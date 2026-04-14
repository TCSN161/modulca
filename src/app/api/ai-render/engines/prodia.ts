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
  // Use FLUX Schnell for speed, or SDXL for broader compatibility
  const model = "flux-schnell";
  console.log(`[prodia] Using ${model}`);

  // Step 1: Submit generation job via v2 inference API
  const response = await fetch("https://inference.prodia.com/v2/job", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      type: "inference.flux.txt2img.v1",
      config: {
        prompt: req.prompt.slice(0, 1000),
        width: clampDimension(req.width),
        height: clampDimension(req.height),
        steps: 4,
        guidance_scale: 3.5,
        seed: Number(req.seed) % 4294967295 || -1,
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

  const job = (await response.json()) as { job?: string; status?: string };
  if (!job?.job) {
    console.error("[prodia] No job ID in response:", JSON.stringify(job).slice(0, 200));
    return null;
  }

  console.log(`[prodia] Job submitted: ${job.job}`);
  return pollForResult(job.job, startMs);
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
        seed: Number(req.seed) % 4294967295 || -1,
        sampler: "DPM++ 2M Karras",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`[prodia] SDXL submit error: ${response.status}`, errText.slice(0, 200));
    return null;
  }

  const job = (await response.json()) as { job?: string };
  if (!job?.job) return null;

  console.log(`[prodia] SDXL job submitted: ${job.job}`);
  return pollForResult(job.job, startMs);
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
      status?: string;
      imageUrl?: string;
      error?: string;
    };

    if (status.status === "succeeded" && status.imageUrl) {
      const imgRes = await fetch(status.imageUrl);
      if (!imgRes.ok) return null;

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

    if (status.status === "failed") {
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
