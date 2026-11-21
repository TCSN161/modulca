/**
 * LTX Video — Lightricks text-to-video via fal.ai
 *
 * Status: scaffold ready for Phase 3 wire-up. NOT registered in the main
 * render fallback chain yet (video is a different output medium than
 * image). When Phase 3 kicks off the "walkthrough animation" feature,
 * a new /api/ai-video route will consume this engine.
 *
 * Why LTX via fal: our existing FAL_API_KEY works (no new signup), LTX
 * weights are OSS so provider churn is low, and $0.01-0.015/sec of video
 * is the cheapest viable Nov 2026 option for 4-8 sec walkthrough clips.
 *
 * Alternative paths tracked but not implemented:
 *   - LTX direct on HuggingFace Inference (slower, free quota)
 *   - LTX self-hosted on Replicate (we already have replicate key)
 *   - Higgsfield (cinematic camera moves) → Phase 5 Architect feature
 *   - Luma Ray 3 → Phase 5 Architect feature
 *   - Sora 2 / Veo 3.5 → Phase 7+ when revenue supports $0.05-0.08/sec
 */

import type { AiRenderEngine, AiRenderRequest, AiRenderResult } from "./types";
import { devLog } from "@/shared/lib/devLog";

const API_KEY = process.env.FAL_API_KEY || "";
const FAL_API = "https://queue.fal.run";

/**
 * NOTE: AiRenderResult shape assumes image/* output. Video generation needs
 * its own result shape (buffer + duration + fps + resolution). We keep the
 * same AiRenderEngine signature for consistency, returning a video/mp4 buffer
 * which the caller must handle differently (direct file download, not
 * rendered as an <img>).
 */
export const ltxVideoEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!API_KEY) {
    devLog("[ltx-video] No FAL_API_KEY set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    devLog("[ltx-video] Submitting LTX Video job to fal...");

    // Submit async job
    const submit = await fetch(`${FAL_API}/fal-ai/ltx-video`, {
      method: "POST",
      headers: {
        Authorization: `Key ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: req.prompt.slice(0, 1000),
        num_frames: 97,          // ~4 seconds at 24fps (LTX default)
        aspect_ratio: req.width >= req.height ? "16:9" : "9:16",
        seed: Number(req.seed) % 2147483647 || undefined,
      }),
    });

    if (!submit.ok) {
      const err = await submit.text().catch(() => "");
      console.error(`[ltx-video] submit ${submit.status}:`, err.slice(0, 200));
      return null;
    }

    const { request_id } = (await submit.json()) as { request_id?: string };
    if (!request_id) {
      console.error("[ltx-video] no request_id in response");
      return null;
    }

    // Poll for completion (video generation takes 30-90s typically)
    let videoUrl: string | null = null;
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const status = await fetch(
        `${FAL_API}/fal-ai/ltx-video/requests/${request_id}/status`,
        { headers: { Authorization: `Key ${API_KEY}` } }
      );
      if (!status.ok) continue;
      const data = await status.json();
      if (data?.status === "COMPLETED") {
        const result = await fetch(
          `${FAL_API}/fal-ai/ltx-video/requests/${request_id}`,
          { headers: { Authorization: `Key ${API_KEY}` } }
        );
        const resJson = await result.json();
        videoUrl = resJson?.video?.url || null;
        break;
      }
      if (data?.status === "FAILED") {
        console.error("[ltx-video] job failed:", data);
        return null;
      }
    }

    if (!videoUrl) {
      console.error("[ltx-video] polling timeout");
      return null;
    }

    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) return null;
    const buffer = Buffer.from(await videoRes.arrayBuffer());

    return {
      buffer,
      contentType: "video/mp4",
      engine: "ltx-video",
      // LTX-2.3 on fal Nov 2026: Fast 1080p = $0.04/sec, Pro = $0.06/sec.
      // ~4s video at Fast tier = $0.16 (not the $0.048 my earlier scaffold
      // assumed — original $0.012/sec was LTX 0.9.1 which is marked
      // "research only" and no longer the primary endpoint).
      costUsd: 0.16,
      latencyMs: Date.now() - startMs,
      prompt: req.prompt,
    };
  } catch (err) {
    console.error("[ltx-video] Error:", err);
    return null;
  }
};
