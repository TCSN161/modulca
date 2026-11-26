import * as Sentry from "@sentry/nextjs";
import type { ServerTierContext } from "@/shared/server/serverTier";
import {
  checkAndConsumeQuota,
  refundQuota,
  getQuotaLimits,
  type QuotaResult,
} from "@/shared/server/quota";

/**
 * Fail-safe wrapper around the shared quota layer (BUG-E08) for the consultant.
 *
 * - quota.ts already falls back to an in-memory per-instance counter (tier limits)
 *   when the `consume_quota` RPC fails (e.g. migration 012 not applied yet).
 *   We report that to Sentry ONCE per instance so it is visible without spamming.
 * - If the quota layer itself throws, we allow the call (never block all users)
 *   and report the exception.
 */

let fallbackReported = false;

export async function consumeAiCallQuota(ctx: ServerTierContext): Promise<QuotaResult> {
  try {
    const q = await checkAndConsumeQuota(ctx, "ai_call");
    const unlimited = q.limits.day === -1 && q.limits.month === -1;
    if (q.source === "memory" && !unlimited && !fallbackReported) {
      fallbackReported = true;
      Sentry.captureMessage("consultant quota: consume_quota unavailable, in-memory fallback in use", {
        level: "warning",
        tags: { source: "consultant-quota" },
      });
    }
    return q;
  } catch (err) {
    console.error("[consultant] quota check threw, allowing call:", err);
    Sentry.captureException(err, { tags: { source: "consultant-quota" } });
    return {
      allowed: true,
      kind: "ai_call",
      limits: getQuotaLimits(ctx.effectiveTier, "ai_call"),
      used: { day: 0, month: 0 },
      source: "memory",
    };
  }
}

/** Give the unit back when no LLM call was made (response cache / local KB). Never throws. */
export async function refundAiCall(ctx: ServerTierContext, quota: QuotaResult): Promise<void> {
  try {
    await refundQuota(ctx, "ai_call", quota.source);
  } catch (err) {
    console.warn("[consultant] quota refund failed:", err);
  }
}
