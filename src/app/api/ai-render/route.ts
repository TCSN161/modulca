import { NextRequest, NextResponse } from "next/server";
import { pollinationsEngine } from "./engines/pollinations";
import { aiHordeEngine } from "./engines/aihorde";
import { stabilityEngine } from "./engines/stability";
import { togetherEngine } from "./engines/together";
import { leonardoEngine } from "./engines/leonardo";
import type { AiRenderEngine, AiRenderRequest, AiRenderResult, EngineInfo, PolicyFlags } from "./engines/types";

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
  pollinations: {
    fn: pollinationsEngine,
    info: {
      id: "pollinations",
      label: "Pollinations AI",
      description: "Free, no auth, fast (~30-90s). Uses Stable Diffusion via pollinations.ai",
      speed: "fast",
    },
    estimatedCostUsd: 0,
  },
  "ai-horde": {
    fn: aiHordeEngine,
    info: {
      id: "ai-horde",
      label: "AI Horde",
      description: "Free community GPU cluster (stablehorde.net). Slower but reliable.",
      speed: "slow",
    },
    estimatedCostUsd: 0,
  },
  stability: {
    fn: stabilityEngine,
    info: {
      id: "stability",
      label: "Stability AI",
      description: "High-quality img2img — uses 3D scene as base. Requires API key.",
      speed: "medium",
    },
    estimatedCostUsd: 0.065,
  },
  together: {
    fn: togetherEngine,
    info: {
      id: "together",
      label: "Together.ai FLUX",
      description: "Free unlimited for 3 months. Fast, high quality FLUX model.",
      speed: "fast",
    },
    estimatedCostUsd: 0, // schnell is free; kontext ~$0.04
  },
  leonardo: {
    fn: leonardoEngine,
    info: {
      id: "leonardo",
      label: "Leonardo.ai",
      description: "150 free/day. Photorealistic with alchemy enhancement.",
      speed: "medium",
    },
    estimatedCostUsd: 0.03,
  },
};

/** Default EU policy: no China providers, safe mode on */
const DEFAULT_POLICY: PolicyFlags = {
  allowChinaProviders: false,
  requireEUGateway: false,
  safeMode: true,
};

/** Default engine order for text-to-image fallback chain.
 *  Together (best quality, no content filter issues) → AI Horde → Leonardo → Pollinations (most aggressive filter, last resort) */
const FALLBACK_ORDER = ["together", "ai-horde", "leonardo", "pollinations"];
/** Engines that support img2img (prefer these when baseImage is provided) */
const IMG2IMG_FALLBACK = ["stability", "together", "ai-horde", "pollinations"];

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
  // If a specific engine is requested, try it first (if within budget), then fall back
  if (engineParam && ENGINES[engineParam]) {
    const eng = ENGINES[engineParam];
    if (eng.estimatedCostUsd > maxCostUsd) {
      console.log(`[ai-render] Engine "${engineParam}" exceeds cost ceiling ($${eng.estimatedCostUsd} > $${maxCostUsd}), skipping to fallback`);
    } else {
      console.log(`[ai-render] Using engine: ${engineParam}`);
      const result = await eng.fn(renderReq);
      if (result) {
        if (isContentFilterImage(result)) {
          console.warn(`[ai-render] Engine "${engineParam}" returned content-filter image (${result.buffer.length} bytes), falling back...`);
        } else {
          console.log(`[ai-render] ✓ ${result.engine} cost=$${result.costUsd ?? 0} latency=${result.latencyMs ?? 0}ms`);
          return imageResponse(result);
        }
      }
      console.log(`[ai-render] Engine "${engineParam}" failed, falling back to others...`);
    }
  }

  // Auto mode / fallback: try engines in order, skip those over budget
  for (const engineId of fallbackOrder) {
    if (engineId === engineParam) continue; // already tried
    const engine = ENGINES[engineId];
    if (!engine) continue;
    if (engine.estimatedCostUsd > maxCostUsd) {
      console.log(`[ai-render] Skipping "${engineId}" — over cost ceiling ($${engine.estimatedCostUsd} > $${maxCostUsd})`);
      continue;
    }
    console.log(`[ai-render] Trying engine: ${engineId}`);
    const result = await engine.fn(renderReq);
    if (result) {
      if (isContentFilterImage(result)) {
        console.warn(`[ai-render] Engine "${engineId}" returned content-filter image (${result.buffer.length} bytes), trying next...`);
        continue;
      }
      console.log(`[ai-render] ✓ ${result.engine} cost=$${result.costUsd ?? 0} latency=${result.latencyMs ?? 0}ms`);
      return imageResponse(result);
    }
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
  const { searchParams } = req.nextUrl;
  const prompt = searchParams.get("prompt") || "modern interior design";
  const width = Number(searchParams.get("width") || "1024");
  const height = Number(searchParams.get("height") || "576");
  const seed = searchParams.get("seed") || String(Date.now());
  const engineParam = searchParams.get("engine");
  const maxCost = Number(searchParams.get("maxCostUsd") || "1.0");

  const renderReq: AiRenderRequest = {
    prompt, width, height, seed,
    tier: searchParams.get("tier") || "free",
    policyFlags: DEFAULT_POLICY,
  };

  console.log(
    `[ai-render] GET: "${prompt.slice(0, 60)}..." ${width}x${height} engine=${engineParam || "auto"} maxCost=$${maxCost}`
  );

  return tryEngines(renderReq, engineParam, FALLBACK_ORDER, maxCost);
}

/* ------------------------------------------------------------------ */
/*  POST /api/ai-render  — img2img (with 3D scene capture)            */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    prompt = "modern interior design",
    width = 1024,
    height = 576,
    seed = String(Date.now()),
    engine: engineParam = null,
    baseImage = null,
    tier = "free",
    maxCostUsd = 1.0,
  } = body;

  const renderReq: AiRenderRequest = {
    prompt,
    width: Number(width),
    height: Number(height),
    seed: String(seed),
    baseImage: baseImage || undefined,
    tier,
    policyFlags: DEFAULT_POLICY,
  };

  console.log(
    `[ai-render] POST: "${prompt.slice(0, 60)}..." ${width}x${height} engine=${engineParam || "auto"} img2img=${!!baseImage} maxCost=$${maxCostUsd}`
  );

  // When we have a base image, prefer img2img-capable engines
  const order = baseImage ? IMG2IMG_FALLBACK : FALLBACK_ORDER;
  return tryEngines(renderReq, engineParam, order, Number(maxCostUsd));
}
