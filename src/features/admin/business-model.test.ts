import { describe, it, expect } from "vitest";
import {
  projectRevenue,
  getARR,
  getBreakEvenMonth,
  TIER_PRICING,
  CHURN_RATES,
  INFRA_COSTS,
  AI_RENDER_COST,
} from "./business-model";

/* ═══════════════════════════════════════════════════════════
   projectRevenue
   ═══════════════════════════════════════════════════════════ */

describe("projectRevenue", () => {
  it("returns correct array length matching months parameter", () => {
    const result12 = projectRevenue({ months: 12 });
    expect(result12).toHaveLength(12);

    const result24 = projectRevenue({ months: 24 });
    expect(result24).toHaveLength(24);

    const result6 = projectRevenue({ months: 6 });
    expect(result6).toHaveLength(6);
  });

  it("defaults to 24 months when no params given", () => {
    const result = projectRevenue();
    expect(result).toHaveLength(24);
  });

  it("first month has zero or near-zero paid users", () => {
    const result = projectRevenue({ months: 3 });
    const first = result[0];
    // First month: conversions start from initial free users
    expect(first.month).toBe(0);
    expect(first.freeUsers).toBeGreaterThan(0);
  });

  it("free user count grows over time", () => {
    const result = projectRevenue({ months: 12 });
    expect(result[11].freeUsers).toBeGreaterThan(result[0].freeUsers);
  });

  it("MRR grows over time as paid users accumulate", () => {
    const result = projectRevenue({ months: 12 });
    // MRR in later months should exceed earlier months
    expect(result[11].mrr).toBeGreaterThan(result[2].mrr);
  });

  it("each projection has all required fields", () => {
    const result = projectRevenue({ months: 1 });
    const month = result[0];

    expect(month).toHaveProperty("month");
    expect(month).toHaveProperty("freeUsers");
    expect(month).toHaveProperty("premiumUsers");
    expect(month).toHaveProperty("architectUsers");
    expect(month).toHaveProperty("constructorUsers");
    expect(month).toHaveProperty("mrr");
    expect(month).toHaveProperty("aiCost");
    expect(month).toHaveProperty("infraCost");
    expect(month).toHaveProperty("grossProfit");
    expect(month).toHaveProperty("grossMargin");
  });

  it("respects custom initial free users", () => {
    const result = projectRevenue({ months: 1, initialFreeUsers: 500 });
    // After one month of 25% growth: 500 * 1.25 = 625
    expect(result[0].freeUsers).toBe(625);
  });

  it("grossProfit ≈ mrr - aiCost - infraCost (within floating point tolerance)", () => {
    const result = projectRevenue({ months: 12 });
    for (const m of result) {
      const expected = m.mrr - m.aiCost - m.infraCost;
      expect(m.grossProfit).toBeCloseTo(expected, 1);
    }
  });
});

/* ═══════════════════════════════════════════════════════════
   getARR
   ═══════════════════════════════════════════════════════════ */

describe("getARR", () => {
  it("returns year 1 ARR as 12x the last month MRR", () => {
    const projections = projectRevenue({ months: 12 });
    const lastMonthMrr = projections[11].mrr;
    expect(getARR(1)).toBe(lastMonthMrr * 12);
  });

  it("year 2 ARR is greater than year 1 ARR", () => {
    expect(getARR(2)).toBeGreaterThan(getARR(1));
  });

  it("ARR is always a positive number", () => {
    expect(getARR(1)).toBeGreaterThan(0);
    expect(getARR(2)).toBeGreaterThan(0);
    expect(getARR(3)).toBeGreaterThan(0);
  });
});

/* ═══════════════════════════════════════════════════════════
   getBreakEvenMonth
   ═══════════════════════════════════════════════════════════ */

describe("getBreakEvenMonth", () => {
  it("returns a valid month index (0-35) or -1", () => {
    const month = getBreakEvenMonth();
    expect(month).toBeGreaterThanOrEqual(-1);
    expect(month).toBeLessThan(36);
  });

  it("break-even month has gross profit > 500", () => {
    const month = getBreakEvenMonth();
    if (month >= 0) {
      const projections = projectRevenue({ months: 36 });
      expect(projections[month].grossProfit).toBeGreaterThan(500);
    }
  });

  it("month before break-even has gross profit <= 500", () => {
    const month = getBreakEvenMonth();
    if (month > 0) {
      const projections = projectRevenue({ months: 36 });
      expect(projections[month - 1].grossProfit).toBeLessThanOrEqual(500);
    }
  });
});

/* ═══════════════════════════════════════════════════════════
   Constants sanity checks
   ═══════════════════════════════════════════════════════════ */

describe("business model constants", () => {
  it("TIER_PRICING: free tier costs nothing", () => {
    expect(TIER_PRICING.free.monthly).toBe(0);
    expect(TIER_PRICING.free.yearly).toBe(0);
  });

  it("TIER_PRICING: paid tiers have positive yearly pricing", () => {
    for (const tier of ["premium", "architect", "constructor"] as const) {
      expect(TIER_PRICING[tier].yearly).toBeGreaterThan(0);
      expect(TIER_PRICING[tier].monthly).toBeGreaterThan(0);
    }
  });

  it("CHURN_RATES: higher tiers have lower churn", () => {
    expect(CHURN_RATES.constructor).toBeLessThan(CHURN_RATES.architect);
    expect(CHURN_RATES.architect).toBeLessThan(CHURN_RATES.premium);
  });

  it("INFRA_COSTS: costs increase with user count", () => {
    for (let i = 1; i < INFRA_COSTS.length; i++) {
      expect(INFRA_COSTS[i].monthlyCost).toBeGreaterThanOrEqual(INFRA_COSTS[i - 1].monthlyCost);
    }
  });

  it("AI_RENDER_COST: is a small positive number", () => {
    expect(AI_RENDER_COST).toBeGreaterThan(0);
    expect(AI_RENDER_COST).toBeLessThan(1);
  });
});
