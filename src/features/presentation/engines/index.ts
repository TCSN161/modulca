/**
 * Presentation Engine Registry
 *
 * Modular system — add new engines here. The first available engine is used by default.
 * Priority order: Canva (premium) > html2canvas (free fallback)
 */

export type { PresentationEngine, ExportOptions } from "./types";
export { html2canvasEngine } from "./html2canvasEngine";
export { canvaEngine } from "./canvaEngine";

import { canvaEngine } from "./canvaEngine";
import { html2canvasEngine } from "./html2canvasEngine";
import type { PresentationEngine } from "./types";

const ENGINES: PresentationEngine[] = [
  canvaEngine,
  html2canvasEngine,
];

/** Get all registered engines */
export function getAllEngines(): PresentationEngine[] {
  return ENGINES;
}

/** Get the best available engine (first available in priority order) */
export function getDefaultEngine(): PresentationEngine {
  return ENGINES.find((e) => e.isAvailable()) ?? html2canvasEngine;
}

/** Get a specific engine by ID */
export function getEngine(id: string): PresentationEngine | undefined {
  return ENGINES.find((e) => e.id === id);
}
