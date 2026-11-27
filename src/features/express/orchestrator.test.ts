/**
 * Orchestration with mocked engines and stores — 0 live AI renders.
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import { runExpress, retryFailedRenders, presentationUrl, type ExpressDeps, type RenderResponse } from "./orchestrator";
import { normalizeBrief } from "./normalize";
import { generateDesign } from "@/features/wizard/generator";
import type { Img2ImgBody } from "@/features/design/components/render/renderRequest";
import type { ExpressJob } from "./types";

beforeAll(() => {
  // jsdom has no object URLs
  if (!URL.createObjectURL) URL.createObjectURL = () => "blob:mock";
  if (!URL.revokeObjectURL) URL.revokeObjectURL = () => {};
});

const okImage = (): RenderResponse => ({ ok: true, blob: new Blob([new Uint8Array(2048)], { type: "image/jpeg" }), engine: "cloudflare-klein" });

function makeDeps(over: Partial<ExpressDeps> = {}) {
  const jobs: ExpressJob[] = [];
  const bodies: Img2ImgBody[] = [];
  const deps: ExpressDeps = {
    applyDesign: vi.fn((input) => generateDesign(input)),
    applyLand: vi.fn(),
    applyProducts: vi.fn(),
    catalog: [
      { id: "p1", price: 10, subcategory: "flooring", styles: ["scandinavian"], roomTypes: ["living"] },
      { id: "p2", price: 99, subcategory: "sofa", styles: ["scandinavian"], roomTypes: ["living"] },
    ],
    styleName: () => "Scandinavian Minimal",
    saveProject: vi.fn(async () => ({ ok: true as const, id: "proj-1" })),
    estimateEur: () => 123_000,
    captureView: vi.fn(async () => ({ baseImage: "data:image/jpeg;base64,AAAA", controlImage: "data:image/png;base64,BBBB" })),
    requestRender: vi.fn(async (b: Img2ImgBody) => { bodies.push(b); return okImage(); }),
    persistRender: vi.fn(async () => true),
    persistJob: (j) => jobs.push(j),
    maxCostUsd: 0.003,
    sleep: vi.fn(async () => {}),
    now: () => "2026-11-28T10:00:00.000Z",
    uuid: () => "abcdef12-0000-4000-8000-000000000000",
    ...over,
  };
  return { deps, jobs, bodies };
}

const g1 = normalizeBrief(
  { county: "CJ", plotAreaSqm: 600, householdSize: 4, bedrooms: 3, targetAreaSqm: 110, styleId: "scandinavian", budgetBand: "moderate" },
  { locale: "ro", maxModules: 12, rendersPerDay: 5 },
);

describe("runExpress", () => {
  it("G1 end to end: design → land → products → save → 3 img2img renders → done", async () => {
    const { deps, jobs, bodies } = makeDeps();
    const job = await runExpress(g1, deps);

    expect(job.stage).toBe("done");
    expect(job.error).toBeNull();
    expect(job.projectId).toBe("proj-1");
    expect(job.modules).toBe(12);
    expect(job.productCount).toBe(2);
    expect(job.estimateEur).toBe(123_000);
    expect(job.renders.map((r) => r.status)).toEqual(["ok", "ok", "ok"]);
    expect(job.renders.map((r) => r.view)).toEqual(["exterior", "overview", "interior"]);
    expect(presentationUrl(job.projectId!)).toBe("/project/proj-1/presentation?express=1");

    expect(deps.applyLand).toHaveBeenCalledWith(expect.objectContaining({ polygon: expect.any(Array) }));
    expect(deps.applyProducts).toHaveBeenCalledWith([{ productId: "p1", quantity: 1 }, { productId: "p2", quantity: 1 }]);
    expect(deps.persistRender).toHaveBeenCalledTimes(3);

    // img2img contract: base + depth, engine null (server chain, klein first), no client tier
    expect(bodies).toHaveLength(3);
    for (const b of bodies) {
      expect(b.engine).toBeNull();
      expect(b.baseImage).toMatch(/^data:image\/jpeg/);
      expect(b.controlType).toBe("depth");
      expect(b).not.toHaveProperty("tier");
      expect(b.width).toBe(1024);
    }
    expect(bodies[0].prompt).toMatch(/^Turn this 3D eye-level exterior view of a modular house \(12 modules/);
    expect(bodies[2].prompt).toMatch(/^Turn this 3D view of a living/i);

    // progress persisted at every stage
    const stages = jobs.map((j) => j.stage);
    for (const s of ["design", "land", "products", "save", "renders", "done"]) expect(stages).toContain(s);
  });

  it("a failed render still delivers the project; 503 waits and retries once", async () => {
    let calls = 0;
    const { deps } = makeDeps({
      requestRender: vi.fn(async () => {
        calls++;
        if (calls === 1) return { ok: false as const, status: 503, message: "All AI engines busy" };
        if (calls === 3) return { ok: false as const, status: 500, message: "boom" };
        return okImage();
      }),
    });
    const job = await runExpress(g1, deps);
    expect(deps.sleep).toHaveBeenCalledWith(45_000);
    expect(job.stage).toBe("done");
    expect(job.renders.map((r) => r.status)).toEqual(["ok", "failed", "ok"]);
    expect(job.renders[1].error).toBe("boom");
  });

  it("quota exhausted (429) stops the remaining renders without calling the server", async () => {
    const { deps } = makeDeps({
      requestRender: vi.fn(async () => ({ ok: false as const, status: 429, message: "Daily limit" })),
    });
    const job = await runExpress(g1, deps);
    expect(deps.requestRender).toHaveBeenCalledTimes(1);
    expect(job.renders.every((r) => r.status === "failed" && r.error === "quota")).toBe(true);
    expect(job.stage).toBe("done");
  });

  it("scene not ready → render marked failed, no request sent", async () => {
    const { deps } = makeDeps({ captureView: vi.fn(async () => null) });
    const job = await runExpress(g1, deps);
    expect(deps.requestRender).not.toHaveBeenCalled();
    expect(job.renders.every((r) => r.error === "scene")).toBe(true);
  });

  it("save failure stops before renders", async () => {
    const { deps } = makeDeps({ saveProject: vi.fn(async () => ({ ok: false as const, error: "offline" })) });
    const job = await runExpress(g1, deps);
    expect(job.stage).toBe("failed");
    expect(job.error).toBe("save: offline");
    expect(job.failedStage).toBe("save");
    expect(deps.requestRender).not.toHaveBeenCalled();
  });

  it("design failure fails fast", async () => {
    const { deps } = makeDeps({ applyDesign: vi.fn(() => null) });
    const job = await runExpress(g1, deps);
    expect(job).toMatchObject({ stage: "failed", error: "design" });
    expect(deps.saveProject).not.toHaveBeenCalled();
  });

  it("retryFailedRenders re-runs only the failed views", async () => {
    let first = true;
    const { deps } = makeDeps({
      requestRender: vi.fn(async () => {
        if (first) { first = false; return { ok: false as const, status: 500, message: "x" }; }
        return okImage();
      }),
    });
    const job = await runExpress(g1, deps);
    expect(job.renders.map((r) => r.status)).toEqual(["failed", "ok", "ok"]);
    const design = generateDesign({ householdSize: 4, budgetLevel: "moderate", stylePreference: "scandinavian", floors: 1 });
    const again = await retryFailedRenders(job, design, deps);
    expect(again.renders.map((r) => r.status)).toEqual(["ok", "ok", "ok"]);
    expect(deps.requestRender).toHaveBeenCalledTimes(4);
  });
});
