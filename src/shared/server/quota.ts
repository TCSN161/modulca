/**
 * Per-user (per-guest) AI quota, enforced server-side (BUG-E08).
 *
 * Counters live in Postgres (`usage_quota_counters`, migration 012) and are
 * consumed through the `consume_quota` RPC, which checks the daily and monthly
 * limits and increments both in ONE transaction under an advisory lock, so
 * parallel requests cannot overshoot. Limits come from the tier config
 * (features/auth/types.ts) of the caller's server-resolved effectiveTier.
 *
 * This is the "how many calls may this person make" layer. creditManager stays
 * the "which engines may this tier use / how much USD" layer — they stack.
 *
 * Fallback: when Supabase is not configured or the RPC fails (e.g. migration
 * not applied yet), an in-memory per-instance counter is used so routes keep
 * working with a best-effort limit instead of failing open completely.
 */

import { getSupabaseServer } from "@/shared/lib/supabase-server";
import { getTierConfig, type AccountTier } from "@/features/auth/types";
import type { ServerTierContext } from "./serverTier";

export type QuotaKind = "render" | "ai_call";

export interface QuotaLimits {
  /** -1 = unlimited */
  day: number;
  /** -1 = unlimited */
  month: number;
}

export interface QuotaResult {
  allowed: boolean;
  kind: QuotaKind;
  limits: QuotaLimits;
  used: { day: number; month: number };
  /** Set when allowed=false: which window is exhausted. */
  exceeded?: "day" | "month";
  reason?: string;
  source: "db" | "memory";
}

export function getQuotaLimits(tier: AccountTier, kind: QuotaKind): QuotaLimits {
  const f = getTierConfig(tier).features;
  if (kind === "render") {
    return { day: f.aiRendersPerDay, month: f.aiRendersPerMonth };
  }
  return { day: f.aiConsultantMessagesPerDay, month: -1 };
}

/* ── in-memory fallback ─────────────────────────────────────────── */

const memory = new Map<string, number>();

function periodKeys(now = new Date()): { day: string; month: string } {
  const iso = now.toISOString();
  return { day: iso.slice(0, 10), month: iso.slice(0, 7) };
}

function memoryConsume(subject: string, kind: QuotaKind, limits: QuotaLimits): Omit<QuotaResult, "kind" | "limits" | "source"> {
  const p = periodKeys();
  const dKey = `${subject}|${kind}|${p.day}`;
  const mKey = `${subject}|${kind}|${p.month}`;
  const day = memory.get(dKey) ?? 0;
  const month = memory.get(mKey) ?? 0;
  if (limits.day >= 0 && day >= limits.day) return { allowed: false, used: { day, month }, exceeded: "day" };
  if (limits.month >= 0 && month >= limits.month) return { allowed: false, used: { day, month }, exceeded: "month" };
  memory.set(dKey, day + 1);
  memory.set(mKey, month + 1);
  return { allowed: true, used: { day: day + 1, month: month + 1 } };
}

function memoryRefund(subject: string, kind: QuotaKind): void {
  const p = periodKeys();
  for (const key of [`${subject}|${kind}|${p.day}`, `${subject}|${kind}|${p.month}`]) {
    const v = memory.get(key) ?? 0;
    if (v > 0) memory.set(key, v - 1);
  }
}

/** Test-only. */
export function __resetQuotaMemory(): void {
  memory.clear();
}

/* ── public API ─────────────────────────────────────────────────── */

interface RpcRow {
  allowed: boolean;
  day_count: number;
  month_count: number;
  exceeded: "day" | "month" | null;
}

function reasonFor(kind: QuotaKind, exceeded: "day" | "month", limits: QuotaLimits, tier: AccountTier): string {
  const what = kind === "render" ? "AI render" : "AI assistant";
  const label = getTierConfig(tier).label;
  return exceeded === "day"
    ? `Daily ${what} limit reached (${limits.day}/day on ${label}). Resets at 00:00 UTC.`
    : `Monthly ${what} limit reached (${limits.month}/month on ${label}). Upgrade for more.`;
}

/**
 * Check the caller's quota and, if allowed, consume one unit (atomic).
 * Call BEFORE doing the expensive work. If the work then fails completely
 * (no image / no answer produced), call `refundQuota` so the user is not charged.
 */
export async function checkAndConsumeQuota(ctx: ServerTierContext, kind: QuotaKind): Promise<QuotaResult> {
  const limits = getQuotaLimits(ctx.effectiveTier, kind);
  const base = { kind, limits };

  if (limits.day === -1 && limits.month === -1) {
    return { ...base, allowed: true, used: { day: 0, month: 0 }, source: "memory" };
  }

  const sb = getSupabaseServer();
  if (sb) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (sb as any).rpc("consume_quota", {
        p_subject: ctx.quotaSubject,
        p_kind: kind,
        p_day_limit: limits.day,
        p_month_limit: limits.month,
      });
      if (error) throw new Error(error.message);
      const row = (Array.isArray(data) ? data[0] : data) as RpcRow | undefined;
      if (!row) throw new Error("consume_quota returned no row");
      const exceeded = row.exceeded ?? undefined;
      return {
        ...base,
        allowed: row.allowed,
        used: { day: row.day_count, month: row.month_count },
        exceeded,
        reason: row.allowed || !exceeded ? undefined : reasonFor(kind, exceeded, limits, ctx.effectiveTier),
        source: "db",
      };
    } catch (err) {
      console.warn("[quota] consume_quota RPC failed, using in-memory fallback:", err);
    }
  }

  const r = memoryConsume(ctx.quotaSubject, kind, limits);
  return {
    ...base,
    ...r,
    reason: r.allowed || !r.exceeded ? undefined : reasonFor(kind, r.exceeded, limits, ctx.effectiveTier),
    source: "memory",
  };
}

/** Give back one unit after a total failure. Never throws. */
export async function refundQuota(ctx: ServerTierContext, kind: QuotaKind, source: QuotaResult["source"]): Promise<void> {
  if (source === "memory") {
    memoryRefund(ctx.quotaSubject, kind);
    return;
  }
  const sb = getSupabaseServer();
  if (!sb) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (sb as any).rpc("refund_quota", { p_subject: ctx.quotaSubject, p_kind: kind });
    if (error) console.warn("[quota] refund_quota failed:", error.message);
  } catch (err) {
    console.warn("[quota] refund_quota threw:", err);
  }
}

/** Standard 429 body + headers for routes. */
export function quotaExceededResponse(result: QuotaResult): Response {
  return new Response(
    JSON.stringify({ error: result.reason ?? "Quota exceeded", code: "QUOTA_EXCEEDED", quota: { limits: result.limits, used: result.used, exceeded: result.exceeded } }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "x-quota-limit-day": String(result.limits.day),
        "x-quota-used-day": String(result.used.day),
      },
    },
  );
}
