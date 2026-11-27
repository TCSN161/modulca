import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("@/shared/lib/authHeaders", () => ({
  authHeaders: vi.fn(async () => ({ Authorization: "Bearer test-token" })),
}));

vi.mock("./renderImage", async (orig) => ({
  ...(await orig<typeof import("./renderImage")>()),
  // jsdom has no canvas: pass through, tag so tests can see it was re-encoded
  toJpegDataUrl: vi.fn(async (s: string) => s.replace(/^data:image\/\w+/, "data:image/jpeg")),
  toPngDataUrl: vi.fn(async (s: string) => s),
}));

import { useRenderEngine } from "./useRenderEngine";
import type { AiEngine, RenderInputMode } from "./renderConstants";

const fetchMock = vi.fn();

function setup(base: string | null = null, mode?: RenderInputMode, uploadImage: string | null = null, aiEngine: AiEngine = "together") {
  const captureRef = { current: base ? () => `data:image/png;base64,${base}` : null };
  return renderHook(() =>
    useRenderEngine({
      aiEngine,
      renderResolution: "draft",
      inputMode: mode ?? (base ? "scene" : "text"),
      captureRef,
      uploadImage,
    }),
  );
}

describe("useRenderEngine — SEC-02 auth", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("GET text2img sends the Bearer token and no tier param", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));
    const { result } = setup();
    await act(() => result.current.handleGenerateAiRender("modern living room"));
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/^\/api\/ai-render\?/);
    expect(String(url)).not.toContain("tier=");
    expect(init.headers).toMatchObject({ Authorization: "Bearer test-token" });
  });

  it("POST img2img sends the Bearer token and no tier in the body", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
    const { result } = setup("AAAA");
    await act(() => result.current.handleGenerateAiRender("modern living room"));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/ai-render");
    expect(init.headers).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer test-token",
    });
    expect(JSON.parse(init.body)).not.toHaveProperty("tier");
  });

  it("429 shows the server message and does NOT fall back to Pollinations", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "Limita zilnică atinsă", code: "QUOTA_EXCEEDED" }), { status: 429 }),
    );
    const { result } = setup();
    await act(() => result.current.handleGenerateAiRender("kitchen"));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.aiError).toBe("Limita zilnică atinsă");
    expect(result.current.aiLoading).toBe(false);
  });
});

describe("useRenderEngine — BUG-ST03 img2img contract", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("3D + Text POSTs the canvas capture as a JPEG data URI with the chosen engine (BUG-ST33)", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
    const { result } = setup("AAAA", "scene");
    await act(() => result.current.handleGenerateAiRender("kitchen"));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/ai-render");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body);
    expect(body.baseImage).toBe("data:image/jpeg;base64,AAAA");
    expect(body.engine).toBe("together");
    expect(body).toMatchObject({ width: expect.any(Number), height: expect.any(Number) });
  });

  it("img2img with AI engine \"auto\" sends engine null (klein first)", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
    const { result } = setup("AAAA", "scene", null, "auto");
    await act(() => result.current.handleGenerateAiRender("kitchen"));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).engine).toBeNull();
  });

  it("Image → Image POSTs the uploaded image with the chosen engine", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
    const { result } = setup(null, "upload", "data:image/png;base64,UPLD");
    await act(() => result.current.handleGenerateAiRender("kitchen"));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.baseImage).toBe("data:image/jpeg;base64,UPLD");
    expect(body.engine).toBe("together");
  });

  it("no capture / no upload: error, no request, never a silent text-only render", async () => {
    const scene = setup(null, "scene");
    const ok = await act(() => scene.result.current.handleGenerateAiRender("kitchen"));
    expect(ok).toBe(false);
    expect(scene.result.current.aiError).toMatch(/3D view/);
    const up = setup(null, "upload");
    await act(() => up.result.current.handleGenerateAiRender("kitchen"));
    expect(up.result.current.aiError).toMatch(/image/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("useRenderEngine — BUG-ST02 server errors, no client fallback", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("503 shows the server message with Retry-After and never calls image.pollinations.ai", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "All AI engines are currently busy", code: "ENGINES_UNAVAILABLE" }), {
        status: 503,
        headers: { "Retry-After": "60" },
      }),
    );
    const { result } = setup();
    let ok: boolean | undefined;
    await act(async () => { ok = await result.current.handleGenerateAiRender("kitchen"); });
    expect(ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls.some(([u]) => String(u).includes("pollinations"))).toBe(false);
    expect(result.current.aiError).toBe("All AI engines are currently busy");
    expect(result.current.aiErrorInfo).toEqual({ status: 503, code: "ENGINES_UNAVAILABLE", retryAfterSec: 60 });
  });

  it("non-JSON 500 gets a status message, still no fallback", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 500 }));
    const { result } = setup();
    await act(() => result.current.handleGenerateAiRender("kitchen"));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.aiError).toMatch(/500/);
  });

  it("success returns true and reports the engine", async () => {
    fetchMock.mockResolvedValue(
      new Response(new Uint8Array(2000), { status: 200, headers: { "Content-Type": "image/jpeg", "X-AI-Engine": "cloudflare-klein" } }),
    );
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: () => "blob:x" }));
    const { result } = setup("AAAA", "scene", null, "auto");
    let ok: boolean | undefined;
    await act(async () => { ok = await result.current.handleGenerateAiRender("kitchen"); });
    expect(ok).toBe(true);
    expect(result.current.aiEngineMeta).toMatchObject({ engine: "cloudflare-klein", fallbackFrom: [], inputMode: "scene" });
  });
});

describe("useRenderEngine — 5.03-A depth control image + view prompt", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  function setupDepth(mode: RenderInputMode, depth: string | null) {
    const captureRef = { current: () => "data:image/png;base64,RGB" };
    const depthCaptureRef = { current: depth ? () => depth : null };
    return renderHook(() =>
      useRenderEngine({ aiEngine: "auto", renderResolution: "standard", inputMode: mode, captureRef, depthCaptureRef, uploadImage: "data:image/png;base64,UPLD" }),
    );
  }

  it("Randează ce vezi: sends the depth map as controlImage (PNG, depth) next to the RGB base", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
    const { result } = setupDepth("scene", "data:image/png;base64,DEPTH");
    await act(() => result.current.handleGenerateAiRender("Turn this 3D view of a kitchen into a photoreal interior render"));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.baseImage).toBe("data:image/jpeg;base64,RGB");
    expect(body.controlImage).toBe("data:image/png;base64,DEPTH");
    expect(body.controlType).toBe("depth");
    expect(body.engine).toBeNull();
    // the view sentence stays first: no text2img prefix in front of it
    expect(body.prompt.startsWith("Turn this 3D view")).toBe(true);
  });

  it("upload: no control image (no 3D camera)", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
    const { result } = setupDepth("upload", "data:image/png;base64,DEPTH");
    await act(() => result.current.handleGenerateAiRender("Turn this image into a render"));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.baseImage).toBe("data:image/jpeg;base64,UPLD");
    expect(body).not.toHaveProperty("controlImage");
  });

  it("scene without a depth capture still renders (klein needs only the RGB)", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
    const { result } = setupDepth("scene", null);
    await act(() => result.current.handleGenerateAiRender("x"));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).not.toHaveProperty("controlType");
  });
});
