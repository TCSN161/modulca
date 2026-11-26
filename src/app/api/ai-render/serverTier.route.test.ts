import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { engineTierFor, clampMaxCost } from "./engines/renderTier";

/* ── helpers ─────────────────────────────────────────────────────────── */
describe("renderTier helpers", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("beta promo (free → premium) keeps FREE engines by default", () => {
    expect(engineTierFor({ tier: "free", effectiveTier: "premium" })).toBe("free");
    expect(engineTierFor({ tier: "guest_free", effectiveTier: "guest_free" })).toBe("guest_free");
    expect(engineTierFor({ tier: "architect", effectiveTier: "architect" })).toBe("architect");
  });
  it("BETA_PAID_ENGINES=1 lets promo users use their effective tier", () => {
    vi.stubEnv("BETA_PAID_ENGINES", "1");
    expect(engineTierFor({ tier: "free", effectiveTier: "premium" })).toBe("premium");
  });
  it("client maxCost can only lower the ceiling", () => {
    expect(clampMaxCost("1.0", 0.005)).toBe(0.005);
    expect(clampMaxCost(0.001, 0.005)).toBe(0.001);
    expect(clampMaxCost(null, 0.05)).toBe(0.05);
    expect(clampMaxCost("abc", 0.05)).toBe(0.05);
  });
});

/* ── route wiring ────────────────────────────────────────────────────── */
const h = vi.hoisted(() => ({
  ctx: { userId: "u1", tier: "free", effectiveTier: "premium", quotaSubject: "user:u1" },
  allowed: true,
  engineCalls: [] as Array<{ tier?: string; userId?: string }>,
  engineOk: true,
  refunds: 0,
}));

vi.mock("@/shared/server/serverTier", () => ({ getServerTier: vi.fn(async () => h.ctx) }));
vi.mock("@/shared/server/quota", () => ({
  checkAndConsumeQuota: vi.fn(async () => ({
    allowed: h.allowed, kind: "render", limits: { day: 5, month: 50 }, used: { day: 5, month: 5 },
    exceeded: h.allowed ? undefined : "day", reason: h.allowed ? undefined : "limit", source: "memory",
  })),
  refundQuota: vi.fn(async () => { h.refunds++; }),
  quotaExceededResponse: (r: { reason?: string }) =>
    new Response(JSON.stringify({ error: r.reason, code: "QUOTA_EXCEEDED" }), { status: 429 }),
}));
vi.mock("./engines/renderLogger", () => ({ logRender: vi.fn() }));
vi.mock("./engines/renderCache", () => ({
  makeCacheKey: () => "k", getCachedRender: vi.fn(async () => null), cacheResult: vi.fn(),
}));
vi.mock("./engines/cloudflare", () => ({
  cloudflareEngine: vi.fn(async (req: { tier?: string; userId?: string }) => {
    h.engineCalls.push({ tier: req.tier, userId: req.userId });
    return h.engineOk ? { buffer: Buffer.alloc(20000, 1), contentType: "image/jpeg", engine: "cloudflare-flux", costUsd: 0 } : null;
  }),
}));

function nextReq(url: string, init?: RequestInit) {
  const r = new Request(url, init) as Request & { nextUrl: URL };
  r.nextUrl = new URL(url);
  return r as never;
}

describe("/api/ai-render server tier + quota", () => {
  beforeEach(() => {
    h.allowed = true; h.engineOk = true; h.refunds = 0; h.engineCalls = [];
    h.ctx = { userId: "u1", tier: "free", effectiveTier: "premium", quotaSubject: "user:u1" };
  });

  it("GET ignores ?tier=architect and uses the server tier", async () => {
    const { GET } = await import("./route");
    const res = await GET(nextReq("http://x/api/ai-render?prompt=house&tier=architect&maxCostUsd=5&engine=cloudflare"));
    expect(res.status).toBe(200);
    expect(h.engineCalls[0]).toEqual({ tier: "free", userId: "u1" });
  });

  it("POST ignores body.tier", async () => {
    const { POST } = await import("./route");
    const res = await POST(nextReq("http://x/api/ai-render", {
      method: "POST", body: JSON.stringify({ prompt: "house", tier: "constructor", engine: "cloudflare" }),
    }));
    expect(res.status).toBe(200);
    expect(h.engineCalls[0].tier).toBe("free");
  });

  it("returns 429 QUOTA_EXCEEDED before any engine runs", async () => {
    h.allowed = false;
    const { GET } = await import("./route");
    const res = await GET(nextReq("http://x/api/ai-render?prompt=house&engine=cloudflare"));
    expect(res.status).toBe(429);
    expect((await res.json()).code).toBe("QUOTA_EXCEEDED");
    expect(h.engineCalls).toHaveLength(0);
  });

  it("refunds the unit when no engine produced an image", async () => {
    h.engineOk = false;
    vi.stubEnv("AI_ENGINES_DISABLED", "cloudflare-klein,pollinations,huggingface,gemini,together,ai-horde");
    const { GET } = await import("./route");
    const res = await GET(nextReq("http://x/api/ai-render?prompt=house"));
    vi.unstubAllEnvs();
    expect(res.status).toBe(503);
    expect(h.refunds).toBe(1);
  });
});
