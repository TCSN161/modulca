import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "./store";

/* ═══════════════════════════════════════════════════════════
   Mocks
   ═══════════════════════════════════════════════════════════ */

// Mock Supabase — return null (demo mode) so no network calls
vi.mock("@/shared/lib/supabase", () => ({
  getSupabase: () => null,
}));

/* ═══════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════ */

function resetStore(overrides: Record<string, unknown> = {}) {
  useAuthStore.setState({
    isAuthenticated: false,
    userId: null,
    userName: null,
    userEmail: null,
    userTier: "guest_free",
    userAvatar: null,
    loading: false,
    error: null,
    projectCount: 0,
    storageUsedMb: 0,
    aiCallsToday: 0,
    monthlyRenderCount: 0,
    totalCostUsd: 0,
    stripeCustomerId: null,
    userCreatedAt: null,
    betaPromoActive: false,
    betaPromoDaysLeft: 0,
    ...overrides,
  });
}

/* ═══════════════════════════════════════════════════════════
   Tests
   ═══════════════════════════════════════════════════════════ */

beforeEach(() => {
  localStorage.clear();
  resetStore();
});

/* ── canCreateProject ── */

describe("canCreateProject", () => {
  it("free tier (guest_free): allows up to 1 project", () => {
    resetStore({ userTier: "guest_free", projectCount: 0 });
    expect(useAuthStore.getState().canCreateProject()).toEqual({ allowed: true });

    resetStore({ userTier: "guest_free", projectCount: 1 });
    const result = useAuthStore.getState().canCreateProject();
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("1");
  });

  it("free tier: allows up to 2 projects", () => {
    resetStore({ userTier: "free", projectCount: 0, userCreatedAt: null });
    expect(useAuthStore.getState().canCreateProject()).toEqual({ allowed: true });

    resetStore({ userTier: "free", projectCount: 2, userCreatedAt: null });
    const result = useAuthStore.getState().canCreateProject();
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("2");
  });

  it("free tier with beta promo: gets premium limits (10 projects)", () => {
    const recent = new Date();
    recent.setDate(recent.getDate() - 1);
    resetStore({ userTier: "free", projectCount: 5, userCreatedAt: recent.toISOString() });
    // Beta promo elevates free -> premium (10 projects)
    expect(useAuthStore.getState().canCreateProject()).toEqual({ allowed: true });
  });

  it("premium tier: allows up to 10 projects", () => {
    resetStore({ userTier: "premium", projectCount: 9 });
    expect(useAuthStore.getState().canCreateProject()).toEqual({ allowed: true });

    resetStore({ userTier: "premium", projectCount: 10 });
    const result = useAuthStore.getState().canCreateProject();
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("10");
  });

  it("architect tier: unlimited projects (-1)", () => {
    resetStore({ userTier: "architect", projectCount: 100 });
    expect(useAuthStore.getState().canCreateProject()).toEqual({ allowed: true });
  });

  it("constructor tier: unlimited projects (-1)", () => {
    resetStore({ userTier: "constructor", projectCount: 999 });
    expect(useAuthStore.getState().canCreateProject()).toEqual({ allowed: true });
  });
});

/* ── canUseMonthlyRender ── */

describe("canUseMonthlyRender", () => {
  it("free tier: allows up to 5 renders", () => {
    resetStore({ userTier: "free", monthlyRenderCount: 4, userCreatedAt: null });
    expect(useAuthStore.getState().canUseMonthlyRender()).toEqual({ allowed: true });

    resetStore({ userTier: "free", monthlyRenderCount: 5, userCreatedAt: null });
    const result = useAuthStore.getState().canUseMonthlyRender();
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("5");
  });

  it("premium tier: allows up to 50 renders", () => {
    resetStore({ userTier: "premium", monthlyRenderCount: 49 });
    expect(useAuthStore.getState().canUseMonthlyRender()).toEqual({ allowed: true });

    resetStore({ userTier: "premium", monthlyRenderCount: 50 });
    const result = useAuthStore.getState().canUseMonthlyRender();
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("50");
  });

  it("architect tier: allows up to 200 renders", () => {
    resetStore({ userTier: "architect", monthlyRenderCount: 199 });
    expect(useAuthStore.getState().canUseMonthlyRender()).toEqual({ allowed: true });

    resetStore({ userTier: "architect", monthlyRenderCount: 200 });
    const result = useAuthStore.getState().canUseMonthlyRender();
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("200");
  });

  it("constructor tier: unlimited renders (-1)", () => {
    resetStore({ userTier: "constructor", monthlyRenderCount: 9999 });
    expect(useAuthStore.getState().canUseMonthlyRender()).toEqual({ allowed: true });
  });
});

/* ── getEffectiveTier ── */

describe("getEffectiveTier (store method)", () => {
  it("returns premium for free user within beta promo window", () => {
    const recent = new Date();
    recent.setDate(recent.getDate() - 7);
    resetStore({ userTier: "free", userCreatedAt: recent.toISOString() });
    expect(useAuthStore.getState().getEffectiveTier()).toBe("premium");
  });

  it("returns free for free user after beta promo expires", () => {
    const old = new Date();
    old.setMonth(old.getMonth() - 4);
    resetStore({ userTier: "free", userCreatedAt: old.toISOString() });
    expect(useAuthStore.getState().getEffectiveTier()).toBe("free");
  });

  it("returns same tier for paid users regardless of createdAt", () => {
    const recent = new Date().toISOString();
    resetStore({ userTier: "premium", userCreatedAt: recent });
    expect(useAuthStore.getState().getEffectiveTier()).toBe("premium");

    resetStore({ userTier: "architect", userCreatedAt: recent });
    expect(useAuthStore.getState().getEffectiveTier()).toBe("architect");

    resetStore({ userTier: "constructor", userCreatedAt: recent });
    expect(useAuthStore.getState().getEffectiveTier()).toBe("constructor");
  });

  it("returns free when createdAt is null (no beta promo)", () => {
    resetStore({ userTier: "free", userCreatedAt: null });
    expect(useAuthStore.getState().getEffectiveTier()).toBe("free");
  });
});

/* ── signOut ── */

describe("signOut", () => {
  it("resets all state to defaults", async () => {
    // Set up authenticated state
    resetStore({
      isAuthenticated: true,
      userId: "user-123",
      userName: "Test User",
      userEmail: "test@example.com",
      userTier: "premium",
      projectCount: 5,
      monthlyRenderCount: 10,
      aiCallsToday: 3,
      totalCostUsd: 1.50,
      betaPromoActive: true,
      betaPromoDaysLeft: 45,
    });

    await useAuthStore.getState().signOut();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.userId).toBeNull();
    expect(state.userName).toBeNull();
    expect(state.userEmail).toBeNull();
    expect(state.userTier).toBe("guest_free");
    expect(state.userAvatar).toBeNull();
    expect(state.error).toBeNull();
    expect(state.projectCount).toBe(0);
    expect(state.storageUsedMb).toBe(0);
    expect(state.aiCallsToday).toBe(0);
    expect(state.monthlyRenderCount).toBe(0);
    expect(state.totalCostUsd).toBe(0);
    expect(state.stripeCustomerId).toBeNull();
    expect(state.userCreatedAt).toBeNull();
    expect(state.betaPromoActive).toBe(false);
    expect(state.betaPromoDaysLeft).toBe(0);
  });

  it("clears localStorage auth key", async () => {
    localStorage.setItem("modulca-auth", JSON.stringify({ name: "Test", email: "t@t.com", tier: "free" }));

    await useAuthStore.getState().signOut();

    expect(localStorage.getItem("modulca-auth")).toBeNull();
  });
});
