/**
 * AI Horde Engine (stablehorde.net)
 *
 * Free community GPU cluster. Anonymous access with key "0000000000".
 * Slower queue but very reliable. Uses Stable Diffusion models.
 * Submit async job → poll for result → download image.
 */

import type { AiRenderEngine, AiRenderRequest, AiRenderResult } from "./types";

import { devLog } from "@/shared/lib/devLog";
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
// 2026-11-26 (BUG-E12): was 120 s, longer than the client's 90 s abort, so a
// Horde result could never reach the UI. 75 s leaves room for the download.
const TIMEOUT_MS = 75_000;

/**
 * img2img (added 2026-11-26, Chat 3): when req.baseImage is set, Horde gets
 * source_image + source_processing "img2img". Live test: 11 s, keeps the
 * geometry, but SD-1.5 quality is weak, so it sits LAST in the img2img chain.
 * Kill switch for img2img only: AIHORDE_IMG2IMG_DISABLED=1.
 */
const IMG2IMG_DENOISE = 0.6;

function hordeSourceImage(b64?: string): string | undefined {
  if (!b64 || /^(1|true|yes|on)$/i.test(process.env.AIHORDE_IMG2IMG_DISABLED || "")) return undefined;
  return b64.replace(/^data:[^;]+;base64,/, "");
}

/** AI Horde requires multiples of 64, max 768 */
function clampHorde(d: number): number {
  const clamped = Math.min(Math.max(d, 256), 768);
  return Math.round(clamped / 64) * 64;
}

export const aiHordeEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  const startMs = Date.now();
  try {
    // 1. Submit async generation job
    const sourceImage = hordeSourceImage(req.baseImage);
    devLog(`[ai-horde] Submitting ${sourceImage ? "img2img" : "text2img"} job...`);
    const submitRes = await fetch(`${HORDE_API}/generate/async`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
      },
      body: JSON.stringify({
        prompt: `${sanitizeForContentFilter(req.prompt)} ### professional photograph, 8k, photorealistic, architectural interior design, empty room`,
        params: {
          width: clampHorde(req.width),
          height: clampHorde(req.height),
          steps: 25,
          cfg_scale: 7,
          sampler_name: "k_euler_a",
          ...(sourceImage ? { denoising_strength: IMG2IMG_DENOISE } : {}),
        },
        ...(sourceImage ? { source_image: sourceImage, source_processing: "img2img" } : {}),
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
    devLog(`[ai-horde] Job submitted: ${id}`);

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
        devLog("[ai-horde] Image ready, downloading...");

        const imgRes = await fetch(imgUrl);
        if (!imgRes.ok) return null;

        const blob = await imgRes.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());
        devLog(`[ai-horde] Success: ${buffer.length} bytes`);
        return {
          buffer,
          contentType: blob.type || "image/webp",
          engine: sourceImage ? "ai-horde-img2img" : "ai-horde",
          costUsd: 0, // Free community GPUs
          latencyMs: Date.now() - startMs,
        };
      }
    }

    devLog(`[ai-horde] Timed out after ${TIMEOUT_MS / 1000}s`);
    return null;
  } catch (err) {
    console.error("[ai-horde] Error:", err);
    return null;
  }
};
