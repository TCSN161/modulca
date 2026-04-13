/**
 * Engine Credit Manager
 *
 * Tracks usage per engine so the system can:
 * - Auto-disable engines when credits run out
 * - Route to cheapest available engine
 * - Show remaining budget in admin dashboard
 * - Auto-failover when an engine is depleted
 *
 * In-memory for now; will migrate to Supabase for persistence.
 */

export interface EngineBudget {
  /** Engine identifier */
  engineId: string;
  /** Total credits/budget available (USD). -1 = unlimited */
  totalBudgetUsd: number;
  /** Amount spent so far (USD) */
  spentUsd: number;
  /** Number of successful renders */
  renderCount: number;
  /** Number of failed attempts */
  failCount: number;
  /** Daily render count (resets at midnight UTC) */
  dailyRenderCount: number;
  /** Daily render limit. -1 = unlimited */
  dailyLimit: number;
  /** Date string of last daily reset (YYYY-MM-DD) */
  lastDailyReset: string;
  /** Whether engine is manually disabled */
  disabled: boolean;
  /** Last successful render timestamp */
  lastSuccessAt: string | null;
  /** Last error message */
  lastError: string | null;
  /** Average latency in ms (rolling) */
  avgLatencyMs: number;
  /** Health score 0-100 (based on recent success rate) */
  healthScore: number;
}

/** Engine budget configuration — what we start with */
interface EngineBudgetConfig {
  totalBudgetUsd: number;
  dailyLimit: number;
  costPerRender: number;
}

const ENGINE_CONFIGS: Record<string, EngineBudgetConfig> = {
  // Free unlimited
  pollinations:  { totalBudgetUsd: -1, dailyLimit: -1, costPerRender: 0 },
  "ai-horde":    { totalBudgetUsd: -1, dailyLimit: -1, costPerRender: 0 },
  // Free with limits
  cloudflare:    { totalBudgetUsd: -1, dailyLimit: 10000, costPerRender: 0 },
  together:      { totalBudgetUsd: -1, dailyLimit: -1, costPerRender: 0 },     // Free 3 months
  huggingface:   { totalBudgetUsd: -1, dailyLimit: -1, costPerRender: 0.001 },  // Free tier
  // Credit-based
  fireworks:     { totalBudgetUsd: 5.0, dailyLimit: -1, costPerRender: 0.0014 },
  fal:           { totalBudgetUsd: 1.0, dailyLimit: -1, costPerRender: 0.003 },
  segmind:       { totalBudgetUsd: 1.0, dailyLimit: -1, costPerRender: 0.005 },
  deepinfra:     { totalBudgetUsd: 1.0, dailyLimit: -1, costPerRender: 0.015 },
  replicate:     { totalBudgetUsd: 1.0, dailyLimit: -1, costPerRender: 0.003 },
  leonardo:      { totalBudgetUsd: 5.0, dailyLimit: -1, costPerRender: 0.03 },
  blackforest:   { totalBudgetUsd: 1.0, dailyLimit: -1, costPerRender: 0.003 },
  stability:     { totalBudgetUsd: 1.0, dailyLimit: -1, costPerRender: 0.04 },
  openai:        { totalBudgetUsd: 5.0, dailyLimit: -1, costPerRender: 0.02 },
};

/** In-memory budget store (resets on server restart — will persist to Supabase later) */
const budgets: Map<string, EngineBudget> = new Map();

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function getOrCreateBudget(engineId: string): EngineBudget {
  let budget = budgets.get(engineId);
  if (!budget) {
    const config = ENGINE_CONFIGS[engineId] || { totalBudgetUsd: 0, dailyLimit: 0, costPerRender: 0 };
    budget = {
      engineId,
      totalBudgetUsd: config.totalBudgetUsd,
      spentUsd: 0,
      renderCount: 0,
      failCount: 0,
      dailyRenderCount: 0,
      dailyLimit: config.dailyLimit,
      lastDailyReset: todayUTC(),
      disabled: false,
      lastSuccessAt: null,
      lastError: null,
      avgLatencyMs: 0,
      healthScore: 100,
    };
    budgets.set(engineId, budget);
  }

  // Reset daily counter if new day
  const today = todayUTC();
  if (budget.lastDailyReset !== today) {
    budget.dailyRenderCount = 0;
    budget.lastDailyReset = today;
  }

  return budget;
}

/** Check if an engine has budget remaining */
export function canUseEngine(engineId: string): boolean {
  const budget = getOrCreateBudget(engineId);

  if (budget.disabled) return false;

  // Check daily limit
  if (budget.dailyLimit !== -1 && budget.dailyRenderCount >= budget.dailyLimit) {
    return false;
  }

  // Check total budget
  if (budget.totalBudgetUsd !== -1) {
    const config = ENGINE_CONFIGS[engineId];
    if (config && budget.spentUsd + config.costPerRender > budget.totalBudgetUsd) {
      return false;
    }
  }

  // Skip engines with very low health (repeated failures)
  if (budget.healthScore < 10) return false;

  return true;
}

/** Record a successful render */
export function recordSuccess(engineId: string, costUsd: number, latencyMs: number): void {
  const budget = getOrCreateBudget(engineId);
  budget.spentUsd += costUsd;
  budget.renderCount += 1;
  budget.dailyRenderCount += 1;
  budget.lastSuccessAt = new Date().toISOString();
  budget.lastError = null;

  // Rolling average latency
  budget.avgLatencyMs = budget.avgLatencyMs === 0
    ? latencyMs
    : budget.avgLatencyMs * 0.8 + latencyMs * 0.2;

  // Improve health score on success
  budget.healthScore = Math.min(100, budget.healthScore + 10);
}

/** Record a failed render attempt */
export function recordFailure(engineId: string, error: string): void {
  const budget = getOrCreateBudget(engineId);
  budget.failCount += 1;
  budget.lastError = error;

  // Decrease health score on failure
  budget.healthScore = Math.max(0, budget.healthScore - 20);
}

/** Get remaining budget for an engine */
export function getRemainingBudget(engineId: string): { renders: number; budgetUsd: number } {
  const budget = getOrCreateBudget(engineId);
  const config = ENGINE_CONFIGS[engineId];

  if (!config) return { renders: 0, budgetUsd: 0 };

  if (budget.totalBudgetUsd === -1) {
    // Check daily limit
    if (budget.dailyLimit === -1) return { renders: -1, budgetUsd: -1 }; // unlimited
    return {
      renders: Math.max(0, budget.dailyLimit - budget.dailyRenderCount),
      budgetUsd: -1,
    };
  }

  const remaining = Math.max(0, budget.totalBudgetUsd - budget.spentUsd);
  const rendersLeft = config.costPerRender > 0
    ? Math.floor(remaining / config.costPerRender)
    : -1;

  return { renders: rendersLeft, budgetUsd: remaining };
}

/** Get all engine budgets for the admin dashboard */
export function getAllBudgets(): EngineBudget[] {
  // Ensure all engines are initialized
  for (const engineId of Object.keys(ENGINE_CONFIGS)) {
    getOrCreateBudget(engineId);
  }
  return Array.from(budgets.values());
}

/** Get a summary for the admin dashboard */
export function getBudgetSummary(): {
  totalSpent: number;
  totalRenders: number;
  totalFails: number;
  engines: Array<EngineBudget & { remainingRenders: number; remainingBudget: number }>;
} {
  const allBudgets = getAllBudgets();
  const totalSpent = allBudgets.reduce((sum, b) => sum + b.spentUsd, 0);
  const totalRenders = allBudgets.reduce((sum, b) => sum + b.renderCount, 0);
  const totalFails = allBudgets.reduce((sum, b) => sum + b.failCount, 0);

  const engines = allBudgets.map((b) => {
    const remaining = getRemainingBudget(b.engineId);
    return { ...b, remainingRenders: remaining.renders, remainingBudget: remaining.budgetUsd };
  });

  return { totalSpent, totalRenders, totalFails, engines };
}
