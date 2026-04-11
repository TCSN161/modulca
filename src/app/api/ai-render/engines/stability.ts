import type { AiRenderEngine, AiRenderResult, AiRenderRequest } from "./types";

/**
 * Stability AI — Control/Structure endpoint
 *
 * Uses the 3D scene screenshot as a structural reference to generate
 * a photorealistic render that preserves the spatial layout.
 *
 * Requires STABILITY_API_KEY env variable.
 * Free: 25 credits on signup at https://platform.stability.ai
 *
 * Falls back to text-to-image if no baseImage is provided.
 */

const API_KEY = process.env.STABILITY_API_KEY || "";
const STRUCTURE_URL =
  "https://api.stability.ai/v2beta/stable-image/control/structure";
const TEXT2IMG_URL =
  "https://api.stability.ai/v2beta/stable-image/generate/sd3";

export const stabilityEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!API_KEY) {
    console.log("[stability] No STABILITY_API_KEY set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    let result: AiRenderResult | null;
    if (req.baseImage) {
      result = await tryStructure(req);
    } else {
      result = await tryText2Img(req);
    }
    if (result) {
      result.costUsd = req.baseImage ? 0.065 : 0.04; // ~6.5 credits structure, ~4 credits sd3
      result.latencyMs = Date.now() - startMs;
    }
    return result;
  } catch (err) {
    console.error("[stability] Error:", err);
    return null;
  }
};

async function tryStructure(
  req: AiRenderRequest
): Promise<AiRenderResult | null> {
  console.log("[stability] Using Control/Structure (img2img) mode");

  // Convert base64 to a Blob for multipart upload
  const imageBuffer = Buffer.from(req.baseImage!, "base64");
  const blob = new Blob([imageBuffer], { type: "image/png" });

  const formData = new FormData();
  formData.append("image", blob, "scene.png");
  formData.append("prompt", req.prompt.slice(0, 500));
  formData.append("control_strength", "0.65"); // Balance between structure and creativity
  formData.append("output_format", "png");
  if (req.seed && req.seed !== "0") {
    formData.append("seed", String(Number(req.seed) % 4294967295));
  }

  const response = await fetch(STRUCTURE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "image/*",
    },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(
      `[stability] Structure API error: ${response.status}`,
      errText
    );
    return null;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 500) {
    console.error("[stability] Structure returned tiny image");
    return null;
  }

  return {
    buffer,
    contentType: "image/png",
    engine: "stability-structure",
  };
}

async function tryText2Img(
  req: AiRenderRequest
): Promise<AiRenderResult | null> {
  console.log("[stability] Using text-to-image mode (no base image)");

  const formData = new FormData();
  formData.append("prompt", req.prompt.slice(0, 500));
  formData.append(
    "negative_prompt",
    "blurry, low quality, distorted, cartoon, anime, sketch"
  );
  formData.append("output_format", "png");
  formData.append("aspect_ratio", "16:9");
  if (req.seed && req.seed !== "0") {
    formData.append("seed", String(Number(req.seed) % 4294967295));
  }

  const response = await fetch(TEXT2IMG_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "image/*",
    },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(
      `[stability] Text2Img API error: ${response.status}`,
      errText
    );
    return null;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 500) return null;

  return {
    buffer,
    contentType: "image/png",
    engine: "stability-sd3",
  };
}
