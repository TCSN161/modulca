/**
 * Replicate FLUX structure control (3.07): flux-depth-dev + flux-canny-dev.
 *
 * Model ids live in STRUCTURE_ENGINES (structureFunding.ts). Both models take
 * `control_image` and run their own depth / canny preprocessor on it, so the
 * RGB 3D capture works; a matching control map from the client (Chat 5,
 * Three.js depth pass) is cleaner and is preferred when sent.
 *
 * Off until funded: route.ts checks isStructureEngineFunded() first. A 401/402
 * here parks Replicate for 30 min (markUnfunded) so the chain stops paying the
 * round trip. Never falls back to text2img (that would drop the 3D view, BUG-ST34).
 */
import type { AiRenderEngine, AiRenderRequest, AiRenderResult } from "./types";
import {
  STRUCTURE_ENGINES, apiKeyFor, isUnfundedStatus, markUnfunded, pickControlInput,
  type StructureEngineId, type StructureEngineConfig,
} from "./structureFunding";
import { devLog } from "@/shared/lib/devLog";

const API = "https://api.replicate.com/v1/models";
const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 75_000; // under the client's 90 s abort (BUG-E12)

type Prediction = { id?: string; status?: string; output?: string | string[] | null; error?: string; urls?: { get?: string } };

/** The Replicate request body for one structure render. Exported for tests. */
export function replicateStructureBody(id: StructureEngineId, req: AiRenderRequest): { input: Record<string, unknown> } | null {
  const control = pickControlInput((STRUCTURE_ENGINES[id] as StructureEngineConfig).controlType, req);
  if (!control) return null;
  const seed = Number(req.seed) % 4294967295;
  return {
    input: {
      prompt: req.prompt.slice(0, 1000),
      control_image: `data:image/png;base64,${control}`,
      num_outputs: 1,
      output_format: "png",
      ...(Number.isFinite(seed) && seed > 0 ? { seed } : {}),
    },
  };
}

function firstOutput(p: Prediction): string | null {
  const o = p.output;
  return Array.isArray(o) ? o[0] ?? null : typeof o === "string" ? o : null;
}

function makeEngine(id: StructureEngineId): AiRenderEngine {
  return async (req): Promise<AiRenderResult | null> => {
    const key = apiKeyFor(id);
    if (!key) return null;
    const body = replicateStructureBody(id, req);
    if (!body) return null; // structure control needs an image
    const startMs = Date.now();
    const auth = { Authorization: `Bearer ${key}` };
    try {
      const res = await fetch(`${API}/${STRUCTURE_ENGINES[id].model}/predictions`, {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json", Prefer: "wait=55" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        if (isUnfundedStatus(res.status)) markUnfunded("replicate");
        console.error(`[${id}] ${res.status}`, (await res.text().catch(() => "")).slice(0, 200));
        return null;
      }
      let p = (await res.json()) as Prediction;
      const deadline = startMs + TIMEOUT_MS;
      while (!firstOutput(p) && p.status !== "failed" && p.status !== "canceled" && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        const poll = await fetch(p.urls?.get || `https://api.replicate.com/v1/predictions/${p.id}`, { headers: auth });
        if (poll.ok) p = (await poll.json()) as Prediction;
      }
      const url = p.status === "failed" || p.status === "canceled" ? null : firstOutput(p);
      if (!url) {
        console.error(`[${id}] no output (${p.status ?? "timeout"}) ${p.error ?? ""}`);
        return null;
      }
      const img = await fetch(url);
      if (!img.ok) return null;
      const buffer = Buffer.from(await img.arrayBuffer());
      if (buffer.length < 500) return null;
      devLog(`[${id}] ok ${buffer.length} bytes`);
      return {
        buffer,
        contentType: img.headers.get("content-type") || "image/png",
        engine: id,
        costUsd: STRUCTURE_ENGINES[id].costUsd,
        latencyMs: Date.now() - startMs,
      };
    } catch (err) {
      console.error(`[${id}] error:`, err);
      return null;
    }
  };
}

export const replicateDepthEngine = makeEngine("replicate-depth");
export const replicateCannyEngine = makeEngine("replicate-canny");
