import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  canUseEngine,
  recordSuccess,
  recordFailure,
  priceToBand,
  getEngineBand,
  getEnginePrice,
  getTierState,
  getBudgetSummary,
  pickAvailableEngine,
  TIER_ALLOWED_BANDS,
  TIER_MONTHLY_CAP_USD,
  TIER_DAILY_CALL_CAP,
  DEMOTE_THRESHOLD,
  __resetCreditManagerState,
  type Tier,
} from "./creditManager";

beforeEach(() => {
  __resetCreditManagerState();
});

afterEach(() => {
  vi.useRealTimers();
});

/* ------------------------------------------------------------------ */
/*  Band classification                                                */
/* ------------------------------------------------------------------ */

describe("priceToBand — strict range buckets", () => {
  it("classifies $0 as free", () => {
    expect(priceToBand(0)).toBe("free");
  });

  it("classifies BUDGET band (0, 0.005]", () => {
    expect(priceToBand(0.001)).toBe("budget");
    expect(priceToBand(0.003)).toBe("budget");
    expect(priceToBand(0.005)).toBe("budget");
  });

  it("classifies MID band (0.005, 0.02]", () => {
    expect(priceToBand(0.006)).toBe("mid");
    expect(priceToBand(0.015)).toBe("mid");
    expect(priceToBand(0.02)).toBe("mid");
  });

  it("classifies PREMIUM band (0.02, 0.10]", () => {
    expect(priceToBand(0.03)).toBe("premium");
    expect(priceToBand(0.065)).toBe("premium");
    expect(priceToBand(0.1)).toBe("premium");
  });

  it("classifies ENTERPRISE band (> 0.10)", () => {
    expect(priceToBand(0.15)).toBe("enterprise");
    expect(priceToBand(1.0)).toBe("enterprise");
  });
});

describe("engine-billing-data.json integration", () => {
  it("resolves real engine prices from the registry", () => {
    expect(getEnginePrice("pollinations")).toBe(0);
    expect(getEnginePrice("fireworks")).toBe(0.0014);
    expect(getEnginePrice("openai")).toBe(0.02);
    expect(getEnginePrice("stability")).toBe(0.065);
  });

  it("maps engines to their expected band", () => {
    expect(getEngineBand("pollinations")).toBe("free");
    expect(getEngineBand("cloudflare")).toBe("free"); // $0.00011
    expect(getEngineBand("fireworks")).toBe("budget");
    expect(getEngineBand("deepinfra")).toBe("mid"); // $0.015
    expect(getEngineBand("openai")).toBe("mid"); // $0.02 — upper boundary of mid
    expect(getEngineBand("leonardo")).toBe("premium"); // $0.03
    expect(getEngineBand("stability")).toBe("premium"); // $0.065
  });

  it("falls back to 0 price for unknown engine ids", () => {
    expect(getEnginePrice("unknown-engine-xyz")).toBe(0);
    expect(getEngineBand("unknown-engine-xyz")).toBe("free");
  });
});

/* ------------------------------------------------------------------ */
/*  Tier → band gating                                                 */
/* ------------------------------------------------------------------ */

describe("tier → allowed bands", () => {
  it("free tier can only use free band", () => {
    expect(TIER_ALLOWED_BANDS.free).toEqual(["free"]);
  });

  it("premium tier adds budget", () => {
    expect(TIER_ALLOWED_BANDS.premium).toContain("free");
    expect(TIER_ALLOWED_BANDS.premium).toContain("budget");
    expect(TIER_ALLOWED_BANDS.premium).not.toContain("mid");
  });

  it("architect tier adds mid", () => {
    expect(TIER_ALLOWED_BANDS.architect).toContain("mid");
    expect(TIER_ALLOWED_BANDS.architect).not.toContain("premium");
  });

  it("constructor tier gets premium band", () => {
    expect(TIER_ALLOWED_BANDS.constructor).toContain("premium");
    expect(TIER_ALLOWED_BANDS.constructor).not.toContain("enterprise");
  });

  it("no tier may call enterprise band", () => {
    for (const bands of Object.values(TIER_ALLOWED_BANDS)) {
      expect(bands).not.toContain("enterprise");
    }
  });
});

describe("canUseEngine — tier-aware gate", () => {
  it("free tier cannot call a paid engine even if engine has credit", () => {
    expect(canUseEngine("fireworks", { tier: "free" })).toBe(false);
    expect(canUseEngine("openai", { tier: "free" })).toBe(false);
    expect(canUseEngine("stability", { tier: "free" })).toBe(false);
  });

  it("free tier can call free engines", () => {
    expect(canUseEngine("pollinations", { tier: "free" })).toBe(true);
    expect(canUseEngine("cloudflare", { tier: "free" })).toBe(true);
    expect(canUseEngine("ai-horde", { tier: "free" })).toBe(true);
  });

  it("premium tier cannot call mid-band engines like openai", () => {
    expect(canUseEngine("openai", { tier: "premium" })).toBe(false);
    expect(canUseEngine("deepinfra", { tier: "premium" })).toBe(false);
  });

  it("premium tier can call budget-band engines", () => {
    expect(canUseEngine("fireworks", { tier: "premium" })).toBe(true);
    expect(canUseEngine("fal", { tier: "premium" })).toBe(true);
  });

  it("architect tier can call mid-band but not premium-band", () => {
    expect(canUseEngine("openai", { tier: "architect" })).toBe(true);
    expect(canUseEngine("leonardo", { tier: "architect" })).toBe(false);
    expect(canUseEngine("stability", { tier: "architect" })).toBe(false);
  });

  it("constructor tier can call premium-band engines", () => {
    expect(canUseEngine("leonardo", { tier: "constructor" })).toBe(true);
    expect(canUseEngine("stability", { tier: "constructor" })).toBe(true);
  });

  it("no context falls back to engine-level checks only (backwards compat)", () => {
    // Without a tier we don't enforce bands — just check the engine budget.
    expect(canUseEngine("stability")).toBe(true);
    expect(canUseEngine("openai")).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  Monthly cap + auto-demote                                          */
/* ------------------------------------------------------------------ */

describe("monthly cap enforcement", () => {
  it("hard-blocks a paid call once the tier has spent its monthly cap", () => {
    // Premium cap is $5. Spend half ($2.50) via a handful of large calls
    // (keep below the 100-call daily cap).
    for (let i = 0; i < 10; i++) {
      recordSuccess("fireworks", 0.25, 100, { tier: "premium" });
    }
    expect(getTierState("premium").spentUsd).toBeCloseTo(2.5);
    expect(getTierState("premium").demoted).toBe(false);
    expect(canUseEngine("fireworks", { tier: "premium" })).toBe(true);

    // Spend through the rest of the cap.
    recordSuccess("fireworks", 2.51, 100, { tier: "premium" });

    // Now paid calls are blocked by either demote or hard cap.
    expect(canUseEngine("fireworks", { tier: "premium" })).toBe(false);
    // But a free-band engine still works.
    expect(canUseEngine("pollinations", { tier: "premium" })).toBe(true);
  });

  it("silently demotes to free band at 80% of cap", () => {
    // Architect cap is $15. Demote threshold is 80% → $12.
    const cap = TIER_MONTHLY_CAP_USD.architect;
    const threshold = cap * DEMOTE_THRESHOLD;

    // Budget-band (fal $0.003) stays available up to threshold.
    expect(canUseEngine("fal", { tier: "architect" })).toBe(true);

    // Spend up to just under threshold.
    recordSuccess("fireworks", threshold - 0.01, 100, { tier: "architect" });
    expect(canUseEngine("fal", { tier: "architect" })).toBe(true);

    // Push past 80%.
    recordSuccess("fireworks", 0.02, 100, { tier: "architect" });

    const state = getTierState("architect");
    expect(state.demoted).toBe(true);

    // Paid-band calls now blocked; free-band calls still work.
    expect(canUseEngine("fal", { tier: "architect" })).toBe(false);
    expect(canUseEngine("openai", { tier: "architect" })).toBe(false);
    expect(canUseEngine("pollinations", { tier: "architect" })).toBe(true);
    expect(canUseEngine("cloudflare", { tier: "architect" })).toBe(true);
  });

  it("free + guest tiers have $0 monthly cap", () => {
    expect(TIER_MONTHLY_CAP_USD.free).toBe(0);
    expect(TIER_MONTHLY_CAP_USD.guest_free).toBe(0);
  });

  it("constructor has the highest cap", () => {
    expect(TIER_MONTHLY_CAP_USD.constructor).toBe(40);
    expect(TIER_MONTHLY_CAP_USD.constructor).toBeGreaterThan(
      TIER_MONTHLY_CAP_USD.architect,
    );
    expect(TIER_MONTHLY_CAP_USD.architect).toBeGreaterThan(
      TIER_MONTHLY_CAP_USD.premium,
    );
  });
});

/* ------------------------------------------------------------------ */
/*  Daily call cap                                                     */
/* ------------------------------------------------------------------ */

describe("daily call cap", () => {
  it("blocks when user hits the per-tier daily cap", () => {
    const cap = TIER_DAILY_CALL_CAP.premium;
    for (let i = 0; i < cap; i++) {
      recordSuccess("fireworks", 0.0014, 100, { tier: "premium" });
    }
    expect(canUseEngine("fireworks", { tier: "premium" })).toBe(false);
    expect(canUseEngine("pollinations", { tier: "premium" })).toBe(false); // even free is gated
  });

  it("failed calls count against daily cap (DoS protection)", () => {
    const cap = TIER_DAILY_CALL_CAP.free;
    for (let i = 0; i < cap; i++) {
      recordFailure("pollinations", "network", { tier: "free" });
    }
    expect(canUseEngine("pollinations", { tier: "free" })).toBe(false);
  });

  it("premium has higher cap than free", () => {
    expect(TIER_DAILY_CALL_CAP.premium).toBeGreaterThan(TIER_DAILY_CALL_CAP.free);
  });
});

/* ------------------------------------------------------------------ */
/*  UTC resets                                                         */
/* ------------------------------------------------------------------ */

describe("UTC resets", () => {
  it("clears monthly spend on 1st of next UTC month", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-19T10:00:00Z"));

    recordSuccess("fireworks", 2.0, 100, { tier: "premium" });
    expect(getTierState("premium").spentUsd).toBeCloseTo(2.0);
    expect(getTierState("premium").month).toBe("2026-11");

    // Jump to next month.
    vi.setSystemTime(new Date("2026-12-01T00:01:00Z"));

    const fresh = getTierState("premium");
    expect(fresh.month).toBe("2026-12");
    expect(fresh.spentUsd).toBe(0);
    expect(fresh.demoted).toBe(false);
  });

  it("clears daily call count on next UTC day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-19T23:50:00Z"));

    recordSuccess("pollinations", 0, 50, { tier: "free" });
    recordSuccess("pollinations", 0, 50, { tier: "free" });
    expect(getTierState("free").dailyCalls).toBe(2);

    vi.setSystemTime(new Date("2026-11-20T00:05:00Z"));

    expect(getTierState("free").dailyCalls).toBe(0);
    expect(getTierState("free").dailyResetDate).toBe("2026-11-20");
  });
});

/* ------------------------------------------------------------------ */
/*  pickAvailableEngine — the silent-demote entry point                */
/* ------------------------------------------------------------------ */

describe("pickAvailableEngine", () => {
  it("skips blocked engines and returns the first available one", () => {
    const chain = ["openai", "fal", "pollinations"];
    // Premium can't use openai (mid band) → should pick fal.
    expect(pickAvailableEngine(chain, { tier: "premium" })).toBe("fal");
  });

  it("falls through to a free engine once the tier is demoted", () => {
    // Push architect to demoted state.
    recordSuccess(
      "fireworks",
      TIER_MONTHLY_CAP_USD.architect * DEMOTE_THRESHOLD + 0.01,
      100,
      { tier: "architect" },
    );
    const chain = ["openai", "fal", "pollinations"];
    expect(pickAvailableEngine(chain, { tier: "architect" })).toBe("pollinations");
  });

  it("returns null when nothing in the chain is available", () => {
    const chain = ["openai", "stability"];
    expect(pickAvailableEngine(chain, { tier: "free" })).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/*  Admin summary                                                      */
/* ------------------------------------------------------------------ */

describe("getBudgetSummary — admin dashboard shape", () => {
  it("exposes band + price per engine", () => {
    const summary = getBudgetSummary();
    const fireworks = summary.engines.find((e) => e.engineId === "fireworks");
    expect(fireworks).toBeDefined();
    expect(fireworks!.band).toBe("budget");
    expect(fireworks!.pricePerImageUsd).toBe(0.0014);
  });

  it("includes per-tier spend state for all 5 tiers", () => {
    const summary = getBudgetSummary();
    const tiers = summary.tiers.map((t) => t.tier).sort();
    expect(tiers).toEqual([
      "architect",
      "constructor",
      "free",
      "guest_free",
      "premium",
    ] as Tier[]);
  });

  it("reflects accumulated spending in tier state", () => {
    recordSuccess("fireworks", 1.23, 100, { tier: "premium" });
    const summary = getBudgetSummary();
    const premium = summary.tiers.find((t) => t.tier === "premium");
    expect(premium?.spentUsd).toBeCloseTo(1.23);
    expect(premium?.capUsd).toBe(5);
    expect(premium?.utilization).toBeCloseTo(1.23 / 5);
  });
});
