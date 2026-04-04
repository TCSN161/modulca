"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDesignStore, type ModuleConfig } from "../../store";
import { MODULE_TYPES } from "@/shared/types";
import TechnicalDrawing from "./TechnicalDrawing";
import { findDrawingSvg, downloadPdf } from "./exportDrawing";

/**
 * Full-screen slideshow of all technical drawings for all modules.
 * Similar to PresentationPage (Step 12) but focused only on technical drawings.
 */

const DRAWING_TYPES = [
  { id: "floor-plan", label: "Floor Plan" },
  { id: "section-aa", label: "Section A-A" },
  { id: "front-elevation", label: "Front Elevation" },
  { id: "wall-detail", label: "Wall Detail" },
  { id: "mep-plan", label: "MEP Plan" },
  { id: "foundation-detail", label: "Foundation Detail" },
];

interface Slide {
  module: ModuleConfig;
  drawingType: string;
  drawingLabel: string;
  moduleLabel: string;
  moduleColor: string;
}

function buildSlides(modules: ModuleConfig[]): Slide[] {
  const slides: Slide[] = [];
  for (const mod of modules) {
    const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
    for (const dt of DRAWING_TYPES) {
      slides.push({
        module: mod,
        drawingType: dt.id,
        drawingLabel: dt.label,
        moduleLabel: mod.label,
        moduleColor: mt?.color || "#888",
      });
    }
  }
  return slides;
}

export default function DrawingPresentation({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const modules = useDesignStore((s) => s.modules);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const drawingRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = buildSlides(modules);
  const total = slides.length;
  const slide = slides[currentIndex] ?? null;

  // Reset index when opening
  useEffect(() => {
    if (open) setCurrentIndex(0);
  }, [open]);

  // Auto-play timer
  useEffect(() => {
    if (isAutoPlay && open) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((i) => (i + 1 < total ? i + 1 : 0));
      }, 4000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlay, open, total]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrentIndex((i) => Math.min(i + 1, total - 1));
        setIsAutoPlay(false);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((i) => Math.max(i - 1, 0));
        setIsAutoPlay(false);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, total, onClose]);

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(idx);
    setIsAutoPlay(false);
  }, []);

  const handleExportAll = useCallback(async () => {
    // Export current slide as PDF
    const svg = findDrawingSvg(drawingRef.current);
    if (!svg) return;
    const label = slide ? `${slide.moduleLabel}-${slide.drawingType}` : "drawing";
    await downloadPdf(svg, `MCA-${label}.pdf`);
  }, [slide]);

  if (!open || !slide) return null;

  // Group slides by module for the thumbnail strip
  const moduleGroups: { label: string; color: string; startIdx: number; count: number }[] = [];
  let idx = 0;
  for (const mod of modules) {
    const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
    moduleGroups.push({
      label: mod.label,
      color: mt?.color || "#888",
      startIdx: idx,
      count: DRAWING_TYPES.length,
    });
    idx += DRAWING_TYPES.length;
  }

  const currentModuleGroupIdx = moduleGroups.findIndex(
    (g) => currentIndex >= g.startIdx && currentIndex < g.startIdx + g.count
  );
  const drawingWithinModule = currentIndex - (moduleGroups[currentModuleGroupIdx]?.startIdx ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-gray-900/95 border-b border-gray-700 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div>
            <h2 className="text-sm font-bold text-white">Technical Drawing Set</h2>
            <p className="text-[10px] text-gray-400">
              {slide.moduleLabel} &mdash; {slide.drawingLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Slide counter */}
          <span className="text-xs text-gray-400 font-medium mr-2">
            {currentIndex + 1} / {total}
          </span>

          {/* Auto-play toggle */}
          <button
            onClick={() => setIsAutoPlay((v) => !v)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              isAutoPlay
                ? "bg-brand-amber-500 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {isAutoPlay ? "Pause" : "Auto Play"}
          </button>

          {/* Export current */}
          <button
            onClick={handleExportAll}
            className="rounded-lg bg-brand-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-amber-600 transition-colors"
          >
            Export PDF
          </button>
        </div>
      </header>

      {/* Module tabs */}
      <div className="flex items-center gap-1 px-4 md:px-6 py-2 bg-gray-800/80 overflow-x-auto">
        {moduleGroups.map((group, gi) => (
          <button
            key={gi}
            onClick={() => goTo(group.startIdx)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              gi === currentModuleGroupIdx
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            }`}
          >
            <div
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: group.color }}
            />
            {group.label}
          </button>
        ))}
      </div>

      {/* Drawing type sub-tabs */}
      <div className="flex items-center gap-1 px-4 md:px-6 py-1.5 bg-gray-800/50 overflow-x-auto">
        {DRAWING_TYPES.map((dt, di) => {
          const slideIdx = (moduleGroups[currentModuleGroupIdx]?.startIdx ?? 0) + di;
          return (
            <button
              key={dt.id}
              onClick={() => goTo(slideIdx)}
              className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                di === drawingWithinModule
                  ? "bg-brand-teal-800 text-white"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              {dt.label}
            </button>
          );
        })}
      </div>

      {/* Main drawing area */}
      <main className="flex-1 overflow-auto flex items-center justify-center p-4 md:p-8 relative">
        <div
          ref={drawingRef}
          className="bg-white rounded-sm shadow-2xl"
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          <TechnicalDrawing
            module={slide.module}
            drawingType={slide.drawingType}
            projectName="ModulCA Project"
          />
        </div>

        {/* Navigation arrows */}
        {currentIndex > 0 && (
          <button
            onClick={() => goTo(currentIndex - 1)}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white/80 hover:bg-black/60 hover:text-white flex items-center justify-center transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {currentIndex < total - 1 && (
          <button
            onClick={() => goTo(currentIndex + 1)}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white/80 hover:bg-black/60 hover:text-white flex items-center justify-center transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </main>

      {/* Bottom progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-gradient-to-r from-brand-teal-800 to-brand-amber-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>

      {/* Keyboard hint */}
      <div className="flex items-center justify-center py-2 bg-gray-900 border-t border-gray-800">
        <span className="text-[10px] text-gray-500">
          Use <kbd className="px-1 py-0.5 rounded bg-gray-800 text-gray-400 text-[9px] font-mono">&#8592;</kbd>{" "}
          <kbd className="px-1 py-0.5 rounded bg-gray-800 text-gray-400 text-[9px] font-mono">&#8594;</kbd> to navigate
          &nbsp;&middot;&nbsp;
          <kbd className="px-1 py-0.5 rounded bg-gray-800 text-gray-400 text-[9px] font-mono">ESC</kbd> to close
        </span>
      </div>
    </div>
  );
}
