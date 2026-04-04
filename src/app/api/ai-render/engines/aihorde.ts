/**
 * AI Horde Engine (stablehorde.net)
 *
 * Free community GPU cluster. Anonymous access with key "0000000000".
 * Slower queue but very reliable. Uses Stable Diffusion models.
 * Submit async job → poll for result → download image.
 */

import type { AiRenderEngine, AiRenderRequest, AiRenderResult } from "./types";

function sanitizeForContentFilter(prompt: string): string {
  return prompt
    .replace(/\bbedroom\b/gi, "sleeping quarters")
    .replace(/\bbathroom\b/gi, "washroom")
    .replace(/\btoilet\b/gi, "WC fixture")
    .replace(/\bshower\b/gi, "rain head fixture")
    .replace(/\bbathtub\b/gi, "soaking tub")
    .replace(/\bbed\b/gi, "sleeping platform");
}

const HORDE_API = "https://stablehorde.net/api/v2";
const ANON_KEY = "0000000000";
const POLL_INTERVAL_MS = 3000;
const TIMEOUT_MS = 120_000;

export const aiHordeEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  try {
    // 1. Submit async generation job
    console.log("[ai-horde] Submitting job...");
    const submitRes = await fetch(`${HORDE_API}/generate/async`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
      },
      body: JSON.stringify({
        prompt: `${sanitizeForContentFilter(req.prompt)} ### professional photograph, 8k, photorealistic, architectural interior design, empty room`,
        params: {
          width: Math.min(req.width, 768),  // Horde max is typically 768
          height: Math.min(req.height, 768),
          steps: 25,
          cfg_scale: 7,
          sampler_name: "k_euler_a",
        },
        nsfw: false,
        censor_nsfw: true,
        models: ["Deliberate"],
      }),
    });

    if (!submitRes.ok) {
      console.error("[ai-horde] Submit failed:", submitRes.status);
      return null;
    }

    const { id } = (await submitRes.json()) as { id: string };
    console.log(`[ai-horde] Job submitted: ${id}`);

    // 2. Poll for completion
    const deadline = Date.now() + TIMEOUT_MS;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

      const statusRes = await fetch(`${HORDE_API}/generate/status/${id}`);
      if (!statusRes.ok) continue;

      const status = (await statusRes.json()) as {
        done: boolean;
        faulted: boolean;
        generations?: Array<{ img: string }>;
      };

      if (status.faulted) {
        console.error("[ai-horde] Job faulted");
        return null;
      }

      if (status.done && status.generations?.[0]?.img) {
        const imgUrl = status.generations[0].img;
        console.log("[ai-horde] Image ready, downloading...");

        const imgRes = await fetch(imgUrl);
        if (!imgRes.ok) return null;

        const blob = await imgRes.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());
        console.log(`[ai-horde] Success: ${buffer.length} bytes`);
        return {
          buffer,
          contentType: blob.type || "image/webp",
          engine: "ai-horde",
        };
      }
    }

    console.log("[ai-horde] Timed out after 120s");
    return null;
  } catch (err) {
    console.error("[ai-horde] Error:", err);
    return null;
  }
};
