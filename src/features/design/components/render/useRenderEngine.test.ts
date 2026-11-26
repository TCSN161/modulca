import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("@/shared/lib/authHeaders", () => ({
  authHeaders: vi.fn(async () => ({ Authorization: "Bearer test-token" })),
}));

vi.mock("./renderImage", async (orig) => ({
  ...(await orig<typeof import("./renderImage")>()),
  // jsdom has no canvas: pass through, tag so tests can see it was re-encoded
  toJpegDataUrl: vi.fn(async (s: string) => s.replace(/^data:image\/\w+/, "data:image/jpeg")),
}));

import { useRenderEngine } from "./useRenderEngine";
import type { RenderInputMode } from "./renderConstants";

const fetchMock = vi.fn();

function setup(base: string | null = null, mode?: RenderInputMode, uploadImage: string | null = null) {
  const captureRef = { current: base ? () => `data:image/png;base64,${base}` : null };
  return renderHook(() =>
    useRenderEngine({
      aiEngine: "together",
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

  it("3D + Text POSTs the canvas capture as a JPEG data URI with engine null", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
    const { result } = setup("AAAA", "scene");
    await act(() => result.current.handleGenerateAiRender("kitchen"));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/ai-render");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body);
    expect(body.baseImage).toBe("data:image/jpeg;base64,AAAA");
    expect(body.engine).toBeNull();
    expect(body).toMatchObject({ width: expect.any(Number), height: expect.any(Number) });
  });

  it("Image → Image POSTs the uploaded image", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
    const { result } = setup(null, "upload", "data:image/png;base64,UPLD");
    await act(() => result.current.handleGenerateAiRender("kitchen"));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).baseImage).toBe("data:image/jpeg;base64,UPLD");
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
