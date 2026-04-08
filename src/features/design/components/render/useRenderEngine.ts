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
  aiStatusMessage: string | null;
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

/** Client-side direct engine URLs (used when proxy is unavailable, e.g. GitHub Pages static export) */
const CLIENT_FALLBACK_ENGINES: Array<{
  id: string;
  label: string;
  buildUrl: (prompt: string, width: number, height: number, seed: string) => string;
}> = [
  {
    id: "pollinations",
    label: "Pollinations AI",
    buildUrl: (prompt, width, height, seed) =>
      `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&nofeed=true&safe=true`,
  },
];

export function useRenderEngine({
  aiEngine,
  renderResolution,
  useSceneAsBase,
  captureRef,
}: UseRenderEngineParams): UseRenderEngineReturn {
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);
  const [aiElapsed, setAiElapsed] = useState(0);
  const [aiUsedEngine, setAiUsedEngine] = useState<string | null>(null);

  // Elapsed time ticker for AI loading
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTicker = () => {
    if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null; }
  };

  const resetAiImage = useCallback(() => {
    setAiImageUrl(null);
    setAiError(null);
    setAiStatusMessage(null);
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
    setAiStatusMessage(null);
    setAiLoading(true);
    setAiElapsed(0);

    // Start elapsed timer
    stopTicker();
    const start = Date.now();
    tickerRef.current = setInterval(() => {
      setAiElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    try {
      // ── Step 1: Try the proxy (handles server-side fallback automatically) ──
      const engineLabel = aiEngine === "auto" ? "best available engine" : aiEngine.replace("ai-horde", "AI Horde").replace("pollinations", "Pollinations AI").replace("leonardo", "Leonardo.ai").replace("stability", "Stability AI").replace("together", "Together.ai");
      setAiStatusMessage(`Generating with ${engineLabel}…`);

      let response: Response | null = null;

      try {
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
      } catch (fetchErr) {
        console.warn("[AI Render] Proxy fetch error:", fetchErr);
        response = null;
      }

      // ── Step 2: Handle proxy unavailable (static export: 404/405) ──
      // Fall back to client-side direct engine calls
      if (!response || response.status === 404 || response.status === 405) {
        console.warn("[AI Render] Proxy unavailable — switching to client-side direct calls");
        return await tryClientFallback(sanitized, res.width, res.height, seed);
      }

      // ── Step 3: Handle proxy errors (503 = all engines failed, 429 = rate limit) ──
      if (!response.ok) {
        const status = response.status;
        console.warn(`[AI Render] Proxy error ${status} — falling back to direct Pollinations`);

        if (status === 429) {
          setAiStatusMessage("Rate limit reached — retrying with Pollinations AI…");
        } else if (status === 503) {
          setAiStatusMessage("All engines busy — trying Pollinations AI directly…");
        } else {
          setAiStatusMessage("Server error — trying Pollinations AI directly…");
        }

        return await tryClientFallback(sanitized, res.width, res.height, seed);
      }

      // ── Step 4: Parse successful response ──
      return await parseImageResponse(response, aiEngine);

    } catch (err) {
      stopTicker();
      console.error("[AI Render] Unexpected error:", err);
      setAiError("Network error. Please try again.");
      setAiStatusMessage(null);
      setAiLoading(false);
    }

    // ── Helpers ──

    async function tryClientFallback(prompt: string, width: number, height: number, seed: string) {
      for (const engine of CLIENT_FALLBACK_ENGINES) {
        setAiStatusMessage(`Trying ${engine.label}…`);
        console.log(`[AI Render] Client fallback: ${engine.id}`);

        try {
          const url = engine.buildUrl(prompt, width, height, seed);
          const directResponse = await fetch(url);

          if (directResponse.ok) {
            const blob = await directResponse.blob();
            if (blob.size >= 500) {
              console.log(`[AI Render] ${engine.id} direct success: ${blob.size} bytes`);
              const objectUrl = URL.createObjectURL(blob);
              setAiImageUrl(objectUrl);
              setAiUsedEngine(engine.id);
              setAiStatusMessage(null);
              stopTicker();
              setAiLoading(false);
              return;
            }
            console.warn(`[AI Render] ${engine.id} returned suspiciously small image (${blob.size} bytes)`);
          } else if (directResponse.status === 429) {
            console.warn(`[AI Render] ${engine.id} rate limited (429)`);
            setAiStatusMessage(`${engine.label} is rate limited. Please wait a moment and try again.`);
          }
        } catch (err) {
          console.error(`[AI Render] ${engine.id} client fallback error:`, err);
        }
      }

      stopTicker();
      setAiError("AI generation failed. Please try again in a moment.");
      setAiStatusMessage(null);
      setAiLoading(false);
    }

    async function parseImageResponse(response: Response, engine: AiEngine) {
      const contentType = response.headers.get("content-type") || "";

      // Pollinations sometimes returns without proper content-type
      const isPollinationsDirect = response.url.includes("pollinations");
      if (!contentType.startsWith("image/") && !contentType.includes("octet-stream") && !isPollinationsDirect) {
        console.error("[AI Render] Unexpected content type:", contentType);
        setAiError("Unexpected response from AI. Try again.");
        setAiStatusMessage(null);
        stopTicker();
        setAiLoading(false);
        return;
      }

      const blob = await response.blob();
      console.log("[AI Render] Success! Size:", blob.size, "type:", blob.type);

      if (blob.size < 500) {
        setAiError("AI returned an empty image. Try a shorter prompt.");
        setAiStatusMessage(null);
        stopTicker();
        setAiLoading(false);
        return;
      }

      const usedEngine = response.headers.get("x-ai-engine") || (isPollinationsDirect ? "pollinations" : engine);
      const objectUrl = URL.createObjectURL(blob);
      setAiImageUrl(objectUrl);
      setAiUsedEngine(usedEngine);
      setAiStatusMessage(null);
      stopTicker();
      setAiLoading(false);
    }
  }, [renderResolution, aiEngine, useSceneAsBase, captureRef]);

  return {
    aiImageUrl,
    aiLoading,
    aiError,
    aiStatusMessage,
    aiElapsed,
    aiUsedEngine,
    handleGenerateAiRender,
    resetAiImage,
  };
}
