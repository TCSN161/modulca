import type { AiRenderEngine, AiRenderResult, AiRenderRequest } from "./types";

/**
 * Cloudflare Workers AI — Permanent free tier
 *
 * 10,000 neurons/day FREE, no expiry, no credit card.
 * Models: FLUX 1 Schnell, SDXL Lightning, SDXL Base, DreamShaper 8 LCM
 * Text-to-image only (no img2img).
 * EU regions available — good for GDPR.
 *
 * Requires CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN env variables.
 * Get at https://dash.cloudflare.com → Workers AI
 */

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || "";

export const cloudflareEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!ACCOUNT_ID || !API_TOKEN) {
    console.log("[cloudflare] No CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    return await generateImage(req, startMs);
  } catch (err) {
    console.error("[cloudflare] Error:", err);
    return null;
  }
};

async function generateImage(
  req: AiRenderRequest,
  startMs: number
): Promise<AiRenderResult | null> {
  // Use FLUX Schnell as primary (best quality in CF catalog)
  const model = "@cf/black-forest-labs/flux-1-schnell";
  console.log("[cloudflare] Using FLUX 1 Schnell");

  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${model}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: req.prompt.slice(0, 500),
      num_steps: 8, // 8 steps = good quality for FLUX Schnell (4 was too blurry)
      width: clampToSupported(req.width),
      height: clampToSupported(req.height),
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`[cloudflare] Error: ${response.status}`, errText.slice(0, 200));
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  let buffer: Buffer;
  if (contentType.includes("application/json")) {
    // Some CF models return JSON with base64 image
    const json = await response.json() as { result?: { image?: string }; image?: string };
    const b64 = json.result?.image || json.image;
    if (!b64) {
      console.error("[cloudflare] JSON response but no image field");
      return null;
    }
    buffer = Buffer.from(b64, "base64");
  } else {
    // Raw image bytes
    buffer = Buffer.from(await response.arrayBuffer());
  }

  if (buffer.length < 500) {
    console.error("[cloudflare] Returned tiny image, likely error");
    return null;
  }

  return {
    buffer,
    contentType: "image/png",
    engine: "cloudflare-flux",
    costUsd: 0, // Free tier: 10K neurons/day
    latencyMs: Date.now() - startMs,
  };
}

/** Cloudflare supports specific dimensions — clamp to nearest supported */
function clampToSupported(d: number): number {
  // FLUX on CF supports multiples of 8, range 256-1024
  const clamped = Math.min(Math.max(d, 256), 1024);
  return Math.round(clamped / 8) * 8;
}
