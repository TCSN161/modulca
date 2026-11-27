/**
 * Route registry entries for the structure-control engines (3.07).
 * Kept out of route.ts (file-size limit). Each entry carries:
 *   - creditId:  the creditManager budget it draws from (replicate / stability);
 *   - available: the funded gate, checked BEFORE the call, so an unfunded
 *                engine is skipped silently (no call, no failure record).
 */
import type { AiRenderEngine, EngineInfo } from "./types";
import { replicateDepthEngine, replicateCannyEngine } from "./replicateStructure";
import { stabilityStructureEngine } from "./stability";
import { STRUCTURE_ENGINES, isStructureEngineFunded, type StructureEngineId } from "./structureFunding";

export interface EngineEntry {
  fn: AiRenderEngine;
  info: EngineInfo;
  estimatedCostUsd: number;
  /** creditManager id when it differs from the engine id. */
  creditId?: string;
  /** Pre-call gate; false → skip silently. */
  available?: () => Promise<boolean>;
}

function entry(id: StructureEngineId, fn: AiRenderEngine, label: string, description: string): EngineEntry {
  return {
    fn,
    info: { id, label, description, speed: "medium" },
    estimatedCostUsd: STRUCTURE_ENGINES[id].costUsd,
    creditId: STRUCTURE_ENGINES[id].creditId,
    available: () => isStructureEngineFunded(id),
  };
}

export const STRUCTURE_ENGINE_ENTRIES: Record<StructureEngineId, EngineEntry> = {
  "replicate-depth": entry("replicate-depth", replicateDepthEngine, "Replicate FLUX Depth",
    "Paid ≈$0.025. FLUX.1 depth control: keeps the exact 3D camera and geometry."),
  "replicate-canny": entry("replicate-canny", replicateCannyEngine, "Replicate FLUX Canny",
    "Paid ≈$0.025. FLUX.1 edge control: keeps outlines, openings, furniture."),
  "stability-structure": entry("stability-structure", stabilityStructureEngine, "Stability Structure",
    "Paid ≈$0.05 (5 credits). Control Structure on the 3D capture."),
};
