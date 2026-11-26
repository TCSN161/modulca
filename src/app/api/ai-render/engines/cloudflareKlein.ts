import type { AiRenderEngine, AiRenderResult, AiRenderRequest } from "./types";
import { devLog } from "@/shared/lib/devLog";

/**
 * Cloudflare Workers AI — FLUX.2 [klein] 4B (text2img AND img2img)
 *
 * Added 2026-11-26 (Chat 3, free-engines expansion). Live-tested:
 *   text2img 512² ≈ 7 s · img2img 512² ≈ 4.4 s, geometry of the clay
 *   3D input kept exactly (windows, roof line, camera).
 *
 * Why it matters: it is the ONLY free engine we have that does real
 * structure-preserving img2img, i.e. it can render OUR 3D view at €0.
 *
 * Cost: shares the account's 10,000 free neurons/day with `cloudflare`
 * (flux-1-schnell). Pricing (CF pricing page, 2026-11-18):
 *   26.05 neurons per OUTPUT 512² tile + 5.37 per INPUT 512² tile.
 *   1024×576 out + 1024×576 ref ≈ 4×26.05 + 4×5.37 ≈ 126 neurons → ~80/day
 *   768×432  out + 768×432 ref  ≈ 4×26.05 + …      (tiles round up — same)
 *   512×512  out + 512×512 ref  ≈ 31 neurons       → ~320/day
 * Past the free quota: $0.011 / 1k neurons on Workers Paid (≈ $0.0014/img),
 * or a hard 429 stop on Workers Free.
 *
 * License: FLUX.2 [klein] 4B weights are Apache-2.0 (commercial OK); the CF
 * model card links BFL's API terms. Do NOT swap in klein-9b: non-commercial
 * license and ~1.4k neurons/image.
 *
 * Kill switch: ENGINE_CLOUDFLARE_KLEIN_DISABLED=1 (see killSwitch.ts).
 * Requires CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN (same as cloudflare).
 */

/** Single source of truth for the model ID (scanned by engines-model-check). */
export const CF_KLEIN_MODEL = "@cf/black-forest-labs/flux-2-klein-4b";

/**
 * Longest output side. Each extra 512² tile costs ~26 neurons.
 * Env CF_KLEIN_MAX_SIDE=768 → 768×432 = 2 tiles ≈ 63 neurons/img2img
 * (≈ 158/day instead of ≈ 80/day at 1024×576).
 */
export const CF_KLEIN_MAX_SIDE = Math.min(
  1024,
  Math.max(256, Number(process.env.CF_KLEIN_MAX_SIDE) || 1024)
);

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || "";
const TIMEOUT_MS = 60_000;

/** Fit (w,h) inside CF_KLEIN_MAX_SIDE keeping aspect, multiples of 16, ≥256. */
export function kleinSize(width: number, height: number): { width: number; height: number } {
  const w0 = Number.isFinite(width) && width > 0 ? width : 1024;
  const h0 = Number.isFinite(height) && height > 0 ? height : 576;
  const scale = Math.min(1, CF_KLEIN_MAX_SIDE / Math.max(w0, h0));
  const snap = (d: number) => Math.max(256, Math.round((d * scale) / 16) * 16);
  return { width: snap(w0), height: snap(h0) };
}

/** Rough neuron estimate for logs / quota math (output tiles only). */
export function kleinNeurons(width: number, height: number, hasRef: boolean): number {
  const tiles = Math.ceil(width / 512) * Math.ceil(height / 512);
  return Math.round(tiles * 26.05 + (hasRef ? tiles * 5.37 : 0));
}

/** Accept raw base64 or a data: URI; return bytes + mime. */
export function decodeBaseImage(b64: string): { bytes: Buffer; mime: string } {
  const m = /^data:([^;]+);base64,([\s\S]*)$/.exec(b64);
  const mime = m ? m[1] : "image/png";
  return { bytes: Buffer.from(m ? m[2] : b64, "base64"), mime };
}

export const cloudflareKleinEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!ACCOUNT_ID || !API_TOKEN) {
    devLog("[cloudflare-klein] No CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN, skipping");
    return null;
  }

  const startMs = Date.now();
  const { width, height } = kleinSize(req.width, req.height);
  const hasRef = !!req.baseImage;

  const form = new FormData();
  form.append("prompt", req.prompt.slice(0, 2000));
  form.append("width", String(width));
  form.append("height", String(height));
  const seedNum = Number.parseInt(req.seed, 10);
  if (Number.isFinite(seedNum)) form.append("seed", String(Math.abs(seedNum) % 2_147_483_647));
  if (req.baseImage) {
    const { bytes, mime } = decodeBaseImage(req.baseImage);
    if (bytes.length < 100) {
      console.error("[cloudflare-klein] baseImage too small / invalid, skipping");
      return null;
    }
    form.append("input_image_0", new Blob([new Uint8Array(bytes)], { type: mime }), "base");
  }

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    devLog(`[cloudflare-klein] ${hasRef ? "img2img" : "text2img"} ${width}x${height} ≈${kleinNeurons(width, height, hasRef)} neurons`);
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${CF_KLEIN_MODEL}`,
      { method: "POST", headers: { Authorization: `Bearer ${API_TOKEN}` }, body: form, signal: ctl.signal }
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[cloudflare-klein] Error: ${res.status}`, errText.slice(0, 200));
      return null;
    }
    const json = (await res.json()) as { result?: { image?: string } };
    const b64 = json.result?.image;
    if (!b64) {
      console.error("[cloudflare-klein] Response without image field");
      return null;
    }
    const buffer = Buffer.from(b64, "base64");
    return {
      buffer,
      contentType: buffer[0] === 0x89 ? "image/png" : "image/jpeg",
      engine: hasRef ? "cloudflare-klein-img2img" : "cloudflare-klein",
      costUsd: 0, // within the 10k neurons/day free allocation
      latencyMs: Date.now() - startMs,
    };
  } catch (err) {
    console.error("[cloudflare-klein] Error:", err instanceof Error ? err.message : err);
    return null;
  } finally {
    clearTimeout(timer);
  }
};
