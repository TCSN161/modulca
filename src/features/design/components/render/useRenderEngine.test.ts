import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("@/shared/lib/authHeaders", () => ({
  authHeaders: vi.fn(async () => ({ Authorization: "Bearer test-token" })),
}));

import { useRenderEngine } from "./useRenderEngine";

const fetchMock = vi.fn();

function setup(base: string | null = null) {
  const captureRef = { current: base ? () => `data:image/png;base64,${base}` : null };
  return renderHook(() =>
    useRenderEngine({
      aiEngine: "auto",
      renderResolution: "draft",
      useSceneAsBase: !!base,
      captureRef,
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
