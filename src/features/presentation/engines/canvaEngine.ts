"use client";

import type { PresentationEngine, ExportOptions } from "./types";

/**
 * Canva Connect API engine — premium, full visual editor.
 * Requires NEXT_PUBLIC_CANVA_API_KEY in .env.local.
 *
 * Status: NOT VIABLE — Canva API requires Enterprise plan (30+ seats, custom pricing).
 * This stub falls back to html2canvas engine which works well for our needs.
 * Our built-in @react-pdf/renderer system is the primary PDF export path.
 */
export const canvaEngine: PresentationEngine = {
  id: "canva",
  name: "Canva Editor",

  isAvailable: () => {
    return !!process.env.NEXT_PUBLIC_CANVA_API_KEY;
  },

  exportSlides: async (_slideElements: HTMLElement[], _options: ExportOptions) => {
    // TODO: Implement when Canva API key is configured
    // Steps:
    // 1. POST /v1/designs — create design from brand template
    // 2. POST /v1/autofills — fill fields with project data
    // 3. GET /v1/exports — download as PDF
    //
    // For now, fall back to html2canvas engine
    const { html2canvasEngine } = await import("./html2canvasEngine");
    return html2canvasEngine.exportSlides(_slideElements, _options);
  },
};
