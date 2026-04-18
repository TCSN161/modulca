/**
 * RendersSlide — one render per page with in-slide pagination.
 *
 * Each render fills the slide with a large preview so clients can clearly
 * see the design. Prev/next arrows + indicator (e.g. "3 of 7") let the user
 * flip through all saved renders without leaving the slide.
 *
 * Keyboard shortcuts: ← and → to navigate within the slide.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { SlideCard, SlideHeader } from "./shared";
import type { SlideContext } from "./types";

export interface RenderEntry {
  id: string;
  imageUrl: string;
  label: string;
  description?: string;
  engine?: string;
  resolution?: string;
  mode?: "img2img" | "text2img";
}

export interface RendersSlideProps extends SlideContext {
  slideNumber: number;
  renders: RenderEntry[];
}

export default function RendersSlide(props: RendersSlideProps) {
  const { template: tmpl, slideNumber, renders } = props;
  const [activeIdx, setActiveIdx] = useState(0);

  const total = renders.length;
  const current = renders[activeIdx];

  const goPrev = useCallback(() => {
    setActiveIdx((i) => (i === 0 ? total - 1 : i - 1));
  }, [total]);

  const goNext = useCallback(() => {
    setActiveIdx((i) => (i + 1) % total);
  }, [total]);

  // Keyboard navigation — only active when this slide is visible
  useEffect(() => {
    if (total <= 1) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [total, goPrev, goNext]);

  // If savedRenders changes and activeIdx goes out of range, reset
  useEffect(() => {
    if (activeIdx >= total && total > 0) setActiveIdx(0);
  }, [total, activeIdx]);

  // Empty state
  if (total === 0) {
    return (
      <SlideCard bg={tmpl.bg} text={tmpl.text}>
        <SlideHeader accent={tmpl.accent} text={tmpl.text} number={slideNumber} title="AI Renders" />
        <div className="mt-6 text-center">
          <div className="rounded-xl overflow-hidden bg-gray-200 aspect-video flex items-center justify-center mb-4">
            <p className="text-sm text-gray-500">Save renders from Step 8 to see them here</p>
          </div>
          <p className="text-xs" style={{ color: tmpl.text, opacity: 0.4 }}>
            Use the &quot;Save to Presentation&quot; button in the Render step
          </p>
        </div>
      </SlideCard>
    );
  }

  return (
    <SlideCard bg={tmpl.bg} text={tmpl.text}>
      <SlideHeader
        accent={tmpl.accent}
        text={tmpl.text}
        number={slideNumber}
        title={total > 1 ? `AI Renders · ${activeIdx + 1} of ${total}` : "AI Renders"}
      />

      {/* Large single-render display */}
      <div
        className="relative mt-4 rounded-xl overflow-hidden border"
        style={{ borderColor: tmpl.text + "20" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.imageUrl}
          alt={current.label}
          className="w-full aspect-[16/10] object-cover"
        />

        {/* Prev/Next controls overlay (only if >1 render) */}
        {total > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
              aria-label="Previous render"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
              aria-label="Next render"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Current render metadata */}
      <div className="mt-4">
        <p className="text-base font-semibold" style={{ color: tmpl.text }}>
          {current.label}
        </p>
        {current.description && (
          <p className="text-sm leading-relaxed mt-1" style={{ color: tmpl.text, opacity: 0.7 }}>
            {current.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {current.engine && (
            <span className="text-xs" style={{ color: tmpl.text, opacity: 0.5 }}>
              Engine: <strong>{current.engine}</strong>
            </span>
          )}
          {current.resolution && (
            <span className="text-xs" style={{ color: tmpl.text, opacity: 0.5 }}>
              Resolution: <strong>{current.resolution}</strong>
            </span>
          )}
          {current.mode && (
            <span
              className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
              style={{ backgroundColor: tmpl.accent + "20", color: tmpl.accent }}
            >
              {current.mode === "img2img" ? "3D+AI (img2img)" : "Text-to-Image"}
            </span>
          )}
        </div>
      </div>

      {/* Thumbnail strip — clickable dots + mini-previews for fast navigation */}
      {total > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
          {renders.map((r, idx) => {
            const active = idx === activeIdx;
            return (
              <button
                key={r.id}
                onClick={() => setActiveIdx(idx)}
                className={`relative rounded-md overflow-hidden transition-all ${
                  active ? "ring-2 ring-offset-2 scale-105" : "opacity-60 hover:opacity-100"
                }`}
                style={{
                  width: 48,
                  height: 30,
                  ...(active ? { ["--tw-ring-color" as string]: tmpl.accent } : {}),
                }}
                aria-label={`Go to render ${idx + 1}: ${r.label}`}
                title={r.label}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.imageUrl} alt={r.label} className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      )}

      {/* Helper hint */}
      {total > 1 && (
        <p className="text-[10px] text-center mt-2" style={{ color: tmpl.text, opacity: 0.3 }}>
          Use ← → arrow keys or click thumbnails to navigate
        </p>
      )}
    </SlideCard>
  );
}
