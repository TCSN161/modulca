/**
 * Structure-control engines (3.07, 2026-11-27): config + "is it funded?" gate.
 *
 * These engines keep the exact 3D geometry (depth / canny / structure control)
 * but cost money. They are READY but OFF until Costin funds them: the route
 * calls `isStructureEngineFunded(id)` before each one and skips it silently
 * (no engine call, no failure log) when the answer is no.
 *
 * Funded = key env var set AND not killed AND no recent 401/402 AND, where the
 * provider has a balance API (Stability), balance ≥ the cost of one render.
 * Replicate has no public balance API: a key counts as funded until the first
 * 402 "insufficient credit", which parks the provider for UNFUNDED_TTL_MS.
 *
 * Kill switches: STRUCTURE_CONTROL_DISABLED=1 (all three), plus the usual
 * AI_ENGINES_DISABLED / ENGINE_<ID>_DISABLED handled by route.ts.
 */
import { isEngineDisabled } from "./killSwitch";

export type StructureProvider = "replicate" | "stability";
export type ControlType = "depth" | "canny";

export interface StructureEngineConfig {
  provider: StructureProvider;
  /** Model / endpoint id — the ONE place to change it. */
  model: string;
  /** Env var holding the API key. */
  keyEnv: string;
  /** Approx. USD per render (sources: radar 2026-11-26, provider pricing pages). */
  costUsd: number;
  /** creditManager budget the engine draws from (its own id is unknown there). */
  creditId: string;
  /** Which control map this engine wants, if the client sends one. */
  controlType?: ControlType;
}

export const STRUCTURE_ENGINES = {
  "replicate-depth": {
    provider: "replicate", model: "black-forest-labs/flux-depth-dev",
    keyEnv: "REPLICATE_API_TOKEN", costUsd: 0.025, creditId: "replicate", controlType: "depth",
  },
  "replicate-canny": {
    provider: "replicate", model: "black-forest-labs/flux-canny-dev",
    keyEnv: "REPLICATE_API_TOKEN", costUsd: 0.025, creditId: "replicate", controlType: "canny",
  },
  "stability-structure": {
    provider: "stability", model: "https://api.stability.ai/v2beta/stable-image/control/structure",
    keyEnv: "STABILITY_API_KEY", costUsd: 0.05, creditId: "stability",
  },
} as const satisfies Record<string, StructureEngineConfig>;

export type StructureEngineId = keyof typeof STRUCTURE_ENGINES;
export const STRUCTURE_ENGINE_IDS = Object.keys(STRUCTURE_ENGINES) as StructureEngineId[];

/** Stability bills 5 credits ($0.05) per Control Structure render (radar 2026-11-26). */
export const STABILITY_CREDITS_PER_RENDER = 5;
export const STABILITY_BALANCE_URL = "https://api.stability.ai/v1/user/balance";
export const UNFUNDED_TTL_MS = 30 * 60_000;
export const BALANCE_TTL_MS = 10 * 60_000;

const TRUTHY = /^(1|true|yes|on)$/i;
type Env = Record<string, string | undefined>;

const unfundedUntil = new Map<StructureProvider, number>();
const balanceCache = new Map<StructureProvider, { at: number; funded: boolean }>();

export function apiKeyFor(id: StructureEngineId, env: Env = process.env): string {
  return (env[STRUCTURE_ENGINES[id].keyEnv] || "").trim();
}

/** Engine saw 401/402: park the provider so the chain stops trying it. */
export function markUnfunded(provider: StructureProvider, now = Date.now()): void {
  unfundedUntil.set(provider, now + UNFUNDED_TTL_MS);
  balanceCache.delete(provider);
}

/** HTTP status → should the provider be parked as unfunded? */
export function isUnfundedStatus(status: number): boolean {
  return status === 401 || status === 402 || status === 403;
}

async function stabilityFunded(key: string, now: number): Promise<boolean> {
  const hit = balanceCache.get("stability");
  if (hit && now - hit.at < BALANCE_TTL_MS) return hit.funded;
  let funded: boolean;
  try {
    const res = await fetch(STABILITY_BALANCE_URL, { headers: { Authorization: `Bearer ${key}` } });
    if (isUnfundedStatus(res.status)) funded = false;
    else if (!res.ok) funded = true; // balance API hiccup: let the engine try; a 402 will park it
    else {
      const { credits } = (await res.json()) as { credits?: number };
      funded = typeof credits === "number" ? credits >= STABILITY_CREDITS_PER_RENDER : true;
    }
  } catch {
    funded = true; // network error on the balance call only — same reasoning
  }
  balanceCache.set("stability", { at: now, funded });
  return funded;
}

/** True when the engine may be called now. Never throws, never spends. */
export async function isStructureEngineFunded(
  id: StructureEngineId,
  env: Env = process.env,
  now = Date.now(),
): Promise<boolean> {
  if (TRUTHY.test(env.STRUCTURE_CONTROL_DISABLED || "")) return false;
  if (isEngineDisabled(id, env)) return false;
  const key = apiKeyFor(id, env);
  if (!key) return false;
  const { provider } = STRUCTURE_ENGINES[id];
  if ((unfundedUntil.get(provider) ?? 0) > now) return false;
  if (provider === "stability") return stabilityFunded(key, now);
  return true; // replicate: no balance API — key present = funded until a 402
}

/** Strip a data-URI prefix; engines want raw base64. */
export function rawBase64(b64: string): string {
  return b64.replace(/^data:[^;]+;base64,/, "");
}

/** The image to send as the control input: a matching client map, else the RGB capture. */
export function pickControlInput(
  wanted: ControlType | undefined,
  req: { baseImage?: string; controlImage?: string; controlType?: ControlType },
): string | undefined {
  if (req.controlImage && wanted && req.controlType === wanted) return rawBase64(req.controlImage);
  return req.baseImage ? rawBase64(req.baseImage) : undefined;
}

/** Test hook. */
export function __resetStructureFunding(): void {
  unfundedUntil.clear();
  balanceCache.clear();
}
