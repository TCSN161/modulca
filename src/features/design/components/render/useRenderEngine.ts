import { useState, useRef, useCallback } from "react";
import type { AiEngine, RenderInputMode, RenderResolution } from "./renderConstants";
import { RENDER_RESOLUTIONS } from "./renderConstants";
import { useAuthStore } from "@/features/auth/store";
import { getTierConfig } from "@/features/auth/types";
import { authHeaders } from "@/shared/lib/authHeaders";
import { engineMetaFromHeaders, type EngineMeta } from "./engineMeta";
import { toJpegDataUrl, BASE_IMAGE_QUALITY, STORED_RENDER_MAX_SIDE } from "./renderImage";

interface UseRenderEngineParams {
  aiEngine: AiEngine;
  renderResolution: RenderResolution;
  /** text = GET text2img; scene / upload = POST img2img with a base image (BUG-ST03) */
  inputMode: RenderInputMode;
  captureRef: React.MutableRefObject<(() => string | null) | null>;
  /** Data URI of the uploaded image (inputMode "upload") */
  uploadImage?: string | null;
}

interface UseRenderEngineReturn {
  aiImageUrl: string | null;
  aiLoading: boolean;
  aiError: string | null;
  aiElapsed: number;
  aiUsedEngine: string | null;
  /** Engine + failed engines of the last image, and the input it was made from (BUG-ST29) */
  aiEngineMeta: (EngineMeta & { inputMode: RenderInputMode }) | null;
  /** Resolves true when an image was produced */
  handleGenerateAiRender: (prompt: string) => Promise<boolean>;
  resetAiImage: () => void;
}

const isDev = process.env.NODE_ENV === "development";

/** Build sanitized prompt with architectural context to avoid API false-positive content filters */
function sanitizePrompt(prompt: string): string {
  const cleaned = prompt
    .trim()
    .replace(/[^\w\s,.\-!?']/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 300);
  // Prefix with explicit architectural context to reduce content-filter false positives
  return `architectural interior design visualization, empty furnished room, ${cleaned}`;
}

export function useRenderEngine({
  aiEngine,
  renderResolution,
  inputMode,
  captureRef,
  uploadImage = null,
}: UseRenderEngineParams): UseRenderEngineReturn {
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiElapsed, setAiElapsed] = useState(0);
  const [aiUsedEngine, setAiUsedEngine] = useState<string | null>(null);
  const [aiEngineMeta, setAiEngineMeta] = useState<UseRenderEngineReturn["aiEngineMeta"]>(null);

  // Elapsed time ticker for AI loading
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetAiImage = useCallback(() => {
    setAiImageUrl(null);
    setAiError(null);
  }, []);

  const handleGenerateAiRender = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return false;

    const sanitized = sanitizePrompt(prompt);
    const res = RENDER_RESOLUTIONS[renderResolution];
    const seed = String(Date.now());
    const tier = useAuthStore.getState().userTier;
    const maxCostUsd = getTierConfig(tier).features.maxCostUsdPerImage;

    // img2img base (BUG-ST03): the 3D canvas or the uploaded image, sent as a
    // JPEG data URI ≤1024 px (contract: MCA-DOC-AI-ENGINES-CLIENT-CONTRACT §2)
    let baseImage: string | null = null;
    if (inputMode !== "text") {
      const raw = inputMode === "scene" ? captureRef.current?.() ?? null : uploadImage;
      if (!raw) {
        setAiError(
          inputMode === "scene"
            ? "The 3D view is not available. Switch to Single Module and wait for the scene to load."
            : "Choose an image first.",
        );
        return false;
      }
      baseImage = await toJpegDataUrl(raw, STORED_RENDER_MAX_SIDE, BASE_IMAGE_QUALITY);
      isDev && console.log("[AI Render] img2img base:", inputMode, "length:", baseImage.length);
    }

    setAiError(null);
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
          body: JSON.stringify({
            prompt: sanitized,
            width: res.width,
            height: res.height,
            seed,
            // The img2img chain puts cloudflare-klein first for every tier
            engine: null,
            baseImage,
            maxCostUsd,
          }),
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

      // Quota exhausted: show the server message, never bypass the quota via Pollinations
      if (response.status === 429) {
        let message = "Daily render limit reached for your plan. Try again tomorrow or upgrade.";
        try {
          const body = await response.json();
          if (body && typeof body.message === "string") message = body.message;
          else if (body && typeof body.error === "string") message = body.error;
        } catch { /* non-JSON body */ }
        setAiError(message);
        setAiLoading(false);
        return false;
      }

      // If proxy failed (503, static export, etc.), try direct client-side Pollinations call
      if (!response.ok) {
        console.warn("[AI Render] Proxy error:", response.status, "— falling back to direct Pollinations call");
        const directUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(sanitized)}?width=${res.width}&height=${res.height}&seed=${seed}&nologo=true&safe=true`;
        try {
          response = await fetch(directUrl);
        } catch (directErr) {
          console.error("[AI Render] Direct Pollinations also failed:", directErr);
          setAiError(`AI generation failed (${response.status}). Try again or use a simpler prompt.`);
          setAiLoading(false);
          return false;
        }
        if (!response.ok) {
          setAiError(`AI generation failed (${response.status}). Try again or use a simpler prompt.`);
          setAiLoading(false);
          return false;
        }
      }

      const contentType = response.headers.get("content-type") || "";
      // Direct Pollinations returns image/* or may vary — accept any image type
      if (!contentType.startsWith("image/") && !contentType.includes("octet-stream") && response.url.includes("pollinations")) {
        // Pollinations usually returns image even without proper content type — try blob anyway
        console.warn("[AI Render] Non-image content-type, but Pollinations — trying blob anyway");
      } else if (!contentType.startsWith("image/")) {
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
        requestedEngine: baseImage ? null : aiEngine,
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
  }, [renderResolution, aiEngine, inputMode, captureRef, uploadImage]);

  return {
    aiImageUrl,
    aiLoading,
    aiError,
    aiElapsed,
    aiUsedEngine,
    aiEngineMeta,
    handleGenerateAiRender,
    resetAiImage,
  };
}
