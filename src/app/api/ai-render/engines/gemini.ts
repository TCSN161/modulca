/**
 * Google Gemini Imagen 3 Engine
 *
 * Free tier: 500 requests/day, permanent (no expiry).
 * High quality for architecture — Google's models trained on real buildings.
 * Supports 1024x1024, 1024x1792, 1792x1024.
 *
 * Requires GEMINI_API_KEY env variable.
 * Get free key at https://aistudio.google.com/apikey
 */

import type { AiRenderEngine, AiRenderRequest, AiRenderResult } from "./types";

const API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = "imagen-3.0-generate-002";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict`;

/** Gemini Imagen supports a fixed set of aspect ratios */
function chooseAspect(w: number, h: number): "1:1" | "3:4" | "4:3" | "9:16" | "16:9" {
  const r = w / h;
  if (r > 1.6) return "16:9";
  if (r > 1.2) return "4:3";
  if (r > 0.85) return "1:1";
  if (r > 0.7) return "3:4";
  return "9:16";
}

export const geminiEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!API_KEY) {
    console.log("[gemini] No GEMINI_API_KEY set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    console.log("[gemini] Generating with Imagen 3...");

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [
          { prompt: req.prompt.slice(0, 2000) },
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: chooseAspect(req.width, req.height),
          personGeneration: "DONT_ALLOW",
          // Safety filter — "block_few" is most permissive while staying compliant
          safetyFilterLevel: "BLOCK_ONLY_HIGH",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error(`[gemini] API error ${response.status}:`, errText.slice(0, 200));
      return null;
    }

    const data = await response.json();
    const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) {
      console.error("[gemini] No image bytes in response");
      return null;
    }

    const buffer = Buffer.from(b64, "base64");
    return {
      buffer,
      contentType: "image/png",
      engine: "gemini-imagen-3",
      costUsd: 0, // Free tier 500/day
      latencyMs: Date.now() - startMs,
      prompt: req.prompt,
    };
  } catch (err) {
    console.error("[gemini] Error:", err);
    return null;
  }
};
