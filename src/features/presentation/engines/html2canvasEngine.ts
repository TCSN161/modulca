"use client";

import type { PresentationEngine, ExportOptions } from "./types";

/**
 * html2canvas + jsPDF engine — free, works offline, no API key needed.
 * Renders existing React slide DOM elements to high-quality PDF.
 */
export const html2canvasEngine: PresentationEngine = {
  id: "html2canvas",
  name: "Built-in PDF Export",

  isAvailable: () => true, // Always available — no API key needed

  exportSlides: async (slideElements: HTMLElement[], options: ExportOptions) => {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas-pro"),
      import("jspdf"),
    ]);

    const scale = options.scale ?? 2;
    const orientation = options.orientation ?? "landscape";
    const filename = options.filename ?? "ModulCA-Presentation";

    // A4 dimensions in mm
    const pageW = orientation === "landscape" ? 297 : 210;
    const pageH = orientation === "landscape" ? 210 : 297;

    const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });

    for (let i = 0; i < slideElements.length; i++) {
      const el = slideElements[i];
      if (!el) continue;

      const canvas = await html2canvas(el, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, 0, pageW, pageH);
    }

    pdf.save(`${filename}.pdf`);
  },
};
