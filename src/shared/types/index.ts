/**
 * Shared types used across all features.
 * This is the SINGLE SOURCE OF TRUTH for ModulCA business rules.
 */

/** All supported user types in the platform */
export type UserType =
  | "homeowner"       // Private homeowner (MVP primary user)
  | "commercial"      // Commercial operators (glamping, rentals)
  | "public"          // Public institutions
  | "ngo"             // NGOs and non-profits
  | "academia";       // Academic and research

/** Module room types with their visual properties */
export interface ModuleType {
  id: string;
  label: string;
  color: string;
  icon: string;
}

/** Finishing quality levels with pricing */
export interface FinishLevel {
  id: "basic" | "standard" | "premium";
  label: string;
  pricePerModule: number;
}

// ─── Business Constants ───────────────────────────────────────

export const MODULE_TYPES: ModuleType[] = [
  { id: "bedroom",  label: "Bedroom",    color: "#4A90D9", icon: "🛏️" },
  { id: "kitchen",  label: "Kitchen",    color: "#E8913A", icon: "🍳" },
  { id: "bathroom", label: "Bathroom",   color: "#2ABFBF", icon: "🛁" },
  { id: "living",   label: "Living Room", color: "#6BBF59", icon: "🛋️" },
  { id: "office",   label: "Office",     color: "#8B6DB5", icon: "💼" },
  { id: "storage",  label: "Storage",    color: "#8E99A4", icon: "📦" },
  { id: "hallway",  label: "Hallway",    color: "#D4A76A", icon: "🚪" },
  { id: "terrace",  label: "Terrace",    color: "#68B584", icon: "🌿" },
];

/** Pre-built building layouts that place multiple modules at once */
export interface BuildingPreset {
  id: string;
  label: string;
  description: string;
  category: "house" | "studio" | "cabin";
  /** Grid cells to fill: [row, col, moduleType][] */
  cells: [number, number, string][];
}

export const BUILDING_PRESETS: BuildingPreset[] = [
  // ─── Houses ────────────────────────────────────────────
  {
    id: "house-compact",
    label: "Compact House",
    description: "2BR, 1BA — Perfect starter home",
    category: "house",
    cells: [
      [0, 0, "living"],  [0, 1, "kitchen"],
      [1, 0, "bedroom"], [1, 1, "bathroom"],
    ],
  },
  {
    id: "house-family",
    label: "Family House",
    description: "3BR, 2BA + hallway — Comfortable family living",
    category: "house",
    cells: [
      [0, 0, "living"],  [0, 1, "kitchen"],  [0, 2, "terrace"],
      [1, 0, "hallway"], [1, 1, "bathroom"], [1, 2, "bedroom"],
      [2, 0, "bedroom"], [2, 1, "bedroom"],  [2, 2, "bathroom"],
    ],
  },
  {
    id: "house-lshape",
    label: "L-Shape Villa",
    description: "3BR, 2BA + office — Open plan L-layout with terrace",
    category: "house",
    cells: [
      [0, 0, "terrace"], [0, 1, "living"],  [0, 2, "kitchen"],
                          [1, 1, "hallway"], [1, 2, "bathroom"],
                          [2, 1, "bedroom"], [2, 2, "bedroom"],
                          [3, 1, "office"],  [3, 2, "bedroom"],
    ],
  },
  // ─── Studios ───────────────────────────────────────────
  {
    id: "studio-mini",
    label: "Mini Studio",
    description: "1BR all-in-one — Tiny living",
    category: "studio",
    cells: [
      [0, 0, "living"], [0, 1, "bathroom"],
    ],
  },
  {
    id: "studio-artist",
    label: "Artist Studio",
    description: "Open plan with office — Work from home",
    category: "studio",
    cells: [
      [0, 0, "office"],  [0, 1, "living"],
      [1, 0, "kitchen"], [1, 1, "bathroom"],
    ],
  },
  {
    id: "studio-loft",
    label: "Loft Studio",
    description: "Open plan with bedroom — Modern urban living",
    category: "studio",
    cells: [
      [0, 0, "living"], [0, 1, "kitchen"], [0, 2, "bedroom"],
    ],
  },
  // ─── Cabins ────────────────────────────────────────────
  {
    id: "cabin-retreat",
    label: "Mountain Retreat",
    description: "1BR cabin with terrace — Weekend getaway",
    category: "cabin",
    cells: [
      [0, 0, "terrace"],
      [1, 0, "living"],
      [2, 0, "bedroom"],
    ],
  },
  {
    id: "cabin-glamping",
    label: "Glamping Pod",
    description: "Single module — Luxury camping",
    category: "cabin",
    cells: [
      [0, 0, "bedroom"],
    ],
  },
  {
    id: "cabin-lakehouse",
    label: "Lake House",
    description: "2BR with terrace — Waterside retreat",
    category: "cabin",
    cells: [
      [0, 0, "terrace"], [0, 1, "terrace"],
      [1, 0, "living"],  [1, 1, "kitchen"],
      [2, 0, "bedroom"], [2, 1, "bedroom"],
    ],
  },
];

export const FINISH_LEVELS: FinishLevel[] = [
  { id: "basic",    label: "Basic",    pricePerModule: 6010 },
  { id: "standard", label: "Standard", pricePerModule: 9300 },
  { id: "premium",  label: "Premium",  pricePerModule: 12600 },
];

export const SHARED_WALL_DISCOUNT = 1500;    // €1,500 per shared wall
export const DESIGN_FEE_PERCENTAGE = 0.08;   // 8% design service fee
export const MODULE_EXTERIOR_SIZE = 3;       // 3m x 3m
export const MODULE_EXTERIOR_AREA = 9;       // 9m²
export const MODULE_INTERIOR_AREA = 7;       // 7m² usable
export const WALL_THICKNESS = 0.30;          // 30cm walls
