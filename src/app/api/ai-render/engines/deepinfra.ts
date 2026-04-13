import type { AiRenderEngine, AiRenderResult, AiRenderRequest } from "./types";

/**
 * DeepInfra — Fast FLUX inference
 *
 * FLUX 2 Schnell at $0.015/img, FLUX 2 Pro at $0.014/img.
 * DeepStart startup program: up to 1B tokens free.
 * OpenAI-compatible API.
 *
 * Requires DEEPINFRA_API_KEY env variable.
 * Get at https://deepinfra.com/dash/api_keys
 */

const API_KEY = process.env.DEEPINFRA_API_KEY || "";
const API_URL = "https://api.deepinfra.com/v1/inference";

export const deepinfraEngine: AiRenderEngine = async (
  req: AiRenderRequest
): Promise<AiRenderResult | null> => {
  if (!API_KEY) {
    console.log("[deepinfra] No DEEPINFRA_API_KEY set, skipping");
    return null;
  }

  const startMs = Date.now();
  try {
    return await generateImage(req, startMs);
  } catch (err) {
    console.error("[deepinfra] Error:", err);
    return null;
  }
};

async function generateImage(
  req: AiRenderRequest,
  startMs: number
): Promise<AiRenderResult | null> {
  const model = "black-forest-labs/FLUX-1-schnell";
  console.log(`[deepinfra] Using ${model}`);

  const response = await fetch(`${API_URL}/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: req.prompt.slice(0, 1000),
      width: clampDimension(req.width),
      height: clampDimension(req.height),
      num_inference_steps: 4,
      seed: Number(req.seed) % 4294967295 || undefined,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`[deepinfra] Error: ${response.status}`, errText.slice(0, 200));
    return null;
  }

  const data = await response.json();

  // DeepInfra returns base64 images or URLs depending on model
  const b64 = data?.images?.[0]?.b64_json || data?.output?.[0];
  const imageUrl = data?.images?.[0]?.url || data?.output?.[0];

  if (b64 && !b64.startsWith("http")) {
    const buffer = Buffer.from(b64, "base64");
    if (buffer.length < 500) return null;
    return {
      buffer,
      contentType: "image/png",
      engine: "deepinfra-flux",
      costUsd: 0.015,
      latencyMs: Date.now() - startMs,
    };
  }

  if (imageUrl && typeof imageUrl === "string" && imageUrl.startsWith("http")) {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    if (buffer.length < 500) return null;
    return {
      buffer,
      contentType: "image/png",
      engine: "deepinfra-flux",
      costUsd: 0.015,
      latencyMs: Date.now() - startMs,
    };
  }

  console.error("[deepinfra] No image in response");
  return null;
}

/** DeepInfra needs multiples of 32, max 1440 */
function clampDimension(d: number): number {
  const clamped = Math.min(Math.max(d, 256), 1440);
  return Math.round(clamped / 32) * 32;
}
