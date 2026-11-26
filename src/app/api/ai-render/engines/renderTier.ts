import type { ServerTierContext } from "@/shared/server/serverTier";
import type { AccountTier } from "@/features/auth/types";

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
