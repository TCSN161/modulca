import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSaveProject } = vi.hoisted(() => ({ mockSaveProject: vi.fn() }));
vi.mock("@/features/auth/projectService", () => ({
  saveProject: (...args: unknown[]) => mockSaveProject(...args),
}));

vi.mock("./components/render/renderImage", () => ({ toJpegDataUrl: vi.fn(async (s: string) => s) }));

import { useDesignStore, type SavedRender } from "./store";
import { useAuthStore } from "@/features/auth/store";
import { persistSavedRender, savedRenderLimit, UNLIMITED_RENDER_CAP } from "./renderPersistence";
import { applyProjectSnapshot } from "./projectSnapshot";

const designInitial = useDesignStore.getState();
const authInitial = useAuthStore.getState();

const render = (id: string): SavedRender => ({
  id,
  imageUrl: "data:image/jpeg;base64,AAAA",
  label: "Living — AI Render",
  engine: "cloudflare-klein",
  moduleType: "living",
  createdAt: "2026-11-26T10:00:00.000Z",
  prompt: "modern living room",
  mode: "img2img",
  fallbackFrom: ["gemini"],
});

beforeEach(() => {
  useDesignStore.setState(designInitial, true);
  useAuthStore.setState(authInitial, true);
  localStorage.clear();
  mockSaveProject.mockReset();
  mockSaveProject.mockResolvedValue({ ok: true, value: { id: "p1", name: "Casa" } });
});

describe("persistSavedRender (BUG-ST27)", () => {
  it("saves the render to the project row at once through the single save path", async () => {
    useAuthStore.setState({ isAuthenticated: true, userId: "u1", userTier: "premium" } as never);
    const res = await persistSavedRender(render("r1"), "p1");
    expect(res).toEqual({ ok: true, cloud: true });
    expect(mockSaveProject).toHaveBeenCalledTimes(1);
    const [userId, payload] = mockSaveProject.mock.calls[0];
    expect(userId).toBe("u1");
    expect(payload.id).toBe("p1");
    const saved = payload.data.savedRenders as SavedRender[];
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ engine: "cloudflare-klein", prompt: "modern living room", moduleType: "living", mode: "img2img", fallbackFrom: ["gemini"] });
  });

  it("survives navigation: the cloud row restores it after the store is reset", async () => {
    useAuthStore.setState({ isAuthenticated: true, userId: "u1", userTier: "premium" } as never);
    await persistSavedRender(render("r1"), "p1");
    const data = mockSaveProject.mock.calls[0][1].data;
    useDesignStore.setState(designInitial, true);
    applyProjectSnapshot(data);
    expect(useDesignStore.getState().savedRenders.map((r) => r.id)).toEqual(["r1"]);
  });

  it("writes localStorage and skips the cloud for guests / demo", async () => {
    const res = await persistSavedRender(render("r1"), "demo");
    expect(res).toEqual({ ok: true, cloud: false });
    expect(mockSaveProject).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem("modulca-design")!).savedRenders).toHaveLength(1);
  });

  it("enforces the tier's savedRenders limit", async () => {
    useAuthStore.setState({ userTier: "guest_free" } as never);
    const limit = savedRenderLimit();
    for (let i = 0; i < limit; i++) await persistSavedRender(render(`r${i}`), "demo");
    const res = await persistSavedRender(render("over"), "demo");
    expect(res).toEqual({ ok: false, reason: "limit", limit });
    expect(useDesignStore.getState().savedRenders).toHaveLength(limit);
  });

  it("caps unlimited tiers", () => {
    useAuthStore.setState({ userTier: "constructor" } as never);
    expect(savedRenderLimit()).toBe(UNLIMITED_RENDER_CAP);
  });
});

describe("saveToLocalStorage quota fallback", () => {
  it("keeps the design when renders overflow storage, and load keeps in-memory renders", () => {
    useDesignStore.setState({ savedRenders: [render("r1")] } as never);
    const real = localStorage.setItem.bind(localStorage);
    let calls = 0;
    const spy = vi.spyOn(localStorage, "setItem").mockImplementation((k: string, v: string) => {
      calls++;
      if (calls === 1) throw new DOMException("full", "QuotaExceededError");
      return real(k, v);
    });
    useDesignStore.getState().saveToLocalStorage();
    spy.mockRestore();
    const stored = JSON.parse(localStorage.getItem("modulca-design")!);
    expect(stored).not.toHaveProperty("savedRenders");
    useDesignStore.getState().loadFromLocalStorage();
    expect(useDesignStore.getState().savedRenders.map((r) => r.id)).toEqual(["r1"]);
  });
});
