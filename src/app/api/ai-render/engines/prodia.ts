import type { AiRenderEngine, AiRenderResult, AiRenderRequest } from "./types";

/**
 * Prodia — Ultra-fast, ultra-cheap image generation
 *
 * 1,000 free API calls (no credit card needed!).
 * $0.001-$0.0025/image after that. 190ms average latency.
 * 50+ models including FLUX and SDXL.
 *
 * Requires PRODIA_API_KEY env variable.
 * Get at https://app.prodia.com/api
 */

const API_KEY = process.env.PRODIA_API_KEY || "";
const API_URL = "https://api.prodia.com/v1";

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
  console.log("[prodia] Using SDXL");

  // Step 1: Submit generation job
  const response = await fetch(`${API_URL}/sdxl/generate`, {
    method: "POST",
    headers: {
      "X-Prodia-Key": API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      model: "sdxl",
      prompt: req.prompt.slice(0, 1000),
      negative_prompt: "blurry, low quality, distorted, cartoon, anime, watermark",
      width: clampDimension(req.width),
      height: clampDimension(req.height),
      steps: 25,
      cfg_scale: 7,
      seed: Number(req.seed) % 4294967295 || -1,
      sampler: "DPM++ 2M Karras",
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`[prodia] Submit error: ${response.status}`, errText.slice(0, 200));
    return null;
  }

  const job = await response.json();
  if (!job?.job) {
    console.error("[prodia] No job ID in response");
    return null;
  }

  console.log(`[prodia] Job submitted: ${job.job}`);

  // Step 2: Poll for result (Prodia is typically very fast, ~190ms)
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 500));

    const statusRes = await fetch(`${API_URL}/job/${job.job}`, {
      headers: { "X-Prodia-Key": API_KEY, Accept: "application/json" },
    });

    if (!statusRes.ok) continue;
    const status = await statusRes.json();

    if (status.status === "succeeded" && status.imageUrl) {
      const imgRes = await fetch(status.imageUrl);
      if (!imgRes.ok) return null;

      const buffer = Buffer.from(await imgRes.arrayBuffer());
      if (buffer.length < 500) return null;

      console.log(`[prodia] Success: ${buffer.length} bytes`);
      return {
        buffer,
        contentType: "image/png",
        engine: "prodia-sdxl",
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

/** Prodia SDXL needs multiples of 8, max 1024 */
function clampDimension(d: number): number {
  const clamped = Math.min(Math.max(d, 256), 1024);
  return Math.round(clamped / 8) * 8;
}
