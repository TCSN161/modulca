/**
 * Billing guards shared by the Stripe routes (BUG-ST16, Chat 4, 2026-11-26).
 *
 * Pure functions, no Stripe / Supabase imports, so they are unit-tested in
 * billing.test.ts. Rules:
 *  - checkout only for a tier strictly ABOVE the caller's effective tier;
 *  - a caller who already has a live Stripe subscription changes plan in the
 *    portal (a second checkout would bill twice);
 *  - a webhook never lowers a comp account (paid tier, no subscription id).
 */

import { getBetaPromoDaysLeft, getEffectiveTier, type AccountTier } from "@/features/auth/types";

export const TIER_RANK: Record<AccountTier, number> = {
  guest_free: 0,
  free: 1,
  premium: 2,
  architect: 3,
  constructor: 4,
};

export type PaidTier = "premium" | "architect" | "constructor";

/** Stripe statuses where the subscription is still billing / usable. */
export const LIVE_SUB_STATUSES = new Set<string>(["active", "trialing", "past_due"]);

export function normalizeAccountTier(raw: unknown): AccountTier {
  return typeof raw === "string" && raw in TIER_RANK ? (raw as AccountTier) : "free";
}

/** Map a Stripe price id to its tier using the configured price env vars. */
export function tierForPriceId(
  priceId: string | undefined | null,
  env: Record<string, string | undefined> = process.env,
): PaidTier | null {
  if (!priceId) return null;
  const table: [PaidTier, string | undefined][] = [
    ["premium", env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY],
    ["premium", env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY],
    ["architect", env.NEXT_PUBLIC_STRIPE_PRICE_ARCHITECT_MONTHLY],
    ["architect", env.NEXT_PUBLIC_STRIPE_PRICE_ARCHITECT_YEARLY],
    ["constructor", env.NEXT_PUBLIC_STRIPE_PRICE_CONSTRUCTOR_MONTHLY],
    ["constructor", env.NEXT_PUBLIC_STRIPE_PRICE_CONSTRUCTOR_YEARLY],
  ];
  for (const [tier, id] of table) if (id && id === priceId) return tier;
  return null;
}

export interface BillingProfile {
  tier: string | null;
  created_at: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
}

/** Comp account = paid tier with no Stripe subscription (docs/MCA-DOC-PRICING-COMP-ACCOUNTS.md). */
export function isCompAccount(p: Pick<BillingProfile, "tier" | "stripe_subscription_id"> | null): boolean {
  if (!p) return false;
  return TIER_RANK[normalizeAccountTier(p.tier)] >= TIER_RANK.premium && !p.stripe_subscription_id;
}

export function hasLiveSubscription(p: BillingProfile | null): boolean {
  return !!p?.stripe_subscription_id && LIVE_SUB_STATUSES.has(p.subscription_status ?? "");
}

export type CheckoutDecision =
  | { ok: true; targetTier: PaidTier }
  | { ok: false; status: number; code: "unknown_price" | "not_an_upgrade" | "use_portal"; error: string };

/**
 * Decide whether the caller may open a checkout for `priceId`.
 * `profile` null = no row yet (treated as a new free account).
 */
export function decideCheckout(
  profile: BillingProfile | null,
  priceId: string,
  env: Record<string, string | undefined> = process.env,
): CheckoutDecision {
  const targetTier = tierForPriceId(priceId, env);
  if (!targetTier) {
    return { ok: false, status: 400, code: "unknown_price", error: "Unknown price" };
  }

  if (hasLiveSubscription(profile)) {
    return {
      ok: false,
      status: 409,
      code: "use_portal",
      error: "You already have a subscription — change plan in the billing portal",
    };
  }

  const stored = normalizeAccountTier(profile?.tier ?? "free");
  const effective = getEffectiveTier(stored, profile?.created_at ?? null);
  if (TIER_RANK[targetTier] <= TIER_RANK[effective]) {
    return {
      ok: false,
      status: 409,
      code: "not_an_upgrade",
      error: "Your current plan already includes this tier",
    };
  }
  return { ok: true, targetTier };
}

/**
 * Webhook `checkout.session.completed`: which tier to write.
 * A comp account is never lowered: if the purchased tier is below the comp
 * tier, keep the comp tier (returns `keepTier: true` so the caller can alert).
 */
export function resolveCheckoutTier(
  profile: Pick<BillingProfile, "tier" | "stripe_subscription_id"> | null,
  purchased: PaidTier | "free",
): { tier: AccountTier; keepTier: boolean } {
  const current = normalizeAccountTier(profile?.tier ?? "free");
  if (isCompAccount(profile) && TIER_RANK[purchased] < TIER_RANK[current]) {
    return { tier: current, keepTier: true };
  }
  return { tier: purchased, keepTier: false };
}

/**
 * BUG-DB-01: profiles.subscription_status has a CHECK that only allows
 * free / active / past_due / canceled / unpaid / trialing. Stripe also sends
 * incomplete, incomplete_expired and paused; writing those made the whole
 * update fail silently (tier unchanged). Map them onto allowed values.
 */
const DB_STATUSES = new Set(["free", "active", "past_due", "canceled", "unpaid", "trialing"]);
export function toDbSubscriptionStatus(status: string): string {
  if (DB_STATUSES.has(status)) return status;
  if (status === "incomplete") return "unpaid";
  return "canceled"; // incomplete_expired, paused, anything new
}

export interface BillingStatus {
  tier: AccountTier;
  effectiveTier: AccountTier;
  betaPromoActive: boolean;
  betaPromoDaysLeft: number;
  comp: boolean;
  hasSubscription: boolean;
  subscriptionStatus: string | null;
}

/** Server-computed billing status (beta promo from the DB `created_at`, not the browser). */
export function computeBillingStatus(profile: BillingProfile | null): BillingStatus {
  const tier = normalizeAccountTier(profile?.tier ?? "free");
  const createdAt = profile?.created_at ?? null;
  const effectiveTier = getEffectiveTier(tier, createdAt);
  const promo = tier === "free" && effectiveTier !== "free";
  return {
    tier,
    effectiveTier,
    betaPromoActive: promo,
    betaPromoDaysLeft: promo ? getBetaPromoDaysLeft(tier, createdAt) : 0,
    comp: isCompAccount(profile),
    hasSubscription: hasLiveSubscription(profile),
    subscriptionStatus: profile?.subscription_status ?? null,
  };
}
