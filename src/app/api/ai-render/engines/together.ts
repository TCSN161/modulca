import type { AiRenderEngine, AiRenderResult, AiRenderRequest } from "./types";

/**
 * Together.ai — FLUX.1 [schnell] (free unlimited for 3 months)
 *
 * Free, fast, high quality text-to-image.
 * Also supports FLUX Kontext for img2img editing.
 *
 * Requires TOGETHER_API_KEY env variable.
 * Get free key at https://api.together.xyz/signin (no credit card).
 */

const API_KEY = process.env.TOGETHER_API_KEY || "";
const API_URL = "https://api.together.xyz/v1/images/generations";

export const togetherEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!API_KEY) {
    console.log("[together] No TOGETHER_API_KEY set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    let result: AiRenderResult | null;
    if (req.baseImage) {
      result = await tryKontext(req);
    } else {
      result = await trySchnell(req);
    }
    if (result) {
      // Schnell free tier = $0, Kontext Pro ~$0.04/img
      result.costUsd = result.engine === "together-kontext" ? 0.04 : 0;
      result.latencyMs = Date.now() - startMs;
    }
    return result;
  } catch (err) {
    console.error("[together] Error:", err);
    return null;
  }
};

async function trySchnell(
  req: AiRenderRequest
): Promise<AiRenderResult | null> {
  console.log("[together] Using FLUX.1 schnell (free text-to-image)");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "black-forest-labs/FLUX.1-schnell-Free",
      prompt: req.prompt.slice(0, 1000),
      width: clampDimension(req.width),
      height: clampDimension(req.height),
      steps: 4,
      n: 1,
      response_format: "b64_json",
      seed: Number(req.seed) % 4294967295 || undefined,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`[together] schnell error: ${response.status}`, errText.slice(0, 200));
    return null;
  }

  const data = await response.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) {
    console.error("[together] No image data in response");
    return null;
  }

  const buffer = Buffer.from(b64, "base64");
  if (buffer.length < 500) return null;

  return {
    buffer,
    contentType: "image/png",
    engine: "together-schnell",
  };
}

async function tryKontext(
  req: AiRenderRequest
): Promise<AiRenderResult | null> {
  console.log("[together] Using FLUX Kontext (img2img editing)");

  // Kontext expects a data URI for the image
  const imageUrl = `data:image/png;base64,${req.baseImage}`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "black-forest-labs/FLUX.1-kontext-pro",
      prompt: req.prompt.slice(0, 1000),
      image_url: imageUrl,
      steps: 28,
      n: 1,
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`[together] kontext error: ${response.status}`, errText.slice(0, 200));
    // Fall back to schnell if kontext fails (e.g., credits exhausted)
    return trySchnell(req);
  }

  const data = await response.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) return trySchnell(req);

  const buffer = Buffer.from(b64, "base64");
  if (buffer.length < 500) return null;

  return {
    buffer,
    contentType: "image/png",
    engine: "together-kontext",
  };
}

/** Together.ai requires dimensions to be multiples of 32, max 1440 */
function clampDimension(d: number): number {
  const clamped = Math.min(Math.max(d, 256), 1440);
  return Math.round(clamped / 32) * 32;
}
