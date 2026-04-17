import { NextRequest, NextResponse } from "next/server";
import { pollinationsEngine } from "./engines/pollinations";
import { aiHordeEngine } from "./engines/aihorde";
import { stabilityEngine } from "./engines/stability";
import { togetherEngine } from "./engines/together";
import { leonardoEngine } from "./engines/leonardo";
import { falEngine } from "./engines/fal";
import { cloudflareEngine } from "./engines/cloudflare";
import { replicateEngine } from "./engines/replicate";
import { huggingfaceEngine } from "./engines/huggingface";
import { segmindEngine } from "./engines/segmind";
import { openaiEngine } from "./engines/openai";
import { blackforestEngine } from "./engines/blackforest";
import { deepinfraEngine } from "./engines/deepinfra";
import { fireworksEngine } from "./engines/fireworks";
import { prodiaEngine } from "./engines/prodia";
import { geminiEngine } from "./engines/gemini";
import { novitaEngine } from "./engines/novita";
import { wavespeedEngine } from "./engines/wavespeed";
import { runwayEngine } from "./engines/runway";
import type { AiRenderEngine, AiRenderRequest, AiRenderResult, EngineInfo, PolicyFlags } from "./engines/types";
import { canUseEngine, recordSuccess, recordFailure } from "./engines/creditManager";
import { logRender } from "./engines/renderLogger";
import { makeCacheKey, getCachedRender, cacheResult } from "./engines/renderCache";

/**
 * Must be force-dynamic so Vercel runs this as a serverless function
 * that can make real-time API calls to AI engines.
 */
export const dynamic = "force-dynamic";

/**
 * Modular AI Render Proxy
 *
 * Each engine is a separate module in ./engines/.
 * To add a new engine:
 *   1. Create engines/myengine.ts implementing AiRenderEngine
 *   2. Add it to ENGINES map below
 *   3. It will automatically appear in the UI dropdown
 *
 * Usage:
 *   GET /api/ai-render?prompt=...&width=1024&height=576&engine=pollinations
 *   GET /api/ai-render/engines  (list available engines)
 */

/* ------------------------------------------------------------------ */
/*  Engine Registry                                                    */
/* ------------------------------------------------------------------ */

const ENGINES: Record<string, { fn: AiRenderEngine; info: EngineInfo; estimatedCostUsd: number }> = {
  /* ── Free engines (guest_free + free tier) ── */
  pollinations: {
    fn: pollinationsEngine,
    info: { id: "pollinations", label: "Pollinations AI", description: "Free, no auth. Uses Stable Diffusion.", speed: "fast" },
    estimatedCostUsd: 0,
  },
  "ai-horde": {
    fn: aiHordeEngine,
    info: { id: "ai-horde", label: "AI Horde", description: "Free community GPUs. Slower but reliable.", speed: "slow" },
    estimatedCostUsd: 0,
  },
  together: {
    fn: togetherEngine,
    info: { id: "together", label: "Together.ai FLUX", description: "Free 3 months. Fast FLUX Schnell.", speed: "fast" },
    estimatedCostUsd: 0,
  },
  cloudflare: {
    fn: cloudflareEngine,
    info: { id: "cloudflare", label: "Cloudflare AI", description: "10K neurons/day free FOREVER. FLUX Schnell.", speed: "fast" },
    estimatedCostUsd: 0,
  },
  huggingface: {
    fn: huggingfaceEngine,
    info: { id: "huggingface", label: "Hugging Face", description: "Free inference. Open-source FLUX & SDXL.", speed: "medium" },
    estimatedCostUsd: 0.001,
  },

  /* ── Low-cost engines (free + standard tier) ── */
  fal: {
    fn: falEngine,
    info: { id: "fal", label: "fal.ai", description: "Fastest inference. img2img + text2img + upscale.", speed: "fast" },
    estimatedCostUsd: 0.003,
  },
  segmind: {
    fn: segmindEngine,
    info: { id: "segmind", label: "Segmind", description: "Cheapest upscaling ($0.005). SDXL text2img.", speed: "medium" },
    estimatedCostUsd: 0.005,
  },

  /* ── Low-mid engines ── */
  fireworks: {
    fn: fireworksEngine,
    info: { id: "fireworks", label: "Fireworks AI", description: "Best GDPR (EU rep, SOC 2). FLUX $0.0014/img.", speed: "fast" },
    estimatedCostUsd: 0.0014,
  },
  deepinfra: {
    fn: deepinfraEngine,
    info: { id: "deepinfra", label: "DeepInfra", description: "Fast FLUX inference. DeepStart startup program.", speed: "fast" },
    estimatedCostUsd: 0.015,
  },

  /* ── Mid-tier engines (premium tier) ── */
  leonardo: {
    fn: leonardoEngine,
    info: { id: "leonardo", label: "Leonardo.ai", description: "Photorealistic with alchemy. 150 free/day.", speed: "medium" },
    estimatedCostUsd: 0.03,
  },
  replicate: {
    fn: replicateEngine,
    info: { id: "replicate", label: "Replicate", description: "ControlNet img2img + largest model ecosystem.", speed: "medium" },
    estimatedCostUsd: 0.003,
  },

  /* ── Premium engines (premium + architect tier) ── */
  blackforest: {
    fn: blackforestEngine,
    info: { id: "blackforest", label: "Black Forest Labs", description: "FLUX creators. German company (EU/GDPR). Best FLUX quality.", speed: "medium" },
    estimatedCostUsd: 0.003, // Schnell; Pro is $0.04 but auto-selected by tier
  },
  stability: {
    fn: stabilityEngine,
    info: { id: "stability", label: "Stability AI", description: "High-quality img2img — 3D scene as base.", speed: "medium" },
    estimatedCostUsd: 0.065,
  },
  openai: {
    fn: openaiEngine,
    info: { id: "openai", label: "OpenAI GPT Image", description: "Premium quality. GPT Image + DALL-E 3.", speed: "medium" },
    estimatedCostUsd: 0.02,
  },

  /* ── Ultra-cheap engines ── */
  prodia: {
    fn: prodiaEngine,
    info: { id: "prodia", label: "Prodia", description: "Ultra-fast ($0.002/img). 1000 free calls, no card needed.", speed: "fast" },
    estimatedCostUsd: 0.002,
  },

  /* ── NEW engines (April 2026) ── */
  gemini: {
    fn: geminiEngine,
    info: { id: "gemini", label: "Google Imagen 3", description: "Free 500/day FOREVER. Best for architecture.", speed: "fast" },
    estimatedCostUsd: 0,
  },
  novita: {
    fn: novitaEngine,
    info: { id: "novita", label: "Novita FLUX", description: "$0.0015/img. 200+ models available.", speed: "fast" },
    estimatedCostUsd: 0.0015,
  },
  wavespeed: {
    fn: wavespeedEngine,
    info: { id: "wavespeed", label: "WaveSpeed Seedream", description: "$0.003/img. Best photorealistic img2img.", speed: "medium" },
    estimatedCostUsd: 0.003,
  },
  runway: {
    fn: runwayEngine,
    info: { id: "runway", label: "Runway Gen-3", description: "$0.02/img. Cinematic quality, also does video.", speed: "medium" },
    estimatedCostUsd: 0.02,
  },
};

/** Default EU policy: no China providers, safe mode on */
const DEFAULT_POLICY: PolicyFlags = {
  allowChinaProviders: false,
  requireEUGateway: false,
  safeMode: true,
};

/**
 * Fallback chains — tier-aware, ordered by quality/cost trade-off.
 * Credit manager auto-skips depleted engines.
 * Cost ceiling in tryEngines() auto-skips engines over per-image budget.
 */

/** guest_free / free tier: only free engines */
const FALLBACK_FREE = [
  "together", "cloudflare", "huggingface",             // free with API key
  "pollinations", "ai-horde",                          // free, no key needed
];

/** premium tier: best quality first, then cheaper fallbacks */
const FALLBACK_PREMIUM = [
  "blackforest", "fal", "together", "fireworks",       // best EU + fast
  "cloudflare", "huggingface", "prodia", "replicate",  // free/cheap
  "deepinfra", "segmind", "leonardo",                  // mid-tier
  "openai",                                            // premium
  "ai-horde", "pollinations",                          // always-available
];

/** architect tier: premium quality, no cost restriction */
const FALLBACK_ARCHITECT = [
  "blackforest", "openai", "stability", "leonardo",    // premium quality
  "fal", "together", "fireworks", "replicate",         // fast + versatile
  "prodia", "deepinfra", "cloudflare", "huggingface", "segmind", // mid-tier
  "ai-horde", "pollinations",                          // always-available
];

/** Default text2img: balanced free → cheap → mid → premium */
const FALLBACK_ORDER = [
  "together", "fal", "cloudflare", "blackforest",     // free / near-free (BFL = EU)
  "huggingface", "fireworks", "prodia",                // free/cheap
  "segmind", "deepinfra", "replicate", "leonardo",     // low-cost / mid
  "openai",                                            // premium
  "ai-horde", "pollinations",                          // always-available fallback
];

/** img2img: structure-preserving engines first */
const IMG2IMG_FALLBACK = [
  "stability", "fal", "together", "replicate",         // img2img capable
  "blackforest", "cloudflare", "fireworks",             // text2img fallback (EU-friendly)
  "huggingface", "segmind", "deepinfra", "leonardo",    // mid-tier fallback
  "openai",                                             // premium fallback
  "ai-horde", "pollinations",                           // last resort
];

/** Get the best fallback chain for a tier + mode combination */
function getFallbackChain(tier: string, hasBaseImage: boolean): string[] {
  if (hasBaseImage) return IMG2IMG_FALLBACK;
  switch (tier) {
    case "guest_free":
    case "free":
      return FALLBACK_FREE;
    case "premium":
      return FALLBACK_PREMIUM;
    case "architect":
      return FALLBACK_ARCHITECT;
    default:
      return FALLBACK_ORDER;
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Minimum size for a valid render image — content moderation placeholders are typically <10KB */
const MIN_VALID_IMAGE_BYTES = 8000;

function imageResponse(result: AiRenderResult) {
  return new NextResponse(new Uint8Array(result.buffer), {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      "Content-Length": String(result.buffer.length),
      "X-AI-Engine": result.engine,
      "X-AI-Cost-Usd": String(result.costUsd ?? 0),
      "X-AI-Latency-Ms": String(result.latencyMs ?? 0),
      "Cache-Control": "public, max-age=3600",
    },
  });
}

/** Check if a result looks like a content-moderation placeholder instead of a real render */
function isContentFilterImage(result: { buffer: Buffer }): boolean {
  return result.buffer.length < MIN_VALID_IMAGE_BYTES;
}

async function tryEngines(
  renderReq: AiRenderRequest,
  engineParam: string | null,
  fallbackOrder: string[],
  maxCostUsd: number = 1.0,
) {
  const mode: "text2img" | "img2img" = renderReq.baseImage ? "img2img" : "text2img";
  const tier = renderReq.tier || "free";

  // ── Cache check (skip for img2img since base image varies) ──
  if (!renderReq.baseImage && engineParam) {
    const cacheKey = makeCacheKey(renderReq.prompt, renderReq.width, renderReq.height, engineParam);
    const cached = await getCachedRender(cacheKey);
    if (cached) {
      console.log(`[ai-render] Cache HIT for "${renderReq.prompt.slice(0, 40)}..." engine=${cached.engineId}`);
      logRender({
        prompt: renderReq.prompt, width: renderReq.width, height: renderReq.height,
        seed: renderReq.seed, mode, tier, engine_id: cached.engineId,
        status: "success", cost_usd: 0, image_size_bytes: cached.buffer.length,
        content_type: cached.contentType, cache_hit: true, cache_key: cacheKey,
      });
      return new NextResponse(new Uint8Array(cached.buffer), {
        status: 200,
        headers: {
          "Content-Type": cached.contentType,
          "Content-Length": String(cached.buffer.length),
          "X-AI-Engine": cached.engineId,
          "X-AI-Cost-Usd": "0",
          "X-AI-Cache": "HIT",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }
  }

  /** Helper: handle a successful engine result */
  async function onSuccess(engineId: string, result: AiRenderResult) {
    recordSuccess(engineId, result.costUsd ?? 0, result.latencyMs ?? 0);

    // Cache the result (fire and forget, text2img only)
    if (!renderReq.baseImage) {
      const cacheKey = makeCacheKey(renderReq.prompt, renderReq.width, renderReq.height, engineId);
      cacheResult(cacheKey, engineId, result.buffer, result.contentType, renderReq.width, renderReq.height);
    }

    // Log to analytics (fire and forget)
    logRender({
      prompt: renderReq.prompt, width: renderReq.width, height: renderReq.height,
      seed: renderReq.seed, mode, tier, engine_id: engineId, engine_label: result.engine,
      status: "success", cost_usd: result.costUsd ?? 0, latency_ms: result.latencyMs,
      image_size_bytes: result.buffer.length, content_type: result.contentType,
      cache_hit: false,
    });
  }

  /** Helper: handle a failed engine attempt */
  function onFailure(engineId: string, error: string) {
    recordFailure(engineId, error);
    logRender({
      prompt: renderReq.prompt, width: renderReq.width, height: renderReq.height,
      seed: renderReq.seed, mode, tier, engine_id: engineId,
      status: "failed", error_message: error, cost_usd: 0, cache_hit: false,
    });
  }

  // If a specific engine is requested, try it first (if within budget), then fall back
  if (engineParam && ENGINES[engineParam]) {
    const eng = ENGINES[engineParam];
    if (eng.estimatedCostUsd > maxCostUsd) {
      console.log(`[ai-render] Engine "${engineParam}" exceeds cost ceiling ($${eng.estimatedCostUsd} > $${maxCostUsd}), skipping to fallback`);
    } else if (!canUseEngine(engineParam)) {
      console.log(`[ai-render] Engine "${engineParam}" has no credits remaining, skipping to fallback`);
    } else {
      console.log(`[ai-render] Using engine: ${engineParam}`);
      const result = await eng.fn(renderReq);
      if (result) {
        if (isContentFilterImage(result)) {
          console.warn(`[ai-render] Engine "${engineParam}" returned content-filter image (${result.buffer.length} bytes), falling back...`);
          onFailure(engineParam, "content-filter-image");
        } else {
          console.log(`[ai-render] ✓ ${result.engine} cost=$${result.costUsd ?? 0} latency=${result.latencyMs ?? 0}ms`);
          await onSuccess(engineParam, result);
          return imageResponse(result);
        }
      } else {
        onFailure(engineParam, "no-result");
      }
      console.log(`[ai-render] Engine "${engineParam}" failed, falling back to others...`);
    }
  }

  // Auto mode / fallback: try engines in order, skip those over budget or depleted
  for (const engineId of fallbackOrder) {
    if (engineId === engineParam) continue; // already tried
    const engine = ENGINES[engineId];
    if (!engine) continue;
    if (engine.estimatedCostUsd > maxCostUsd) {
      console.log(`[ai-render] Skipping "${engineId}" — over cost ceiling ($${engine.estimatedCostUsd} > $${maxCostUsd})`);
      continue;
    }
    if (!canUseEngine(engineId)) {
      console.log(`[ai-render] Skipping "${engineId}" — no credits or disabled`);
      continue;
    }
    console.log(`[ai-render] Trying engine: ${engineId}`);
    const result = await engine.fn(renderReq);
    if (result) {
      if (isContentFilterImage(result)) {
        console.warn(`[ai-render] Engine "${engineId}" returned content-filter image (${result.buffer.length} bytes), trying next...`);
        onFailure(engineId, "content-filter-image");
        continue;
      }
      console.log(`[ai-render] ✓ ${result.engine} cost=$${result.costUsd ?? 0} latency=${result.latencyMs ?? 0}ms`);
      await onSuccess(engineId, result);
      return imageResponse(result);
    }
    onFailure(engineId, "no-result");
    console.log(`[ai-render] Engine "${engineId}" failed, trying next...`);
  }

  return NextResponse.json(
    { error: "All AI engines are currently busy. Please try again in a minute." },
    { status: 503 }
  );
}

/* ------------------------------------------------------------------ */
/*  GET /api/ai-render  — text-to-image                               */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const prompt = searchParams.get("prompt") || "modern interior design";
    const width = Number(searchParams.get("width") || "1024");
    const height = Number(searchParams.get("height") || "576");
    const seed = searchParams.get("seed") || String(Date.now());
    const engineParam = searchParams.get("engine");
    const maxCost = Number(searchParams.get("maxCostUsd") || "1.0");

    const tier = searchParams.get("tier") || "free";

    const renderReq: AiRenderRequest = {
      prompt, width, height, seed,
      tier,
      policyFlags: DEFAULT_POLICY,
    };

    console.log(
      `[ai-render] GET: "${prompt.slice(0, 60)}..." ${width}x${height} engine=${engineParam || "auto"} tier=${tier} maxCost=$${maxCost}`
    );

    const order = getFallbackChain(tier, false);
    return await tryEngines(renderReq, engineParam, order, maxCost);
  } catch (err) {
    console.error("[ai-render] GET unhandled error:", err);
    return NextResponse.json(
      { error: "Render request failed. Please try again." },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/ai-render  — img2img (with 3D scene capture)            */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const {
      prompt = "modern interior design",
      width = 1024,
      height = 576,
      seed = String(Date.now()),
      engine: engineParam = null,
      baseImage = null,
      tier = "free",
      maxCostUsd = 1.0,
    } = body as Record<string, unknown> & {
      prompt?: string;
      width?: number;
      height?: number;
      seed?: string | number;
      engine?: string | null;
      baseImage?: string | null;
      tier?: string;
      maxCostUsd?: number;
    };

    const renderReq: AiRenderRequest = {
      prompt: String(prompt),
      width: Number(width),
      height: Number(height),
      seed: String(seed),
      baseImage: baseImage ? String(baseImage) : undefined,
      tier: String(tier),
      policyFlags: DEFAULT_POLICY,
    };

    console.log(
      `[ai-render] POST: "${String(prompt).slice(0, 60)}..." ${width}x${height} engine=${engineParam || "auto"} img2img=${!!baseImage} maxCost=$${maxCostUsd}`
    );

    const order = getFallbackChain(String(tier), !!baseImage);
    return await tryEngines(renderReq, engineParam as string | null, order, Number(maxCostUsd));
  } catch (err) {
    console.error("[ai-render] POST unhandled error:", err);
    return NextResponse.json(
      { error: "Render request failed. Please try again." },
      { status: 500 }
    );
  }
}
