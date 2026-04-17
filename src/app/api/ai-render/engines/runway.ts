/**
 * Runway Gen-3 Engine — Image generation (Gen-3 Alpha Turbo Image model)
 *
 * Note: Runway is primarily a VIDEO generation platform. This engine uses their
 * image model endpoint. For video walkthrough animations, see the
 * separate /api/ai-render/video route (TODO).
 *
 * Free tier: 125 credits/month. Builders Program grants up to 500K credits.
 * ~$0.01-0.02 per image.
 *
 * Requires RUNWAY_API_KEY env variable.
 * Get key at https://runwayml.com/api
 */

import type { AiRenderEngine, AiRenderRequest, AiRenderResult } from "./types";

import { devLog } from "@/shared/lib/devLog";
const API_KEY = process.env.RUNWAY_API_KEY || "";
const API_URL = "https://api.dev.runwayml.com/v1/text_to_image";
const STATUS_URL_BASE = "https://api.dev.runwayml.com/v1/tasks";

async function pollTask(taskId: string, maxMs = 60_000): Promise<string | null> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    await new Promise((r) => setTimeout(r, 2500));
    try {
      const res = await fetch(`${STATUS_URL_BASE}/${taskId}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "X-Runway-Version": "2024-11-06",
        },
      });
      if (!res.ok) continue;
      const data = await res.json();
      const status = data?.status;
      if (status === "SUCCEEDED") {
        return data?.output?.[0] || null;
      }
      if (status === "FAILED" || status === "CANCELLED") return null;
    } catch {
      /* keep polling */
    }
  }
  return null;
}

/** Runway supports specific resolutions — pick closest match */
function chooseRatio(w: number, h: number): string {
  const r = w / h;
  if (r > 1.6) return "1920:1080";
  if (r > 1.2) return "1360:768";
  if (r > 0.85) return "1024:1024";
  if (r > 0.7) return "1080:1350";
  return "1080:1920";
}

export const runwayEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!API_KEY) {
    devLog("[runway] No RUNWAY_API_KEY set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    devLog("[runway] Submitting Gen-3 task...");

    const submit = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06",
      },
      body: JSON.stringify({
        promptText: req.prompt.slice(0, 1000),
        ratio: chooseRatio(req.width, req.height),
        model: "gen3a_turbo",
        seed: Number(req.seed) % 2147483647 || undefined,
      }),
    });

    if (!submit.ok) {
      const errText = await submit.text().catch(() => "");
      console.error(`[runway] Submit error ${submit.status}:`, errText.slice(0, 200));
      return null;
    }

    const { id: taskId } = await submit.json();
    if (!taskId) {
      console.error("[runway] No task id in response");
      return null;
    }

    const imageUrl = await pollTask(taskId);
    if (!imageUrl) {
      console.error("[runway] Task timed out or failed");
      return null;
    }

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    return {
      buffer,
      contentType: imgRes.headers.get("content-type") || "image/jpeg",
      engine: "runway-gen3a-turbo",
      costUsd: 0.02,
      latencyMs: Date.now() - startMs,
      prompt: req.prompt,
    };
  } catch (err) {
    console.error("[runway] Error:", err);
    return null;
  }
};
