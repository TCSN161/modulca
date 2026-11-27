/**
 * Per-module health checks for GET /api/health (BUG-ST21).
 *
 * Rules:
 * - Every network check has a hard timeout (default 2.5 s) — the endpoint must stay fast.
 * - No paid calls: Stripe = balance read, Supabase = auth health + 1-row head select,
 *   image engines = config-only (key present + kill switch), no generation.
 * - Never return secrets — only booleans, modes and short error codes.
 */
import { ARTICLES } from "@/knowledge/_index";
import { isEngineDisabled } from "@/app/api/ai-render/engines/killSwitch";

export type ModuleState = "ok" | "degraded" | "down" | "skipped";

export interface ModuleStatus {
  status: ModuleState;
  latencyMs?: number;
  detail?: string;
  [extra: string]: unknown;
}

type Env = Record<string, string | undefined>;

export const CHECK_TIMEOUT_MS = 2500;

/** fetch with a hard timeout; throws "timeout" on abort. */
async function timedFetch(url: string, init: RequestInit = {}, ms = CHECK_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" });
  } catch (err) {
    throw new Error(ctrl.signal.aborted ? "timeout" : (err as Error).message || "fetch failed");
  } finally {
    clearTimeout(timer);
  }
}

function since(t0: number) {
  return Date.now() - t0;
}

/** Supabase Auth (GoTrue) reachable. */
export async function checkAuth(env: Env = process.env): Promise<ModuleStatus> {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return { status: "down", detail: "supabase env missing" };
  const t0 = Date.now();
  try {
    const res = await timedFetch(`${url}/auth/v1/health`, { headers: { apikey: anon } });
    return res.ok
      ? { status: "ok", latencyMs: since(t0) }
      : { status: "down", latencyMs: since(t0), detail: `http ${res.status}` };
  } catch (err) {
    return { status: "down", latencyMs: since(t0), detail: (err as Error).message };
  }
}

/** Postgres via PostgREST: 1-row HEAD select on profiles with the service role. */
export async function checkDb(env: Env = process.env): Promise<ModuleStatus> {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { status: "down", detail: "supabase service env missing" };
  const t0 = Date.now();
  try {
    const res = await timedFetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
      method: "HEAD",
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    return res.ok
      ? { status: "ok", latencyMs: since(t0) }
      : { status: "down", latencyMs: since(t0), detail: `http ${res.status}` };
  } catch (err) {
    return { status: "down", latencyMs: since(t0), detail: (err as Error).message };
  }
}

export function stripeMode(key: string | undefined): "test" | "live" | "unknown" {
  if (!key) return "unknown";
  if (/^(sk|rk|pk)_test_/.test(key)) return "test";
  if (/^(sk|rk|pk)_live_/.test(key)) return "live";
  return "unknown";
}

/** Stripe secret key valid (free balance read) + TEST/LIVE mode + key-pair consistency. */
export async function checkStripe(env: Env = process.env): Promise<ModuleStatus> {
  const sk = env.STRIPE_SECRET_KEY;
  const pk = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!sk) return { status: "down", detail: "STRIPE_SECRET_KEY missing" };
  const mode = stripeMode(sk);
  const pkMode = stripeMode(pk);
  const webhook = !!env.STRIPE_WEBHOOK_SECRET;
  const t0 = Date.now();
  try {
    const res = await timedFetch("https://api.stripe.com/v1/balance", {
      headers: { Authorization: `Bearer ${sk}` },
    });
    const latencyMs = since(t0);
    if (res.status === 401) return { status: "down", mode, latencyMs, detail: "invalid key" };
    if (!res.ok) return { status: "degraded", mode, latencyMs, detail: `http ${res.status}` };
    const mismatch = pk && pkMode !== mode;
    const issues = [mismatch && "publishable key mode differs", !webhook && "webhook secret missing"]
      .filter(Boolean)
      .join("; ");
    return {
      status: issues ? "degraded" : "ok",
      mode,
      publishableMode: pkMode,
      webhookSecret: webhook,
      latencyMs,
      ...(issues ? { detail: issues } : {}),
    };
  } catch (err) {
    return { status: "down", mode, latencyMs: since(t0), detail: (err as Error).message };
  }
}

/**
 * Image engines — config-only (no generation, no paid probe).
 * `requires`: env vars that must all be set; empty = keyless engine.
 * `recommended`: optional env that lifts a free limit (missing → degraded).
 * Mirrors the env names used in src/app/api/ai-render/engines/*.ts (Chat 3, read-only).
 */
export const IMAGE_ENGINES: { id: string; requires: string[]; recommended?: string; free: boolean }[] = [
  { id: "pollinations", requires: [], recommended: "POLLINATIONS_API_KEY", free: true },
  { id: "ai-horde", requires: [], free: true },
  { id: "cloudflare", requires: ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"], free: true },
  { id: "cloudflare-klein", requires: ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"], free: true },
  { id: "gemini", requires: ["GEMINI_API_KEY"], free: true },
  { id: "together", requires: ["TOGETHER_API_KEY"], free: true },
  { id: "huggingface", requires: ["HUGGINGFACE_API_TOKEN"], free: true },
  { id: "fal", requires: ["FAL_API_KEY"], free: false },
  { id: "fireworks", requires: ["FIREWORKS_API_KEY"], free: false },
  { id: "segmind", requires: ["SEGMIND_API_KEY"], free: false },
  { id: "deepinfra", requires: ["DEEPINFRA_API_KEY"], free: false },
  { id: "replicate", requires: ["REPLICATE_API_TOKEN"], free: false },
  { id: "leonardo", requires: ["LEONARDO_API_KEY"], free: false },
  { id: "blackforest", requires: ["BFL_API_KEY"], free: false },
  { id: "stability", requires: ["STABILITY_API_KEY"], free: false },
  { id: "openai", requires: ["OPENAI_API_KEY"], free: false },
  { id: "novita", requires: ["NOVITA_API_KEY"], free: false },
  { id: "wavespeed", requires: ["WAVESPEED_API_KEY"], free: false },
  { id: "runway", requires: ["RUNWAY_API_KEY"], free: false },
  { id: "prodia", requires: ["PRODIA_API_KEY"], free: false },
];

export function checkEngines(env: Env = process.env): ModuleStatus {
  const engines = IMAGE_ENGINES.map((e) => {
    const disabled = isEngineDisabled(e.id, env);
    const missing = e.requires.filter((k) => !env[k]);
    const enabled = !disabled && missing.length === 0;
    const state: ModuleState = !enabled
      ? "skipped"
      : e.recommended && !env[e.recommended]
        ? "degraded"
        : "ok";
    return {
      id: e.id,
      free: e.free,
      status: state,
      ...(disabled ? { detail: "kill switch" } : {}),
      ...(!disabled && missing.length ? { detail: `missing ${missing.join(", ")}` } : {}),
      ...(state === "degraded" ? { detail: `no ${e.recommended} (anonymous limits)` } : {}),
    };
  });
  const enabled = engines.filter((e) => e.status !== "skipped");
  const freeEnabled = enabled.filter((e) => e.free).length;
  const status: ModuleState =
    enabled.length === 0 ? "down" : enabled.some((e) => e.status === "degraded") ? "degraded" : "ok";
  return {
    status,
    enabled: enabled.length,
    freeEnabled,
    paidEnabled: enabled.length - freeEnabled,
    betaPaidEngines: env.BETA_PAID_ENGINES === "1",
    engines,
  };
}

/** KB index must not contain unreviewed drafts (*.new.md). */
export function checkKnowledge(articles: { id: string; filePath?: string }[] = ARTICLES): ModuleStatus {
  const drafts = articles.filter((a) => (a.filePath ?? "").endsWith(".new.md")).map((a) => a.id);
  return {
    status: drafts.length ? "degraded" : articles.length ? "ok" : "down",
    articles: articles.length,
    draftsIndexed: drafts,
    ...(drafts.length ? { detail: ".new.md drafts present in _index.ts" } : {}),
  };
}

/** Overall: down if auth or db is down; degraded if anything else is not ok. */
export function overallStatus(modules: Record<string, ModuleStatus>): "ok" | "degraded" | "down" {
  if (modules.auth?.status === "down" || modules.db?.status === "down") return "down";
  const bad = Object.values(modules).some((m) => m.status === "down" || m.status === "degraded");
  return bad ? "degraded" : "ok";
}
