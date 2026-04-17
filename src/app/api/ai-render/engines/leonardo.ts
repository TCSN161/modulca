import type { AiRenderEngine, AiRenderResult, AiRenderRequest } from "./types";

import { devLog } from "@/shared/lib/devLog";
/**
 * Leonardo.ai — Creative Engine API
 *
 * High quality image generation with 150 free tokens/day (web)
 * and $5 in free API credits on signup.
 *
 * Requires LEONARDO_API_KEY env variable.
 * Get free key at https://app.leonardo.ai/api-access (free account).
 */

const API_KEY = process.env.LEONARDO_API_KEY || "";
const GENERATE_URL = "https://cloud.leonardo.ai/api/rest/v1/generations";

export const leonardoEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!API_KEY) {
    devLog("[leonardo] No LEONARDO_API_KEY set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    const result = await generateImage(req);
    if (result) {
      result.costUsd = 0.03; // ~3 tokens with alchemy
      result.latencyMs = Date.now() - startMs;
    }
    return result;
  } catch (err) {
    console.error("[leonardo] Error:", err);
    return null;
  }
};

async function generateImage(
  req: AiRenderRequest
): Promise<AiRenderResult | null> {
  devLog("[leonardo] Submitting generation job...");

  // Step 1: Submit generation request
  const genResponse = await fetch(GENERATE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: req.prompt.slice(0, 1000),
      negative_prompt:
        "blurry, low quality, distorted, cartoon, anime, sketch, watermark",
      width: clampDimension(req.width),
      height: clampDimension(req.height),
      num_images: 1,
      guidance_scale: 7,
      num_inference_steps: 30,
      seed: Number(req.seed) % 4294967295 || undefined,
      photoReal: true,
      alchemy: true,
    }),
  });

  if (!genResponse.ok) {
    const errText = await genResponse.text().catch(() => "");
    console.error(
      `[leonardo] Generation submit error: ${genResponse.status}`,
      errText.slice(0, 200)
    );
    return null;
  }

  const genData = await genResponse.json();
  const generationId =
    genData?.sdGenerationJob?.generationId;
  if (!generationId) {
    console.error("[leonardo] No generationId in response");
    return null;
  }

  devLog(`[leonardo] Job submitted: ${generationId}, polling...`);

  // Step 2: Poll for completion (max 120 seconds)
  const pollUrl = `${GENERATE_URL}/${generationId}`;
  const maxWait = 120_000;
  const pollInterval = 3_000;
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    await new Promise((r) => setTimeout(r, pollInterval));

    const pollResponse = await fetch(pollUrl, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (!pollResponse.ok) continue;

    const pollData = await pollResponse.json();
    const status =
      pollData?.generations_by_pk?.status;

    if (status === "COMPLETE") {
      const images =
        pollData?.generations_by_pk?.generated_images;
      if (!images || images.length === 0) {
        console.error("[leonardo] No images in completed job");
        return null;
      }

      const imageUrl = images[0].url;
      devLog("[leonardo] Image ready, downloading...");

      // Step 3: Download the image
      const imgResponse = await fetch(imageUrl);
      if (!imgResponse.ok) return null;

      const buffer = Buffer.from(await imgResponse.arrayBuffer());
      if (buffer.length < 500) return null;

      return {
        buffer,
        contentType: "image/png",
        engine: "leonardo",
      };
    }

    if (status === "FAILED") {
      console.error("[leonardo] Generation failed");
      return null;
    }

    // Still processing, continue polling
  }

  console.error("[leonardo] Timed out waiting for generation");
  return null;
}

/** Leonardo requires dimensions in multiples of 8, within reasonable range */
function clampDimension(d: number): number {
  const clamped = Math.min(Math.max(d, 512), 1536);
  return Math.round(clamped / 8) * 8;
}
