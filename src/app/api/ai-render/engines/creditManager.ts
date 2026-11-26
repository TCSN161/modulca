/**
 * Engine Credit Manager — U9 (MCA-HANDOFF-4, 2026-11-19)
 *
 * Three layers of enforcement:
 *
 *   1. Per-engine budget (daily + total USD) — protects external accounts
 *      from going negative on a single broken engine.
 *   2. Tier → allowed cost bands — a Free user can never trigger a $0.065
 *      Stability call, regardless of what the fallback chain recommends.
 *   3. Per-tier monthly spend cap — hard ceiling that preserves >75% margin
 *      at the tier's subscription price. At 80% of cap the credit manager
 *      silently demotes future calls to free-band engines only.
 *   4. Per-tier daily call cap — defuses the "one user runs a batch script
 *      and burns the tier's monthly $30 in an hour" scenario (handoff §3.2).
 *
 * Prices come from `src/features/admin/engine-billing-data.json` so Chat 3
 * (engines) and Chat 4 (billing) edit a single source of truth.
 *
 * All state is in-memory. Monthly + daily counters reset lazily on first
 * access of a new UTC month/day. Will migrate to Supabase for durability
 * when per-user tracking lands.
 */

import billingData from "@/features/admin/engine-billing-data.json";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type CostBand = "free" | "budget" | "mid" | "premium" | "enterprise";

/** Subscription tiers the credit manager understands. Mirrored from
 *  `@/features/auth/types.ts` to avoid a cross-feature import cycle. */
export type Tier =
  | "guest_free"
  | "free"
  | "premium"
  | "architect"
  | "constructor";

export interface EngineBudget {
  engineId: string;
  /** Total credits/budget available (USD). -1 = unlimited */
  totalBudgetUsd: number;
  /** Amount spent so far (USD) */
  spentUsd: number;
  renderCount: number;
  failCount: number;
  /** Daily render count (resets at midnight UTC) */
  dailyRenderCount: number;
  /** Daily render limit. -1 = unlimited */
  dailyLimit: number;
  lastDailyReset: string;
  disabled: boolean;
  lastSuccessAt: string | null;
  lastError: string | null;
  avgLatencyMs: number;
  /** Health score 0-100 (based on recent success rate) */
  healthScore: number;
  /** Epoch ms of the last failure (0 = never). Drives the health cooldown. */
  lastFailureMs: number;
}

export interface TierSpendState {
  tier: Tier;
  month: string; // YYYY-MM UTC
  spentUsd: number;
  capUsd: number;
  /** 0..1 fraction of cap consumed */
  utilization: number;
  /** true when ≥ demote threshold — future calls steer to free band only */
  demoted: boolean;
  /** Calls made today (resets at midnight UTC) */
  dailyCalls: number;
  dailyCap: number;
  dailyResetDate: string; // YYYY-MM-DD UTC
}

/* ------------------------------------------------------------------ */
/*  Band classification                                                */
/* ------------------------------------------------------------------ */

/** Strict ranges: each price falls in exactly one band.
 *
 *  The handoff spec has a gap between FREE ($0) and BUDGET ($0.001+). We fill
 *  that gap by treating anything below $0.001/image as free-band — at our
 *  volumes the cost is noise, and this catches quota-based "effectively free"
 *  engines like Cloudflare ($0.00011) that do not match the handoff's
 *  pay-per-image BUDGET definition.
 */
export function priceToBand(pricePerImageUsd: number): CostBand {
  if (pricePerImageUsd < 0.001) return "free";
  if (pricePerImageUsd <= 0.005) return "budget";
  if (pricePerImageUsd <= 0.02) return "mid";
  if (pricePerImageUsd <= 0.1) return "premium";
  return "enterprise";
}

/** Which bands a given subscription tier is allowed to call. */
export const TIER_ALLOWED_BANDS: Record<Tier, readonly CostBand[]> = {
  guest_free: ["free"],
  free: ["free"],
  premium: ["free", "budget"],
  architect: ["free", "budget", "mid"],
  constructor: ["free", "budget", "mid", "premium"],
  // enterprise band is never tier-allowed — custom contracts only.
};

/** Hard monthly USD ceiling per subscriber in each tier. 0 = no paid usage. */
export const TIER_MONTHLY_CAP_USD: Record<Tier, number> = {
  guest_free: 0,
  free: 0,
  premium: 5,
  architect: 15,
  constructor: 40,
};

/** Per-tier daily call cap — protects against batch-script burn. */
export const TIER_DAILY_CALL_CAP: Record<Tier, number> = {
  guest_free: 20,
  free: 50,
  premium: 100,
  architect: 500,
  constructor: 2000,
};

/** Fraction of monthly cap at which we silently demote to free-band only. */
export const DEMOTE_THRESHOLD = 0.8;

/* ------------------------------------------------------------------ */
/*  Price registry (loaded from engine-billing-data.json)              */
/* ------------------------------------------------------------------ */

interface BillingRow {
  id: string;
  pricePerImageUsd: number;
  role: string;
}

const PRICE_BY_ENGINE = new Map<string, number>();
const BAND_BY_ENGINE = new Map<string, CostBand>();

for (const row of (billingData.registry || []) as BillingRow[]) {
  PRICE_BY_ENGINE.set(row.id, row.pricePerImageUsd);
  BAND_BY_ENGINE.set(row.id, priceToBand(row.pricePerImageUsd));
}

export function getEnginePrice(engineId: string): number {
  return PRICE_BY_ENGINE.get(engineId) ?? 0;
}

export function getEngineBand(engineId: string): CostBand {
  return BAND_BY_ENGINE.get(engineId) ?? "free";
}

/** Per-engine hard budget / daily limit — tightens the external quota even
 *  within the price-band rules above. */
interface EngineLimitConfig {
  totalBudgetUsd: number;
  dailyLimit: number;
}

const ENGINE_LIMITS: Record<string, EngineLimitConfig> = {
  pollinations: { totalBudgetUsd: -1, dailyLimit: -1 },
  "ai-horde": { totalBudgetUsd: -1, dailyLimit: -1 },
  cloudflare: { totalBudgetUsd: -1, dailyLimit: 10000 },
  "cloudflare-klein": { totalBudgetUsd: -1, dailyLimit: 10000 }, // CF FLUX.2 klein 4B img2img (Chat 3, $0)
  together: { totalBudgetUsd: -1, dailyLimit: -1 },
  huggingface: { totalBudgetUsd: -1, dailyLimit: -1 },
  gemini: { totalBudgetUsd: -1, dailyLimit: 1500 },
  fireworks: { totalBudgetUsd: 5.0, dailyLimit: -1 },
  fal: { totalBudgetUsd: 1.0, dailyLimit: -1 },
  segmind: { totalBudgetUsd: 1.0, dailyLimit: -1 },
  deepinfra: { totalBudgetUsd: 1.0, dailyLimit: -1 },
  replicate: { totalBudgetUsd: 1.0, dailyLimit: -1 },
  leonardo: { totalBudgetUsd: 1.0, dailyLimit: -1 },
  blackforest: { totalBudgetUsd: 1.0, dailyLimit: -1 },
  stability: { totalBudgetUsd: 1.0, dailyLimit: -1 },
  openai: { totalBudgetUsd: 5.0, dailyLimit: -1 },
  prodia: { totalBudgetUsd: 4.0, dailyLimit: 50 },
  novita: { totalBudgetUsd: 0.5, dailyLimit: -1 },
  wavespeed: { totalBudgetUsd: 1.0, dailyLimit: -1 },
  runway: { totalBudgetUsd: -1, dailyLimit: 125 },
};

/* ------------------------------------------------------------------ */
/*  In-memory stores                                                   */
/* ------------------------------------------------------------------ */

const budgets: Map<string, EngineBudget> = new Map();

/** Per-tier spend/call tracker — keyed by tier. */
const tierState: Map<Tier, TierSpendState> = new Map();

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthUTC(): string {
  return new Date().toISOString().slice(0, 7);
}

/* ------------------------------------------------------------------ */
/*  Per-engine budget helpers                                          */
/* ------------------------------------------------------------------ */

function getOrCreateBudget(engineId: string): EngineBudget {
  let budget = budgets.get(engineId);
  if (!budget) {
    const limits = ENGINE_LIMITS[engineId] || {
      totalBudgetUsd: 0,
      dailyLimit: 0,
    };
    budget = {
      engineId,
      totalBudgetUsd: limits.totalBudgetUsd,
      spentUsd: 0,
      renderCount: 0,
      failCount: 0,
      dailyRenderCount: 0,
      dailyLimit: limits.dailyLimit,
      lastDailyReset: todayUTC(),
      disabled: false,
      lastSuccessAt: null,
      lastError: null,
      avgLatencyMs: 0,
      healthScore: 100,
      lastFailureMs: 0,
    };
    budgets.set(engineId, budget);
  }

  // Reset daily counter if new UTC day
  const today = todayUTC();
  if (budget.lastDailyReset !== today) {
    budget.dailyRenderCount = 0;
    budget.lastDailyReset = today;
  }

  return budget;
}

/** Internal — raw engine-level gate, no tier awareness. */
function engineHasCredit(engineId: string): boolean {
  const budget = getOrCreateBudget(engineId);
  if (budget.disabled) return false;

  if (budget.dailyLimit !== -1 && budget.dailyRenderCount >= budget.dailyLimit) {
    return false;
  }

  if (budget.totalBudgetUsd !== -1) {
    const cost = getEnginePrice(engineId);
    if (budget.spentUsd + cost > budget.totalBudgetUsd) return false;
  }

  if (budget.healthScore < 10) {
    // BUG-ST01 (Chat 3, 2026-11-26): health only recovered on success, and an
    // unhealthy engine was never tried again, so 5 failures (e.g. the CF daily
    // quota) blocked it on a warm instance FOREVER, even after the quota reset.
    // After the cooldown, allow one probe at low health.
    if (Date.now() - budget.lastFailureMs < HEALTH_COOLDOWN_MS) return false;
    budget.healthScore = 10;
  }
  return true;
}

/** Time an unhealthy engine (score < 10) is skipped before one probe is allowed. */
export const HEALTH_COOLDOWN_MS = 5 * 60_000;

/* ------------------------------------------------------------------ */
/*  Per-tier state helpers                                             */
/* ------------------------------------------------------------------ */

function getOrCreateTierState(tier: Tier): TierSpendState {
  const nowMonth = monthUTC();
  const nowDate = todayUTC();
  const capUsd = TIER_MONTHLY_CAP_USD[tier];
  const dailyCap = TIER_DAILY_CALL_CAP[tier];

  let state = tierState.get(tier);
  if (!state) {
    state = {
      tier,
      month: nowMonth,
      spentUsd: 0,
      capUsd,
      utilization: 0,
      demoted: false,
      dailyCalls: 0,
      dailyCap,
      dailyResetDate: nowDate,
    };
    tierState.set(tier, state);
  }

  // Lazy UTC resets
  if (state.month !== nowMonth) {
    state.month = nowMonth;
    state.spentUsd = 0;
    state.utilization = 0;
    state.demoted = false;
  }
  if (state.dailyResetDate !== nowDate) {
    state.dailyResetDate = nowDate;
    state.dailyCalls = 0;
  }

  // Keep cap values in sync with current config (if we bump them live)
  state.capUsd = capUsd;
  state.dailyCap = dailyCap;
  state.utilization = capUsd > 0 ? state.spentUsd / capUsd : 0;
  state.demoted = capUsd > 0 && state.utilization >= DEMOTE_THRESHOLD;

  return state;
}

export function getTierState(tier: Tier): TierSpendState {
  // Return a snapshot (plain object) so callers can't mutate internal state.
  return { ...getOrCreateTierState(tier) };
}

export function getAllTierStates(): TierSpendState[] {
  // Force creation of state for every tier so admin dashboard shows them all.
  const all: TierSpendState[] = [];
  const tiers: Tier[] = ["guest_free", "free", "premium", "architect", "constructor"];
  for (const t of tiers) all.push({ ...getOrCreateTierState(t) });
  return all;
}

/* ------------------------------------------------------------------ */
/*  Public gate — tier-aware engine availability                       */
/* ------------------------------------------------------------------ */

export interface UseEngineContext {
  tier?: Tier;
}

/**
 * Tier-aware availability check.
 *
 * When `context.tier` is omitted the function falls back to the pre-U9
 * behavior (engine-level checks only) so admin tools and legacy callers
 * keep working. When a tier is passed, all four layers run.
 */
export function canUseEngine(
  engineId: string,
  context?: UseEngineContext,
): boolean {
  if (!engineHasCredit(engineId)) return false;
  if (!context?.tier) return true;

  const tier = context.tier;
  const band = getEngineBand(engineId);

  // Layer 2 — band must be allowed for this tier
  const allowed = TIER_ALLOWED_BANDS[tier];
  if (!allowed.includes(band)) return false;

  const state = getOrCreateTierState(tier);

  // Layer 4 — daily call cap
  if (state.dailyCap > 0 && state.dailyCalls >= state.dailyCap) return false;

  const cost = getEnginePrice(engineId);

  // Free-band engines always pass regardless of monthly cap — their cost
  // is either zero (Pollinations, AI Horde) or sub-$0.001 and quota-covered
  // (Cloudflare). This lets a demoted/free tier keep rendering.
  if (band === "free") return true;

  // Layer 3 — monthly cap for paid bands
  if (state.capUsd === 0) {
    // $0 cap tier never calls a paid engine (defense in depth; the
    // TIER_ALLOWED_BANDS check above already blocks this today).
    return false;
  }
  if (state.spentUsd + cost > state.capUsd) return false;

  // Layer 3b — soft demote: once we're at 80% of cap, only free-band calls.
  if (state.demoted) return false;

  return true;
}

/**
 * Picks the first available engine from a preferred ordering, respecting
 * the full tier-aware gate. Used by the fallback chain in route.ts to
 * implement silent auto-demote: when the preferred premium engine is
 * blocked by the cap, the next cheaper option is returned.
 */
export function pickAvailableEngine(
  preferred: readonly string[],
  context: UseEngineContext,
): string | null {
  for (const engineId of preferred) {
    if (canUseEngine(engineId, context)) return engineId;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Recording usage                                                    */
/* ------------------------------------------------------------------ */

export function recordSuccess(
  engineId: string,
  costUsd: number,
  latencyMs: number,
  context?: UseEngineContext,
): void {
  const budget = getOrCreateBudget(engineId);
  budget.spentUsd += costUsd;
  budget.renderCount += 1;
  budget.dailyRenderCount += 1;
  budget.lastSuccessAt = new Date().toISOString();
  budget.lastError = null;

  budget.avgLatencyMs =
    budget.avgLatencyMs === 0
      ? latencyMs
      : budget.avgLatencyMs * 0.8 + latencyMs * 0.2;

  budget.healthScore = Math.min(100, budget.healthScore + 10);

  // Also account against the tier's monthly cap + daily call counter
  if (context?.tier) {
    const state = getOrCreateTierState(context.tier);
    state.spentUsd += costUsd;
    state.dailyCalls += 1;
    if (state.capUsd > 0) {
      state.utilization = state.spentUsd / state.capUsd;
      state.demoted = state.utilization >= DEMOTE_THRESHOLD;
    }
  }
}

export function recordFailure(
  engineId: string,
  error: string,
  context?: UseEngineContext,
): void {
  const budget = getOrCreateBudget(engineId);
  budget.failCount += 1;
  budget.lastError = error;
  budget.lastFailureMs = Date.now();
  budget.healthScore = Math.max(0, budget.healthScore - 20);

  // Failed calls still count against the tier's daily call cap to prevent
  // an attacker from DoS'ing us with engines that always fail.
  if (context?.tier) {
    const state = getOrCreateTierState(context.tier);
    state.dailyCalls += 1;
  }
}

/* ------------------------------------------------------------------ */
/*  Read-only inspection helpers                                       */
/* ------------------------------------------------------------------ */

export function getRemainingBudget(engineId: string): {
  renders: number;
  budgetUsd: number;
} {
  const budget = getOrCreateBudget(engineId);
  const price = getEnginePrice(engineId);

  if (budget.totalBudgetUsd === -1) {
    if (budget.dailyLimit === -1) return { renders: -1, budgetUsd: -1 };
    return {
      renders: Math.max(0, budget.dailyLimit - budget.dailyRenderCount),
      budgetUsd: -1,
    };
  }

  const remaining = Math.max(0, budget.totalBudgetUsd - budget.spentUsd);
  const rendersLeft = price > 0 ? Math.floor(remaining / price) : -1;
  return { renders: rendersLeft, budgetUsd: remaining };
}

export function getAllBudgets(): EngineBudget[] {
  // Ensure every known engine is materialized.
  for (const engineId of PRICE_BY_ENGINE.keys()) {
    getOrCreateBudget(engineId);
  }
  return Array.from(budgets.values());
}

export interface BudgetSummary {
  totalSpent: number;
  totalRenders: number;
  totalFails: number;
  engines: Array<
    EngineBudget & {
      band: CostBand;
      pricePerImageUsd: number;
      remainingRenders: number;
      remainingBudget: number;
    }
  >;
  tiers: TierSpendState[];
}

export function getBudgetSummary(): BudgetSummary {
  const allBudgets = getAllBudgets();
  const totalSpent = allBudgets.reduce((sum, b) => sum + b.spentUsd, 0);
  const totalRenders = allBudgets.reduce((sum, b) => sum + b.renderCount, 0);
  const totalFails = allBudgets.reduce((sum, b) => sum + b.failCount, 0);

  const engines = allBudgets.map((b) => {
    const remaining = getRemainingBudget(b.engineId);
    return {
      ...b,
      band: getEngineBand(b.engineId),
      pricePerImageUsd: getEnginePrice(b.engineId),
      remainingRenders: remaining.renders,
      remainingBudget: remaining.budgetUsd,
    };
  });

  return {
    totalSpent,
    totalRenders,
    totalFails,
    engines,
    tiers: getAllTierStates(),
  };
}

/* ------------------------------------------------------------------ */
/*  Test helpers — do not call from product code                       */
/* ------------------------------------------------------------------ */

/** @internal Reset all in-memory state. Only for tests. */
export function __resetCreditManagerState(): void {
  budgets.clear();
  tierState.clear();
}
