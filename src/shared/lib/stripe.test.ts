import { describe, it, expect, vi } from "vitest";
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
    for (const [, val] of Object.entries(STRIPE_PRICES)) {
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

describe("openCustomerPortal (BUG-ST14)", () => {
  it("sends the Bearer token and returns 'comp' without alerting when notify is false", async () => {
    vi.resetModules();
    vi.doMock("@/shared/lib/authHeaders", () => ({ authHeaders: async () => ({ Authorization: "Bearer tok" }) }));
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ code: "comp" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const alertMock = vi.fn();
    vi.stubGlobal("alert", alertMock);
    const { openCustomerPortal } = await import("./stripe");
    await expect(openCustomerPortal(null, { notify: false })).resolves.toBe("comp");
    const init = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok");
    expect(alertMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("falls back to a Romanian message on a ro page", async () => {
    const { portalFallbackMessage } = await import("./stripe");
    document.documentElement.lang = "ro";
    expect(portalFallbackMessage("comp")).toContain("Cont gratuit (comp), fără abonament Stripe");
    document.documentElement.lang = "en";
    expect(portalFallbackMessage("comp")).toContain("Free account (comp)");
  });
});
