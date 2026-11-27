import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { SavedRender } from "../../store";

const persistMock = vi.fn();
vi.mock("../../renderPersistence", () => ({
  persistSavedRender: (...a: unknown[]) => persistMock(...a),
}));

import { useAutoPersistRender } from "./useAutoPersistRender";

/** The metadata RenderPage builds for a "Ce vezi" (3D scene) img2img render */
const make = (imageUrl: string): SavedRender => ({
  id: "render-1",
  imageUrl,
  label: "Bedroom — Modern AI Render",
  engine: "cloudflare-klein",
  moduleType: "bedroom",
  createdAt: "2026-11-27T20:00:00.000Z",
  mode: "img2img",
  baseSource: "scene",
  view: { camera: "overview", focalMm: 35, viewMode: "all" },
});

describe("useAutoPersistRender (BUG-ST36)", () => {
  beforeEach(() => persistMock.mockReset());

  it("img2img 'Ce vezi': a new image is persisted at once, with its metadata and the project id", async () => {
    persistMock.mockResolvedValue({ ok: true, cloud: true });
    const { result, rerender } = renderHook(
      ({ url }) => useAutoPersistRender(url, make, "5895a485-a9f1-4844-8c58-1eef8f671ba7"),
      { initialProps: { url: null as string | null } },
    );
    expect(persistMock).not.toHaveBeenCalled();

    rerender({ url: "blob:http://x/abc" });
    await waitFor(() => expect(result.current.status).toEqual({ state: "saved", cloud: true }));
    expect(persistMock).toHaveBeenCalledTimes(1);
    const [render, projectId] = persistMock.mock.calls[0];
    expect(render).toMatchObject({ imageUrl: "blob:http://x/abc", mode: "img2img", baseSource: "scene", engine: "cloudflare-klein" });
    expect(projectId).toBe("5895a485-a9f1-4844-8c58-1eef8f671ba7");

    // re-render with the same image: not saved twice
    rerender({ url: "blob:http://x/abc" });
    expect(persistMock).toHaveBeenCalledTimes(1);

    // the next image is saved too
    rerender({ url: "blob:http://x/def" });
    await waitFor(() => expect(persistMock).toHaveBeenCalledTimes(2));
  });

  it("plan limit and errors are reported; retry saves again", async () => {
    persistMock.mockResolvedValueOnce({ ok: false, reason: "limit", limit: 3 });
    const { result } = renderHook(() => useAutoPersistRender("blob:http://x/1", make, "p1"));
    await waitFor(() => expect(result.current.status).toEqual({ state: "limit", limit: 3 }));

    persistMock.mockResolvedValueOnce({ ok: true, cloud: false });
    result.current.retry();
    await waitFor(() => expect(result.current.status).toEqual({ state: "saved", cloud: false }));
    expect(persistMock).toHaveBeenCalledTimes(2);
  });
});
