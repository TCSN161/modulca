import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { isEngineDisabled, engineEnvName } from "./killSwitch";
import { kleinSize, kleinNeurons, decodeBaseImage, CF_KLEIN_MODEL } from "./cloudflareKlein";

describe("killSwitch", () => {
  it("builds the per-engine env name", () => {
    expect(engineEnvName("cloudflare-klein")).toBe("ENGINE_CLOUDFLARE_KLEIN_DISABLED");
    expect(engineEnvName("ai-horde")).toBe("ENGINE_AI_HORDE_DISABLED");
  });
  it("honours the comma list and per-engine flags", () => {
    expect(isEngineDisabled("cloudflare", {})).toBe(false);
    expect(isEngineDisabled("cloudflare-klein", { AI_ENGINES_DISABLED: "x, Cloudflare-Klein" })).toBe(true);
    expect(isEngineDisabled("ai-horde", { ENGINE_AI_HORDE_DISABLED: "true" })).toBe(true);
    expect(isEngineDisabled("ai-horde", { ENGINE_AI_HORDE_DISABLED: "0" })).toBe(false);
  });
});

describe("cloudflareKlein helpers", () => {
  it("keeps one model ID", () => {
    expect(CF_KLEIN_MODEL).toBe("@cf/black-forest-labs/flux-2-klein-4b");
  });
  it("fits sizes inside 1024 keeping aspect, multiple of 16", () => {
    expect(kleinSize(1920, 1080)).toEqual({ width: 1024, height: 576 });
    expect(kleinSize(512, 512)).toEqual({ width: 512, height: 512 });
    expect(kleinSize(NaN, 0)).toEqual({ width: 1024, height: 576 });
    expect(kleinSize(100, 100)).toEqual({ width: 256, height: 256 });
  });
  it("estimates neurons per tile", () => {
    expect(kleinNeurons(512, 512, false)).toBe(26);
    expect(kleinNeurons(1024, 576, true)).toBe(126);
  });
  it("decodes raw base64 and data URIs", () => {
    const raw = Buffer.from("hello").toString("base64");
    expect(decodeBaseImage(raw).bytes.toString()).toBe("hello");
    const d = decodeBaseImage(`data:image/jpeg;base64,${raw}`);
    expect(d.mime).toBe("image/jpeg");
    expect(d.bytes.toString()).toBe("hello");
  });
});

describe("cloudflareKleinEngine", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "acc");
    vi.stubEnv("CLOUDFLARE_API_TOKEN", "tok");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("sends multipart with input_image_0 for img2img and returns the image", async () => {
    const jpeg = Buffer.alloc(20000, 1);
    jpeg[0] = 0xff;
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: { image: jpeg.toString("base64") } }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);
    const { cloudflareKleinEngine } = await import("./cloudflareKlein");
    const res = await cloudflareKleinEngine({
      prompt: "house", width: 1920, height: 1080, seed: "42",
      baseImage: Buffer.alloc(500, 2).toString("base64"),
    });
    expect(res?.engine).toBe("cloudflare-klein-img2img");
    expect(res?.contentType).toBe("image/jpeg");
    expect(res?.costUsd).toBe(0);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/accounts/acc/ai/run/@cf/black-forest-labs/flux-2-klein-4b");
    const form = init.body as FormData;
    expect(form.get("width")).toBe("1024");
    expect(form.get("height")).toBe("576");
    expect(form.get("input_image_0")).toBeInstanceOf(Blob);
  });

  it("returns null on HTTP error (so the chain falls through)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("quota", { status: 429 })));
    const { cloudflareKleinEngine } = await import("./cloudflareKlein");
    expect(await cloudflareKleinEngine({ prompt: "x", width: 512, height: 512, seed: "1" })).toBeNull();
  });
});

describe("ai-horde censored output (3.06 bake-off)", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

  it("returns null instead of the black CENSORED placeholder", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith("/generate/async")) return new Response(JSON.stringify({ id: "job1" }), { status: 202 });
      if (url.includes("/generate/check/")) return new Response(JSON.stringify({ done: true }));
      if (url.includes("/generate/status/"))
        return new Response(JSON.stringify({ done: true, faulted: false, generations: [{ img: "https://x/y.webp", censored: true }] }));
      throw new Error(`unexpected fetch ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const { aiHordeEngine } = await import("./aihorde");
    const p = aiHordeEngine({ prompt: "kitchen", width: 512, height: 512, seed: "1" } as never);
    await vi.runAllTimersAsync();
    expect(await p).toBeNull();
    expect(fetchMock.mock.calls.some(([u]) => String(u) === "https://x/y.webp")).toBe(false);
  });
});
