import { useState, useRef, useCallback } from "react";
import type { AiEngine, RenderResolution } from "./renderConstants";
import { RENDER_RESOLUTIONS } from "./renderConstants";

interface UseRenderEngineParams {
  aiEngine: AiEngine;
  renderResolution: RenderResolution;
  useSceneAsBase: boolean;
  captureRef: React.MutableRefObject<(() => string | null) | null>;
}

interface UseRenderEngineReturn {
  aiImageUrl: string | null;
  aiLoading: boolean;
  aiError: string | null;
  aiElapsed: number;
  aiUsedEngine: string | null;
  handleGenerateAiRender: (prompt: string) => Promise<void>;
  resetAiImage: () => void;
}

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
  useSceneAsBase,
  captureRef,
}: UseRenderEngineParams): UseRenderEngineReturn {
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiElapsed, setAiElapsed] = useState(0);
  const [aiUsedEngine, setAiUsedEngine] = useState<string | null>(null);

  // Elapsed time ticker for AI loading
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetAiImage = useCallback(() => {
    setAiImageUrl(null);
    setAiError(null);
  }, []);

  const handleGenerateAiRender = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    const sanitized = sanitizePrompt(prompt);
    const res = RENDER_RESOLUTIONS[renderResolution];
    const seed = String(Date.now());

    // Capture 3D scene as base image if img2img is enabled
    let baseImage: string | null = null;
    if (useSceneAsBase && captureRef.current) {
      const dataUrl = captureRef.current();
      if (dataUrl) {
        // Extract base64 from data URL (remove "data:image/png;base64," prefix)
        baseImage = dataUrl.replace(/^data:image\/\w+;base64,/, "");
        console.log("[AI Render] Captured 3D scene for img2img, base64 length:", baseImage.length);
      }
    }

    setAiError(null);
    setAiImageUrl(null);
    setAiUsedEngine(null);
    setAiLoading(true);
    setAiElapsed(0);
    // Start elapsed timer
    if (tickerRef.current) clearInterval(tickerRef.current);
    const start = Date.now();
    tickerRef.current = setInterval(() => {
      setAiElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    try {
      let response: Response;

      if (baseImage) {
        // POST mode: send base image for img2img
        console.log("[AI Render] Using POST (img2img) mode");
        response = await fetch("/api/ai-render", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: sanitized,
            width: res.width,
            height: res.height,
            seed,
            engine: aiEngine !== "auto" ? aiEngine : null,
            baseImage,
          }),
        });
      } else {
        // GET mode: text-to-image
        const engineParam = aiEngine !== "auto" ? `&engine=${aiEngine}` : "";
        const proxyUrl = `/api/ai-render?prompt=${encodeURIComponent(sanitized)}&width=${res.width}&height=${res.height}&seed=${seed}${engineParam}`;
        console.log("[AI Render] Using GET (text-to-image):", proxyUrl.slice(0, 80) + "...");
        response = await fetch(proxyUrl);
      }

      if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null; }

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
          return;
        }
        if (!response.ok) {
          setAiError(`AI generation failed (${response.status}). Try again or use a simpler prompt.`);
          setAiLoading(false);
          return;
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
        return;
      }

      const blob = await response.blob();
      console.log("[AI Render] Success! Size:", blob.size, "type:", blob.type);

      if (blob.size < 500) {
        setAiError("AI returned an empty image. Try a shorter prompt.");
        setAiLoading(false);
        return;
      }

      const usedEngine = response.headers.get("x-ai-engine") || (response.url.includes("pollinations") ? "pollinations" : aiEngine);
      const objectUrl = URL.createObjectURL(blob);
      setAiImageUrl(objectUrl);
      setAiUsedEngine(usedEngine);
      setAiLoading(false);
    } catch (err) {
      if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null; }
      console.error("[AI Render] Error:", err);
      setAiError("Network error. Please try again.");
      setAiLoading(false);
    }
  }, [renderResolution, aiEngine, useSceneAsBase, captureRef]);

  return {
    aiImageUrl,
    aiLoading,
    aiError,
    aiElapsed,
    aiUsedEngine,
    handleGenerateAiRender,
    resetAiImage,
  };
}
