"use client";

import { create } from "zustand";
import {
  SHARED_WALL_DISCOUNT,
  DESIGN_FEE_PERCENTAGE,
} from "@/shared/types";
import type {
  MaterialPrice,
  PriceSource,
  PriceConfidence,
  ModuleCostBreakdown,
  CostLineItem,
  CostSection,
  ProjectEstimate,
  PriceUpdate,
  MaterialCategory,
  MaterialUnit,
} from "./types";
import { COST_SECTIONS, MATERIAL_CATEGORIES, MATERIAL_UNITS } from "./types";
import {
  FALLBACK_PRICES,
  DEFAULT_PRICE_SOURCES,
  getModuleBOM,
} from "./fallback-prices";

// ─── Constants ───────────────────────────────────────────────

const STORE_KEY = "modulca-pricing";
const STORE_VERSION = 1;

/** Prices older than this (ms) are downgraded from "live" to "estimated" */
const LIVE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours
/** Prices older than this (ms) are downgraded from "estimated" to "manual" */
const ESTIMATED_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ─── Confidence Logic ────────────────────────────────────────

const CONFIDENCE_RANK: Record<PriceConfidence, number> = {
  live: 3,
  estimated: 2,
  manual: 1,
};

function effectiveConfidence(price: MaterialPrice): PriceConfidence {
  const age = Date.now() - new Date(price.lastUpdated).getTime();
  if (price.confidence === "live" && age > LIVE_THRESHOLD_MS) return "estimated";
  if (price.confidence === "estimated" && age > ESTIMATED_THRESHOLD_MS) return "manual";
  return price.confidence;
}

function lowestConfidence(items: CostLineItem[]): PriceConfidence {
  if (items.length === 0) return "manual";
  let min: PriceConfidence = "live";
  for (const item of items) {
    if (CONFIDENCE_RANK[item.confidence] < CONFIDENCE_RANK[min]) {
      min = item.confidence;
    }
  }
  return min;
}

// ─── Store Interface ─────────────────────────────────────────

interface PricingStore {
  /** All known material prices (fallback + imported + live) */
  materialPrices: Map<string, MaterialPrice>;
  /** Configured price data sources */
  priceSources: PriceSource[];
  /** Last full sync timestamp (ISO) */
  lastSync: string | null;

  // ── Queries ──────────────────────────────────────────────
  /** Get best available price for a material, preferring live > estimated > manual */
  getPriceForMaterial: (materialId: string) => MaterialPrice | undefined;
  /** Get all prices in a category */
  getPricesForCategory: (category: MaterialCategory) => MaterialPrice[];
  /** Compute detailed cost breakdown for a single module */
  getModuleCost: (
    moduleType: string,
    finishLevel: "basic" | "standard" | "premium",
  ) => ModuleCostBreakdown;
  /** Full project estimate from an array of modules */
  getEstimateForProject: (
    modules: Array<{ moduleType: string }>,
    finishLevel: "basic" | "standard" | "premium",
    sharedWalls: number,
  ) => ProjectEstimate;

  // ── Mutations ────────────────────────────────────────────
  /** Import prices from CSV string (header row: id,name,nameRo,category,unit,priceEUR,supplier,sourceUrl,variant) */
  importFromCSV: (csvData: string) => { imported: number; errors: string[] };
  /** Apply a batch price update from an external source */
  applyPriceUpdate: (update: PriceUpdate) => void;
  /** Manually set a single price */
  setPrice: (price: MaterialPrice) => void;
  /** Update a price source status */
  updatePriceSource: (sourceId: string, patch: Partial<PriceSource>) => void;

  // ── Persistence ──────────────────────────────────────────
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

// ─── CSV Parser ──────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function isValidCategory(v: string): v is MaterialCategory {
  return (MATERIAL_CATEGORIES as readonly string[]).includes(v);
}

function isValidUnit(v: string): v is MaterialUnit {
  return (MATERIAL_UNITS as readonly string[]).includes(v);
}

// ─── Store Implementation ────────────────────────────────────

export const usePricingStore = create<PricingStore>((set, get) => {
  // Initialize with fallback prices
  const initialPrices = new Map<string, MaterialPrice>();
  for (const p of FALLBACK_PRICES) {
    initialPrices.set(p.id, p);
  }

  return {
    materialPrices: initialPrices,
    priceSources: [...DEFAULT_PRICE_SOURCES],
    lastSync: null,

    // ── Queries ────────────────────────────────────────────

    getPriceForMaterial: (materialId) => {
      const { materialPrices } = get();
      const price = materialPrices.get(materialId);
      if (!price) return undefined;
      // Return with effective confidence
      return { ...price, confidence: effectiveConfidence(price) };
    },

    getPricesForCategory: (category) => {
      const { materialPrices } = get();
      const results: MaterialPrice[] = [];
      materialPrices.forEach((p) => {
        if (p.category === category) {
          results.push({ ...p, confidence: effectiveConfidence(p) });
        }
      });
      return results.sort((a, b) => a.priceEUR - b.priceEUR);
    },

    getModuleCost: (moduleType, finishLevel) => {
      const { materialPrices } = get();
      const bom = getModuleBOM(moduleType, finishLevel);

      const sectionItems: Record<CostSection, CostLineItem[]> = {
        structure: [],
        insulation: [],
        exterior: [],
        interior: [],
        windows: [],
        doors: [],
        electrical: [],
        plumbing: [],
      };

      if (bom) {
        for (const [materialId, quantity] of Object.entries(bom.items)) {
          const mat = materialPrices.get(materialId);
          if (!mat) continue;

          const confidence = effectiveConfidence(mat);
          const total = mat.priceEUR * quantity;
          const lineItem: CostLineItem = {
            label: mat.name,
            materialId,
            quantity,
            unit: mat.unit,
            unitPrice: mat.priceEUR,
            total,
            confidence,
          };

          // Route to the right section based on material category
          const section = categoryToSection(mat.category);
          if (section) {
            sectionItems[section].push(lineItem);
          }
        }
      }

      const allItems = COST_SECTIONS.flatMap((s) => sectionItems[s]);
      const subtotal = allItems.reduce((sum, item) => sum + item.total, 0);

      return {
        moduleType,
        finishLevel,
        ...sectionItems,
        subtotal,
        overallConfidence: lowestConfidence(allItems),
      };
    },

    getEstimateForProject: (modules, finishLevel, sharedWalls) => {
      const { getModuleCost } = get();

      const breakdowns = modules.map((m) =>
        getModuleCost(m.moduleType, finishLevel),
      );

      const materialSubtotal = breakdowns.reduce(
        (sum, b) => sum + b.subtotal,
        0,
      );
      const discount = sharedWalls * SHARED_WALL_DISCOUNT;
      const subtotalAfterDiscount = materialSubtotal - discount;
      const designFee = subtotalAfterDiscount * DESIGN_FEE_PERCENTAGE;
      const totalEstimate = subtotalAfterDiscount + designFee;

      // Confidence summary
      const summary: Record<PriceConfidence, number> = {
        live: 0,
        estimated: 0,
        manual: 0,
      };
      for (const breakdown of breakdowns) {
        for (const section of COST_SECTIONS) {
          for (const item of breakdown[section]) {
            summary[item.confidence]++;
          }
        }
      }

      const allItems = breakdowns.flatMap((b) =>
        COST_SECTIONS.flatMap((s) => b[s]),
      );

      return {
        modules: breakdowns,
        materialSubtotal,
        sharedWallDiscount: discount,
        designFee: Math.round(designFee),
        totalEstimate: Math.round(totalEstimate),
        currency: "EUR",
        generatedAt: new Date().toISOString(),
        overallConfidence: lowestConfidence(allItems),
        confidenceSummary: summary,
      };
    },

    // ── Mutations ──────────────────────────────────────────

    importFromCSV: (csvData) => {
      const lines = csvData.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) return { imported: 0, errors: ["CSV has no data rows"] };

      const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
      const idIdx = header.indexOf("id");
      const nameIdx = header.indexOf("name");
      const nameRoIdx = header.indexOf("namero");
      const catIdx = header.indexOf("category");
      const unitIdx = header.indexOf("unit");
      const priceIdx = header.indexOf("priceeur");
      const supplierIdx = header.indexOf("supplier");
      const urlIdx = header.indexOf("sourceurl");
      const variantIdx = header.indexOf("variant");

      if (idIdx === -1 || nameIdx === -1 || priceIdx === -1) {
        return { imported: 0, errors: ["CSV must have at least: id, name, priceEUR columns"] };
      }

      const errors: string[] = [];
      let imported = 0;
      const { materialPrices } = get();
      const updated = new Map(materialPrices);

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        const rowNum = i + 1;

        const id = cols[idIdx];
        const name = cols[nameIdx];
        const priceStr = cols[priceIdx];

        if (!id || !name) {
          errors.push(`Row ${rowNum}: missing id or name`);
          continue;
        }

        const priceEUR = parseFloat(priceStr);
        if (isNaN(priceEUR) || priceEUR < 0) {
          errors.push(`Row ${rowNum}: invalid price "${priceStr}"`);
          continue;
        }

        const categoryRaw = catIdx >= 0 ? cols[catIdx] : "";
        const category: MaterialCategory = isValidCategory(categoryRaw)
          ? categoryRaw
          : "structure";

        const unitRaw = unitIdx >= 0 ? cols[unitIdx] : "";
        const unit: MaterialUnit = isValidUnit(unitRaw) ? unitRaw : "m2";

        const mat: MaterialPrice = {
          id,
          name,
          nameRo: nameRoIdx >= 0 ? cols[nameRoIdx] || name : name,
          category,
          unit,
          priceEUR,
          supplier: supplierIdx >= 0 ? cols[supplierIdx] || "csv" : "csv",
          lastUpdated: new Date().toISOString(),
          confidence: "estimated",
          sourceUrl: urlIdx >= 0 ? cols[urlIdx] || "" : "",
          variant: variantIdx >= 0 ? cols[variantIdx] : undefined,
        };

        updated.set(id, mat);
        imported++;
      }

      set({ materialPrices: updated, lastSync: new Date().toISOString() });
      get().saveToLocalStorage();
      return { imported, errors };
    },

    applyPriceUpdate: (update) => {
      const { materialPrices, priceSources } = get();
      const updated = new Map(materialPrices);

      for (const item of update.items) {
        const mat: MaterialPrice = {
          id: item.materialId,
          name: item.name,
          nameRo: item.nameRo,
          category: item.category,
          unit: item.unit,
          priceEUR: item.priceEUR,
          supplier: item.supplier,
          lastUpdated: update.timestamp,
          confidence: "live",
          sourceUrl: item.sourceUrl,
          variant: item.variant,
        };
        updated.set(item.materialId, mat);
      }

      // Update the source status
      const updatedSources = priceSources.map((s) =>
        s.id === update.sourceId
          ? {
              ...s,
              lastSyncedAt: update.timestamp,
              status: "active" as const,
              materialCount: update.items.length,
            }
          : s,
      );

      set({
        materialPrices: updated,
        priceSources: updatedSources,
        lastSync: update.timestamp,
      });
      get().saveToLocalStorage();
    },

    setPrice: (price) => {
      const { materialPrices } = get();
      const updated = new Map(materialPrices);
      updated.set(price.id, price);
      set({ materialPrices: updated });
      get().saveToLocalStorage();
    },

    updatePriceSource: (sourceId, patch) => {
      set((state) => ({
        priceSources: state.priceSources.map((s) =>
          s.id === sourceId ? { ...s, ...patch } : s,
        ),
      }));
      get().saveToLocalStorage();
    },

    // ── Persistence ────────────────────────────────────────

    saveToLocalStorage: () => {
      const { materialPrices, priceSources, lastSync } = get();
      // Convert Map to array for JSON serialization
      const pricesArray: MaterialPrice[] = [];
      materialPrices.forEach((v) => pricesArray.push(v));

      const data = {
        _v: STORE_VERSION,
        prices: pricesArray,
        sources: priceSources,
        lastSync,
      };
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
      } catch {
        // storage full or unavailable
      }
    },

    loadFromLocalStorage: () => {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (!raw) return;

        const data = JSON.parse(raw) as {
          _v?: number;
          prices?: MaterialPrice[];
          sources?: PriceSource[];
          lastSync?: string | null;
        };

        if (data._v !== STORE_VERSION) {
          localStorage.removeItem(STORE_KEY);
          return;
        }

        // Merge: start with fallback, overlay stored prices
        const merged = new Map<string, MaterialPrice>();
        for (const p of FALLBACK_PRICES) {
          merged.set(p.id, p);
        }
        if (data.prices) {
          for (const p of data.prices) {
            // Stored prices override fallbacks (they may be more recent)
            merged.set(p.id, p);
          }
        }

        set({
          materialPrices: merged,
          priceSources: data.sources ?? [...DEFAULT_PRICE_SOURCES],
          lastSync: data.lastSync ?? null,
        });
      } catch {
        // corrupted or unavailable
      }
    },
  };
});

// ─── Category → Cost Section Mapping ─────────────────────────

function categoryToSection(category: MaterialCategory): CostSection | null {
  switch (category) {
    case "structure":
      return "structure";
    case "insulation":
      return "insulation";
    case "exterior-finish":
    case "roofing":
      return "exterior";
    case "flooring":
    case "wall-finish":
      return "interior";
    case "windows":
      return "windows";
    case "doors":
      return "doors";
    case "electrical":
      return "electrical";
    case "plumbing":
    case "hvac":
      return "plumbing";
    case "fasteners":
      return "structure";
    default:
      return null;
  }
}

// ─── Auto-hydrate from localStorage on client ────────────────

if (typeof window !== "undefined") {
  const stored = localStorage.getItem(STORE_KEY);
  if (stored) {
    queueMicrotask(() => {
      usePricingStore.getState().loadFromLocalStorage();
    });
  }
}
