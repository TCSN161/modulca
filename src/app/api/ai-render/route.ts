import { NextRequest, NextResponse } from "next/server";
import { pollinationsEngine } from "./engines/pollinations";
import { aiHordeEngine } from "./engines/aihorde";
import { stabilityEngine } from "./engines/stability";
import { togetherEngine } from "./engines/together";
import { leonardoEngine } from "./engines/leonardo";
import type { AiRenderEngine, AiRenderRequest, EngineInfo } from "./engines/types";

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

const ENGINES: Record<string, { fn: AiRenderEngine; info: EngineInfo }> = {
  pollinations: {
    fn: pollinationsEngine,
    info: {
      id: "pollinations",
      label: "Pollinations AI",
      description: "Free, no auth, fast (~30-90s). Uses Stable Diffusion via pollinations.ai",
      speed: "fast",
    },
  },
  "ai-horde": {
    fn: aiHordeEngine,
    info: {
      id: "ai-horde",
      label: "AI Horde",
      description: "Free community GPU cluster (stablehorde.net). Slower but reliable.",
      speed: "slow",
    },
  },
  stability: {
    fn: stabilityEngine,
    info: {
      id: "stability",
      label: "Stability AI",
      description: "High-quality img2img — uses 3D scene as base. Requires API key.",
      speed: "medium",
    },
  },
  together: {
    fn: togetherEngine,
    info: {
      id: "together",
      label: "Together.ai FLUX",
      description: "Free unlimited for 3 months. Fast, high quality FLUX model.",
      speed: "fast",
    },
  },
  leonardo: {
    fn: leonardoEngine,
    info: {
      id: "leonardo",
      label: "Leonardo.ai",
      description: "150 free/day. Photorealistic with alchemy enhancement.",
      speed: "medium",
    },
  },
};

/** Default engine order for text-to-image fallback chain */
const FALLBACK_ORDER = ["together", "pollinations", "leonardo", "ai-horde"];
/** Engines that support img2img (prefer these when baseImage is provided) */
const IMG2IMG_FALLBACK = ["stability", "together", "pollinations", "ai-horde"];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function imageResponse(result: { buffer: Buffer; contentType: string; engine: string }) {
  return new NextResponse(new Uint8Array(result.buffer), {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      "Content-Length": String(result.buffer.length),
      "X-AI-Engine": result.engine,
      "Cache-Control": "public, max-age=3600",
    },
  });
}

async function tryEngines(
  renderReq: AiRenderRequest,
  engineParam: string | null,
  fallbackOrder: string[]
) {
  // If a specific engine is requested, try it first, then fall back to others
  if (engineParam && ENGINES[engineParam]) {
    console.log(`[ai-render] Using engine: ${engineParam}`);
    const result = await ENGINES[engineParam].fn(renderReq);
    if (result) return imageResponse(result);
    console.log(`[ai-render] Engine "${engineParam}" failed, falling back to others...`);
  }

  // Auto mode / fallback: try engines in order
  for (const engineId of fallbackOrder) {
    if (engineId === engineParam) continue; // already tried
    const engine = ENGINES[engineId];
    if (!engine) continue;
    console.log(`[ai-render] Trying engine: ${engineId}`);
    const result = await engine.fn(renderReq);
    if (result) return imageResponse(result);
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

  const renderReq: AiRenderRequest = { prompt, width, height, seed };

  console.log(
    `[ai-render] GET: "${prompt.slice(0, 60)}..." ${width}x${height} engine=${engineParam || "auto"}`
  );

  return tryEngines(renderReq, engineParam, FALLBACK_ORDER);
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
  } = body;

  const renderReq: AiRenderRequest = {
    prompt,
    width: Number(width),
    height: Number(height),
    seed: String(seed),
    baseImage: baseImage || undefined,
  };

  console.log(
    `[ai-render] POST: "${prompt.slice(0, 60)}..." ${width}x${height} engine=${engineParam || "auto"} img2img=${!!baseImage}`
  );

  // When we have a base image, prefer img2img-capable engines
  const order = baseImage ? IMG2IMG_FALLBACK : FALLBACK_ORDER;
  return tryEngines(renderReq, engineParam, order);
}
