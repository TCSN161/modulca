/**
 * Pollinations.ai Engine
 *
 * Free, no auth, fast (~30-90s for fresh images).
 * Uses the legacy image.pollinations.ai endpoint (anonymous only).
 * Server-side proxy avoids browser cookie/referer issues.
 *
 * Note: Pollinations uses aggressive content filters that can flag
 * architectural prompts containing "bedroom", "bathroom" etc.
 * We sanitize prompts to explicitly state architectural context.
 */

import type { AiRenderEngine, AiRenderRequest, AiRenderResult } from "./types";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 4000;

/** Minimum acceptable image size — content-moderation placeholder images are typically small */
const MIN_IMAGE_BYTES = 5000;

/**
 * Replace room-type words that trigger content filters with safer synonyms
 * while preserving the architectural meaning.
 */
function sanitizeForContentFilter(prompt: string): string {
  return prompt
    .replace(/\bbedroom\b/gi, "sleeping quarters")
    .replace(/\bbathroom\b/gi, "washroom")
    .replace(/\btoilet\b/gi, "WC fixture")
    .replace(/\bnude\b/gi, "")
    .replace(/\bshower\b/gi, "rain head fixture")
    .replace(/\bbathtub\b/gi, "soaking tub")
    .replace(/\bbed\b/gi, "sleeping platform");
}

export const pollinationsEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  const startMs = Date.now();
  const safePrompt = sanitizeForContentFilter(req.prompt);
  const encoded = encodeURIComponent(safePrompt);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${req.width}&height=${req.height}&nologo=true&nofeed=true&seed=${req.seed}&safe=true`;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      console.log(
        `[pollinations] Retry ${attempt + 1}/${MAX_RETRIES} after ${RETRY_DELAY_MS}ms...`
      );
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }

    try {
      console.log(`[pollinations] Attempt ${attempt + 1}: ${url.slice(0, 100)}...`);
      const response = await fetch(url, {
        method: "GET",
        headers: { "User-Agent": "ModulCA/1.0" },
      });

      if (response.status === 429) {
        console.log("[pollinations] Rate limited (429), will retry...");
        continue;
      }

      if (!response.ok) {
        console.error("[pollinations] HTTP error:", response.status);
        return null;
      }

      const blob = await response.blob();
      const buffer = Buffer.from(await blob.arrayBuffer());

      // Detect content-moderation placeholder images (small black images with text)
      if (buffer.length < MIN_IMAGE_BYTES) {
        console.warn("[pollinations] Image suspiciously small:", buffer.length, "bytes — likely content filter. Skipping.");
        return null;
      }

      console.log(`[pollinations] Success: ${buffer.length} bytes`);
      return {
        buffer,
        contentType: blob.type || "image/jpeg",
        engine: "pollinations",
        costUsd: 0, // Free service
        latencyMs: Date.now() - startMs,
      };
    } catch (err) {
      console.error("[pollinations] Fetch error:", err);
      return null;
    }
  }

  console.log("[pollinations] All retries exhausted");
  return null;
};
