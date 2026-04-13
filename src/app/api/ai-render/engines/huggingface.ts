import type { AiRenderEngine, AiRenderResult, AiRenderRequest } from "./types";

/**
 * Hugging Face Inference API — Open source models
 *
 * Free tier with monthly credits. FLUX, SDXL, Stable Diffusion.
 * PRO plan $9/mo for more credits.
 * Text-to-image only.
 *
 * Requires HUGGINGFACE_API_TOKEN env variable.
 * Get at https://huggingface.co/settings/tokens
 */

const API_TOKEN = process.env.HUGGINGFACE_API_TOKEN || "";

export const huggingfaceEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!API_TOKEN) {
    console.log("[huggingface] No HUGGINGFACE_API_TOKEN set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    return await generateImage(req, startMs);
  } catch (err) {
    console.error("[huggingface] Error:", err);
    return null;
  }
};

async function generateImage(
  req: AiRenderRequest,
  startMs: number
): Promise<AiRenderResult | null> {
  // Use FLUX.1-schnell for speed, fall back to SDXL-base if unavailable
  const model = "black-forest-labs/FLUX.1-schnell";
  console.log(`[huggingface] Using ${model}`);

  const url = `https://router.huggingface.co/hf-inference/models/${model}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: req.prompt.slice(0, 500),
      parameters: {
        width: clampDimension(req.width),
        height: clampDimension(req.height),
        num_inference_steps: 4,
        seed: Number(req.seed) % 4294967295 || undefined,
      },
    }),
  });

  // Model may be loading (503)
  if (response.status === 503) {
    console.log("[huggingface] Model is loading, skipping");
    return null;
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`[huggingface] Error: ${response.status}`, errText.slice(0, 200));
    return null;
  }

  // HF Inference API returns raw image bytes
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 500) {
    console.error("[huggingface] Returned tiny image");
    return null;
  }

  console.log(`[huggingface] Success: ${buffer.length} bytes`);
  return {
    buffer,
    contentType: "image/png",
    engine: "huggingface-flux",
    costUsd: 0.001, // Minimal cost on free tier
    latencyMs: Date.now() - startMs,
  };
}

/** HF models typically need multiples of 8, max ~1024 */
function clampDimension(d: number): number {
  const clamped = Math.min(Math.max(d, 256), 1024);
  return Math.round(clamped / 8) * 8;
}
