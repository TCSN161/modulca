/**
 * NovitaAI Engine
 *
 * Free trial: $0.50 credits + up to $10K startup credits.
 * 200+ models (SDXL, FLUX, Kandinsky, etc.) — cheapest at $0.0015/img.
 *
 * Requires NOVITA_API_KEY env variable.
 * Get free key at https://novita.ai
 */

import type { AiRenderEngine, AiRenderRequest, AiRenderResult } from "./types";

const API_KEY = process.env.NOVITA_API_KEY || "";
const API_URL = "https://api.novita.ai/v3/async/txt2img";
const STATUS_URL = "https://api.novita.ai/v3/async/task-result";

/** Default model — FLUX.1 [schnell] for best quality/price ratio */
const DEFAULT_MODEL = "flux-schnell";

async function poll(taskId: string, maxMs = 30_000): Promise<string | null> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    await new Promise((r) => setTimeout(r, 1500));
    try {
      const res = await fetch(`${STATUS_URL}?task_id=${taskId}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      if (!res.ok) continue;
      const data = await res.json();
      const status = data?.task?.status;
      if (status === "TASK_STATUS_SUCCEED") {
        return data?.images?.[0]?.image_url || null;
      }
      if (status === "TASK_STATUS_FAILED") return null;
    } catch {
      /* keep polling */
    }
  }
  return null;
}

export const novitaEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!API_KEY) {
    console.log("[novita] No NOVITA_API_KEY set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    console.log("[novita] Submitting async task...");

    const submit = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request: {
          model_name: DEFAULT_MODEL,
          prompt: req.prompt.slice(0, 1500),
          width: Math.min(1280, Math.max(512, req.width)),
          height: Math.min(1280, Math.max(512, req.height)),
          image_num: 1,
          steps: 4, // schnell is distilled, 4 steps is optimal
          guidance_scale: 1.0,
          seed: Number(req.seed) % 4294967295 || -1,
        },
      }),
    });

    if (!submit.ok) {
      const errText = await submit.text().catch(() => "");
      console.error(`[novita] Submit error ${submit.status}:`, errText.slice(0, 200));
      return null;
    }

    const { task_id } = await submit.json();
    if (!task_id) {
      console.error("[novita] No task_id in response");
      return null;
    }

    const imageUrl = await poll(task_id);
    if (!imageUrl) {
      console.error("[novita] Task timed out or failed");
      return null;
    }

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    return {
      buffer,
      contentType: imgRes.headers.get("content-type") || "image/png",
      engine: "novita-flux-schnell",
      costUsd: 0.0015,
      latencyMs: Date.now() - startMs,
      prompt: req.prompt,
    };
  } catch (err) {
    console.error("[novita] Error:", err);
    return null;
  }
};
