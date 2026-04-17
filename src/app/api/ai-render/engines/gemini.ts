/**
 * Google Gemini Flash Image Engine ("Nano Banana")
 *
 * Gemini 2.5 Flash Image — Google's free-tier image generation model.
 * Available via AI Studio free tier (rate-limited per minute/day).
 *
 * Note: Imagen 3 requires paid tier, so we use Gemini Flash Image instead
 * which is free, supports text-to-image, and produces architectural photos
 * of comparable quality for our use case.
 *
 * Requires GEMINI_API_KEY env variable.
 * Get free key at https://aistudio.google.com/apikey
 */

import type { AiRenderEngine, AiRenderRequest, AiRenderResult } from "./types";

import { devLog } from "@/shared/lib/devLog";
const API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = "gemini-2.5-flash-image";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/** Aspect ratio chosen from dimensions — informs the prompt */
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
    devLog("[gemini] No GEMINI_API_KEY set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    devLog("[gemini] Generating with Gemini 2.5 Flash Image...");

    // Embed aspect hint + architecture context into the prompt so the
    // model produces the expected framing (Gemini Flash Image doesn't
    // have a structured aspectRatio param like Imagen).
    const aspect = chooseAspect(req.width, req.height);
    const fullPrompt = [
      req.prompt.slice(0, 1800),
      `\n\nStyle: photorealistic architectural photography, professional lighting.`,
      `Aspect ratio: ${aspect} (${req.width}x${req.height}).`,
      `Do not include any people in the image.`,
    ].join("");

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          responseModalities: ["IMAGE"],
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error(`[gemini] API error ${response.status}:`, errText.slice(0, 300));
      return null;
    }

    const data = await response.json();
    // Gemini returns image parts in: candidates[0].content.parts[*].inlineData
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(
      (p: { inlineData?: { mimeType?: string; data?: string } }) =>
        p?.inlineData?.mimeType?.startsWith("image/") && p.inlineData.data
    );

    const b64 = imagePart?.inlineData?.data;
    const contentType = imagePart?.inlineData?.mimeType || "image/png";

    if (!b64) {
      const finishReason = data?.candidates?.[0]?.finishReason;
      console.error(
        `[gemini] No image in response (finishReason: ${finishReason || "unknown"})`
      );
      return null;
    }

    const buffer = Buffer.from(b64, "base64");
    return {
      buffer,
      contentType,
      engine: "gemini-flash-image",
      costUsd: 0, // Free tier
      latencyMs: Date.now() - startMs,
      prompt: req.prompt,
    };
  } catch (err) {
    console.error("[gemini] Error:", err);
    return null;
  }
};
