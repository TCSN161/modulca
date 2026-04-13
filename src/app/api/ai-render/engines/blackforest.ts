import type { AiRenderEngine, AiRenderResult, AiRenderRequest } from "./types";

/**
 * Black Forest Labs (BFL) — Source of all FLUX models
 *
 * German company (Freiburg) — best EU/GDPR compliance for FLUX.
 * Models: FLUX.2 Klein, FLUX 1.1 Pro, FLUX Dev, FLUX Schnell
 * Credit-based pricing (1 credit = $0.01).
 * FLUX.2 Klein from $0.014/img, FLUX 1.1 Pro at $0.04/img.
 *
 * Requires BFL_API_KEY env variable.
 * Get at https://api.bfl.ml/auth/login
 */

const API_KEY = process.env.BFL_API_KEY || "";
const API_URL = "https://api.bfl.ml/v1";
const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 120_000;

export const blackforestEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!API_KEY) {
    console.log("[blackforest] No BFL_API_KEY set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    return await generateImage(req, startMs);
  } catch (err) {
    console.error("[blackforest] Error:", err);
    return null;
  }
};

async function generateImage(
  req: AiRenderRequest,
  startMs: number
): Promise<AiRenderResult | null> {
  // Use FLUX 1.1 Pro for best quality, or Schnell for speed
  const isPremium = req.tier === "premium" || req.tier === "architect";
  const model = isPremium ? "flux-pro-1.1" : "flux-schnell";
  console.log(`[blackforest] Using ${model}`);

  // Step 1: Submit generation request
  const submitRes = await fetch(`${API_URL}/${model}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-key": API_KEY,
    },
    body: JSON.stringify({
      prompt: req.prompt.slice(0, 1000),
      width: clampDimension(req.width),
      height: clampDimension(req.height),
      seed: Number(req.seed) % 4294967295 || undefined,
    }),
  });

  if (!submitRes.ok) {
    const errText = await submitRes.text().catch(() => "");
    console.error(`[blackforest] Submit error: ${submitRes.status}`, errText.slice(0, 200));
    return null;
  }

  const { id: taskId } = await submitRes.json();
  if (!taskId) {
    console.error("[blackforest] No task ID in response");
    return null;
  }

  console.log(`[blackforest] Task submitted: ${taskId}, polling...`);

  // Step 2: Poll for result
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const pollRes = await fetch(`${API_URL}/get_result?id=${taskId}`, {
      headers: { "x-key": API_KEY },
    });

    if (!pollRes.ok) continue;

    const result = await pollRes.json();

    if (result.status === "Ready" && result.result?.sample) {
      const imageUrl = result.result.sample;
      console.log("[blackforest] Image ready, downloading...");

      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) return null;

      const buffer = Buffer.from(await imgRes.arrayBuffer());
      if (buffer.length < 500) return null;

      console.log(`[blackforest] Success: ${buffer.length} bytes`);
      return {
        buffer,
        contentType: "image/png",
        engine: `bfl-${model}`,
        costUsd: isPremium ? 0.04 : 0.003, // Pro: 4 credits, Schnell: ~0.3 credits
        latencyMs: Date.now() - startMs,
      };
    }

    if (result.status === "Error") {
      console.error("[blackforest] Generation failed:", result.error);
      return null;
    }
  }

  console.error("[blackforest] Timed out after 120s");
  return null;
}

/** BFL needs multiples of 32, max 1440 */
function clampDimension(d: number): number {
  const clamped = Math.min(Math.max(d, 256), 1440);
  return Math.round(clamped / 32) * 32;
}
