"use client";

import type { PresentationEngine, ExportOptions } from "./types";

/**
 * Canva Connect API engine — premium, full visual editor.
 * Requires NEXT_PUBLIC_CANVA_API_KEY in .env.local.
 *
 * Status: PLACEHOLDER — will be implemented when Canva API key is ready.
 * See: https://www.canva.dev/docs/connect/
 *
 * Flow:
 * 1. Create a design from template via Canva API
 * 2. Autofill template fields with project data
 * 3. Open Canva editor for user customization (or skip)
 * 4. Export finished design as PDF
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
