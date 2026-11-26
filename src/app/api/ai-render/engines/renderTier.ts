import type { ServerTierContext } from "@/shared/server/serverTier";
import type { AccountTier } from "@/features/auth/types";
import { checkAndConsumeQuota, refundQuota, type QuotaResult } from "@/shared/server/quota";

/**
 * Engine-cost tier. Beta-promo users are stored as `free` but get premium
 * LIMITS (effectiveTier → quota: 5 renders/day). Beta renders must stay €0,
 * so engine choice + cost ceiling follow what the user PAYS (ctx.tier).
 * Set BETA_PAID_ENGINES=1 to let promo users reach premium (paid) engines.
 */
export function engineTierFor(ctx: Pick<ServerTierContext, "tier" | "effectiveTier">): AccountTier {
  const nonPaying = ctx.tier === "free" || ctx.tier === "guest_free";
  if (nonPaying && process.env.BETA_PAID_ENGINES !== "1") return ctx.tier;
  return ctx.effectiveTier;
}

/** Client maxCostUsd can only LOWER the tier ceiling, never raise it. */
export function clampMaxCost(clientValue: unknown, tierMax: number): number {
  const asked = clientValue === null || clientValue === undefined || clientValue === "" ? NaN : Number(clientValue);
  return Number.isFinite(asked) && asked >= 0 ? Math.min(asked, tierMax) : tierMax;
}

/**
 * Consume `n` render units for a multi-image request (e.g. /compare).
 * All-or-nothing: if any unit is refused, the ones already taken are refunded
 * and the refusing QuotaResult is returned (route answers 429).
 */
export async function consumeRenderUnits(
  ctx: ServerTierContext,
  n: number,
): Promise<{ allowed: boolean; result: QuotaResult; taken: number }> {
  let last: QuotaResult | null = null;
  let taken = 0;
  for (let i = 0; i < n; i++) {
    last = await checkAndConsumeQuota(ctx, "render");
    if (!last.allowed) {
      await refundRenderUnits(ctx, last.source, taken);
      return { allowed: false, result: last, taken: 0 };
    }
    taken++;
  }
  // n === 0 → nothing to consume; synthesize an "allowed" result.
  return { allowed: true, result: last ?? { allowed: true, kind: "render", limits: { day: -1, month: -1 }, used: { day: 0, month: 0 }, source: "memory" }, taken };
}

/** Give back `k` render units (failed images). Never throws. */
export async function refundRenderUnits(ctx: ServerTierContext, source: QuotaResult["source"], k: number): Promise<void> {
  for (let i = 0; i < k; i++) await refundQuota(ctx, "render", source);
}
