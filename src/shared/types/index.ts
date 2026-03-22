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
