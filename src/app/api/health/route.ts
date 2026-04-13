import { NextResponse } from "next/server";
import { ARTICLES, REGIONS, CATEGORIES } from "@/knowledge/_index";

export const dynamic = "force-dynamic";

/**
 * Health check & provider status endpoint.
 * Reports which AI providers are configured and knowledge library stats.
 */

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
  { id: "anthropic", keyCheck: () => !!getAnthropicKey(), model: "claude-sonnet-4", tiers: ["architect"] },
  { id: "openai", keyEnv: "OPENAI_API_KEY", model: "gpt-4o-mini", tiers: ["premium", "architect"] },
  { id: "groq", keyEnv: "GROQ_API_KEY", model: "llama-3.3-70b", tiers: ["free", "premium", "architect"] },
  { id: "together", keyEnv: "TOGETHER_API_KEY", model: "llama-3.3-70b", tiers: ["free", "premium", "architect"] },
  { id: "pollinations", model: "openai-proxy", tiers: ["free", "premium", "architect"] },
];

export async function GET() {
  const providers: ProviderStatus[] = PROVIDER_INFO.map((p) => ({
    id: p.id,
    configured: p.keyCheck ? p.keyCheck() : p.keyEnv ? !!process.env[p.keyEnv] : true,
    model: p.model,
    tiers: p.tiers,
  }));

  const configuredCount = providers.filter((p) => p.configured).length;

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
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
  });
}
