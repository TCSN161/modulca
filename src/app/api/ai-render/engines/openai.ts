import type { AiRenderEngine, AiRenderResult, AiRenderRequest } from "./types";

/**
 * OpenAI — GPT Image (premium quality)
 *
 * $5 free credits on signup (no expiry).
 * GPT Image 1 Mini: ~$0.005/img (low), ~$0.02/img (high)
 * DALL-E 3: ~$0.04-$0.08/img
 * Premium tier only due to cost.
 *
 * Requires OPENAI_API_KEY env variable.
 * Get at https://platform.openai.com/api-keys
 */

const API_KEY = process.env.OPENAI_API_KEY || "";
const API_URL = "https://api.openai.com/v1/images/generations";

export const openaiEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!API_KEY) {
    console.log("[openai] No OPENAI_API_KEY set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    if (req.baseImage) {
      // OpenAI supports image editing, but it's complex — fall back to text2img
      console.log("[openai] img2img not supported, using text-to-image");
    }
    return await generateImage(req, startMs);
  } catch (err) {
    console.error("[openai] Error:", err);
    return null;
  }
};

async function generateImage(
  req: AiRenderRequest,
  startMs: number
): Promise<AiRenderResult | null> {
  // Use gpt-image-1 (best quality), fall back to dall-e-3
  const model = "gpt-image-1";
  const quality = req.tier === "architect" ? "high" : "medium";
  console.log(`[openai] Using ${model} quality=${quality}`);

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: `Interior design photograph: ${req.prompt.slice(0, 900)}`,
      n: 1,
      size: getSize(req.width, req.height),
      quality,
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`[openai] Error: ${response.status}`, errText.slice(0, 200));

    // If gpt-image-1 fails, try dall-e-3
    if (model === "gpt-image-1") {
      console.log("[openai] Falling back to dall-e-3");
      return tryDalle3(req, startMs);
    }
    return null;
  }

  const data = await response.json();
  const b64 = data?.data?.[0]?.b64_json;
  const imageUrl = data?.data?.[0]?.url;

  if (b64) {
    const buffer = Buffer.from(b64, "base64");
    if (buffer.length < 500) return null;
    return {
      buffer,
      contentType: "image/png",
      engine: "openai-gpt-image",
      costUsd: quality === "high" ? 0.02 : 0.005,
      latencyMs: Date.now() - startMs,
    };
  }

  if (imageUrl) {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    if (buffer.length < 500) return null;
    return {
      buffer,
      contentType: "image/png",
      engine: "openai-gpt-image",
      costUsd: quality === "high" ? 0.02 : 0.005,
      latencyMs: Date.now() - startMs,
    };
  }

  console.error("[openai] No image data in response");
  return null;
}

async function tryDalle3(
  req: AiRenderRequest,
  startMs: number
): Promise<AiRenderResult | null> {
  console.log("[openai] Using DALL-E 3");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: req.prompt.slice(0, 1000),
      n: 1,
      size: getDalle3Size(req.width, req.height),
      quality: "standard",
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`[openai] DALL-E 3 error: ${response.status}`, errText.slice(0, 200));
    return null;
  }

  const data = await response.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) return null;

  const buffer = Buffer.from(b64, "base64");
  if (buffer.length < 500) return null;

  return {
    buffer,
    contentType: "image/png",
    engine: "openai-dalle3",
    costUsd: 0.04,
    latencyMs: Date.now() - startMs,
  };
}

/** GPT Image supports flexible sizes */
function getSize(w: number, h: number): string {
  const ratio = w / h;
  if (ratio > 1.4) return "1536x1024";
  if (ratio < 0.7) return "1024x1536";
  return "1024x1024";
}

/** DALL-E 3 only supports specific sizes */
function getDalle3Size(w: number, h: number): string {
  const ratio = w / h;
  if (ratio > 1.4) return "1792x1024";
  if (ratio < 0.7) return "1024x1792";
  return "1024x1024";
}
