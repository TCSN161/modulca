// @vitest-environment node
import { describe, it, expect } from "vitest";
import { decideCheckout, resolveCheckoutTier, tierForPriceId, isCompAccount, type BillingProfile } from "./billing";

const ENV = {
  NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY: "price_pm",
  NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY: "price_py",
  NEXT_PUBLIC_STRIPE_PRICE_ARCHITECT_MONTHLY: "price_am",
  NEXT_PUBLIC_STRIPE_PRICE_ARCHITECT_YEARLY: "price_ay",
  NEXT_PUBLIC_STRIPE_PRICE_CONSTRUCTOR_MONTHLY: "price_cm",
  NEXT_PUBLIC_STRIPE_PRICE_CONSTRUCTOR_YEARLY: "",
};
const OLD = new Date(Date.now() - 400 * 86400_000).toISOString();
const NEW = new Date(Date.now() - 5 * 86400_000).toISOString();

const profile = (p: Partial<BillingProfile>): BillingProfile => ({
  tier: "free",
  created_at: OLD,
  stripe_subscription_id: null,
  subscription_status: "free",
  ...p,
});

describe("tierForPriceId", () => {
  it("maps configured prices and rejects unknown or empty ids", () => {
    expect(tierForPriceId("price_py", ENV)).toBe("premium");
    expect(tierForPriceId("price_cm", ENV)).toBe("constructor");
    expect(tierForPriceId("price_other", ENV)).toBeNull();
    expect(tierForPriceId("", ENV)).toBeNull();
  });
});

describe("decideCheckout (BUG-ST16)", () => {
  it("allows a free user (promo expired) to buy Premium", () => {
    expect(decideCheckout(profile({}), "price_pm", ENV)).toEqual({ ok: true, targetTier: "premium" });
  });

  it("treats a missing profile row as a new free account", () => {
    expect(decideCheckout(null, "price_am", ENV)).toEqual({ ok: true, targetTier: "architect" });
  });

  it("refuses Premium for a comp Constructor", () => {
    const d = decideCheckout(profile({ tier: "constructor" }), "price_pm", ENV);
    expect(d).toMatchObject({ ok: false, code: "not_an_upgrade", status: 409 });
  });

  it("refuses the same tier", () => {
    expect(decideCheckout(profile({ tier: "architect" }), "price_ay", ENV)).toMatchObject({ ok: false, code: "not_an_upgrade" });
  });

  it("uses the effective tier: a beta-promo user already has Premium, may buy Architect", () => {
    expect(decideCheckout(profile({ beta_invited_at: NEW }), "price_pm", ENV)).toMatchObject({ ok: false, code: "not_an_upgrade" });
    expect(decideCheckout(profile({ beta_invited_at: NEW }), "price_am", ENV)).toMatchObject({ ok: true });
  });

  it("sends a live subscriber to the portal instead of a second subscription", () => {
    const p = profile({ tier: "premium", stripe_subscription_id: "sub_1", subscription_status: "active" });
    expect(decideCheckout(p, "price_am", ENV)).toMatchObject({ ok: false, code: "use_portal" });
  });

  it("lets a user with a canceled old subscription check out again", () => {
    const p = profile({ stripe_subscription_id: "sub_old", subscription_status: "canceled" });
    expect(decideCheckout(p, "price_pm", ENV)).toMatchObject({ ok: true });
  });

  it("rejects an unknown price id", () => {
    expect(decideCheckout(profile({}), "price_hacked", ENV)).toMatchObject({ ok: false, code: "unknown_price", status: 400 });
  });
});

describe("resolveCheckoutTier (webhook)", () => {
  it("never lowers a comp account", () => {
    expect(isCompAccount({ tier: "constructor", stripe_subscription_id: null })).toBe(true);
    expect(resolveCheckoutTier({ tier: "constructor", stripe_subscription_id: null }, "premium")).toEqual({
      tier: "constructor",
      keepTier: true,
    });
  });

  it("applies an upgrade for a comp account", () => {
    expect(resolveCheckoutTier({ tier: "premium", stripe_subscription_id: null }, "architect")).toEqual({
      tier: "architect",
      keepTier: false,
    });
  });

  it("applies the purchased tier for Stripe-managed and free accounts", () => {
    expect(resolveCheckoutTier({ tier: "architect", stripe_subscription_id: "sub_1" }, "premium").tier).toBe("premium");
    expect(resolveCheckoutTier({ tier: "free", stripe_subscription_id: null }, "premium").tier).toBe("premium");
    expect(resolveCheckoutTier(null, "premium").tier).toBe("premium");
  });
});

describe("toDbSubscriptionStatus (BUG-DB-01)", () => {
  it("keeps allowed statuses and maps the ones the CHECK rejects", async () => {
    const { toDbSubscriptionStatus } = await import("./billing");
    expect(toDbSubscriptionStatus("active")).toBe("active");
    expect(toDbSubscriptionStatus("trialing")).toBe("trialing");
    expect(toDbSubscriptionStatus("incomplete")).toBe("unpaid");
    expect(toDbSubscriptionStatus("incomplete_expired")).toBe("canceled");
    expect(toDbSubscriptionStatus("paused")).toBe("canceled");
  });
});

describe("computeBillingStatus (server-side beta promo)", () => {
  it("reports the promo for an invited free account and none for comp", async () => {
    const { computeBillingStatus } = await import("./billing");
    const s = computeBillingStatus(profile({ beta_invited_at: NEW }));
    expect(s).toMatchObject({ tier: "free", effectiveTier: "premium", betaPromoActive: true, comp: false, betaInvitedAt: NEW });
    expect(s.betaPromoDaysLeft).toBeGreaterThan(80);
    const c = computeBillingStatus(profile({ tier: "constructor" }));
    expect(c).toMatchObject({ effectiveTier: "constructor", betaPromoActive: false, comp: true, hasSubscription: false });
    expect(computeBillingStatus(null)).toMatchObject({ tier: "free", effectiveTier: "free", betaPromoActive: false });
  });

  it("BUG-B2-02: the anchor is beta_invited_at, not created_at", async () => {
    const { computeBillingStatus } = await import("./billing");
    // New account, not invited → no promo.
    expect(computeBillingStatus(profile({ created_at: NEW }))).toMatchObject({ effectiveTier: "free", betaPromoActive: false, betaInvitedAt: null });
    // Old account (signed up long before the beta), invited 5 days ago → full promo.
    const s = computeBillingStatus(profile({ created_at: OLD, beta_invited_at: NEW }));
    expect(s.effectiveTier).toBe("premium");
    expect(s.betaPromoDaysLeft).toBeGreaterThan(80);
    // Invited 400 days ago → expired.
    expect(computeBillingStatus(profile({ beta_invited_at: OLD })).betaPromoActive).toBe(false);
  });
});
