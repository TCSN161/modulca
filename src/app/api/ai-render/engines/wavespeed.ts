/**
 * WaveSpeedAI Engine
 *
 * Free credits on signup. 600+ models including Seedream 4.5 (high-quality img2img).
 * From $0.001/img standard generation.
 *
 * Best for photorealistic img2img with the Seedream model.
 *
 * Requires WAVESPEED_API_KEY env variable.
 * Get free key at https://wavespeed.ai
 */

import type { AiRenderEngine, AiRenderRequest, AiRenderResult } from "./types";

const API_KEY = process.env.WAVESPEED_API_KEY || "";
const BASE_URL = "https://api.wavespeed.ai/api/v3";

/** Text-to-image: FLUX schnell (cheap & fast) */
const TXT2IMG_MODEL = "bytedance/seedream-v4";
/** Image-to-image: Seedream 4.5 (photorealistic refinement) */
const IMG2IMG_MODEL = "bytedance/seedream-v4-edit";

async function pollTask(url: string, maxMs = 60_000): Promise<string | null> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      if (!res.ok) continue;
      const data = await res.json();
      const status = data?.data?.status;
      if (status === "completed") {
        return data?.data?.outputs?.[0] || null;
      }
      if (status === "failed") return null;
    } catch {
      /* keep polling */
    }
  }
  return null;
}

export const wavespeedEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!API_KEY) {
    console.log("[wavespeed] No WAVESPEED_API_KEY set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    const isImg2Img = !!req.baseImage;
    const model = isImg2Img ? IMG2IMG_MODEL : TXT2IMG_MODEL;
    console.log(`[wavespeed] Using ${model}...`);

    const payload: Record<string, unknown> = {
      prompt: req.prompt.slice(0, 2000),
      size: `${Math.min(2048, Math.max(512, req.width))}*${Math.min(2048, Math.max(512, req.height))}`,
      enable_safety_checker: true,
      seed: Number(req.seed) % 4294967295 || -1,
    };

    if (isImg2Img && req.baseImage) {
      payload.image = `data:image/png;base64,${req.baseImage}`;
    }

    const submit = await fetch(`${BASE_URL}/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!submit.ok) {
      const errText = await submit.text().catch(() => "");
      console.error(`[wavespeed] Submit error ${submit.status}:`, errText.slice(0, 200));
      return null;
    }

    const submitData = await submit.json();
    const statusUrl = submitData?.data?.urls?.get;
    if (!statusUrl) {
      console.error("[wavespeed] No status URL in response");
      return null;
    }

    const imageUrl = await pollTask(statusUrl);
    if (!imageUrl) {
      console.error("[wavespeed] Task timed out or failed");
      return null;
    }

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    return {
      buffer,
      contentType: imgRes.headers.get("content-type") || "image/png",
      engine: isImg2Img ? "wavespeed-seedream-edit" : "wavespeed-seedream",
      // Seedream v4 pricing: $0.003/img standard
      costUsd: 0.003,
      latencyMs: Date.now() - startMs,
      prompt: req.prompt,
    };
  } catch (err) {
    console.error("[wavespeed] Error:", err);
    return null;
  }
};
