import type { AiRenderEngine, AiRenderResult, AiRenderRequest } from "./types";

import { devLog } from "@/shared/lib/devLog";
/**
 * Segmind — Cheapest upscaling + image generation
 *
 * Upscaling at $0.005/image. Text2img from $0.005.
 * Free credits on signup. Min top-up $10.
 *
 * Requires SEGMIND_API_KEY env variable.
 * Get at https://www.segmind.com/api-keys
 */

const API_KEY = process.env.SEGMIND_API_KEY || "";
const API_BASE = "https://api.segmind.com/v1";

export const segmindEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!API_KEY) {
    devLog("[segmind] No SEGMIND_API_KEY set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    return await generateImage(req, startMs);
  } catch (err) {
    console.error("[segmind] Error:", err);
    return null;
  }
};

async function generateImage(
  req: AiRenderRequest,
  startMs: number
): Promise<AiRenderResult | null> {
  // Use SDXL 1.0 for text2img (cheapest reliable model)
  devLog("[segmind] Using SDXL 1.0");

  const response = await fetch(`${API_BASE}/sdxl1.0-txt2img`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: req.prompt.slice(0, 1000),
      negative_prompt: "blurry, low quality, distorted, cartoon, anime, sketch, watermark",
      samples: 1,
      scheduler: "UniPC",
      num_inference_steps: 25,
      guidance_scale: 7.5,
      seed: Number(req.seed) % 4294967295 || -1,
      img_width: clampDimension(req.width),
      img_height: clampDimension(req.height),
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`[segmind] Error: ${response.status}`, errText.slice(0, 200));
    return null;
  }

  // Segmind returns image bytes directly
  const contentType = response.headers.get("content-type") || "";
  if (contentType.startsWith("image/")) {
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 500) return null;

    devLog(`[segmind] Success: ${buffer.length} bytes`);
    return {
      buffer,
      contentType: contentType || "image/png",
      engine: "segmind-sdxl",
      costUsd: 0.005,
      latencyMs: Date.now() - startMs,
    };
  }

  // Some endpoints return JSON with base64
  const data = await response.json();
  const b64 = data?.image;
  if (!b64) {
    console.error("[segmind] No image in response");
    return null;
  }

  const buffer = Buffer.from(b64, "base64");
  if (buffer.length < 500) return null;

  return {
    buffer,
    contentType: "image/png",
    engine: "segmind-sdxl",
    costUsd: 0.005,
    latencyMs: Date.now() - startMs,
  };
}

/** Segmind needs multiples of 8, max 1536 */
function clampDimension(d: number): number {
  const clamped = Math.min(Math.max(d, 512), 1536);
  return Math.round(clamped / 8) * 8;
}
