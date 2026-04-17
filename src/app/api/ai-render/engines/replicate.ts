import type { AiRenderEngine, AiRenderResult, AiRenderRequest } from "./types";

import { devLog } from "@/shared/lib/devLog";
/**
 * Replicate — Largest model ecosystem
 *
 * Pay-per-second GPU billing. ControlNet for img2img.
 * FLUX generations ~$0.003-$0.01/image.
 * Community models for architectural visualization.
 *
 * Requires REPLICATE_API_TOKEN env variable.
 * Get at https://replicate.com/account/api-tokens
 */

const API_TOKEN = process.env.REPLICATE_API_TOKEN || "";
const API_URL = "https://api.replicate.com/v1/predictions";
const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 120_000;

export const replicateEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!API_TOKEN) {
    devLog("[replicate] No REPLICATE_API_TOKEN set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    if (req.baseImage) {
      return await tryControlNet(req, startMs);
    }
    return await tryFlux(req, startMs);
  } catch (err) {
    console.error("[replicate] Error:", err);
    return null;
  }
};

async function tryFlux(
  req: AiRenderRequest,
  startMs: number
): Promise<AiRenderResult | null> {
  devLog("[replicate] Using FLUX Schnell (text-to-image)");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
      Prefer: "wait", // Synchronous mode — waits up to 60s
    },
    body: JSON.stringify({
      version: "black-forest-labs/flux-schnell",
      input: {
        prompt: req.prompt.slice(0, 1000),
        num_outputs: 1,
        aspect_ratio: getAspectRatio(req.width, req.height),
        output_format: "png",
        seed: Number(req.seed) % 4294967295 || undefined,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`[replicate] Flux error: ${response.status}`, errText.slice(0, 200));
    return null;
  }

  const prediction = await response.json();
  return await pollAndDownload(prediction, startMs, "replicate-flux", 0.003);
}

async function tryControlNet(
  req: AiRenderRequest,
  startMs: number
): Promise<AiRenderResult | null> {
  devLog("[replicate] Using ControlNet (img2img with structure)");

  const imageDataUri = `data:image/png;base64,${req.baseImage}`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "jagilley/controlnet-depth2img:922c7bb67b87ec32cbc2fd11b1d5f94f0ba4f5571c4571a60a5aece6f785d164",
      input: {
        prompt: req.prompt.slice(0, 1000),
        image: imageDataUri,
        num_outputs: 1,
        structure_strength: 0.65,
        output_format: "png",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`[replicate] ControlNet error: ${response.status}`, errText.slice(0, 200));
    // Fall back to text-only
    return tryFlux(req, startMs);
  }

  const prediction = await response.json();
  return await pollAndDownload(prediction, startMs, "replicate-controlnet", 0.02);
}

async function pollAndDownload(
  prediction: { id: string; status: string; output?: string[] | null; urls?: { get?: string } },
  startMs: number,
  engineName: string,
  costUsd: number,
): Promise<AiRenderResult | null> {
  // If prediction completed synchronously (Prefer: wait)
  if (prediction.status === "succeeded" && prediction.output?.[0]) {
    return await downloadImage(prediction.output[0], startMs, engineName, costUsd);
  }

  // Otherwise poll
  const pollUrl = prediction.urls?.get || `${API_URL}/${prediction.id}`;
  const deadline = Date.now() + TIMEOUT_MS;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const pollRes = await fetch(pollUrl, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    });
    if (!pollRes.ok) continue;

    const status = await pollRes.json();
    if (status.status === "succeeded" && status.output?.[0]) {
      return await downloadImage(status.output[0], startMs, engineName, costUsd);
    }
    if (status.status === "failed" || status.status === "canceled") {
      console.error(`[replicate] Prediction ${status.status}: ${status.error || ""}`);
      return null;
    }
  }

  console.error("[replicate] Timed out after 120s");
  return null;
}

async function downloadImage(
  url: string,
  startMs: number,
  engineName: string,
  costUsd: number,
): Promise<AiRenderResult | null> {
  const imgRes = await fetch(url);
  if (!imgRes.ok) return null;

  const buffer = Buffer.from(await imgRes.arrayBuffer());
  if (buffer.length < 500) return null;

  devLog(`[replicate] Success: ${buffer.length} bytes`);
  return {
    buffer,
    contentType: "image/png",
    engine: engineName,
    costUsd,
    latencyMs: Date.now() - startMs,
  };
}

function getAspectRatio(w: number, h: number): string {
  const ratio = w / h;
  if (ratio > 1.7) return "16:9";
  if (ratio > 1.4) return "3:2";
  if (ratio < 0.6) return "9:16";
  if (ratio < 0.75) return "2:3";
  return "1:1";
}
