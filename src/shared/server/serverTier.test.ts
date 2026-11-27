// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { getServerTier, getGuestSubject, normalizeTier, type ServerTierDeps } from "./serverTier";

vi.mock("@/shared/lib/api-auth", () => ({ getAuthenticatedUser: vi.fn(async () => null) }));
vi.mock("@/shared/lib/supabase-server", () => ({ getSupabaseServer: () => null }));

const UID = "11111111-2222-3333-4444-555555555555";
const daysAgo = (d: number) => new Date(Date.now() - d * 86400_000).toISOString();

function req(headers: Record<string, string> = {}, body?: unknown): Request {
  return new Request("https://modulca.eu/api/x?tier=constructor", {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

function deps(userId: string | null, profile: { tier: string | null; created_at: string | null; beta_invited_at?: string | null } | null): ServerTierDeps {
  return { getUserId: async () => userId, loadProfile: async () => profile };
}

describe("getServerTier", () => {
  it("returns guest when there is no session, ignoring a client-sent tier", async () => {
    const r = await getServerTier(req({ "x-forwarded-for": "1.2.3.4" }, { tier: "constructor" }), deps(null, null));
    expect(r.userId).toBeNull();
    expect(r.tier).toBe("guest_free");
    expect(r.effectiveTier).toBe("guest_free");
    expect(r.quotaSubject).toMatch(/^ip:[0-9a-f]{32}$/);
  });

  it("uses the profile tier for a logged-in user", async () => {
    const r = await getServerTier(req(), deps(UID, { tier: "architect", created_at: daysAgo(400) }));
    expect(r).toEqual({ userId: UID, tier: "architect", effectiveTier: "architect", quotaSubject: `user:${UID}` });
  });

  it("applies the beta promo: free + invited < 3 months ago → premium", async () => {
    const r = await getServerTier(req(), deps(UID, { tier: "free", created_at: daysAgo(400), beta_invited_at: daysAgo(10) }));
    expect(r.tier).toBe("free");
    expect(r.effectiveTier).toBe("premium");
  });

  it("no promo after 3 months", async () => {
    const r = await getServerTier(req(), deps(UID, { tier: "free", created_at: daysAgo(10), beta_invited_at: daysAgo(120) }));
    expect(r.effectiveTier).toBe("free");
  });

  it("BUG-B2-02/03: a new free account that was not invited gets no promo", async () => {
    const r = await getServerTier(req(), deps(UID, { tier: "free", created_at: daysAgo(1) }));
    expect(r.effectiveTier).toBe("free");
    const r2 = await getServerTier(req(), deps(UID, { tier: "free", created_at: daysAgo(1), beta_invited_at: null }));
    expect(r2.effectiveTier).toBe("free");
  });

  it("promo does not apply to paid tiers", async () => {
    const r = await getServerTier(req(), deps(UID, { tier: "constructor", created_at: daysAgo(1) }));
    expect(r.effectiveTier).toBe("constructor");
  });

  it("falls back to free (no promo) when the profile cannot be read", async () => {
    const r = await getServerTier(req(), deps(UID, null));
    expect(r).toMatchObject({ userId: UID, tier: "free", effectiveTier: "free" });
  });

  it("unknown or guest tier in the row becomes free for a logged-in user", async () => {
    expect((await getServerTier(req(), deps(UID, { tier: "godmode", created_at: daysAgo(400) }))).tier).toBe("free");
    expect((await getServerTier(req(), deps(UID, { tier: "guest_free", created_at: daysAgo(400) }))).tier).toBe("free");
  });

  it("treats a throwing session check as guest", async () => {
    const r = await getServerTier(req(), { getUserId: async () => { throw new Error("boom"); }, loadProfile: async () => null });
    expect(r.tier).toBe("guest_free");
  });

  it("default deps: no Supabase configured → guest", async () => {
    const r = await getServerTier(req({ authorization: "Bearer fake" }));
    expect(r.tier).toBe("guest_free");
  });
});

describe("getGuestSubject", () => {
  it("hashes the first x-forwarded-for IP, stable and without the raw IP", () => {
    const a = getGuestSubject(req({ "x-forwarded-for": "9.8.7.6, 10.0.0.1" }));
    const b = getGuestSubject(req({ "x-forwarded-for": "9.8.7.6" }));
    expect(a).toBe(b);
    expect(a).not.toContain("9.8.7.6");
  });

  it("different IPs → different subjects", () => {
    expect(getGuestSubject(req({ "x-real-ip": "1.1.1.1" }))).not.toBe(getGuestSubject(req({ "x-real-ip": "2.2.2.2" })));
  });

  it("uses the mca_gid cookie when there is no IP", () => {
    expect(getGuestSubject(req({ cookie: "foo=1; mca_gid=abc123" }))).toMatch(/^gid:[0-9a-f]{32}$/);
  });

  it("falls back to a shared anon bucket", () => {
    expect(getGuestSubject(req())).toBe("anon");
  });
});

describe("normalizeTier", () => {
  it("accepts known tiers and defaults the rest to free", () => {
    expect(normalizeTier("premium")).toBe("premium");
    expect(normalizeTier(null)).toBe("free");
    expect(normalizeTier("CONSTRUCTOR")).toBe("free");
  });
});
