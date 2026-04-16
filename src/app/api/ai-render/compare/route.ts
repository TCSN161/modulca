import { NextRequest, NextResponse } from "next/server";
import { pollinationsEngine } from "../engines/pollinations";
import { aiHordeEngine } from "../engines/aihorde";
import { stabilityEngine } from "../engines/stability";
import { togetherEngine } from "../engines/together";
import { leonardoEngine } from "../engines/leonardo";
import { falEngine } from "../engines/fal";
import { cloudflareEngine } from "../engines/cloudflare";
import { replicateEngine } from "../engines/replicate";
import { huggingfaceEngine } from "../engines/huggingface";
import { segmindEngine } from "../engines/segmind";
import { openaiEngine } from "../engines/openai";
import { blackforestEngine } from "../engines/blackforest";
import { deepinfraEngine } from "../engines/deepinfra";
import { fireworksEngine } from "../engines/fireworks";
import { prodiaEngine } from "../engines/prodia";
import type { AiRenderEngine, AiRenderRequest, PolicyFlags } from "../engines/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // Allow up to 2 min for all engines

interface EngineEntry {
  id: string;
  label: string;
  fn: AiRenderEngine;
  costPerImage: number;
  capabilities: ("text2img" | "img2img")[];
  maxWidth: number;
  maxHeight: number;
  freeQuota: string;
}

const ALL_ENGINES: EngineEntry[] = [
  { id: "pollinations", label: "Pollinations AI", fn: pollinationsEngine, costPerImage: 0, capabilities: ["text2img"], maxWidth: 1024, maxHeight: 1024, freeQuota: "Unlimited forever" },
  { id: "ai-horde", label: "AI Horde", fn: aiHordeEngine, costPerImage: 0, capabilities: ["text2img"], maxWidth: 768, maxHeight: 768, freeQuota: "Unlimited (community GPUs)" },
  { id: "together", label: "Together.ai", fn: togetherEngine, costPerImage: 0, capabilities: ["text2img", "img2img"], maxWidth: 1440, maxHeight: 1440, freeQuota: "Free 3 months" },
  { id: "cloudflare", label: "Cloudflare AI", fn: cloudflareEngine, costPerImage: 0, capabilities: ["text2img"], maxWidth: 1024, maxHeight: 1024, freeQuota: "10K neurons/day forever" },
  { id: "huggingface", label: "Hugging Face", fn: huggingfaceEngine, costPerImage: 0.001, capabilities: ["text2img"], maxWidth: 1024, maxHeight: 1024, freeQuota: "Free tier monthly" },
  { id: "fal", label: "fal.ai", fn: falEngine, costPerImage: 0.003, capabilities: ["text2img", "img2img"], maxWidth: 1536, maxHeight: 1536, freeQuota: "Free tier" },
  { id: "fireworks", label: "Fireworks AI", fn: fireworksEngine, costPerImage: 0.0014, capabilities: ["text2img"], maxWidth: 1024, maxHeight: 1024, freeQuota: "$5 credits" },
  { id: "segmind", label: "Segmind", fn: segmindEngine, costPerImage: 0.005, capabilities: ["text2img"], maxWidth: 1536, maxHeight: 1536, freeQuota: "Free signup credits" },
  { id: "deepinfra", label: "DeepInfra", fn: deepinfraEngine, costPerImage: 0.015, capabilities: ["text2img"], maxWidth: 1440, maxHeight: 1440, freeQuota: "Free tier" },
  { id: "replicate", label: "Replicate", fn: replicateEngine, costPerImage: 0.003, capabilities: ["text2img", "img2img"], maxWidth: 1024, maxHeight: 1024, freeQuota: "Free tier" },
  { id: "leonardo", label: "Leonardo.ai", fn: leonardoEngine, costPerImage: 0.03, capabilities: ["text2img"], maxWidth: 1536, maxHeight: 1536, freeQuota: "$5 credits" },
  { id: "blackforest", label: "Black Forest Labs", fn: blackforestEngine, costPerImage: 0.003, capabilities: ["text2img"], maxWidth: 1440, maxHeight: 1440, freeQuota: "Credit-based" },
  { id: "stability", label: "Stability AI", fn: stabilityEngine, costPerImage: 0.04, capabilities: ["text2img", "img2img"], maxWidth: 1536, maxHeight: 1536, freeQuota: "25 credits" },
  { id: "openai", label: "OpenAI GPT Image", fn: openaiEngine, costPerImage: 0.02, capabilities: ["text2img"], maxWidth: 1536, maxHeight: 1536, freeQuota: "Existing key" },
  { id: "prodia", label: "Prodia", fn: prodiaEngine, costPerImage: 0.002, capabilities: ["text2img"], maxWidth: 1024, maxHeight: 1024, freeQuota: "1000 free calls" },
];

const DEFAULT_POLICY: PolicyFlags = {
  allowChinaProviders: false,
  requireEUGateway: false,
  safeMode: true,
};

/**
 * GET /api/ai-render/compare?prompt=...&width=512&height=288
 *
 * Returns JSON with results from all engines (base64 images + metadata).
 * Uses small dimensions by default to save credits.
 */
export async function GET(req: NextRequest) {
  try {
  const { searchParams } = req.nextUrl;
  const prompt = searchParams.get("prompt") || "modern scandinavian living room, natural light, minimalist furniture";
  const width = Number(searchParams.get("width") || "512");
  const height = Number(searchParams.get("height") || "288");
  const seed = searchParams.get("seed") || String(Date.now());
  const enginesParam = searchParams.get("engines"); // comma-separated filter

  const selectedEngines = enginesParam
    ? ALL_ENGINES.filter((e) => enginesParam.split(",").includes(e.id))
    : ALL_ENGINES;

  const renderReq: AiRenderRequest = {
    prompt,
    width,
    height,
    seed,
    tier: "free",
    policyFlags: DEFAULT_POLICY,
  };

  console.log(`[compare] Testing ${selectedEngines.length} engines: "${prompt.slice(0, 60)}..." ${width}x${height}`);

  // Run all engines in parallel with individual timeouts
  const results = await Promise.allSettled(
    selectedEngines.map(async (engine) => {
      const startMs = Date.now();
      try {
        const result = await Promise.race([
          engine.fn(renderReq),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 60_000)), // 60s per engine
        ]);

        if (!result) {
          return {
            engineId: engine.id,
            label: engine.label,
            status: "failed" as const,
            error: "No result or timeout",
            latencyMs: Date.now() - startMs,
            costPerImage: engine.costPerImage,
            capabilities: engine.capabilities,
            freeQuota: engine.freeQuota,
          };
        }

        // Convert buffer to base64 for JSON response
        const base64 = Buffer.from(result.buffer).toString("base64");
        return {
          engineId: engine.id,
          label: engine.label,
          status: "success" as const,
          image: `data:${result.contentType};base64,${base64}`,
          contentType: result.contentType,
          engine: result.engine,
          costUsd: result.costUsd ?? engine.costPerImage,
          latencyMs: result.latencyMs ?? (Date.now() - startMs),
          imageSize: result.buffer.length,
          capabilities: engine.capabilities,
          freeQuota: engine.freeQuota,
        };
      } catch (err) {
        return {
          engineId: engine.id,
          label: engine.label,
          status: "error" as const,
          error: err instanceof Error ? err.message : "Unknown error",
          latencyMs: Date.now() - startMs,
          costPerImage: engine.costPerImage,
          capabilities: engine.capabilities,
          freeQuota: engine.freeQuota,
        };
      }
    })
  );

  const output = results.map((r) =>
    r.status === "fulfilled" ? r.value : { status: "error", error: "Promise rejected" }
  );

  return NextResponse.json({
    prompt,
    width,
    height,
    seed,
    timestamp: new Date().toISOString(),
    engines: output,
  });
  } catch (err) {
    console.error("[ai-render/compare] Unhandled error:", err);
    return NextResponse.json(
      { error: "Compare request failed." },
      { status: 500 }
    );
  }
}
