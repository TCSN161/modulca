import { describe, it, expect, vi, afterEach } from "vitest";
import {
  checkAuth,
  checkDb,
  checkStripe,
  checkEngines,
  checkKnowledge,
  overallStatus,
  stripeMode,
} from "./checks";

const SB = { NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon", SUPABASE_SERVICE_ROLE_KEY: "svc" };

afterEach(() => vi.unstubAllGlobals());

describe("health checks (BUG-ST21)", () => {
  it("stripeMode reads the key prefix", () => {
    expect(stripeMode("sk_test_abc")).toBe("test");
    expect(stripeMode("pk_live_abc")).toBe("live");
    expect(stripeMode("rk_test_abc")).toBe("test");
    expect(stripeMode(undefined)).toBe("unknown");
  });

  it("auth/db are down without env, ok on 200", async () => {
    expect((await checkAuth({})).status).toBe("down");
    expect((await checkDb({})).status).toBe("down");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 200 })));
    expect((await checkAuth(SB)).status).toBe("ok");
    expect((await checkDb(SB)).status).toBe("ok");
  });

  it("network failure maps to down with detail", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("ECONNREFUSED"); }));
    const r = await checkAuth(SB);
    expect(r.status).toBe("down");
    expect(r.detail).toBe("ECONNREFUSED");
  });

  it("stripe: 401 = down, mismatch = degraded, never echoes the key", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 401 })));
    expect((await checkStripe({ STRIPE_SECRET_KEY: "sk_test_secret" })).status).toBe("down");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    const r = await checkStripe({
      STRIPE_SECRET_KEY: "sk_test_secret",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_x",
      STRIPE_WEBHOOK_SECRET: "whsec",
    });
    expect(r.status).toBe("degraded");
    expect(r.mode).toBe("test");
    expect(JSON.stringify(r)).not.toContain("sk_test_secret");
  });

  it("engines: config-only, kill switch skips, missing pollinations key degrades", () => {
    const r = checkEngines({ CLOUDFLARE_ACCOUNT_ID: "a", CLOUDFLARE_API_TOKEN: "t", AI_ENGINES_DISABLED: "cloudflare-klein" });
    const byId = Object.fromEntries((r.engines as { id: string; status: string }[]).map((e) => [e.id, e.status]));
    expect(byId.cloudflare).toBe("ok");
    expect(byId["cloudflare-klein"]).toBe("skipped");
    expect(byId.fal).toBe("skipped");
    expect(byId.pollinations).toBe("degraded");
    expect(r.status).toBe("degraded");
  });

  it("knowledge flags indexed .new.md drafts", () => {
    expect(checkKnowledge([{ id: "a", filePath: "x/a.md" }]).status).toBe("ok");
    const r = checkKnowledge([{ id: "a", filePath: "x/a.md" }, { id: "b", filePath: "x/b.new.md" }]);
    expect(r.status).toBe("degraded");
    expect(r.draftsIndexed).toEqual(["b"]);
  });

  it("real KB index has no .new.md drafts", () => {
    expect(checkKnowledge().draftsIndexed).toEqual([]);
  });

  it("overall: db down = down, stripe degraded = degraded", () => {
    expect(overallStatus({ auth: { status: "ok" }, db: { status: "down" } })).toBe("down");
    expect(overallStatus({ auth: { status: "ok" }, db: { status: "ok" }, stripe: { status: "degraded" } })).toBe("degraded");
    expect(overallStatus({ auth: { status: "ok" }, db: { status: "ok" } })).toBe("ok");
  });
});
