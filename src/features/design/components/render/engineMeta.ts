/**
 * Which engine produced a render, and which failed first (BUG-ST29).
 *
 * Sources, in order of trust:
 *  1. `X-AI-Fallback-From: a,b` — engines the server tried and that failed
 *     (requested from Chat 3; read here as soon as the route sends it).
 *  2. Inference from the request: an explicitly chosen engine that is not the
 *     one in `X-AI-Engine` failed; for img2img the chain starts with
 *     cloudflare-klein, so any other engine means klein failed.
 */

export const IMG2IMG_PRIMARY = "cloudflare-klein";
/** Engines in the img2img chain that only read the prompt (3D view lost). */
export const TEXT_ONLY_ENGINES = new Set(["cloudflare", "pollinations", "gemini", "together", "huggingface"]);

export interface EngineMeta {
  engine: string;
  fallbackFrom: string[];
  /** img2img request answered by a text-only engine */
  baseNotKept: boolean;
}

export function engineMetaFromHeaders(
  headers: Headers,
  req: { requestedEngine: string | null; hadBaseImage: boolean },
): EngineMeta {
  const engine = headers.get("x-ai-engine") || req.requestedEngine || "unknown";
  const fromHeader = (headers.get("x-ai-fallback-from") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let fallbackFrom = fromHeader;
  if (fallbackFrom.length === 0) {
    const expected = req.hadBaseImage ? IMG2IMG_PRIMARY : req.requestedEngine;
    if (expected && expected !== "auto" && expected !== engine) fallbackFrom = [expected];
  }
  fallbackFrom = fallbackFrom.filter((e) => e !== engine);

  return {
    engine,
    fallbackFrom,
    baseNotKept: req.hadBaseImage && TEXT_ONLY_ENGINES.has(engine),
  };
}
