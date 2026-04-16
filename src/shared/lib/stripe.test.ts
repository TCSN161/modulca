import { describe, it, expect } from "vitest";
import { STRIPE_PRICES, isStripeConfigured } from "./stripe";

/**
 * Stripe configuration tests.
 * Validates price mapping structure and demo mode detection.
 */

describe("STRIPE_PRICES", () => {
  it("should define all 6 price keys", () => {
    const keys = Object.keys(STRIPE_PRICES);
    expect(keys).toHaveLength(6);
    expect(keys).toEqual([
      "premium_monthly",
      "premium_yearly",
      "architect_monthly",
      "architect_yearly",
      "constructor_monthly",
      "constructor_yearly",
    ]);
  });

  it("all prices should be strings (empty or price IDs)", () => {
    for (const [key, val] of Object.entries(STRIPE_PRICES)) {
      expect(typeof val).toBe("string");
      // In test env, no env vars set so all should be empty string
      expect(val).toBe("");
    }
  });
});

describe("isStripeConfigured", () => {
  it("should be false in test environment (no keys)", () => {
    expect(isStripeConfigured).toBe(false);
  });
});
