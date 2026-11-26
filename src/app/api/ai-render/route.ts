import { NextRequest, NextResponse } from "next/server";
import { pollinationsEngine } from "./engines/pollinations";
import { aiHordeEngine } from "./engines/aihorde";
import { stabilityEngine } from "./engines/stability";
import { togetherEngine } from "./engines/together";
import { leonardoEngine } from "./engines/leonardo";
import { falEngine } from "./engines/fal";
import { cloudflareEngine } from "./engines/cloudflare";
import { cloudflareKleinEngine } from "./engines/cloudflareKlein";
import { isEngineDisabled } from "./engines/killSwitch";
import { getServerTier } from "@/shared/server/serverTier";
import { engineTierFor, clampMaxCost } from "./engines/renderTier";
import { checkAndConsumeQuota, refundQuota, quotaExceededResponse } from "@/shared/server/quota";
import { getTierConfig } from "@/features/auth/types";
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
import { canUseEngine, recordSuccess, recordFailure, type Tier } from "./engines/creditManager";
import { logRender } from "./engines/renderLogger";
import { makeCacheKey, getCachedRender, cacheResult } from "./engines/renderCache";
import { getFallbackChain } from "./engines/chains";

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
  "cloudflare-klein": {
    fn: cloudflareKleinEngine,
    info: { id: "cloudflare-klein", label: "Cloudflare FLUX.2 klein", description: "Free (shared 10K neurons/day). text2img + img2img that keeps the 3D geometry.", speed: "fast" },
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

// Fallback chains per tier + mode live in ./engines/chains.ts (BUG-ST01):
// every tier keeps the free engines as a floor.

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
  // U9 — pass tier to creditManager so monthly cap + band gate engage.
  const creditCtx = { tier: tier as Tier };

  // ── Cache check (skip for img2img since base image varies) ──
  if (!renderReq.baseImage && engineParam) {
    const cacheKey = makeCacheKey(renderReq.prompt, renderReq.width, renderReq.height, engineParam);
    const cached = await getCachedRender(cacheKey);
    if (cached) {
      devLog(`[ai-render] Cache HIT for "${renderReq.prompt.slice(0, 40)}..." engine=${cached.engineId}`);
      logRender({
        prompt: renderReq.prompt, width: renderReq.width, height: renderReq.height,
        seed: renderReq.seed, mode, tier, user_id: renderReq.userId, engine_id: cached.engineId,
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
    recordSuccess(engineId, result.costUsd ?? 0, result.latencyMs ?? 0, creditCtx);

    // Cache the result (fire and forget, text2img only)
    if (!renderReq.baseImage) {
      const cacheKey = makeCacheKey(renderReq.prompt, renderReq.width, renderReq.height, engineId);
      cacheResult(cacheKey, engineId, result.buffer, result.contentType, renderReq.width, renderReq.height);
    }

    // Log to analytics (fire and forget)
    logRender({
      prompt: renderReq.prompt, width: renderReq.width, height: renderReq.height,
      seed: renderReq.seed, mode, tier, user_id: renderReq.userId, engine_id: engineId, engine_label: result.engine,
      status: "success", cost_usd: result.costUsd ?? 0, latency_ms: result.latencyMs,
      image_size_bytes: result.buffer.length, content_type: result.contentType,
      cache_hit: false,
    });
  }

  /** Helper: handle a failed engine attempt */
  function onFailure(engineId: string, error: string) {
    recordFailure(engineId, error, creditCtx);
    logRender({
      prompt: renderReq.prompt, width: renderReq.width, height: renderReq.height,
      seed: renderReq.seed, mode, tier, user_id: renderReq.userId, engine_id: engineId,
      status: "failed", error_message: error, cost_usd: 0, cache_hit: false,
    });
  }

  // If a specific engine is requested, try it first (if within budget), then fall back
  if (engineParam && ENGINES[engineParam]) {
    const eng = ENGINES[engineParam];
    if (isEngineDisabled(engineParam)) {
      devLog(`[ai-render] Engine "${engineParam}" disabled by kill switch, skipping to fallback`);
    } else if (eng.estimatedCostUsd > maxCostUsd) {
      devLog(`[ai-render] Engine "${engineParam}" exceeds cost ceiling ($${eng.estimatedCostUsd} > $${maxCostUsd}), skipping to fallback`);
    } else if (!canUseEngine(engineParam, creditCtx)) {
      devLog(`[ai-render] Engine "${engineParam}" blocked (tier/band/cap/credits), skipping to fallback`);
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
    if (isEngineDisabled(engineId)) {
      devLog(`[ai-render] Skipping "${engineId}" — kill switch`);
      continue;
    }
    if (engine.estimatedCostUsd > maxCostUsd) {
      devLog(`[ai-render] Skipping "${engineId}" — over cost ceiling ($${engine.estimatedCostUsd} > $${maxCostUsd})`);
      continue;
    }
    if (!canUseEngine(engineId, creditCtx)) {
      devLog(`[ai-render] Skipping "${engineId}" — blocked by tier/band/cap/credits`);
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

  // Client contract (MCA-DOC-AI-ENGINES-CLIENT-CONTRACT): show `error` as-is,
  // do NOT fall back to a client-side engine (BUG-ST02).
  return NextResponse.json(
    { error: "All AI engines are currently busy. Please try again in a minute.", code: "ENGINES_UNAVAILABLE" },
    { status: 503, headers: { "Retry-After": "60" } }
  );
}

/* ------------------------------------------------------------------ */
/*  Server tier + per-user quota (BUG-SEC-02 / E07 / E08, 2026-11-26)  */
/* ------------------------------------------------------------------ */

/**
 * Resolve the tier from the verified session (client `tier` is IGNORED) and
 * consume one render unit. getServerTier never throws; quota falls back to an
 * in-memory counter if the 012 RPC fails — so this is fail-safe.
 */
async function startRender(req: NextRequest, clientMaxCost: unknown) {
  const ctx = await getServerTier(req);
  const quota = await checkAndConsumeQuota(ctx, "render");
  const tier = engineTierFor(ctx);
  const maxCost = clampMaxCost(clientMaxCost, getTierConfig(tier).features.maxCostUsdPerImage);
  return { ctx, quota, tier, maxCost };
}

/** No image produced → give the unit back. */
async function finishRender(res: Response, st: Awaited<ReturnType<typeof startRender>>): Promise<Response> {
  if (!res.ok) await refundQuota(st.ctx, "render", st.quota.source);
  return res;
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

    // NEVER trust ?tier= (BUG-SEC-02) — the verified session decides.
    const st = await startRender(req, searchParams.get("maxCostUsd"));
    if (!st.quota.allowed) return quotaExceededResponse(st.quota);
    const { tier, maxCost } = st;

    const renderReq: AiRenderRequest = {
      prompt, width, height, seed,
      tier,
      userId: st.ctx.userId ?? undefined,
      policyFlags: DEFAULT_POLICY,
    };

    devLog(
      `[ai-render] GET: "${prompt.slice(0, 60)}..." ${width}x${height} engine=${engineParam || "auto"} tier=${tier} maxCost=$${maxCost}`
    );

    const order = getFallbackChain(tier, false);
    return await finishRender(await tryEngines(renderReq, engineParam, order, maxCost), st);
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
      maxCostUsd = null,
    } = body as Record<string, unknown> & {
      prompt?: string;
      width?: number;
      height?: number;
      seed?: string | number;
      engine?: string | null;
      baseImage?: string | null;
      maxCostUsd?: number | null;
    };

    // NEVER trust body.tier (BUG-SEC-02) — the verified session decides.
    const st = await startRender(req, maxCostUsd);
    if (!st.quota.allowed) return quotaExceededResponse(st.quota);
    const tier = st.tier;

    const renderReq: AiRenderRequest = {
      prompt: String(prompt),
      width: Number(width),
      height: Number(height),
      seed: String(seed),
      baseImage: baseImage ? String(baseImage) : undefined,
      tier,
      userId: st.ctx.userId ?? undefined,
      policyFlags: DEFAULT_POLICY,
    };

    devLog(
      `[ai-render] POST: "${String(prompt).slice(0, 60)}..." ${width}x${height} engine=${engineParam || "auto"} img2img=${!!baseImage} tier=${tier} maxCost=$${st.maxCost}`
    );

    const order = getFallbackChain(tier, !!baseImage);
    return await finishRender(await tryEngines(renderReq, engineParam as string | null, order, st.maxCost), st);
  } catch (err) {
    console.error("[ai-render] POST unhandled error:", err);
    return NextResponse.json(
      { error: "Render request failed. Please try again." },
      { status: 500 }
    );
  }
}
