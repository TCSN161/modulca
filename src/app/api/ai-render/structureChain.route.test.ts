/**
 * 3.07 — structure-control engines are READY but OFF until funded.
 * Route-level: funded ones come right after klein for paid tiers; unfunded
 * ones are skipped silently (never called). All engines are mocked; the only
 * fetch is the Stability balance check, stubbed here. No paid calls.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

type Call = { id: string; baseImage?: string; controlImage?: string; controlType?: string };
const h = vi.hoisted(() => ({
  ctx: { userId: "u1", tier: "constructor", effectiveTier: "constructor", quotaSubject: "user:u1" },
  ok: new Set<string>(),
  calls: [] as Call[],
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
  return vi.fn(async (req: Call) => {
    h.calls.push({ id, baseImage: req.baseImage, controlImage: req.controlImage, controlType: req.controlType });
    return h.ok.has(id) ? { buffer: Buffer.alloc(20000, 1), contentType: "image/png", engine: id, costUsd: 0.025 } : null;
  });
}
vi.mock("./engines/replicateStructure", () => ({ replicateDepthEngine: fake("replicate-depth"), replicateCannyEngine: fake("replicate-canny") }));
vi.mock("./engines/stability", () => ({ stabilityEngine: fake("stability"), stabilityStructureEngine: fake("stability-structure") }));
vi.mock("./engines/pollinations", () => ({ pollinationsEngine: fake("pollinations") }));
vi.mock("./engines/aihorde", () => ({ aiHordeEngine: fake("ai-horde") }));
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

const STRUCT = ["replicate-depth", "replicate-canny", "stability-structure"];
const baseImage = "data:image/jpeg;base64," + Buffer.from("rgb").toString("base64");
const depthMap = "data:image/png;base64," + Buffer.from("depth").toString("base64");

async function post(body: Record<string, unknown> = {}) {
  const { POST } = await import("./route");
  const r = new Request("http://x/api/ai-render", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "photoreal house", width: 1024, height: 576, baseImage, ...body }),
  }) as Request & { nextUrl: URL };
  r.nextUrl = new URL(r.url);
  return POST(r as never);
}
const tried = () => h.calls.map((c) => c.id);
const asTier = (tier: string) => { h.ctx = { ...h.ctx, tier, effectiveTier: tier }; };

let balance: number | null = null;
const fetchSpy = vi.fn(async (url: string) => {
  if (String(url).includes("/v1/user/balance") && balance !== null) {
    return new Response(JSON.stringify({ credits: balance }), { status: 200 });
  }
  throw new Error(`unexpected network call in test: ${url}`);
});

beforeEach(async () => {
  h.calls = []; h.ok = new Set(["ai-horde"]); balance = null;
  vi.unstubAllEnvs();
  for (const k of ["REPLICATE_API_TOKEN", "STABILITY_API_KEY", "STRUCTURE_CONTROL_DISABLED", "AI_ENGINES_DISABLED"]) vi.stubEnv(k, "");
  vi.stubGlobal("fetch", fetchSpy);
  fetchSpy.mockClear();
  (await import("./engines/creditManager")).__resetCreditManagerState();
  (await import("./engines/structureFunding")).__resetStructureFunding();
});
afterEach(() => { vi.unstubAllGlobals(); });

describe("3.07 — unfunded structure engines are skipped silently", () => {
  for (const tier of ["premium", "architect", "constructor"]) {
    it(`${tier}: no keys → none called, ai-horde still renders`, async () => {
      asTier(tier);
      const res = await post();
      expect(res.status).toBe(200);
      expect(res.headers.get("X-AI-Engine")).toBe("ai-horde");
      for (const id of STRUCT) expect(tried()).not.toContain(id);
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  }

  it("Stability key but balance below one render (4 credits) → skipped", async () => {
    asTier("constructor");
    vi.stubEnv("STABILITY_API_KEY", "sk-test"); balance = 4;
    await post();
    expect(tried()).not.toContain("stability-structure");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("STRUCTURE_CONTROL_DISABLED=1 beats funded keys", async () => {
    asTier("constructor");
    vi.stubEnv("REPLICATE_API_TOKEN", "r8_test"); vi.stubEnv("STABILITY_API_KEY", "sk-test"); balance = 25;
    vi.stubEnv("STRUCTURE_CONTROL_DISABLED", "1");
    await post();
    for (const id of STRUCT) expect(tried()).not.toContain(id);
  });

  it("free tiers never reach structure engines, even when funded", async () => {
    vi.stubEnv("REPLICATE_API_TOKEN", "r8_test"); vi.stubEnv("STABILITY_API_KEY", "sk-test"); balance = 25;
    for (const tier of ["free", "guest_free"]) {
      asTier(tier); h.calls = [];
      await post();
      for (const id of STRUCT) expect(tried()).not.toContain(id);
    }
  });
});

describe("3.07 — funded structure engines come right after klein", () => {
  it("premium + Replicate key: klein fails → replicate-depth renders", async () => {
    asTier("premium");
    vi.stubEnv("REPLICATE_API_TOKEN", "r8_test");
    h.ok = new Set(["replicate-depth", "ai-horde"]);
    const res = await post();
    expect(res.headers.get("X-AI-Engine")).toBe("replicate-depth");
    expect(tried()).toEqual(["cloudflare-klein", "replicate-depth"]);
  });

  it("klein ok → structure engines not called (klein stays the free default)", async () => {
    asTier("constructor");
    vi.stubEnv("REPLICATE_API_TOKEN", "r8_test");
    h.ok = new Set(["cloudflare-klein", "replicate-depth"]);
    const res = await post();
    expect(res.headers.get("X-AI-Engine")).toBe("cloudflare-klein");
    expect(tried()).toEqual(["cloudflare-klein"]);
  });

  it("constructor, all funded, all fail → order depth → canny → structure → … → ai-horde", async () => {
    asTier("constructor");
    vi.stubEnv("REPLICATE_API_TOKEN", "r8_test"); vi.stubEnv("STABILITY_API_KEY", "sk-test"); balance = 25;
    const res = await post();
    expect(res.headers.get("X-AI-Engine")).toBe("ai-horde");
    const t = tried();
    expect(t.slice(0, 4)).toEqual(["cloudflare-klein", ...STRUCT]);
    expect(t.indexOf("stability-structure")).toBeLessThan(t.indexOf("ai-horde"));
  });

  it("controlImage + controlType reach the engine; dropped without baseImage", async () => {
    asTier("constructor");
    vi.stubEnv("REPLICATE_API_TOKEN", "r8_test");
    h.ok = new Set(["replicate-depth"]);
    await post({ controlImage: depthMap, controlType: "depth" });
    expect(h.calls.find((c) => c.id === "replicate-depth")).toMatchObject({ baseImage, controlImage: depthMap, controlType: "depth" });

    h.calls = []; h.ok = new Set(["cloudflare"]);
    await post({ baseImage: null, controlImage: depthMap });
    expect(h.calls.every((c) => c.controlImage === undefined)).toBe(true);
  });

  it("unknown controlType falls back to depth", async () => {
    asTier("constructor");
    h.ok = new Set(["cloudflare-klein"]);
    await post({ controlImage: depthMap, controlType: "normal" });
    expect(h.calls[0].controlType).toBe("depth");
  });
});
