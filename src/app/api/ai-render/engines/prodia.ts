import type { AiRenderEngine, AiRenderResult, AiRenderRequest } from "./types";

/**
 * Prodia Pro — Meta-gateway to 30+ image models
 *
 * $5/mo Pro plan gives access to: FLUX Schnell, FLUX Dev, SDXL,
 * Stable Diffusion XL, Recraft V4, Upscale, and more.
 * Single API, single billing, many models.
 *
 * Uses the inference API: https://inference.prodia.com/v2/job
 * Auth: Bearer token (JWT format)
 *
 * Requires PRODIA_API_KEY env variable.
 * Get at https://app.prodia.com/api
 */

const API_KEY = process.env.PRODIA_API_KEY || "";

export const prodiaEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!API_KEY) {
    console.log("[prodia] No PRODIA_API_KEY set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    return await generateImage(req, startMs);
  } catch (err) {
    console.error("[prodia] Error:", err);
    return null;
  }
};

async function generateImage(
  req: AiRenderRequest,
  startMs: number
): Promise<AiRenderResult | null> {
  // FLUX Fast Schnell = fastest + cheapest ($0.002, ~0.25s)
  console.log("[prodia] Using FLUX Fast Schnell v2");

  // Step 1: Submit generation job via v2 inference API
  const response = await fetch("https://inference.prodia.com/v2/job", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      type: "inference.flux-fast.schnell.txt2img.v2",
      config: {
        prompt: req.prompt.slice(0, 1000),
        width: clampDimension(req.width),
        height: clampDimension(req.height),
        steps: 4,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`[prodia] Submit error: ${response.status}`, errText.slice(0, 300));

    // Try fallback to SDXL if FLUX fails
    if (response.status === 400 || response.status === 422) {
      console.log("[prodia] Trying SDXL fallback...");
      return generateSDXL(req, startMs);
    }
    return null;
  }

  const job = (await response.json()) as { id?: string; state?: { current?: string } };
  if (!job?.id) {
    console.error("[prodia] No job ID in response:", JSON.stringify(job).slice(0, 200));
    return null;
  }

  // If already completed (fast models complete inline)
  if (job.state?.current === "completed") {
    console.log(`[prodia] Job completed inline: ${job.id}`);
    return downloadResult(job.id, startMs);
  }

  console.log(`[prodia] Job submitted: ${job.id}`);
  return pollForResult(job.id, startMs);
}

/** Fallback: SDXL via v2 API */
async function generateSDXL(
  req: AiRenderRequest,
  startMs: number
): Promise<AiRenderResult | null> {
  const response = await fetch("https://inference.prodia.com/v2/job", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      type: "inference.sdxl.txt2img.v1",
      config: {
        prompt: req.prompt.slice(0, 1000),
        negative_prompt: "blurry, low quality, distorted, cartoon, anime, watermark",
        width: clampDimension(req.width),
        height: clampDimension(req.height),
        steps: 25,
        cfg_scale: 7,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`[prodia] SDXL submit error: ${response.status}`, errText.slice(0, 200));
    return null;
  }

  const job = (await response.json()) as { id?: string; state?: { current?: string } };
  if (!job?.id) return null;

  if (job.state?.current === "completed") {
    return downloadResult(job.id, startMs);
  }

  console.log(`[prodia] SDXL job submitted: ${job.id}`);
  return pollForResult(job.id, startMs);
}

/** Download image from a completed job */
async function downloadResult(
  jobId: string,
  startMs: number
): Promise<AiRenderResult | null> {
  const imgRes = await fetch(`https://inference.prodia.com/v2/job/${jobId}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "image/png",
    },
  });

  if (!imgRes.ok) {
    console.error(`[prodia] Download failed: ${imgRes.status}`);
    return null;
  }

  const buffer = Buffer.from(await imgRes.arrayBuffer());
  if (buffer.length < 500) return null;

  console.log(`[prodia] Success: ${buffer.length} bytes`);
  return {
    buffer,
    contentType: "image/png",
    engine: "prodia-flux",
    costUsd: 0.002,
    latencyMs: Date.now() - startMs,
  };
}

/** Poll for job completion and download result */
async function pollForResult(
  jobId: string,
  startMs: number
): Promise<AiRenderResult | null> {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 500));

    const statusRes = await fetch(`https://inference.prodia.com/v2/job/${jobId}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!statusRes.ok) continue;
    const status = (await statusRes.json()) as {
      state?: { current?: string };
      error?: string;
    };

    if (status.state?.current === "completed") {
      return downloadResult(jobId, startMs);
    }

    if (status.state?.current === "failed") {
      console.error("[prodia] Job failed:", status.error);
      return null;
    }
  }

  console.error("[prodia] Timed out after 30s");
  return null;
}

/** Prodia supports multiples of 8, max 1024 */
function clampDimension(d: number): number {
  const clamped = Math.min(Math.max(d, 256), 1024);
  return Math.round(clamped / 8) * 8;
}
