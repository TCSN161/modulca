import type { AiRenderEngine, AiRenderResult, AiRenderRequest } from "./types";

import { devLog } from "@/shared/lib/devLog";
/**
 * Fireworks AI — Best GDPR compliance
 *
 * EU representative appointed, SOC 2 Type II, HIPAA compliant.
 * FLUX Schnell at $0.0014/img (very cheap).
 * $1 free credits on signup.
 *
 * Requires FIREWORKS_API_KEY env variable.
 * Get at https://fireworks.ai/account/api-keys
 */

const API_KEY = process.env.FIREWORKS_API_KEY || "";
const API_URL = "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models";

export const fireworksEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!API_KEY) {
    devLog("[fireworks] No FIREWORKS_API_KEY set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    return await generateImage(req, startMs);
  } catch (err) {
    console.error("[fireworks] Error:", err);
    return null;
  }
};

async function generateImage(
  req: AiRenderRequest,
  startMs: number
): Promise<AiRenderResult | null> {
  const model = "flux-1-schnell-fp8";
  devLog(`[fireworks] Using ${model}`);

  const response = await fetch(`${API_URL}/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      Accept: "image/png",
    },
    body: JSON.stringify({
      prompt: req.prompt.slice(0, 1000),
      width: clampDimension(req.width),
      height: clampDimension(req.height),
      steps: 4,
      seed: Number(req.seed) % 4294967295 || undefined,
      cfg_scale: 1,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`[fireworks] Error: ${response.status}`, errText.slice(0, 200));
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  // Fireworks can return raw image bytes or JSON
  if (contentType.startsWith("image/")) {
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 500) return null;

    devLog(`[fireworks] Success: ${buffer.length} bytes`);
    return {
      buffer,
      contentType: contentType || "image/png",
      engine: "fireworks-flux",
      costUsd: 0.0014,
      latencyMs: Date.now() - startMs,
    };
  }

  // JSON response with base64
  const data = await response.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) {
    console.error("[fireworks] No image in response");
    return null;
  }

  const buffer = Buffer.from(b64, "base64");
  if (buffer.length < 500) return null;

  return {
    buffer,
    contentType: "image/png",
    engine: "fireworks-flux",
    costUsd: 0.0014,
    latencyMs: Date.now() - startMs,
  };
}

/** Fireworks needs multiples of 8, max 1024 */
function clampDimension(d: number): number {
  const clamped = Math.min(Math.max(d, 256), 1024);
  return Math.round(clamped / 8) * 8;
}
