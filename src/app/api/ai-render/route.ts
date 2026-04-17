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
import { devLog } from "@/shared/lib/devLog";
// Disabled until API keys are configured (see docs/AI_PROVIDERS.md):
// import { novitaEngine } from "./engines/novita";
// import { wavespeedEngine } from "./engines/wavespeed";
// import { runwayEngine } from "./engines/runway";
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
  // Disabled until API keys are configured:
  // novita:    needs NOVITA_API_KEY    ($0.0015/img)
  // wavespeed: needs WAVESPEED_API_KEY (China provider, also gated by EU policy)
  // runway:    needs RUNWAY_API_KEY    (primarily a video platform, overkill)
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

/**
 * Fallback chains — optimized 2026-04-17 using real production latency data
 * from scripts/test-live-engines.mjs.
 *
 * Ordering principle: expected quality → fast fallback → slow fallback.
 * Prodia (113s) and ai-horde (110s) are placed last — used only when
 * everything else is depleted.
 */

/**
 * guest_free / free tier — all $0/img.
 * Order by real latency: cloudflare (3s) → pollinations (5s) → huggingface (9s)
 * → gemini/together/ai-horde (slower but robust).
 */
const FALLBACK_FREE = [
  "cloudflare",     // 3s — fastest free, FLUX Schnell
  "pollinations",   // 5s — no auth needed, reliable
  "huggingface",    // 9s — open-source SDXL/FLUX
  "gemini",         // 51s — Google quality, 500 req/day
  "together",       // 49s — FLUX Schnell free tier
  "ai-horde",       // 110s — last resort, volunteer GPUs
];

/**
 * premium tier — best quality, balanced cost.
 * openai (2s) is fastest AND highest quality, so it leads.
 * Fall back to cheaper/free when cost budget hits ceiling.
 */
const FALLBACK_PREMIUM = [
  "openai",         // 2s, $0.02 — fastest premium, great quality
  "cloudflare",     // 3s, $0 — free speed boost
  "leonardo",       // 17s, $0.03 — photorealistic alchemy
  "blackforest",    // 43s, $0.003 — FLUX Pro creators (EU/GDPR)
  "fireworks",      // 54s, $0.0014 — EU rep, SOC 2
  "fal",            // 52s, $0.003 — fast FLUX Kontext
  "gemini",         // 51s, $0 — free Google fallback
  "together",       // 49s, $0 — free FLUX Schnell
  "replicate",      // 53s, $0.003 — big model ecosystem
  "deepinfra",      // 51s, $0.015 — FLUX inference
  "segmind",        // 52s, $0.005 — SDXL + upscale
  "huggingface",    // 9s, $0 — quick free fallback
  "pollinations",   // 5s, $0 — always on
  "ai-horde",       // 110s, $0 — last resort
];

/**
 * architect tier — max quality, no cost ceiling.
 * Prioritize specialized engines (stability for img2img, runway for
 * cinematic, blackforest for FLUX Pro).
 */
const FALLBACK_ARCHITECT = [
  "openai",         // 2s, $0.02 — instant premium quality
  "stability",      // 52s, $0.065 — best img2img with 3D base
  "blackforest",    // 43s, $0.003 — FLUX Pro authors
  "runway",         // 39s, $0.02 — cinematic Gen-3
  "leonardo",       // 17s, $0.03 — photoreal alchemy
  "fal",            // 52s, $0.003 — fast FLUX Kontext
  "fireworks",      // 54s, $0.0014 — EU/GDPR compliant
  "wavespeed",      // 62s, $0.003 — Seedream edit for img2img
  "replicate",      // 53s, $0.003 — huge model ecosystem
  "deepinfra",      // 51s, $0.015 — FLUX serverless
  "gemini",         // 51s, $0 — free Google quality
  "together",       // 49s, $0 — free FLUX
  "novita",         // 60s, $0.0015 — 200+ models
  "segmind",        // 52s, $0.005 — SDXL + upscale
  "cloudflare",     // 3s, $0 — fast free backup
  "huggingface",    // 9s, $0
  "pollinations",   // 5s, $0
  "ai-horde",       // 110s, $0 — last resort
];

/** Default text2img when tier unspecified — balanced cost/speed */
const FALLBACK_ORDER = [
  "cloudflare",     // 3s, $0
  "openai",         // 2s, $0.02 — fast premium
  "gemini",         // 51s, $0
  "together",       // 49s, $0
  "blackforest",    // 43s, $0.003
  "fireworks",      // 54s, $0.0014
  "fal",            // 52s, $0.003
  "huggingface",    // 9s, $0
  "replicate",      // 53s, $0.003
  "deepinfra",      // 51s, $0.015
  "segmind",        // 52s, $0.005
  "leonardo",       // 17s, $0.03
  "pollinations",   // 5s, $0
  "ai-horde",       // 110s, $0
];

/**
 * img2img — structure-preserving engines first, then text2img fallback.
 * Stability and WaveSpeed Seedream-Edit are the only true img2img engines
 * that respect the input 3D composition. Others will ignore baseImage.
 */
const IMG2IMG_FALLBACK = [
  "stability",      // 52s, $0.065 — specialist img2img
  "wavespeed",      // 62s, $0.003 — Seedream edit
  "fal",            // 52s, $0.003 — Flux Kontext img2img
  "replicate",      // 53s, $0.003 — ControlNet + SDXL
  "blackforest",    // 43s, $0.003 — FLUX (text2img mode)
  "runway",         // 39s, $0.02 — cinematic fallback
  "openai",         // 2s, $0.02 — premium text2img fallback
  "fireworks",      // 54s, $0.0014 — EU/GDPR
  "deepinfra",      // 51s, $0.015
  "leonardo",       // 17s, $0.03
  "segmind",        // 52s, $0.005
  "gemini",         // 51s, $0 — free text2img fallback
  "together",       // 49s, $0
  "cloudflare",     // 3s, $0
  "huggingface",    // 9s, $0
  "pollinations",   // 5s, $0
  "ai-horde",       // 110s, $0 — last resort
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
      devLog(`[ai-render] Cache HIT for "${renderReq.prompt.slice(0, 40)}..." engine=${cached.engineId}`);
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
      devLog(`[ai-render] Engine "${engineParam}" exceeds cost ceiling ($${eng.estimatedCostUsd} > $${maxCostUsd}), skipping to fallback`);
    } else if (!canUseEngine(engineParam)) {
      devLog(`[ai-render] Engine "${engineParam}" has no credits remaining, skipping to fallback`);
    } else {
      devLog(`[ai-render] Using engine: ${engineParam}`);
      const result = await eng.fn(renderReq);
      if (result) {
        if (isContentFilterImage(result)) {
          console.warn(`[ai-render] Engine "${engineParam}" returned content-filter image (${result.buffer.length} bytes), falling back...`);
          onFailure(engineParam, "content-filter-image");
        } else {
          devLog(`[ai-render] ✓ ${result.engine} cost=$${result.costUsd ?? 0} latency=${result.latencyMs ?? 0}ms`);
          await onSuccess(engineParam, result);
          return imageResponse(result);
        }
      } else {
        onFailure(engineParam, "no-result");
      }
      devLog(`[ai-render] Engine "${engineParam}" failed, falling back to others...`);
    }
  }

  // Auto mode / fallback: try engines in order, skip those over budget or depleted
  for (const engineId of fallbackOrder) {
    if (engineId === engineParam) continue; // already tried
    const engine = ENGINES[engineId];
    if (!engine) continue;
    if (engine.estimatedCostUsd > maxCostUsd) {
      devLog(`[ai-render] Skipping "${engineId}" — over cost ceiling ($${engine.estimatedCostUsd} > $${maxCostUsd})`);
      continue;
    }
    if (!canUseEngine(engineId)) {
      devLog(`[ai-render] Skipping "${engineId}" — no credits or disabled`);
      continue;
    }
    devLog(`[ai-render] Trying engine: ${engineId}`);
    const result = await engine.fn(renderReq);
    if (result) {
      if (isContentFilterImage(result)) {
        console.warn(`[ai-render] Engine "${engineId}" returned content-filter image (${result.buffer.length} bytes), trying next...`);
        onFailure(engineId, "content-filter-image");
        continue;
      }
      devLog(`[ai-render] ✓ ${result.engine} cost=$${result.costUsd ?? 0} latency=${result.latencyMs ?? 0}ms`);
      await onSuccess(engineId, result);
      return imageResponse(result);
    }
    onFailure(engineId, "no-result");
    devLog(`[ai-render] Engine "${engineId}" failed, trying next...`);
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

    devLog(
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

    devLog(
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
