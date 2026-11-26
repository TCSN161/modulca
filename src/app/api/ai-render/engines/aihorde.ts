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

/**
 * Anonymous Horde limit (live 2026-11-26, BUG-ST01): requests over 576×576
 * pixels get an instant 403 "KudosUpfront". The old clamp sent 1024×576 as
 * 768×576, so Horde, the last free fallback, failed in under 1 s for EVERY
 * default-size render. Fit inside 576² pixels, keep the aspect, multiples of 64.
 */
export const HORDE_MAX_PIXELS = 576 * 576;

export function hordeSize(width: number, height: number): { width: number; height: number } {
  const w0 = Number.isFinite(width) && width > 0 ? width : 1024;
  const h0 = Number.isFinite(height) && height > 0 ? height : 576;
  const scale = Math.min(1, Math.sqrt(HORDE_MAX_PIXELS / (w0 * h0)));
  const snap = (d: number) => Math.max(256, Math.floor((d * scale) / 64) * 64);
  let w = snap(w0), h = snap(h0);
  // Extreme aspect ratios: the 256 floor can push us over — trim the long side.
  while (w * h > HORDE_MAX_PIXELS && (w > 256 || h > 256)) {
    if (w >= h) w -= 64; else h -= 64;
  }
  return { width: w, height: h };
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
          ...hordeSize(req.width, req.height),
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
      console.error("[ai-horde] Submit failed:", submitRes.status, (await submitRes.text().catch(() => "")).slice(0, 160));
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
