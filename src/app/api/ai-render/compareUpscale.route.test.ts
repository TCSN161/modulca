import { describe, it, expect, vi, beforeEach } from "vitest";

/* BUG-SEC-02 leftovers: /compare and /upscale use the server tier + quota. */
const h = vi.hoisted(() => ({
  ctx: { userId: "u1", tier: "free", effectiveTier: "premium", quotaSubject: "user:u1" },
  budget: 99,
  consumed: 0,
  refunds: 0,
  engineCalls: [] as Array<{ id: string; tier?: string; userId?: string }>,
  okEngines: new Set<string>(),
  prodiaOk: true,
}));

vi.mock("@/shared/server/serverTier", () => ({ getServerTier: vi.fn(async () => h.ctx) }));
vi.mock("@/shared/server/quota", () => ({
  checkAndConsumeQuota: vi.fn(async () => {
    const allowed = h.consumed < h.budget;
    if (allowed) h.consumed++;
    return {
      allowed, kind: "render", limits: { day: h.budget, month: 50 }, used: { day: h.consumed, month: h.consumed },
      exceeded: allowed ? undefined : "day", reason: allowed ? undefined : "limit", source: "memory",
    };
  }),
  refundQuota: vi.fn(async () => { h.refunds++; h.consumed--; }),
  quotaExceededResponse: (r: { reason?: string }) =>
    new Response(JSON.stringify({ error: r.reason, code: "QUOTA_EXCEEDED" }), { status: 429 }),
}));

function fakeEngine(id: string) {
  return vi.fn(async (req: { tier?: string; userId?: string }) => {
    h.engineCalls.push({ id, tier: req.tier, userId: req.userId });
    return h.okEngines.has(id) ? { buffer: Buffer.alloc(2000, 1), contentType: "image/jpeg", engine: id, costUsd: 0 } : null;
  });
}
vi.mock("./engines/cloudflare", () => ({ cloudflareEngine: fakeEngine("cloudflare") }));
vi.mock("./engines/pollinations", () => ({ pollinationsEngine: fakeEngine("pollinations") }));
vi.mock("./engines/fal", () => ({ falEngine: fakeEngine("fal") }));
vi.mock("./engines/prodia", () => ({
  prodiaEngine: fakeEngine("prodia"),
  prodiaUpscale: vi.fn(async () => (h.prodiaOk ? { buffer: Buffer.alloc(3000, 2), contentType: "image/png" } : null)),
  prodiaRemoveBackground: vi.fn(async () => (h.prodiaOk ? { buffer: Buffer.alloc(3000, 2), contentType: "image/png" } : null)),
}));

function nextReq(url: string, init?: RequestInit) {
  const r = new Request(url, init) as Request & { nextUrl: URL };
  r.nextUrl = new URL(url);
  return r as never;
}

beforeEach(() => {
  h.ctx = { userId: "u1", tier: "free", effectiveTier: "premium", quotaSubject: "user:u1" };
  h.budget = 99; h.consumed = 0; h.refunds = 0; h.engineCalls = [];
  h.okEngines = new Set(["cloudflare", "pollinations", "fal"]); h.prodiaOk = true;
});

describe("/api/ai-render/compare server tier + quota", () => {
  it("non-paying user never reaches paid engines, even with ?tier=paid", async () => {
    const { GET } = await import("./compare/route");
    const res = await GET(nextReq("http://x/api/ai-render/compare?engines=cloudflare,fal&tier=all"));
    expect(res.status).toBe(200);
    expect(h.engineCalls.map((c) => c.id)).toEqual(["cloudflare"]);
    expect(h.engineCalls[0]).toMatchObject({ tier: "free", userId: "u1" });
    const paidOnly = await GET(nextReq("http://x/api/ai-render/compare?engines=fal&tier=paid"));
    expect(paidOnly.status).toBe(400);
  });

  it("paying tier can compare paid engines; consumes one unit per engine", async () => {
    h.ctx = { userId: "u2", tier: "architect", effectiveTier: "architect", quotaSubject: "user:u2" };
    const { GET } = await import("./compare/route");
    const res = await GET(nextReq("http://x/api/ai-render/compare?engines=cloudflare,fal"));
    expect(res.status).toBe(200);
    expect(h.engineCalls.map((c) => c.id).sort()).toEqual(["cloudflare", "fal"]);
    expect(h.engineCalls[0].tier).toBe("architect");
    expect(h.consumed).toBe(2);
  });

  it("refuses with 429 (and refunds partial units) when N exceeds the remaining quota", async () => {
    h.budget = 1;
    const { GET } = await import("./compare/route");
    const res = await GET(nextReq("http://x/api/ai-render/compare?engines=cloudflare,pollinations"));
    expect(res.status).toBe(429);
    expect((await res.json()).code).toBe("QUOTA_EXCEEDED");
    expect(h.engineCalls).toHaveLength(0);
    expect(h.consumed).toBe(0);
  });

  it("refunds units for engines that failed", async () => {
    h.okEngines = new Set(["cloudflare"]);
    const { GET } = await import("./compare/route");
    const res = await GET(nextReq("http://x/api/ai-render/compare?engines=cloudflare,pollinations"));
    expect(res.status).toBe(200);
    expect(h.refunds).toBe(1);
    expect(h.consumed).toBe(1);
  });
});

describe("/api/ai-render/upscale server tier + quota", () => {
  const body = (mode = "upscale") =>
    ({ method: "POST", body: JSON.stringify({ image: Buffer.alloc(1000, 3).toString("base64"), mode, tier: "constructor" }) });

  it("consumes one unit on success", async () => {
    const { POST } = await import("./upscale/route");
    const res = await POST(nextReq("http://x/api/ai-render/upscale", body()));
    expect(res.status).toBe(200);
    expect(h.consumed).toBe(1);
    expect(h.refunds).toBe(0);
  });

  it("returns 429 before calling Prodia when quota is exhausted", async () => {
    h.budget = 0;
    const prodia = await import("./engines/prodia");
    vi.mocked(prodia.prodiaUpscale).mockClear();
    const { POST } = await import("./upscale/route");
    const res = await POST(nextReq("http://x/api/ai-render/upscale", body()));
    expect(res.status).toBe(429);
    expect(prodia.prodiaUpscale).not.toHaveBeenCalled();
  });

  it("refunds when Prodia returns nothing", async () => {
    h.prodiaOk = false;
    const { POST } = await import("./upscale/route");
    const res = await POST(nextReq("http://x/api/ai-render/upscale", body("remove-bg")));
    expect(res.status).toBe(503);
    expect(h.refunds).toBe(1);
    expect(h.consumed).toBe(0);
  });

  it("bad input costs nothing", async () => {
    const { POST } = await import("./upscale/route");
    const res = await POST(nextReq("http://x/api/ai-render/upscale", { method: "POST", body: JSON.stringify({}) }));
    expect(res.status).toBe(400);
    expect(h.consumed).toBe(0);
  });
});
