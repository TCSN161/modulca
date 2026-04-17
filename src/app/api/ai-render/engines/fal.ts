import type { AiRenderEngine, AiRenderResult, AiRenderRequest } from "./types";

import { devLog } from "@/shared/lib/devLog";
/**
 * fal.ai — Fastest inference, all 4 capabilities
 *
 * Supports: text2img, img2img, upscaling, video
 * Models: FLUX Schnell/Dev/Pro, Seedream, various
 * GDPR: Partial (trust center at trust.fal.ai)
 *
 * Requires FAL_API_KEY env variable.
 * Get key at https://fal.ai/dashboard/keys
 */

const API_KEY = process.env.FAL_API_KEY || "";

/** fal.ai queue-based endpoint */
const FAL_API = "https://queue.fal.run";

export const falEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!API_KEY) {
    devLog("[fal] No FAL_API_KEY set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    if (req.baseImage) {
      return await tryImg2Img(req, startMs);
    }
    return await tryText2Img(req, startMs);
  } catch (err) {
    console.error("[fal] Error:", err);
    return null;
  }
};

async function tryText2Img(
  req: AiRenderRequest,
  startMs: number
): Promise<AiRenderResult | null> {
  devLog("[fal] Using FLUX Schnell (text-to-image)");

  const response = await fetch(`${FAL_API}/fal-ai/flux/schnell`, {
    method: "POST",
    headers: {
      Authorization: `Key ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: req.prompt.slice(0, 1000),
      image_size: {
        width: clampDimension(req.width),
        height: clampDimension(req.height),
      },
      num_inference_steps: 4,
      num_images: 1,
      seed: Number(req.seed) % 4294967295 || undefined,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`[fal] text2img error: ${response.status}`, errText.slice(0, 200));
    return null;
  }

  const data = await response.json();
  const imageUrl = data?.images?.[0]?.url;
  if (!imageUrl) {
    console.error("[fal] No image URL in response");
    return null;
  }

  // Download the image
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) return null;

  const buffer = Buffer.from(await imgRes.arrayBuffer());
  if (buffer.length < 500) return null;

  return {
    buffer,
    contentType: "image/png",
    engine: "fal-schnell",
    costUsd: 0.003, // FLUX Schnell is very cheap on fal
    latencyMs: Date.now() - startMs,
  };
}

async function tryImg2Img(
  req: AiRenderRequest,
  startMs: number
): Promise<AiRenderResult | null> {
  devLog("[fal] Using FLUX Kontext Pro (img2img)");

  const imageDataUri = `data:image/png;base64,${req.baseImage}`;

  const response = await fetch(`${FAL_API}/fal-ai/flux-kontext/pro`, {
    method: "POST",
    headers: {
      Authorization: `Key ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: req.prompt.slice(0, 1000),
      image_url: imageDataUri,
      num_images: 1,
      seed: Number(req.seed) % 4294967295 || undefined,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`[fal] img2img error: ${response.status}`, errText.slice(0, 200));
    // Fall back to text2img
    return tryText2Img(req, startMs);
  }

  const data = await response.json();
  const imageUrl = data?.images?.[0]?.url;
  if (!imageUrl) return tryText2Img(req, startMs);

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) return null;

  const buffer = Buffer.from(await imgRes.arrayBuffer());
  if (buffer.length < 500) return null;

  return {
    buffer,
    contentType: "image/png",
    engine: "fal-kontext",
    costUsd: 0.04,
    latencyMs: Date.now() - startMs,
  };
}

/** fal.ai dimensions must be multiples of 8, max 1536 */
function clampDimension(d: number): number {
  const clamped = Math.min(Math.max(d, 256), 1536);
  return Math.round(clamped / 8) * 8;
}
