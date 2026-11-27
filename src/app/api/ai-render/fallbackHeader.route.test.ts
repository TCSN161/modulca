/**
 * BUG-ST29 (3.08) — the image response lists the engines that were tried and
 * failed: `X-AI-Fallback-From: a,b`. Skipped engines are not listed; the
 * header is absent when the first engine answered. All engines mocked, €0.
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


const baseImage = "data:image/jpeg;base64," + Buffer.from("rgb").toString("base64");

async function post(body: Record<string, unknown> = {}) {
  const { POST } = await import("./route");
  const r = new Request("http://x/api/ai-render", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "photoreal house", width: 1024, height: 576, ...body }),
  }) as Request & { nextUrl: URL };
  r.nextUrl = new URL(r.url);
  return POST(r as never);
}
const tried = () => h.calls.map((c) => c.id);

beforeEach(async () => {
  h.calls = []; h.ok = new Set();
  h.ctx = { userId: "u1", tier: "free", effectiveTier: "free", quotaSubject: "user:u1" };
  vi.unstubAllEnvs();
  for (const k of ["REPLICATE_API_TOKEN", "STABILITY_API_KEY", "STRUCTURE_CONTROL_DISABLED", "AI_ENGINES_DISABLED"]) vi.stubEnv(k, "");
  vi.stubGlobal("fetch", vi.fn(async (url: string) => { throw new Error(`unexpected network call in test: ${url}`); }));
  (await import("./engines/creditManager")).__resetCreditManagerState();
  (await import("./engines/structureFunding")).__resetStructureFunding();
});
afterEach(() => { vi.unstubAllGlobals(); });

describe("ST29 — X-AI-Fallback-From", () => {
  it("first engine answers → no header (klein img2img is not a fallback, ST37)", async () => {
    h.ok = new Set(["cloudflare-klein"]);
    const res = await post({ baseImage });
    expect(res.status).toBe(200);
    expect(res.headers.get("x-ai-engine")).toBe("cloudflare-klein");
    expect(res.headers.get("x-ai-fallback-from")).toBeNull();
  });

  it("img2img: klein fails, ai-horde answers → header = engines tried before, in order", async () => {
    h.ok = new Set(["ai-horde"]);
    const res = await post({ baseImage });
    expect(res.status).toBe(200);
    expect(res.headers.get("x-ai-engine")).toBe("ai-horde");
    const failed = (res.headers.get("x-ai-fallback-from") || "").split(",");
    expect(failed[0]).toBe("cloudflare-klein");
    expect(failed).not.toContain("ai-horde");
    expect(failed).toEqual(tried().slice(0, -1));
  });

  it("chosen engine fails → it is listed first", async () => {
    h.ok = new Set(["cloudflare"]);
    const res = await post({ engine: "pollinations" });
    expect(res.status).toBe(200);
    expect(tried()[0]).toBe("pollinations");
    expect(res.headers.get("x-ai-fallback-from")?.split(",")[0]).toBe("pollinations");
    expect(res.headers.get("x-ai-fallback-from")?.split(",")).not.toContain(res.headers.get("x-ai-engine"));
  });

  it("kill-switched engines are skipped, not listed", async () => {
    vi.stubEnv("AI_ENGINES_DISABLED", "cloudflare-klein");
    h.ok = new Set(["ai-horde"]);
    const res = await post({ baseImage });
    expect(tried()).not.toContain("cloudflare-klein");
    expect(res.headers.get("x-ai-fallback-from") ?? "").not.toContain("cloudflare-klein");
  });
});
