import { describe, it, expect } from "vitest";
import {
  ACCOUNT_TIERS,
  getTierConfig,
  hasFeature,
  isBetaPromoActive,
  getEffectiveTier,
  getBetaPromoDaysLeft,
  type AccountTier,
} from "./types";

/* ═══════════════════════════════════════════════════════════
   Account Tier Config
   ═══════════════════════════════════════════════════════════ */

describe("ACCOUNT_TIERS", () => {
  it("should define exactly 5 tiers", () => {
    expect(ACCOUNT_TIERS).toHaveLength(5);
  });

  it("should have correct tier IDs in order", () => {
    const ids = ACCOUNT_TIERS.map((t) => t.id);
    expect(ids).toEqual(["guest_free", "free", "premium", "architect", "constructor"]);
  });

  it("should have correct monthly prices", () => {
    const prices = ACCOUNT_TIERS.map((t) => ({ id: t.id, price: t.priceMonthly }));
    expect(prices).toEqual([
      { id: "guest_free", price: null },
      { id: "free", price: null },
      { id: "premium", price: 29 },
      { id: "architect", price: 79 },
      { id: "constructor", price: 149 },
    ]);
  });

  it("should have correct yearly prices (17% savings)", () => {
    const prices = ACCOUNT_TIERS.map((t) => ({ id: t.id, price: t.priceYearly }));
    expect(prices).toEqual([
      { id: "guest_free", price: null },
      { id: "free", price: null },
      { id: "premium", price: 290 },
      { id: "architect", price: 790 },
      { id: "constructor", price: 1490 },
    ]);
  });

  it("each paid tier yearly should be < 12x monthly", () => {
    for (const tier of ACCOUNT_TIERS) {
      if (tier.priceMonthly && tier.priceYearly) {
        expect(tier.priceYearly).toBeLessThan(tier.priceMonthly * 12);
      }
    }
  });
});

/* ═══════════════════════════════════════════════════════════
   getTierConfig
   ═══════════════════════════════════════════════════════════ */

describe("getTierConfig", () => {
  it("should return the correct tier for each ID", () => {
    expect(getTierConfig("guest_free").label).toBe("Guest");
    expect(getTierConfig("free").label).toBe("Explorer");
    expect(getTierConfig("premium").label).toBe("Premium");
    expect(getTierConfig("architect").label).toBe("Architect");
    expect(getTierConfig("constructor").label).toBe("Constructor");
  });

  it("should fall back to guest_free for unknown tier", () => {
    const result = getTierConfig("unknown" as AccountTier);
    expect(result.id).toBe("guest_free");
  });
});

/* ═══════════════════════════════════════════════════════════
   hasFeature
   ═══════════════════════════════════════════════════════════ */

describe("hasFeature", () => {
  // Module limits
  it("guest_free should have maxModules = 4", () => {
    expect(getTierConfig("guest_free").features.maxModules).toBe(4);
  });

  it("free should have maxModules = 6", () => {
    expect(getTierConfig("free").features.maxModules).toBe(6);
  });

  it("premium should have maxModules = 12", () => {
    expect(getTierConfig("premium").features.maxModules).toBe(12);
  });

  it("architect should have maxModules = 50", () => {
    expect(getTierConfig("architect").features.maxModules).toBe(50);
  });

  it("constructor should have maxModules = 200", () => {
    expect(getTierConfig("constructor").features.maxModules).toBe(200);
  });

  // Boolean features
  it("guest_free should NOT have exportPdf", () => {
    expect(hasFeature("guest_free", "exportPdf")).toBe(false);
  });

  it("premium should have exportPdf", () => {
    expect(hasFeature("premium", "exportPdf")).toBe(true);
  });

  it("only constructor should have whiteLabel", () => {
    expect(hasFeature("guest_free", "whiteLabel")).toBe(false);
    expect(hasFeature("free", "whiteLabel")).toBe(false);
    expect(hasFeature("premium", "whiteLabel")).toBe(false);
    expect(hasFeature("architect", "whiteLabel")).toBe(false);
    expect(hasFeature("constructor", "whiteLabel")).toBe(true);
  });

  // AI renders
  it("free should have 5 AI renders per month", () => {
    expect(getTierConfig("free").features.aiRendersPerMonth).toBe(5);
  });

  it("premium should have 50 AI renders per month", () => {
    expect(getTierConfig("premium").features.aiRendersPerMonth).toBe(50);
  });

  it("constructor should have unlimited AI renders", () => {
    expect(getTierConfig("constructor").features.aiRendersPerMonth).toBe(-1);
    expect(hasFeature("constructor", "aiRendersPerMonth")).toBe(true);
  });

  // DWG export
  it("only architect+ should have DWG export", () => {
    expect(hasFeature("free", "exportDwg")).toBe(false);
    expect(hasFeature("premium", "exportDwg")).toBe(false);
    expect(hasFeature("architect", "exportDwg")).toBe(true);
    expect(hasFeature("constructor", "exportDwg")).toBe(true);
  });

  // Projects
  it("should have correct project limits", () => {
    expect(getTierConfig("guest_free").features.maxProjects).toBe(1);
    expect(getTierConfig("free").features.maxProjects).toBe(2);
    expect(getTierConfig("premium").features.maxProjects).toBe(10);
    expect(getTierConfig("architect").features.maxProjects).toBe(-1); // unlimited
    expect(getTierConfig("constructor").features.maxProjects).toBe(-1);
  });
});

/* ═══════════════════════════════════════════════════════════
   Beta Promo Logic
   ═══════════════════════════════════════════════════════════ */

describe("isBetaPromoActive", () => {
  it("should be false for non-free tiers", () => {
    const now = new Date().toISOString();
    expect(isBetaPromoActive("guest_free", now)).toBe(false);
    expect(isBetaPromoActive("premium", now)).toBe(false);
    expect(isBetaPromoActive("architect", now)).toBe(false);
    expect(isBetaPromoActive("constructor", now)).toBe(false);
  });

  it("should be true for free user created less than 3 months ago", () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    expect(isBetaPromoActive("free", oneWeekAgo.toISOString())).toBe(true);
  });

  it("should be false for free user created more than 3 months ago", () => {
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
    expect(isBetaPromoActive("free", fourMonthsAgo.toISOString())).toBe(false);
  });

  it("should be false when createdAt is null", () => {
    expect(isBetaPromoActive("free", null)).toBe(false);
  });
});

describe("getEffectiveTier", () => {
  it("should return premium for free users within beta promo", () => {
    const recent = new Date();
    recent.setDate(recent.getDate() - 1);
    expect(getEffectiveTier("free", recent.toISOString())).toBe("premium");
  });

  it("should return free for free users after beta expires", () => {
    const old = new Date();
    old.setMonth(old.getMonth() - 4);
    expect(getEffectiveTier("free", old.toISOString())).toBe("free");
  });

  it("should return the same tier for paid users", () => {
    const now = new Date().toISOString();
    expect(getEffectiveTier("premium", now)).toBe("premium");
    expect(getEffectiveTier("architect", now)).toBe("architect");
    expect(getEffectiveTier("constructor", now)).toBe("constructor");
  });
});

describe("getBetaPromoDaysLeft", () => {
  it("should return ~90 days for a user created today", () => {
    const today = new Date();
    const days = getBetaPromoDaysLeft("free", today.toISOString());
    expect(days).toBeGreaterThanOrEqual(89);
    expect(days).toBeLessThanOrEqual(92);
  });

  it("should return 0 for expired promo", () => {
    const old = new Date();
    old.setMonth(old.getMonth() - 4);
    expect(getBetaPromoDaysLeft("free", old.toISOString())).toBe(0);
  });

  it("should return 0 for non-free tiers", () => {
    expect(getBetaPromoDaysLeft("premium", new Date().toISOString())).toBe(0);
  });
});
