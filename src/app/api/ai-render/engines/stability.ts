import type { AiRenderEngine, AiRenderResult, AiRenderRequest } from "./types";

import { devLog } from "@/shared/lib/devLog";
import { STRUCTURE_ENGINES, isUnfundedStatus, markUnfunded, pickControlInput } from "./structureFunding";
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
/** Endpoint id lives in STRUCTURE_ENGINES (one place). */
const STRUCTURE_URL = STRUCTURE_ENGINES["stability-structure"].model;
/** 0 = loose, 1 = rigid. Stability default 0.7; 0.65 keeps walls and openings. */
export const STABILITY_CONTROL_STRENGTH = "0.65";
const TEXT2IMG_URL =
  "https://api.stability.ai/v2beta/stable-image/generate/sd3";

export const stabilityEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!API_KEY) {
    devLog("[stability] No STABILITY_API_KEY set, skipping");
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
  req: AiRenderRequest,
  key: string = API_KEY,
): Promise<AiRenderResult | null> {
  devLog("[stability] Using Control/Structure (img2img) mode");

  // Convert base64 to a Blob for multipart upload
  const imageBuffer = Buffer.from(pickControlInput(undefined, req)!, "base64");
  const blob = new Blob([imageBuffer], { type: "image/png" });

  const formData = new FormData();
  formData.append("image", blob, "scene.png");
  formData.append("prompt", req.prompt.slice(0, 500));
  formData.append("control_strength", STABILITY_CONTROL_STRENGTH);
  formData.append("output_format", "png");
  if (req.seed && req.seed !== "0") {
    formData.append("seed", String(Number(req.seed) % 4294967295));
  }

  const response = await fetch(STRUCTURE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: "image/*",
    },
    body: formData,
  });

  if (!response.ok) {
    if (isUnfundedStatus(response.status)) markUnfunded("stability");
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
  devLog("[stability] Using text-to-image mode (no base image)");

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

/**
 * "stability-structure" (3.07): Control Structure as its own engine id, so the
 * img2img chain can place it with the other structure-control engines and the
 * route can skip it while unfunded (balance check in structureFunding.ts).
 * Uses the RGB 3D capture: Structure extracts its own edges/depth from it.
 */
export const stabilityStructureEngine: AiRenderEngine = async (req) => {
  const key = (process.env.STABILITY_API_KEY || "").trim();
  if (!key || !req.baseImage) return null;
  const startMs = Date.now();
  try {
    const result = await tryStructure(req, key);
    if (result) {
      result.engine = "stability-structure";
      result.costUsd = STRUCTURE_ENGINES["stability-structure"].costUsd;
      result.latencyMs = Date.now() - startMs;
    }
    return result;
  } catch (err) {
    console.error("[stability-structure] Error:", err);
    return null;
  }
};
