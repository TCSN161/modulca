import { useState, useRef, useCallback } from "react";
import type { AiEngine, RenderInputMode, RenderResolution } from "./renderConstants";
import { RENDER_RESOLUTIONS } from "./renderConstants";
import { useAuthStore } from "@/features/auth/store";
import { getTierConfig } from "@/features/auth/types";
import { authHeaders } from "@/shared/lib/authHeaders";
import { engineMetaFromHeaders, type EngineMeta } from "./engineMeta";
import { toJpegDataUrl, toPngDataUrl, BASE_IMAGE_QUALITY, STORED_RENDER_MAX_SIDE } from "./renderImage";
import { buildImg2ImgBody, sanitizePrompt } from "./renderRequest";

interface UseRenderEngineParams {
  aiEngine: AiEngine;
  renderResolution: RenderResolution;
  /** text = GET text2img; scene / upload = POST img2img with a base image (BUG-ST03) */
  inputMode: RenderInputMode;
  captureRef: React.MutableRefObject<(() => string | null) | null>;
  /** Depth map of the same camera (5.03-A), sent as the control image */
  depthCaptureRef?: React.MutableRefObject<(() => string | null) | null>;
  /** Data URI of the uploaded image (inputMode "upload") */
  uploadImage?: string | null;
}

interface UseRenderEngineReturn {
  aiImageUrl: string | null;
  aiLoading: boolean;
  aiError: string | null;
  /** Status / code / Retry-After of the last failed request (BUG-ST02) */
  aiErrorInfo: AiErrorInfo | null;
  aiElapsed: number;
  aiUsedEngine: string | null;
  /** Engine + failed engines of the last image, and the input it was made from (BUG-ST29) */
  aiEngineMeta: (EngineMeta & { inputMode: RenderInputMode }) | null;
  /** Resolves true when an image was produced */
  handleGenerateAiRender: (prompt: string) => Promise<boolean>;
  resetAiImage: () => void;
}

const isDev = process.env.NODE_ENV === "development";

export interface AiErrorInfo {
  status: number;
  /** Server code, e.g. ENGINES_UNAVAILABLE (503) or QUOTA_EXCEEDED (429) */
  code?: string;
  /** From Retry-After: "Try again" is offered only after this (503) */
  retryAfterSec?: number;
}

const DEFAULT_ERRORS: Record<number, string> = {
  429: "Render limit reached for your plan. Try again tomorrow or upgrade.",
  503: "All AI engines are busy right now. Please try again in a minute.",
};

/** Contract §3: body { error, code }, 503 also Retry-After. */
export async function readApiError(response: Response): Promise<{ message: string; code?: string; retryAfterSec?: number }> {
  let message = DEFAULT_ERRORS[response.status] ?? `AI generation failed (${response.status}). Please try again.`;
  let code: string | undefined;
  try {
    const body = await response.json();
    if (body && typeof body.error === "string") message = body.error;
    else if (body && typeof body.message === "string") message = body.message;
    if (body && typeof body.code === "string") code = body.code;
  } catch { /* non-JSON body */ }
  const ra = Number(response.headers.get("retry-after"));
  return { message, code, retryAfterSec: Number.isFinite(ra) && ra > 0 ? ra : undefined };
}

export function useRenderEngine({
  aiEngine,
  renderResolution,
  inputMode,
  captureRef,
  depthCaptureRef,
  uploadImage = null,
}: UseRenderEngineParams): UseRenderEngineReturn {
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiErrorInfo, setAiErrorInfo] = useState<AiErrorInfo | null>(null);
  const [aiElapsed, setAiElapsed] = useState(0);
  const [aiUsedEngine, setAiUsedEngine] = useState<string | null>(null);
  const [aiEngineMeta, setAiEngineMeta] = useState<UseRenderEngineReturn["aiEngineMeta"]>(null);

  // Elapsed time ticker for AI loading
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetAiImage = useCallback(() => {
    setAiImageUrl(null);
    setAiError(null);
    setAiErrorInfo(null);
  }, []);

  const handleGenerateAiRender = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return false;

    const sanitized = sanitizePrompt(prompt, inputMode !== "text");
    const res = RENDER_RESOLUTIONS[renderResolution];
    const seed = String(Date.now());
    const tier = useAuthStore.getState().userTier;
    const maxCostUsd = getTierConfig(tier).features.maxCostUsdPerImage;

    // img2img base (BUG-ST03): the 3D canvas or the uploaded image, sent as a
    // JPEG data URI ≤1024 px (contract: MCA-DOC-AI-ENGINES-CLIENT-CONTRACT §2)
    let baseImage: string | null = null;
    let controlImage: string | null = null;
    if (inputMode !== "text") {
      const raw = inputMode === "scene" ? captureRef.current?.() ?? null : uploadImage;
      if (!raw) {
        setAiError(
          inputMode === "scene"
            ? "The 3D view is not available yet. Wait for the scene to load. / Vizualizarea 3D nu este gata."
            : "Choose an image first.",
        );
        return false;
      }
      // 5.03-A: depth of exactly the same frame, right after the RGB capture
      const rawDepth = inputMode === "scene" ? depthCaptureRef?.current?.() ?? null : null;
      baseImage = await toJpegDataUrl(raw, STORED_RENDER_MAX_SIDE, BASE_IMAGE_QUALITY);
      if (rawDepth) controlImage = await toPngDataUrl(rawDepth, STORED_RENDER_MAX_SIDE);
      isDev && console.log("[AI Render] img2img base:", inputMode, "length:", baseImage.length);
    }

    setAiError(null);
    setAiErrorInfo(null);
    setAiImageUrl(null);
    setAiUsedEngine(null);
    setAiEngineMeta(null);
    setAiLoading(true);
    setAiElapsed(0);
    // Start elapsed timer
    if (tickerRef.current) clearInterval(tickerRef.current);
    const start = Date.now();
    tickerRef.current = setInterval(() => {
      setAiElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    // 90-second timeout — abort request if no response, prevents infinite loading UX
    const AI_TIMEOUT_MS = 90_000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    try {
      let response: Response;

      if (baseImage) {
        // POST mode: send base image for img2img
        isDev && console.log("[AI Render] Using POST (img2img) mode");
        response = await fetch("/api/ai-render", {
          method: "POST",
          // Bearer token: the server resolves the tier itself (SEC-02); the session lives in localStorage
          headers: { "Content-Type": "application/json", ...(await authHeaders()) },
          body: JSON.stringify(buildImg2ImgBody({
            prompt: sanitized,
            width: res.width,
            height: res.height,
            seed,
            engine: aiEngine,
            baseImage,
            controlImage,
            maxCostUsd,
          })),
          signal: controller.signal,
        });
      } else {
        // GET mode: text-to-image
        const engineParam = aiEngine !== "auto" ? `&engine=${aiEngine}` : "";
        const proxyUrl = `/api/ai-render?prompt=${encodeURIComponent(sanitized)}&width=${res.width}&height=${res.height}&seed=${seed}${engineParam}&maxCostUsd=${maxCostUsd}`;
        isDev && console.log("[AI Render] Using GET (text-to-image):", proxyUrl.slice(0, 80) + "...");
        response = await fetch(proxyUrl, { headers: await authHeaders(), signal: controller.signal });
      }

      if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null; }

      // BUG-ST02: show the server message as is. No client-side fallback:
      // a direct image.pollinations.ai call has no auth, bypasses quota and
      // tier, returns 402, and hides the real cause.
      if (!response.ok) {
        const err = await readApiError(response);
        setAiError(err.message);
        setAiErrorInfo({ status: response.status, code: err.code, retryAfterSec: err.retryAfterSec });
        setAiLoading(false);
        return false;
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.startsWith("image/")) {
        console.error("[AI Render] Unexpected content type:", contentType);
        setAiError("Unexpected response from AI. Try again.");
        setAiLoading(false);
        return false;
      }

      const blob = await response.blob();
      isDev && console.log("[AI Render] Success! Size:", blob.size, "type:", blob.type);

      if (blob.size < 500) {
        setAiError("AI returned an empty image. Try a shorter prompt.");
        setAiLoading(false);
        return false;
      }

      const meta = engineMetaFromHeaders(response.headers, {
        requestedEngine: aiEngine,
        hadBaseImage: !!baseImage,
      });
      const usedEngine = meta.engine;
      const objectUrl = URL.createObjectURL(blob);
      setAiImageUrl(objectUrl);
      setAiUsedEngine(usedEngine);
      setAiEngineMeta({ ...meta, inputMode });
      setAiLoading(false);
      return true;
    } catch (err) {
      if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null; }
      console.error("[AI Render] Error:", err);
      if (err instanceof Error && err.name === "AbortError") {
        setAiError("AI generation timed out after 90 seconds. The engine may be overloaded — please try again or use a simpler prompt.");
      } else {
        setAiError("Network error. Please try again.");
      }
      setAiLoading(false);
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  }, [renderResolution, aiEngine, inputMode, captureRef, depthCaptureRef, uploadImage]);

  return {
    aiImageUrl,
    aiLoading,
    aiError,
    aiErrorInfo,
    aiElapsed,
    aiUsedEngine,
    aiEngineMeta,
    handleGenerateAiRender,
    resetAiImage,
  };
}
