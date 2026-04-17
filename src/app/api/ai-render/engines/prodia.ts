import type { AiRenderEngine, AiRenderResult, AiRenderRequest } from "./types";

import { devLog } from "@/shared/lib/devLog";
/**
 * Prodia Pro — Meta-gateway to 30+ AI image models
 *
 * $5/mo Pro plan. Single API, single billing, many models.
 * Tier-aware model selection:
 *   guest_free/free → FLUX Fast Schnell (0.25s, $0.002)
 *   premium        → FLUX Dev (3s, $0.008) or Kontext Pro (img2img)
 *   architect      → FLUX 2 Pro (8s, $0.04) or Kontext Max (img2img)
 *
 * Also provides: upscale, inpainting, vector, video (separate endpoints)
 *
 * API: https://inference.prodia.com/v2/job
 * Auth: Bearer JWT token
 * Requires PRODIA_API_KEY env variable.
 */

const API_KEY = process.env.PRODIA_API_KEY || "";
const API_BASE = "https://inference.prodia.com/v2";

/* ------------------------------------------------------------------ */
/*  Model catalog — organized by tier and capability                   */
/* ------------------------------------------------------------------ */

interface ProdiaModel {
  type: string;           // v2 job type
  label: string;          // Human-readable name
  costUsd: number;        // Estimated cost per render
  engineLabel: string;    // What to show in X-AI-Engine header
}

/** Text-to-image models by tier */
const TXT2IMG_MODELS: Record<string, ProdiaModel[]> = {
  guest_free: [
    { type: "inference.flux-fast.schnell.txt2img.v2", label: "FLUX Fast Schnell", costUsd: 0.002, engineLabel: "prodia-schnell" },
    { type: "inference.sdxl.txt2img.v1",              label: "SDXL",              costUsd: 0.003, engineLabel: "prodia-sdxl" },
  ],
  free: [
    { type: "inference.flux-fast.schnell.txt2img.v2", label: "FLUX Fast Schnell", costUsd: 0.002, engineLabel: "prodia-schnell" },
    { type: "inference.flux.schnell.txt2img.v2",      label: "FLUX Schnell",      costUsd: 0.003, engineLabel: "prodia-schnell" },
    { type: "inference.sdxl.txt2img.v1",              label: "SDXL",              costUsd: 0.003, engineLabel: "prodia-sdxl" },
  ],
  premium: [
    { type: "inference.flux.dev.txt2img.v2",          label: "FLUX Dev",          costUsd: 0.008, engineLabel: "prodia-flux-dev" },
    { type: "inference.flux-2.dev.txt2img.v1",        label: "FLUX 2 Dev",        costUsd: 0.010, engineLabel: "prodia-flux2-dev" },
    { type: "inference.flux-fast.schnell.txt2img.v2", label: "FLUX Fast Schnell", costUsd: 0.002, engineLabel: "prodia-schnell" },
  ],
  architect: [
    { type: "inference.flux-2.pro.txt2img.v1",        label: "FLUX 2 Pro",        costUsd: 0.040, engineLabel: "prodia-flux2-pro" },
    { type: "inference.flux.pro11ultra.txt2img.v1",    label: "FLUX Pro 1.1 Ultra",costUsd: 0.050, engineLabel: "prodia-pro-ultra" },
    { type: "inference.flux.dev.txt2img.v2",           label: "FLUX Dev",          costUsd: 0.008, engineLabel: "prodia-flux-dev" },
    { type: "inference.recraft.v4.txt2img.v1",         label: "Recraft V4",        costUsd: 0.020, engineLabel: "prodia-recraft" },
  ],
};

/** Image-to-image models by tier */
const IMG2IMG_MODELS: Record<string, ProdiaModel[]> = {
  guest_free: [
    { type: "inference.flux-fast.schnell.img2img.v2", label: "FLUX Fast Schnell img2img", costUsd: 0.002, engineLabel: "prodia-schnell-i2i" },
  ],
  free: [
    { type: "inference.flux-fast.schnell.img2img.v2", label: "FLUX Fast Schnell img2img", costUsd: 0.002, engineLabel: "prodia-schnell-i2i" },
    { type: "inference.sdxl.img2img.v1",              label: "SDXL img2img",              costUsd: 0.003, engineLabel: "prodia-sdxl-i2i" },
  ],
  premium: [
    { type: "inference.flux-kontext.pro.img2img.v2",  label: "FLUX Kontext Pro",  costUsd: 0.015, engineLabel: "prodia-kontext-pro" },
    { type: "inference.flux.dev.img2img.v2",          label: "FLUX Dev img2img",  costUsd: 0.008, engineLabel: "prodia-flux-dev-i2i" },
    { type: "inference.flux-fast.schnell.img2img.v2", label: "FLUX Fast Schnell", costUsd: 0.002, engineLabel: "prodia-schnell-i2i" },
  ],
  architect: [
    { type: "inference.flux-kontext.max.img2img.v2",  label: "FLUX Kontext Max",  costUsd: 0.025, engineLabel: "prodia-kontext-max" },
    { type: "inference.flux-kontext.pro.img2img.v2",  label: "FLUX Kontext Pro",  costUsd: 0.015, engineLabel: "prodia-kontext-pro" },
    { type: "inference.flux.dev.img2img.v2",          label: "FLUX Dev img2img",  costUsd: 0.008, engineLabel: "prodia-flux-dev-i2i" },
  ],
};

/* ------------------------------------------------------------------ */
/*  Main engine function                                               */
/* ------------------------------------------------------------------ */

export const prodiaEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!API_KEY) {
    devLog("[prodia] No PRODIA_API_KEY set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    const tier = req.tier || "free";
    const hasBaseImage = !!req.baseImage;
    const catalog = hasBaseImage ? IMG2IMG_MODELS : TXT2IMG_MODELS;
    const models = catalog[tier] || catalog["free"];

    // Try models in priority order (best for tier first, fallback to cheaper)
    for (const model of models) {
      devLog(`[prodia] Trying ${model.label} (${model.type})`);
      const result = await submitJob(req, model, hasBaseImage, startMs);
      if (result) return result;
      devLog(`[prodia] ${model.label} failed, trying next...`);
    }

    return null;
  } catch (err) {
    console.error("[prodia] Error:", err);
    return null;
  }
};

/* ------------------------------------------------------------------ */
/*  Standalone exports for upscale and other capabilities              */
/* ------------------------------------------------------------------ */

/** Upscale an image via Prodia HypIR */
export async function prodiaUpscale(
  imageBuffer: Buffer
): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (!API_KEY) return null;

  try {
    const blob = new Blob([new Uint8Array(imageBuffer)], { type: "image/png" });
    const formData = new FormData();
    formData.append("type", "inference.hypir.upscale.v1");
    formData.append("input", blob, "input.png");

    const response = await fetch(`${API_BASE}/job`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, Accept: "application/json" },
      body: formData,
    });

    if (!response.ok) return null;
    const job = (await response.json()) as { id?: string; state?: { current?: string } };
    if (!job?.id) return null;

    if (job.state?.current === "completed") {
      return downloadImage(job.id);
    }
    return pollAndDownload(job.id);
  } catch (err) {
    console.error("[prodia-upscale] Error:", err);
    return null;
  }
}

/** Remove background from an image */
export async function prodiaRemoveBackground(
  imageBuffer: Buffer
): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (!API_KEY) return null;

  try {
    const blob = new Blob([new Uint8Array(imageBuffer)], { type: "image/png" });
    const formData = new FormData();
    formData.append("type", "inference.remove-background.v1");
    formData.append("input", blob, "input.png");

    const response = await fetch(`${API_BASE}/job`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, Accept: "application/json" },
      body: formData,
    });

    if (!response.ok) return null;
    const job = (await response.json()) as { id?: string; state?: { current?: string } };
    if (!job?.id) return null;

    if (job.state?.current === "completed") {
      return downloadImage(job.id);
    }
    return pollAndDownload(job.id);
  } catch (err) {
    console.error("[prodia-rmbg] Error:", err);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                   */
/* ------------------------------------------------------------------ */

async function submitJob(
  req: AiRenderRequest,
  model: ProdiaModel,
  isImg2Img: boolean,
  startMs: number,
): Promise<AiRenderResult | null> {
  let response: Response;

  if (isImg2Img && req.baseImage) {
    // img2img: send base image as multipart form
    const imageBytes = Buffer.from(req.baseImage, "base64");
    const blob = new Blob([new Uint8Array(imageBytes)], { type: "image/png" });
    const formData = new FormData();
    formData.append("type", model.type);
    formData.append("config", JSON.stringify({
      prompt: req.prompt.slice(0, 1000),
      width: clampDimension(req.width),
      height: clampDimension(req.height),
      strength: 0.65, // Preserve structure from 3D scene
    }));
    formData.append("input", blob, "scene.png");

    response = await fetch(`${API_BASE}/job`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, Accept: "application/json" },
      body: formData,
    });
  } else {
    // txt2img: JSON body
    const config: Record<string, unknown> = {
      prompt: req.prompt.slice(0, 1000),
      width: clampDimension(req.width),
      height: clampDimension(req.height),
    };

    // Add steps for models that support it
    if (model.type.includes("schnell")) {
      config.steps = 4;
    } else if (model.type.includes("sdxl")) {
      config.steps = 25;
      config.cfg_scale = 7;
      config.negative_prompt = "blurry, low quality, distorted, cartoon, anime, watermark";
    }

    response = await fetch(`${API_BASE}/job`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ type: model.type, config }),
    });
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`[prodia] ${model.label} error: ${response.status}`, errText.slice(0, 200));
    return null;
  }

  const job = (await response.json()) as { id?: string; state?: { current?: string } };
  if (!job?.id) {
    console.error("[prodia] No job ID:", JSON.stringify(job).slice(0, 200));
    return null;
  }

  let imageResult: { buffer: Buffer; contentType: string } | null;

  if (job.state?.current === "completed") {
    devLog(`[prodia] ${model.label} completed inline: ${job.id}`);
    imageResult = await downloadImage(job.id);
  } else {
    devLog(`[prodia] ${model.label} queued: ${job.id}`);
    imageResult = await pollAndDownload(job.id);
  }

  if (!imageResult) return null;

  return {
    buffer: imageResult.buffer,
    contentType: imageResult.contentType,
    engine: model.engineLabel,
    costUsd: model.costUsd,
    latencyMs: Date.now() - startMs,
  };
}

/** Download image from a completed job */
async function downloadImage(
  jobId: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const imgRes = await fetch(`${API_BASE}/job/${jobId}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "image/png",
    },
  });

  if (!imgRes.ok) {
    console.error(`[prodia] Download failed: ${imgRes.status}`);
    return null;
  }

  const buffer = Buffer.from(await imgRes.arrayBuffer());
  if (buffer.length < 500) return null;

  const contentType = imgRes.headers.get("content-type") || "image/png";
  devLog(`[prodia] Downloaded: ${buffer.length} bytes`);
  return { buffer, contentType };
}

/** Poll for job completion then download */
async function pollAndDownload(
  jobId: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 500));

    const statusRes = await fetch(`${API_BASE}/job/${jobId}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!statusRes.ok) continue;
    const status = (await statusRes.json()) as {
      state?: { current?: string };
      error?: string;
    };

    if (status.state?.current === "completed") {
      return downloadImage(jobId);
    }

    if (status.state?.current === "failed") {
      console.error("[prodia] Job failed:", status.error);
      return null;
    }
  }

  console.error("[prodia] Timed out after 30s");
  return null;
}

/** Prodia supports multiples of 8, max 1024 */
function clampDimension(d: number): number {
  const clamped = Math.min(Math.max(d, 256), 1024);
  return Math.round(clamped / 8) * 8;
}
