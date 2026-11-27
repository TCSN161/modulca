import { NextResponse } from "next/server";
import { ARTICLES, REGIONS, CATEGORIES } from "@/knowledge/_index";
import { checkEnv } from "@/shared/config/env-check";
import {
  checkAuth,
  checkDb,
  checkStripe,
  checkEngines,
  checkKnowledge,
  overallStatus,
  type ModuleStatus,
} from "./checks";

export const dynamic = "force-dynamic";

/**
 * Health check & provider status endpoint.
 *
 * BUG-ST21: per-module status — auth (Supabase Auth reachable), db (1-row select),
 * stripe (key valid + TEST/LIVE mode), image engines (config-only), knowledge
 * (no *.new.md in the index). Network checks run in parallel with 2.5 s timeouts;
 * the full result is cached in-process for 60 s so monitors can't hammer upstreams.
 * HTTP 503 only when auth or db is down; degraded stays 200.
 */

const CACHE_TTL_MS = 60_000;
let cache: { at: number; body: Record<string, unknown>; httpStatus: number } | null = null;
let inflight: Promise<{ body: Record<string, unknown>; httpStatus: number }> | null = null;

interface ProviderStatus {
  id: string;
  configured: boolean;
  model: string;
  tiers: string[];
}

/** Helper: read Anthropic key — MODULCA_ANTHROPIC_KEY avoids clash with Claude Code's env */
function getAnthropicKey(): string {
  return process.env.MODULCA_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY || "";
}

const PROVIDER_INFO: { id: string; keyCheck?: () => boolean; keyEnv?: string; model: string; tiers: string[] }[] = [
  { id: "anthropic", keyCheck: () => !!getAnthropicKey(), model: "claude-sonnet-5-5", tiers: ["architect"] },
  { id: "openai", keyEnv: "OPENAI_API_KEY", model: "gpt-5.4-mini", tiers: ["premium", "architect"] },
  { id: "groq", keyEnv: "GROQ_API_KEY", model: "openai/gpt-oss-120b", tiers: ["free", "premium", "architect"] },
  { id: "gemini", keyEnv: "GEMINI_API_KEY", model: "gemini-flash-latest", tiers: ["free", "premium", "architect"] },
  { id: "pollinations", model: "openai-proxy", tiers: ["free", "premium", "architect"] },
];

async function buildHealth(): Promise<{ body: Record<string, unknown>; httpStatus: number }> {
  const t0 = Date.now();
  const providers: ProviderStatus[] = PROVIDER_INFO.map((p) => ({
    id: p.id,
    configured: p.keyCheck ? p.keyCheck() : p.keyEnv ? !!process.env[p.keyEnv] : true,
    model: p.model,
    tiers: p.tiers,
  }));
  const configuredCount = providers.filter((p) => p.configured).length;
  const envCheck = checkEnv();

  const [auth, db, stripe] = await Promise.all([checkAuth(), checkDb(), checkStripe()]);
  const modules: Record<string, ModuleStatus> = {
    auth,
    db,
    stripe,
    engines: checkEngines(),
    knowledge: checkKnowledge(),
  };
  const status = overallStatus(modules);

  return {
    httpStatus: status === "down" ? 503 : 200,
    body: {
      status,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - t0,
      modules,
      knowledge: {
        articles: ARTICLES.length,
        categories: CATEGORIES.filter((c) => c.articleCount > 0).length,
        regions: REGIONS.filter((r) => (r.articleCount ?? 0) > 0).length,
      },
      providers,
      summary: {
        total: providers.length,
        configured: configuredCount,
        freeTierReady: providers.some((p) => p.configured && p.tiers.includes("free")),
        premiumReady: providers.some((p) => p.configured && p.tiers.includes("premium") && p.id !== "groq"),
        architectReady: providers.some((p) => p.configured && p.tiers.includes("architect") && p.id === "anthropic"),
      },
      env: {
        ok: envCheck.ok,
        missingCritical: envCheck.missing.filter((m) => m.critical).map((m) => m.key),
        missingOptional: envCheck.missing.filter((m) => !m.critical).map((m) => m.key),
        warnings: envCheck.warnings,
      },
    },
  };
}

export async function GET() {
  try {
    const now = Date.now();
    if (!cache || now - cache.at > CACHE_TTL_MS) {
      // Coalesce concurrent misses into one upstream round.
      inflight ??= buildHealth().finally(() => {
        inflight = null;
      });
      const fresh = await inflight;
      cache = { at: Date.now(), ...fresh };
    }
    const ageS = Math.round((Date.now() - cache.at) / 1000);
    return NextResponse.json(
      { ...cache.body, cached: ageS > 0, cacheAgeS: ageS },
      {
        status: cache.httpStatus,
        headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=30" },
      },
    );
  } catch (error) {
    console.error("[api/health] GET error:", error);
    return NextResponse.json({ status: "down", error: "Health check failed" }, { status: 500 });
  }
}
