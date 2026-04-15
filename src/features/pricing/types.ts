/**
 * Material pricing types for ModulCA live pricing system.
 *
 * Supports live feeds from Romanian suppliers (Dedeman, Hornbach, MatHaus, etc.)
 * with graceful fallback to estimated and manual prices.
 */

import type { FinishLevel } from "@/shared/types";

// ─── Material Categories ─────────────────────────────────────

export const MATERIAL_CATEGORIES = [
  "flooring",
  "wall-finish",
  "insulation",
  "windows",
  "doors",
  "roofing",
  "plumbing",
  "electrical",
  "structure",
  "exterior-finish",
  "fasteners",
  "hvac",
] as const;

export type MaterialCategory = (typeof MATERIAL_CATEGORIES)[number];

// ─── Units ───────────────────────────────────────────────────

export const MATERIAL_UNITS = ["m2", "piece", "ml", "kg", "m3", "roll", "set"] as const;

export type MaterialUnit = (typeof MATERIAL_UNITS)[number];

// ─── Price Confidence ────────────────────────────────────────

/** How reliable the price is. "live" = scraped/API today, "estimated" = <30 days old, "manual" = user-entered or fallback */
export type PriceConfidence = "live" | "estimated" | "manual";

// ─── Core Interfaces ─────────────────────────────────────────

export interface MaterialPrice {
  id: string;
  name: string;
  nameRo: string;                   // Romanian name for supplier matching
  category: MaterialCategory;
  unit: MaterialUnit;
  priceEUR: number;
  supplier: string;                  // e.g. "Dedeman", "Hornbach", "manual"
  lastUpdated: string;               // ISO date
  confidence: PriceConfidence;
  sourceUrl: string;                 // product page URL or empty for manual
  /** Optional variant info (e.g. thickness, brand) */
  variant?: string;
  /** Whether this is the default/recommended option for its category */
  isDefault?: boolean;
}

export type PriceSourceType = "api" | "scrape" | "csv" | "manual";
export type PriceSourceStatus = "active" | "paused" | "error" | "pending";

export interface PriceSource {
  id: string;
  name: string;                      // "Dedeman", "Hornbach", etc.
  type: PriceSourceType;
  baseUrl: string;
  lastSyncedAt: string | null;       // ISO date or null if never synced
  status: PriceSourceStatus;
  /** Number of materials successfully imported from this source */
  materialCount: number;
  /** Error message if status is "error" */
  errorMessage?: string;
}

// ─── Module Cost Breakdown ───────────────────────────────────

export interface CostLineItem {
  label: string;
  materialId: string;               // references MaterialPrice.id
  quantity: number;
  unit: MaterialUnit;
  unitPrice: number;
  total: number;
  confidence: PriceConfidence;
}

export interface ModuleCostBreakdown {
  moduleType: string;                // e.g. "bedroom", "kitchen"
  finishLevel: FinishLevel["id"];
  structure: CostLineItem[];
  insulation: CostLineItem[];
  exterior: CostLineItem[];
  interior: CostLineItem[];
  windows: CostLineItem[];
  doors: CostLineItem[];
  electrical: CostLineItem[];
  plumbing: CostLineItem[];
  /** Subtotal before any discounts */
  subtotal: number;
  /** Overall confidence: the lowest confidence among all line items */
  overallConfidence: PriceConfidence;
}

export type CostSection = keyof Pick<
  ModuleCostBreakdown,
  "structure" | "insulation" | "exterior" | "interior" | "windows" | "doors" | "electrical" | "plumbing"
>;

export const COST_SECTIONS: CostSection[] = [
  "structure",
  "insulation",
  "exterior",
  "interior",
  "windows",
  "doors",
  "electrical",
  "plumbing",
];

// ─── Batch Price Updates ─────────────────────────────────────

export interface PriceUpdateItem {
  materialId: string;                // existing ID to update, or new ID to create
  name: string;
  nameRo: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  priceEUR: number;
  supplier: string;
  sourceUrl: string;
  variant?: string;
}

export interface PriceUpdate {
  sourceId: string;
  timestamp: string;                 // ISO date
  items: PriceUpdateItem[];
}

// ─── Project Estimate ────────────────────────────────────────

export interface ProjectEstimate {
  modules: ModuleCostBreakdown[];
  materialSubtotal: number;
  sharedWallDiscount: number;
  designFee: number;
  totalEstimate: number;
  currency: "EUR";
  generatedAt: string;               // ISO date
  /** Lowest confidence across all modules */
  overallConfidence: PriceConfidence;
  /** Count of prices by confidence level */
  confidenceSummary: Record<PriceConfidence, number>;
}
