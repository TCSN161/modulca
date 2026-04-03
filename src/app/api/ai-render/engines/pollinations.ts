/**
 * Pollinations.ai Engine
 *
 * Free, no auth, fast (~30-90s for fresh images).
 * Uses the legacy image.pollinations.ai endpoint (anonymous only).
 * Server-side proxy avoids browser cookie/referer issues.
 */

import type { AiRenderEngine, AiRenderRequest, AiRenderResult } from "./types";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 4000;

export const pollinationsEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  const encoded = encodeURIComponent(req.prompt);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${req.width}&height=${req.height}&nologo=true&nofeed=true&seed=${req.seed}`;

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
      if (blob.size < 500) {
        console.error("[pollinations] Image too small:", blob.size);
        return null;
      }

      const buffer = Buffer.from(await blob.arrayBuffer());
      console.log(`[pollinations] Success: ${buffer.length} bytes`);
      return {
        buffer,
        contentType: blob.type || "image/jpeg",
        engine: "pollinations",
      };
    } catch (err) {
      console.error("[pollinations] Fetch error:", err);
      return null;
    }
  }

  console.log("[pollinations] All retries exhausted");
  return null;
};
