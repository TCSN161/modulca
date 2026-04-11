/**
 * Profile → Suggested Module Count & Layout
 *
 * Takes the computed ArchitecturalProfile and suggests a ModulCA
 * module configuration (count, layout shape, floor count).
 */

import type { ArchitecturalProfile } from "../../_types";

export type LayoutShape = "line" | "L-shape" | "T-shape" | "U-shape" | "courtyard" | "compact";

export interface ModuleEstimate {
  /** Total module count */
  modules: number;
  /** Gross area (modules × 9m²) */
  grossArea: number;
  /** Estimated usable area (~78% of gross) */
  usableArea: number;
  /** Recommended layout shape */
  layoutShape: LayoutShape;
  /** Number of floors */
  floors: 1 | 2;
  /** Ground floor modules */
  groundFloorModules: number;
  /** Upper floor modules (0 if single story) */
  upperFloorModules: number;
  /** Estimated budget range */
  budgetRange: { min: number; max: number; currency: string };
  /** Human-readable summary */
  summary: string;
}

/** Layout shape thresholds — depends on module count */
function recommendLayout(modules: number, floors: 1 | 2): LayoutShape {
  const perFloor = floors === 2 ? Math.ceil(modules / 2) : modules;

  if (perFloor <= 3) return "line";
  if (perFloor <= 5) return "L-shape";
  if (perFloor <= 7) return "T-shape";
  if (perFloor <= 10) return "U-shape";
  return "courtyard";
}

/** Budget ranges per m² by style profile */
const BUDGET_PER_SQM: Record<string, { min: number; max: number }> = {
  "modern-minimalist": { min: 1400, max: 1800 },
  "warm-organic": { min: 1300, max: 1700 },
  "scandinavian-functional": { min: 1200, max: 1600 },
  "industrial-loft": { min: 1200, max: 1600 },
  "traditional-romanian": { min: 1000, max: 1400 },
  "biophilic-nature": { min: 1500, max: 2000 },
  "eclectic-mixed": { min: 1200, max: 1800 },
};

const DEFAULT_BUDGET = { min: 1200, max: 1600 };

/**
 * Generate a module estimate from a computed profile.
 */
export function estimateFromProfile(profile: ArchitecturalProfile): ModuleEstimate {
  const modules = profile.estimatedModules;
  const floors: 1 | 2 = modules > 8 ? 2 : 1;
  const groundFloorModules = floors === 2 ? Math.ceil(modules / 2) : modules;
  const upperFloorModules = floors === 2 ? modules - groundFloorModules : 0;
  const layoutShape = recommendLayout(modules, floors);
  const grossArea = modules * 9;
  const usableArea = Math.round(modules * 7);

  const budgetRef = BUDGET_PER_SQM[profile.primaryStyle] ?? DEFAULT_BUDGET;
  const budgetRange = {
    min: Math.round(budgetRef.min * grossArea / 100) * 100,
    max: Math.round(budgetRef.max * grossArea / 100) * 100,
    currency: profile.budgetRange.currency || "EUR",
  };

  const floorText = floors === 2 ? `2 floors (${groundFloorModules} ground + ${upperFloorModules} upper)` : "single story";
  const summary = `${modules} modules · ${grossArea}m² gross (${usableArea}m² usable) · ${layoutShape} layout · ${floorText} · €${(budgetRange.min / 1000).toFixed(0)}K–€${(budgetRange.max / 1000).toFixed(0)}K estimated`;

  return {
    modules,
    grossArea,
    usableArea,
    layoutShape,
    floors,
    groundFloorModules,
    upperFloorModules,
    budgetRange,
    summary,
  };
}

/**
 * Quick estimate from just household size and budget preference.
 * Used before full quiz is completed.
 */
export function quickEstimate(
  householdSize: number,
  budgetLevel: "economy" | "standard" | "premium"
): { modules: number; layout: LayoutShape; area: string } {
  // Base: 2 modules per person, min 3
  let modules = Math.max(3, householdSize * 2);

  // Adjust by budget
  if (budgetLevel === "economy") modules = Math.max(3, modules - 1);
  if (budgetLevel === "premium") modules += 2;

  const layout = recommendLayout(modules, modules > 8 ? 2 : 1);
  const area = `${modules * 9}m² gross (~${modules * 7}m² usable)`;

  return { modules, layout, area };
}
