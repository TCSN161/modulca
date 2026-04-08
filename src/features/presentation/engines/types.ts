/**
 * Presentation Engine Abstraction
 *
 * Modular interface so we can swap between export engines:
 *  - html2canvas + jsPDF (free, works offline)
 *  - Canva Connect API (premium, full editor)
 *  - react-design-editor (future, visual editing)
 *
 * Each engine implements PresentationEngine.
 */

export interface ExportOptions {
  /** Output format */
  format: "pdf" | "png" | "jpg";
  /** Scale factor for quality (1 = screen, 2 = print, 3 = high-res) */
  scale?: number;
  /** A4 paper in landscape or portrait */
  orientation?: "portrait" | "landscape";
  /** Filename without extension */
  filename?: string;
}

export interface PresentationEngine {
  /** Unique engine identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Whether this engine is available (API key set, etc.) */
  isAvailable: () => boolean;
  /** Export slides from DOM elements to PDF/image */
  exportSlides: (
    slideElements: HTMLElement[],
    options: ExportOptions,
  ) => Promise<void>;
}
