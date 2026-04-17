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
import { geminiEngine } from "../engines/gemini";
import { novitaEngine } from "../engines/novita";
import { wavespeedEngine } from "../engines/wavespeed";
import { runwayEngine } from "../engines/runway";
import type { AiRenderEngine, AiRenderRequest, PolicyFlags } from "../engines/types";

import { devLog } from "@/shared/lib/devLog";
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
  /** True if the engine can be tested at $0 cost (free-forever or current free quota) */
  freeTier: boolean;
}

const ALL_ENGINES: EngineEntry[] = [
  // ── FREE tier ── (costPerImage=0 OR has large free quota we can use safely)
  { id: "pollinations", label: "Pollinations AI", fn: pollinationsEngine, costPerImage: 0, capabilities: ["text2img"], maxWidth: 1024, maxHeight: 1024, freeQuota: "Unlimited forever", freeTier: true },
  { id: "ai-horde", label: "AI Horde", fn: aiHordeEngine, costPerImage: 0, capabilities: ["text2img"], maxWidth: 768, maxHeight: 768, freeQuota: "Unlimited (community GPUs)", freeTier: true },
  { id: "cloudflare", label: "Cloudflare AI", fn: cloudflareEngine, costPerImage: 0, capabilities: ["text2img"], maxWidth: 1024, maxHeight: 1024, freeQuota: "10K neurons/day forever", freeTier: true },
  { id: "gemini", label: "Google Gemini (Nano Banana)", fn: geminiEngine, costPerImage: 0, capabilities: ["text2img"], maxWidth: 1536, maxHeight: 1536, freeQuota: "~1500 req/day free", freeTier: true },
  { id: "together", label: "Together.ai (FLUX Schnell)", fn: togetherEngine, costPerImage: 0, capabilities: ["text2img", "img2img"], maxWidth: 1440, maxHeight: 1440, freeQuota: "Free FLUX Schnell (promo)", freeTier: true },
  { id: "huggingface", label: "Hugging Face", fn: huggingfaceEngine, costPerImage: 0, capabilities: ["text2img"], maxWidth: 1024, maxHeight: 1024, freeQuota: "Free tier monthly", freeTier: true },

  // ── PAID tier ── (real cost per image; testing consumes credits)
  { id: "fal", label: "fal.ai", fn: falEngine, costPerImage: 0.003, capabilities: ["text2img", "img2img"], maxWidth: 1536, maxHeight: 1536, freeQuota: "$5 free credits (one-time)", freeTier: false },
  { id: "fireworks", label: "Fireworks AI", fn: fireworksEngine, costPerImage: 0.0014, capabilities: ["text2img"], maxWidth: 1024, maxHeight: 1024, freeQuota: "$1 free (one-time)", freeTier: false },
  { id: "segmind", label: "Segmind", fn: segmindEngine, costPerImage: 0.005, capabilities: ["text2img"], maxWidth: 1536, maxHeight: 1536, freeQuota: "Signup credits", freeTier: false },
  { id: "deepinfra", label: "DeepInfra", fn: deepinfraEngine, costPerImage: 0.015, capabilities: ["text2img"], maxWidth: 1440, maxHeight: 1440, freeQuota: "DeepStart program", freeTier: false },
  { id: "replicate", label: "Replicate", fn: replicateEngine, costPerImage: 0.003, capabilities: ["text2img", "img2img"], maxWidth: 1024, maxHeight: 1024, freeQuota: "Small monthly allowance", freeTier: false },
  { id: "leonardo", label: "Leonardo.ai", fn: leonardoEngine, costPerImage: 0.03, capabilities: ["text2img"], maxWidth: 1536, maxHeight: 1536, freeQuota: "150 tokens/day", freeTier: false },
  { id: "blackforest", label: "Black Forest Labs (FLUX)", fn: blackforestEngine, costPerImage: 0.003, capabilities: ["text2img"], maxWidth: 1440, maxHeight: 1440, freeQuota: "Credit-based", freeTier: false },
  { id: "stability", label: "Stability AI", fn: stabilityEngine, costPerImage: 0.04, capabilities: ["text2img", "img2img"], maxWidth: 1536, maxHeight: 1536, freeQuota: "25 credits (one-time)", freeTier: false },
  { id: "openai", label: "OpenAI GPT Image", fn: openaiEngine, costPerImage: 0.02, capabilities: ["text2img"], maxWidth: 1536, maxHeight: 1536, freeQuota: "$5 credits", freeTier: false },
  { id: "novita", label: "NovitaAI", fn: novitaEngine, costPerImage: 0.0015, capabilities: ["text2img"], maxWidth: 1280, maxHeight: 1280, freeQuota: "$0.50 trial (one-time)", freeTier: false },
  { id: "wavespeed", label: "WaveSpeed (Seedream)", fn: wavespeedEngine, costPerImage: 0.003, capabilities: ["text2img", "img2img"], maxWidth: 2048, maxHeight: 2048, freeQuota: "Signup credits", freeTier: false },
  { id: "runway", label: "Runway Gen-3", fn: runwayEngine, costPerImage: 0.02, capabilities: ["text2img"], maxWidth: 1920, maxHeight: 1080, freeQuota: "125 credits/mo", freeTier: false },
  { id: "prodia", label: "Prodia", fn: prodiaEngine, costPerImage: 0.002, capabilities: ["text2img"], maxWidth: 1024, maxHeight: 1024, freeQuota: "1000 free calls", freeTier: false },
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
  const tierFilter = (searchParams.get("tier") || "all").toLowerCase(); // "free" | "paid" | "all"

  let selectedEngines = enginesParam
    ? ALL_ENGINES.filter((e) => enginesParam.split(",").includes(e.id))
    : ALL_ENGINES;

  if (tierFilter === "free") {
    selectedEngines = selectedEngines.filter((e) => e.freeTier);
  } else if (tierFilter === "paid") {
    selectedEngines = selectedEngines.filter((e) => !e.freeTier);
  }

  const renderReq: AiRenderRequest = {
    prompt,
    width,
    height,
    seed,
    tier: "free",
    policyFlags: DEFAULT_POLICY,
  };

  devLog(`[compare] Testing ${selectedEngines.length} engines: "${prompt.slice(0, 60)}..." ${width}x${height}`);

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
