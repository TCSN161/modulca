/**
 * Express render plan: one img2img request per camera preset, built only with
 * the Chat 5 public render contract (viewPrompt + renderRequest). engine "auto"
 * → null → the server img2img chain (cloudflare-klein first). No `tier` field:
 * the server derives it from the session (SEC-02).
 */
import { buildViewPrompt } from "@/features/design/components/render/viewPrompt";
import { buildImg2ImgBody, sanitizePrompt, type Img2ImgBody } from "@/features/design/components/render/renderRequest";
import type { ExpressRenderView } from "./types";

export const EXPRESS_RENDER_SIZE = { width: 1024, height: 576 } as const;

export interface RenderPlanContext {
  moduleLabels: string[];
  /** Room shown by the interior preset (the living room in the MVP) */
  interiorRoomLabel: string;
  styleName: string;
  /** getTierConfig(tier).features.maxCostUsdPerImage; the server clamps it again */
  maxCostUsd: number;
  seedBase: string;
}

const LIGHTING: Record<ExpressRenderView, string> = {
  exterior: "soft daylight",
  overview: "soft daylight",
  interior: "warm natural",
};

export function buildExpressPrompt(view: ExpressRenderView, ctx: RenderPlanContext): string {
  return sanitizePrompt(
    buildViewPrompt({
      view,
      moduleLabels: ctx.moduleLabels,
      roomLabel: view === "interior" ? ctx.interiorRoomLabel : undefined,
      styleName: ctx.styleName,
      lighting: LIGHTING[view],
    }),
    true,
  );
}

export function buildExpressRenderBody(
  view: ExpressRenderView,
  ctx: RenderPlanContext,
  capture: { baseImage: string; controlImage?: string | null },
): Img2ImgBody {
  return buildImg2ImgBody({
    prompt: buildExpressPrompt(view, ctx),
    ...EXPRESS_RENDER_SIZE,
    seed: `${ctx.seedBase}-${view}`,
    engine: "auto",
    baseImage: capture.baseImage,
    controlImage: capture.controlImage ?? null,
    maxCostUsd: ctx.maxCostUsd,
  });
}
