/**
 * Express orchestrator (spec v1 §4) — a plain async function, not a hook.
 * Every side effect goes through `ExpressDeps`, so it runs with mocks in tests
 * and with the real stores in the browser (clientDeps.ts). The job is persisted
 * after each stage: a failed stage never loses the earlier ones, and a render
 * failure still delivers the project + presentation.
 */
import type { GeneratedDesign, WizardInput } from "@/features/wizard/types";
import type { SavedRender } from "@/features/design/store";
import type { SelectedProduct } from "@/features/design/productSelection";
import type { Img2ImgBody } from "@/features/design/components/render/renderRequest";
import type { LatLng } from "@/features/land/store";
import { PRESET_FOCAL_MM } from "@/features/design/components/render/cameraPresets";
import { briefToWizardInput } from "./briefToWizardInput";
import { COUNTY_CENTROIDS, squarePlot } from "./countyCentroids";
import { pickProducts, type PickableProduct } from "./pickProducts";
import { buildExpressPrompt, buildExpressRenderBody, EXPRESS_RENDER_SIZE } from "./renderPlan";
import type { ExpressBrief, ExpressJob, ExpressRenderState, ExpressRenderView } from "./types";

export type RenderResponse =
  | { ok: true; blob: Blob; engine: string }
  | { ok: false; status: number; message: string; retryAfterSec?: number };

export interface ExpressDeps {
  applyDesign(input: WizardInput): GeneratedDesign | null;
  applyLand(land: { center: LatLng; polygon: LatLng[] }): void;
  applyProducts(items: SelectedProduct[]): void;
  catalog: PickableProduct[];
  styleName(styleId: string): string;
  saveProject(name: string): Promise<{ ok: true; id: string } | { ok: false; error: string }>;
  estimateEur(): number | null;
  /** Capture the 3D scene from a camera preset (JPEG base + optional depth PNG). null = scene not ready. */
  captureView(view: ExpressRenderView): Promise<{ baseImage: string; controlImage?: string | null } | null>;
  requestRender(body: Img2ImgBody): Promise<RenderResponse>;
  persistRender(render: SavedRender, projectId: string): Promise<boolean>;
  persistJob(job: ExpressJob): void;
  maxCostUsd: number;
  sleep(ms: number): Promise<void>;
  now(): string;
  uuid(): string;
}

/** Wait before the single retry of a 503 "all engines busy" (Pollinations 1/45 s/IP). */
export const BUSY_RETRY_MS = 45_000;

export function presentationUrl(projectId: string): string {
  return `/project/${projectId}/presentation?express=1`;
}

export function projectNameFor(brief: ExpressBrief, date: string): string {
  const county = COUNTY_CENTROIDS[brief.county]?.name ?? brief.county;
  return `Express ${county} · ${brief.bedrooms}BR · ${date.slice(0, 10)}`;
}

function newJob(brief: ExpressBrief, deps: ExpressDeps): ExpressJob {
  const startedAt = deps.now();
  return {
    id: deps.uuid(),
    brief,
    projectId: null,
    projectName: projectNameFor(brief, startedAt),
    stage: "design",
    modules: 0,
    productCount: 0,
    estimateEur: null,
    renders: brief.renderViews.map((view) => ({ view, status: "pending" as const })),
    startedAt,
    finishedAt: null,
    error: null,
  };
}

export type ExpressListener = (job: ExpressJob) => void;

export async function runExpress(
  brief: ExpressBrief,
  deps: ExpressDeps,
  onProgress?: ExpressListener,
): Promise<ExpressJob> {
  let job = newJob(brief, deps);
  const commit = (patch: Partial<ExpressJob>) => {
    job = { ...job, ...patch };
    deps.persistJob(job);
    onProgress?.(job);
  };
  const fail = (error: string) => {
    commit({ stage: "failed", error, finishedAt: deps.now() });
    return job;
  };
  commit({});

  // design (steps 3–7, 9–10) — Chat 5: setInput → generate → applyToProject({syncLand})
  const design = deps.applyDesign(briefToWizardInput(brief));
  if (!design || design.modules.length === 0) return fail("design");

  // land (step 2)
  commit({ stage: "land", modules: design.modules.length });
  const center = COUNTY_CENTROIDS[brief.county].center;
  deps.applyLand({ center, polygon: squarePlot(center, brief.plotAreaSqm) });

  // products (step 11)
  commit({ stage: "products" });
  const picks = pickProducts(deps.catalog, design.styleDirection, design.modules.map((m) => m.moduleType), design.finishLevel);
  deps.applyProducts(picks);

  // save (step 12)
  commit({ stage: "save", productCount: picks.length });
  const saved = await deps.saveProject(job.projectName);
  if (!saved.ok) return fail(`save: ${saved.error}`);
  commit({ stage: "renders", projectId: saved.id, estimateEur: deps.estimateEur() });

  // renders (step 8)
  job = await renderViews(job, design, deps, commit);

  // presentation (step 13): the page reads the filled stores
  commit({ stage: "done", finishedAt: deps.now() });
  return job;
}

/** Re-run only the failed renders of a finished job (the "Reîncearcă randările" button). */
export async function retryFailedRenders(
  job: ExpressJob,
  design: Pick<GeneratedDesign, "modules" | "styleDirection">,
  deps: ExpressDeps,
  onProgress?: ExpressListener,
): Promise<ExpressJob> {
  if (!job.projectId) return job;
  let cur: ExpressJob = {
    ...job,
    stage: "renders",
    renders: job.renders.map((r) => (r.status === "failed" ? { view: r.view, status: "pending" } : r)),
  };
  const commit = (patch: Partial<ExpressJob>) => {
    cur = { ...cur, ...patch };
    deps.persistJob(cur);
    onProgress?.(cur);
  };
  commit({});
  cur = await renderViews(cur, design, deps, commit);
  commit({ stage: "done", finishedAt: deps.now() });
  return cur;
}

async function renderViews(
  job: ExpressJob,
  design: Pick<GeneratedDesign, "modules" | "styleDirection">,
  deps: ExpressDeps,
  commit: (patch: Partial<ExpressJob>) => void,
): Promise<ExpressJob> {
  const projectId = job.projectId!;
  const labels = design.modules.map((m) => m.label);
  const living = design.modules.find((m) => m.moduleType === "living");
  const ctx = {
    moduleLabels: labels,
    interiorRoomLabel: living?.label ?? "Living",
    styleName: deps.styleName(design.styleDirection),
    maxCostUsd: deps.maxCostUsd,
    seedBase: job.id.slice(0, 8),
  };
  let renders = [...job.renders];
  let quotaHit = false;
  const set = (i: number, r: ExpressRenderState) => {
    renders = renders.map((x, j) => (j === i ? r : x));
    commit({ renders });
  };

  for (let i = 0; i < renders.length; i++) {
    const { view, status } = renders[i];
    if (status !== "pending") continue;
    if (quotaHit) { set(i, { view, status: "failed", error: "quota" }); continue; }

    const capture = await deps.captureView(view);
    if (!capture) { set(i, { view, status: "failed", error: "scene" }); continue; }
    const body = buildExpressRenderBody(view, ctx, capture);

    let res = await deps.requestRender(body);
    if (!res.ok && res.status === 503) {
      await deps.sleep(res.retryAfterSec ? res.retryAfterSec * 1000 : BUSY_RETRY_MS);
      res = await deps.requestRender(body);
    }
    if (!res.ok) {
      if (res.status === 429 || res.status === 402) quotaHit = true;
      set(i, { view, status: "failed", error: res.status === 429 || res.status === 402 ? "quota" : res.message });
      continue;
    }

    const renderId = `express-${job.id.slice(0, 8)}-${view}`;
    const render: SavedRender = {
      id: renderId,
      imageUrl: URL.createObjectURL(res.blob),
      label: view === "interior" ? ctx.interiorRoomLabel : view === "exterior" ? "Exterior" : "Overview",
      engine: res.engine,
      moduleType: view === "interior" ? "living" : "house",
      createdAt: deps.now(),
      prompt: buildExpressPrompt(view, ctx),
      mode: "img2img",
      baseSource: "scene",
      resolution: `${EXPRESS_RENDER_SIZE.width}x${EXPRESS_RENDER_SIZE.height}`,
      view: { camera: view, focalMm: PRESET_FOCAL_MM[view], viewMode: "all" },
    };
    const ok = await deps.persistRender(render, projectId);
    URL.revokeObjectURL(render.imageUrl);
    set(i, ok ? { view, status: "ok", engine: res.engine, renderId } : { view, status: "failed", error: "persist" });
  }
  return { ...job, renders };
}
