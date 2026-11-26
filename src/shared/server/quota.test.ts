// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ServerTierContext } from "./serverTier";

const rpc = vi.fn();
let supabaseConfigured = false;
vi.mock("@/shared/lib/supabase-server", () => ({
  getSupabaseServer: () => (supabaseConfigured ? { rpc } : null),
}));

import { checkAndConsumeQuota, refundQuota, getQuotaLimits, quotaExceededResponse, __resetQuotaMemory } from "./quota";

const ctx = (effectiveTier: ServerTierContext["effectiveTier"], subject = "user:u1"): ServerTierContext => ({
  userId: subject.startsWith("user:") ? subject.slice(5) : null,
  tier: effectiveTier,
  effectiveTier,
  quotaSubject: subject,
});

beforeEach(() => {
  __resetQuotaMemory();
  rpc.mockReset();
  supabaseConfigured = false;
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("getQuotaLimits (from tier config)", () => {
  it("render limits per tier", () => {
    expect(getQuotaLimits("guest_free", "render")).toEqual({ day: 2, month: 3 });
    expect(getQuotaLimits("premium", "render")).toEqual({ day: 5, month: 50 });
    expect(getQuotaLimits("constructor", "render")).toEqual({ day: 100, month: -1 });
  });
  it("ai_call is daily only", () => {
    expect(getQuotaLimits("free", "ai_call")).toEqual({ day: 20, month: -1 });
  });
});

describe("checkAndConsumeQuota — memory fallback", () => {
  it("allows up to the daily limit, then blocks with a reason", async () => {
    const c = ctx("premium");
    for (let i = 1; i <= 5; i++) {
      const r = await checkAndConsumeQuota(c, "render");
      expect(r).toMatchObject({ allowed: true, used: { day: i }, source: "memory" });
    }
    const blocked = await checkAndConsumeQuota(c, "render");
    expect(blocked.allowed).toBe(false);
    expect(blocked.exceeded).toBe("day");
    expect(blocked.reason).toMatch(/5\/day/);
  });

  it("guest: daily cap of 2 blocks the 3rd render", async () => {
    const c = ctx("guest_free", "ip:abc");
    expect((await checkAndConsumeQuota(c, "render")).allowed).toBe(true);
    expect((await checkAndConsumeQuota(c, "render")).allowed).toBe(true);
    const r = await checkAndConsumeQuota(c, "render");
    expect(r).toMatchObject({ allowed: false, exceeded: "day" });
  });

  it("counts per user, not per tier (E08)", async () => {
    for (let i = 0; i < 5; i++) await checkAndConsumeQuota(ctx("premium", "user:a"), "render");
    expect((await checkAndConsumeQuota(ctx("premium", "user:a"), "render")).allowed).toBe(false);
    expect((await checkAndConsumeQuota(ctx("premium", "user:b"), "render")).allowed).toBe(true);
  });

  it("kinds are counted separately", async () => {
    for (let i = 0; i < 5; i++) await checkAndConsumeQuota(ctx("premium"), "render");
    expect((await checkAndConsumeQuota(ctx("premium"), "ai_call")).allowed).toBe(true);
  });

  it("refund gives one unit back", async () => {
    const c = ctx("guest_free", "ip:r");
    await checkAndConsumeQuota(c, "render");
    const second = await checkAndConsumeQuota(c, "render");
    await refundQuota(c, "render", second.source);
    expect((await checkAndConsumeQuota(c, "render")).allowed).toBe(true);
  });
});

describe("checkAndConsumeQuota — database", () => {
  beforeEach(() => {
    supabaseConfigured = true;
  });

  it("passes subject + tier limits to consume_quota and maps the row", async () => {
    rpc.mockResolvedValue({ data: [{ allowed: true, day_count: 1, month_count: 7, exceeded: null }], error: null });
    const r = await checkAndConsumeQuota(ctx("premium"), "render");
    expect(rpc).toHaveBeenCalledWith("consume_quota", { p_subject: "user:u1", p_kind: "render", p_day_limit: 5, p_month_limit: 50 });
    expect(r).toMatchObject({ allowed: true, used: { day: 1, month: 7 }, source: "db" });
  });

  it("maps a refusal", async () => {
    rpc.mockResolvedValue({ data: [{ allowed: false, day_count: 50, month_count: 50, exceeded: "month" }], error: null });
    const r = await checkAndConsumeQuota(ctx("premium"), "render");
    expect(r).toMatchObject({ allowed: false, exceeded: "month", source: "db" });
    expect(r.reason).toMatch(/Monthly/);
  });

  it("falls back to memory when the RPC errors (migration not applied)", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "function consume_quota does not exist" } });
    const r = await checkAndConsumeQuota(ctx("premium"), "render");
    expect(r).toMatchObject({ allowed: true, source: "memory" });
  });

  it("refund calls refund_quota for db results", async () => {
    rpc.mockResolvedValue({ data: null, error: null });
    await refundQuota(ctx("premium"), "render", "db");
    expect(rpc).toHaveBeenCalledWith("refund_quota", { p_subject: "user:u1", p_kind: "render" });
  });

  it("constructor ai_call (1000/day) is still counted", async () => {
    rpc.mockResolvedValue({ data: [{ allowed: true, day_count: 1, month_count: 1, exceeded: null }], error: null });
    await checkAndConsumeQuota(ctx("constructor"), "ai_call");
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});

describe("quotaExceededResponse", () => {
  it("returns a 429 with code QUOTA_EXCEEDED", async () => {
    supabaseConfigured = false;
    const c = ctx("guest_free", "ip:z");
    await checkAndConsumeQuota(c, "render");
    await checkAndConsumeQuota(c, "render");
    const res = quotaExceededResponse(await checkAndConsumeQuota(c, "render"));
    expect(res.status).toBe(429);
    expect((await res.json()).code).toBe("QUOTA_EXCEEDED");
  });
});
