/**
 * BUG-ST01 / ST03 repro (2026-11-26 smoke test): a logged-in Constructor got
 * 503 because every engine it reached failed. These tests pin the server
 * behaviour: paid tiers fall through to the free engines, img2img POST goes to
 * cloudflare-klein first, and the 503 carries a machine-readable code.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  ctx: { userId: "u1", tier: "constructor", effectiveTier: "constructor", quotaSubject: "user:u1" },
  ok: new Set<string>(),
  calls: [] as Array<{ id: string; baseImage?: string; width: number; height: number }>,
}));

vi.mock("@/shared/server/serverTier", () => ({ getServerTier: vi.fn(async () => h.ctx) }));
vi.mock("@/shared/server/quota", () => ({
  checkAndConsumeQuota: vi.fn(async () => ({ allowed: true, kind: "render", limits: { day: -1, month: -1 }, used: { day: 0, month: 0 }, source: "memory" })),
  refundQuota: vi.fn(async () => {}),
  quotaExceededResponse: () => new Response("{}", { status: 429 }),
}));
vi.mock("./engines/renderLogger", () => ({ logRender: vi.fn() }));
vi.mock("./engines/renderCache", () => ({ makeCacheKey: () => "k", getCachedRender: vi.fn(async () => null), cacheResult: vi.fn() }));

function fake(id: string) {
  return vi.fn(async (req: { baseImage?: string; width: number; height: number }) => {
    h.calls.push({ id, baseImage: req.baseImage, width: req.width, height: req.height });
    return h.ok.has(id) ? { buffer: Buffer.alloc(20000, 1), contentType: "image/jpeg", engine: id, costUsd: 0 } : null;
  });
}
vi.mock("./engines/pollinations", () => ({ pollinationsEngine: fake("pollinations") }));
vi.mock("./engines/aihorde", () => ({ aiHordeEngine: fake("ai-horde") }));
vi.mock("./engines/stability", () => ({ stabilityEngine: fake("stability") }));
vi.mock("./engines/together", () => ({ togetherEngine: fake("together") }));
vi.mock("./engines/leonardo", () => ({ leonardoEngine: fake("leonardo") }));
vi.mock("./engines/fal", () => ({ falEngine: fake("fal") }));
vi.mock("./engines/cloudflare", () => ({ cloudflareEngine: fake("cloudflare") }));
vi.mock("./engines/cloudflareKlein", () => ({ cloudflareKleinEngine: fake("cloudflare-klein") }));
vi.mock("./engines/replicate", () => ({ replicateEngine: fake("replicate") }));
vi.mock("./engines/huggingface", () => ({ huggingfaceEngine: fake("huggingface") }));
vi.mock("./engines/segmind", () => ({ segmindEngine: fake("segmind") }));
vi.mock("./engines/openai", () => ({ openaiEngine: fake("openai") }));
vi.mock("./engines/blackforest", () => ({ blackforestEngine: fake("blackforest") }));
vi.mock("./engines/deepinfra", () => ({ deepinfraEngine: fake("deepinfra") }));
vi.mock("./engines/fireworks", () => ({ fireworksEngine: fake("fireworks") }));
vi.mock("./engines/prodia", () => ({ prodiaEngine: fake("prodia") }));
vi.mock("./engines/gemini", () => ({ geminiEngine: fake("gemini") }));

function nextReq(url: string, init?: RequestInit) {
  const r = new Request(url, init) as Request & { nextUrl: URL };
  r.nextUrl = new URL(url);
  return r as never;
}

const PAID = ["premium", "architect", "constructor"] as const;

describe("BUG-ST01 — paid tiers reach the free engines", () => {
  beforeEach(async () => {
    h.calls = []; h.ok = new Set();
    vi.stubEnv("AI_ENGINES_DISABLED", "openai,stability,leonardo,wavespeed");
    (await import("./engines/creditManager")).__resetCreditManagerState();
  });

  for (const tier of PAID) {
    it(`${tier}: all paid engines fail → ai-horde (last free) still renders`, async () => {
      h.ctx = { ...h.ctx, tier, effectiveTier: tier };
      h.ok = new Set(["ai-horde"]);
      const { GET } = await import("./route");
      const res = await GET(nextReq("http://x/api/ai-render?prompt=house"));
      expect(res.status).toBe(200);
      expect(res.headers.get("X-AI-Engine")).toBe("ai-horde");
      const tried = h.calls.map((c) => c.id);
      for (const id of ["cloudflare", "cloudflare-klein", "pollinations"]) expect(tried).toContain(id);
      for (const id of ["openai", "stability", "leonardo"]) expect(tried).not.toContain(id);
    });
  }

  it("constructor GET, engine=auto → cloudflare first", async () => {
    h.ctx = { ...h.ctx, tier: "constructor", effectiveTier: "constructor" };
    h.ok = new Set(["cloudflare", "openai"]);
    const { GET } = await import("./route");
    const res = await GET(nextReq("http://x/api/ai-render?prompt=house&engine=auto"));
    expect(res.headers.get("X-AI-Engine")).toBe("cloudflare");
    expect(h.calls[0].id).toBe("cloudflare");
  });

  it("everything down → 503 with code + Retry-After", async () => {
    const { GET } = await import("./route");
    const res = await GET(nextReq("http://x/api/ai-render?prompt=house"));
    expect(res.status).toBe(503);
    expect(res.headers.get("Retry-After")).toBe("60");
    const body = await res.json();
    expect(body.code).toBe("ENGINES_UNAVAILABLE");
    expect(body.error).toMatch(/busy/);
  });
});

describe("BUG-ST03 — img2img POST (3D + Text → Image)", () => {
  beforeEach(async () => {
    h.calls = []; h.ok = new Set(["cloudflare-klein"]);
    (await import("./engines/creditManager")).__resetCreditManagerState();
  });
  for (const tier of ["free", ...PAID] as const) {
    it(`${tier}: POST {prompt, baseImage} → cloudflare-klein gets the 3D capture`, async () => {
      h.ctx = { ...h.ctx, tier, effectiveTier: tier };
      const baseImage = "data:image/jpeg;base64," + Buffer.from("jpeg").toString("base64");
      const { POST } = await import("./route");
      const res = await POST(nextReq("http://x/api/ai-render", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer t" },
        body: JSON.stringify({ prompt: "photoreal timber house", width: 1024, height: 576, baseImage }),
      }));
      expect(res.status).toBe(200);
      expect(res.headers.get("X-AI-Engine")).toBe("cloudflare-klein");
      expect(h.calls[0]).toMatchObject({ id: "cloudflare-klein", baseImage, width: 1024, height: 576 });
    });
  }
});

describe("BUG-ST34 — img2img never falls to paid text2img (leonardo leak)", () => {
  const baseImage = "data:image/jpeg;base64," + Buffer.from("jpeg").toString("base64");
  const post = async (body: Record<string, unknown>) => {
    const { POST } = await import("./route");
    return POST(nextReq("http://x/api/ai-render", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer t" },
      body: JSON.stringify({ prompt: "photoreal house", width: 1024, height: 576, baseImage, ...body }),
    }));
  };
  beforeEach(async () => {
    h.calls = [];
    vi.unstubAllEnvs();
    (await import("./engines/creditManager")).__resetCreditManagerState();
  });

  for (const tier of PAID) {
    it(`${tier}: klein unavailable → ai-horde renders, leonardo/openai never tried`, async () => {
      h.ctx = { ...h.ctx, tier, effectiveTier: tier };
      h.ok = new Set(["ai-horde", "leonardo", "openai", "blackforest"]);
      const res = await post({});
      expect(res.status).toBe(200);
      expect(res.headers.get("X-AI-Engine")).toBe("ai-horde");
      const tried = h.calls.map((c) => c.id);
      expect(tried[0]).toBe("cloudflare-klein");
      for (const id of ["leonardo", "openai", "blackforest", "fireworks", "runway"]) expect(tried).not.toContain(id);
    });
  }

  it("explicit body.engine is tried first", async () => {
    h.ctx = { ...h.ctx, tier: "constructor", effectiveTier: "constructor" };
    h.ok = new Set(["cloudflare-klein", "ai-horde"]);
    const res = await post({ engine: "ai-horde" });
    expect(res.headers.get("X-AI-Engine")).toBe("ai-horde");
    expect(h.calls[0]).toMatchObject({ id: "ai-horde", baseImage });
  });

  it("engine=auto in the body behaves like no engine", async () => {
    h.ctx = { ...h.ctx, tier: "premium", effectiveTier: "premium" };
    h.ok = new Set(["cloudflare-klein"]);
    await post({ engine: "auto" });
    expect(h.calls[0].id).toBe("cloudflare-klein");
  });
});
