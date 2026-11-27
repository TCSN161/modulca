/**
 * Request body for POST /api/ai-render (Image → Image), 5.03-A.
 * Contract: docs/MCA-DOC-AI-ENGINES-3D-BAKEOFF-2026-11.md §8.2 (3.07).
 */
import { IMG2IMG_PROMPT_MAX } from "./viewPrompt";

export interface Img2ImgBody {
  prompt: string;
  width: number;
  height: number;
  seed: string;
  /** null = "auto": the server chain decides (klein first) */
  engine: string | null;
  /** JPEG data URI, long side ≤ 1024 */
  baseImage: string;
  /** PNG depth map, same camera and size as baseImage */
  controlImage?: string;
  controlType?: "depth" | "canny";
  maxCostUsd: number;
}

export function buildImg2ImgBody(i: {
  prompt: string;
  width: number;
  height: number;
  seed: string;
  engine: string;
  baseImage: string;
  controlImage?: string | null;
  maxCostUsd: number;
}): Img2ImgBody {
  return {
    prompt: i.prompt,
    width: i.width,
    height: i.height,
    seed: i.seed,
    // BUG-ST33: honour the chosen engine; "auto" → null (the img2img chain starts with cloudflare-klein)
    engine: i.engine && i.engine !== "auto" ? i.engine : null,
    baseImage: i.baseImage,
    ...(i.controlImage ? { controlImage: i.controlImage, controlType: "depth" as const } : {}),
    maxCostUsd: i.maxCostUsd,
  };
}

/**
 * Clean the prompt for the route's filters.
 * text2img: short, prefixed with architectural context (content-filter false positives).
 * img2img: the view-describing sentence must stay first (bake-off §4.2), so no
 * prefix that contradicts it ("empty furnished room" on an exterior) and a longer cap.
 */
export function sanitizePrompt(prompt: string, img2img = false): string {
  const cleaned = prompt
    .trim()
    .replace(/[^\w\s,.;:\-!?'()]/g, " ")
    .replace(/\s+/g, " ");
  if (img2img) return cleaned.slice(0, IMG2IMG_PROMPT_MAX);
  return `architectural interior design visualization, empty furnished room, ${cleaned.slice(0, 300)}`;
}
