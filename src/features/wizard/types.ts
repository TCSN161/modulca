/**
 * Wizard Auto-Configurator Types
 * ──────────────────────────────
 * Pure interfaces — no imports from React or stores.
 * Used by generator.ts (pure logic) and store.ts (Zustand).
 */

import type { FinishLevelId, StyleDirectionId, ModuleConfig } from "@/features/design/store";

/** Input for the wizard — either from quiz profile or quick questions */
export interface WizardInput {
  /** Number of people living in the house (1-8+) */
  householdSize: number;
  /** Budget level determines finish quality and module count flexibility */
  budgetLevel: "tight" | "moderate" | "generous";
  /** Preferred design style — maps to StyleDirectionId */
  stylePreference: StyleDirectionId;
  /** Number of floors (future: 2-story modules) */
  floors: 1 | 2;
  /** Optional priority rooms the user specifically wants */
  priorityRooms?: string[];
  /** Optional: user wants a terrace */
  wantsTerrace?: boolean;
  /** Optional: user wants a home office */
  wantsOffice?: boolean;
}

/** Room allocation computed from WizardInput */
export interface RoomAllocation {
  bedrooms: number;
  bathrooms: number;
  living: number;
  kitchen: number;
  office: number;
  hallway: number;
  terrace: number;
  storage: number;
  totalModules: number;
}

/** Layout shape determines how modules are arranged on the grid */
export type LayoutShape = "line" | "L-shape" | "T-shape" | "U-shape" | "compact";

/** The complete auto-generated design */
export interface GeneratedDesign {
  /** Module configurations ready to push into design store */
  modules: ModuleConfig[];
  /** Finish level based on budget */
  finishLevel: FinishLevelId;
  /** Style direction from input */
  styleDirection: NonNullable<StyleDirectionId>;
  /** Layout shape used */
  layoutShape: LayoutShape;
  /** Room allocation breakdown */
  rooms: RoomAllocation;
  /** Estimated total cost in EUR */
  estimatedCost: number;
  /** Human-readable description of the generated design */
  description: string;
}
