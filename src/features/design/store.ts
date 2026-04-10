"use client";

import { create } from "zustand";
import { MODULE_TYPES, FINISH_LEVELS, SHARED_WALL_DISCOUNT, DESIGN_FEE_PERCENTAGE } from "@/shared/types";
import type { GridCell } from "@/features/land/store";
import { getPresetsForType } from "./layouts";

/**
 * Bump this when the localStorage schema changes.
 * Old data with a different version will be discarded on load.
 */
const STORE_VERSION = 2;

export type FinishLevelId = "basic" | "standard" | "premium";
export type StyleDirectionId = "scandinavian" | "industrial" | "warm-contemporary" | null;
export type WallType = "solid" | "window" | "door" | "none" | "shared";
export type WallSide = "north" | "south" | "east" | "west";

export interface FurnitureOverride {
  x?: number;
  z?: number;
  color?: string;
  rotation?: number; // Y-axis rotation in radians
}

export interface MoodboardPin {
  id: string;
  imageUrl: string; // base64 data URL or external URL
  label: string;
  source: "upload" | "curated" | "url";
}

export interface SavedRender {
  id: string;
  imageUrl: string; // base64 data URL
  label: string;
  engine: string;
  moduleType: string;
  createdAt: string;
}

export interface WallConfigs {
  north: WallType;
  south: WallType;
  east: WallType;
  west: WallType;
}

export interface ModuleConfig {
  row: number;
  col: number;
  moduleType: string;
  label: string;
  layoutPreset: string;
  floorFinish: string;
  wallColor: string;
  /** Per-preset furniture overrides: layoutPreset → furnitureId → override */
  furnitureOverrides: Record<string, Record<string, FurnitureOverride>>;
  wallConfigs: WallConfigs;
}

/** Get the furniture overrides for the module's current layout preset. */
export function getPresetOverrides(mod: ModuleConfig): Record<string, FurnitureOverride> {
  return mod.furnitureOverrides[mod.layoutPreset] ?? {};
}

interface DesignStore {
  // Imported from Step 1
  modules: ModuleConfig[];
  finishLevel: FinishLevelId;
  gridRotation: number;

  // Style (Step 4 - Design Vision)
  styleDirection: StyleDirectionId;
  styleDescription: string;
  stylePhoto: string | null; // base64 or URL
  setStyleDirection: (dir: StyleDirectionId) => void;
  setStyleDescription: (desc: string) => void;
  setStylePhoto: (photo: string | null) => void;
  applyStyleToModules: () => void;

  // Moodboard
  moodboardPins: MoodboardPin[];
  addMoodboardPin: (pin: MoodboardPin) => void;
  removeMoodboardPin: (id: string) => void;
  reorderMoodboardPins: (pins: MoodboardPin[]) => void;

  // Saved AI renders for presentation
  savedRenders: SavedRender[];
  addSavedRender: (render: SavedRender) => void;
  removeSavedRender: (id: string) => void;

  // Module fixtures (electrical, plumbing, smart home)
  moduleFixtures: Record<string, string[]>; // "row,col" → fixture ids
  setModuleFixtures: (row: number, col: number, fixtures: string[]) => void;

  // Actions
  setModulesFromGrid: (cells: GridCell[], rotation: number) => void;
  setFinishLevel: (level: FinishLevelId) => void;
  updateModuleConfig: (row: number, col: number, config: Partial<ModuleConfig>) => void;
  updateWallConfig: (row: number, col: number, side: WallSide, wallType: WallType) => void;
  updateFurnitureOverride: (row: number, col: number, furnitureId: string, override: FurnitureOverride) => void;
  resetAllFurnitureOverrides: () => void;
  selectedModule: { row: number; col: number } | null;
  selectedFurniture: string | null;
  setSelectedModule: (m: { row: number; col: number } | null) => void;
  setSelectedFurniture: (id: string | null) => void;

  // Module operations
  swapModules: (a: { row: number; col: number }, b: { row: number; col: number }) => void;

  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;

  // Computed helpers
  getStats: () => {
    totalModules: number;
    totalArea: number;
    usableArea: number;
    sharedWalls: number;
    moduleCost: number;
    sharedWallDiscount: number;
    wallUpgradeCost: number;
    designFee: number;
    totalEstimate: number;
  };
}

function generateLabel(moduleType: string, index: number): string {
  const mt = MODULE_TYPES.find((m) => m.id === moduleType);
  const base = mt ? mt.label.toUpperCase().replace(/\s+/g, "") : moduleType.toUpperCase();
  return index > 0 ? `${base}${String(index + 1).padStart(2, "0")}` : base;
}

function countSharedWalls(modules: ModuleConfig[]): number {
  let count = 0;
  for (let i = 0; i < modules.length; i++) {
    for (let j = i + 1; j < modules.length; j++) {
      const dr = Math.abs(modules[i].row - modules[j].row);
      const dc = Math.abs(modules[i].col - modules[j].col);
      if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
        count++;
      }
    }
  }
  return count;
}

/** Wall upgrade pricing (in EUR) */
const WALL_UPGRADE_PRICES: Record<WallType, number> = {
  solid: 0,    // included in base cost
  window: 800,
  door: 600,
  none: -200,  // savings for removed wall
  shared: 0,   // handled by shared wall discount
};

function computeWallConfigs(
  row: number,
  col: number,
  occupiedSet: Set<string>
): WallConfigs {
  return {
    north: occupiedSet.has(`${row - 1},${col}`) ? "shared" : "solid",
    south: occupiedSet.has(`${row + 1},${col}`) ? "shared" : "solid",
    west: occupiedSet.has(`${row},${col - 1}`) ? "shared" : "solid",
    east: occupiedSet.has(`${row},${col + 1}`) ? "shared" : "solid",
  };
}

function computeWallUpgradeCost(modules: ModuleConfig[]): number {
  let cost = 0;
  for (const mod of modules) {
    for (const side of ["north", "south", "east", "west"] as WallSide[]) {
      const wt = mod.wallConfigs[side];
      cost += WALL_UPGRADE_PRICES[wt];
    }
  }
  return cost;
}

/** Maps style direction → default floor/wall materials */
const STYLE_DEFAULTS: Record<string, { floor: string; wall: string }> = {
  scandinavian: { floor: "oak", wall: "alabaster" },
  industrial: { floor: "concrete", wall: "slate" },
  "warm-contemporary": { floor: "walnut", wall: "sage" },
};

export const useDesignStore = create<DesignStore>((set, get) => ({
  modules: [],
  finishLevel: "standard",
  gridRotation: 0,
  selectedModule: null,
  selectedFurniture: null,
  styleDirection: null,
  styleDescription: "",
  stylePhoto: null,
  moodboardPins: [],
  savedRenders: [],
  moduleFixtures: {},

  addMoodboardPin: (pin) => set((s) => ({ moodboardPins: [...s.moodboardPins, pin] })),
  removeMoodboardPin: (id) => set((s) => ({ moodboardPins: s.moodboardPins.filter((p) => p.id !== id) })),
  reorderMoodboardPins: (pins) => set({ moodboardPins: pins }),

  addSavedRender: (render) => set((s) => ({ savedRenders: [...s.savedRenders, render] })),
  removeSavedRender: (id) => set((s) => ({ savedRenders: s.savedRenders.filter((r) => r.id !== id) })),

  setModuleFixtures: (row, col, fixtures) =>
    set((s) => ({ moduleFixtures: { ...s.moduleFixtures, [`${row},${col}`]: fixtures } })),

  setStyleDirection: (dir) => set({ styleDirection: dir }),
  setStyleDescription: (desc) => set({ styleDescription: desc }),
  setStylePhoto: (photo) => set({ stylePhoto: photo }),

  applyStyleToModules: () => {
    const { styleDirection, modules } = get();
    if (!styleDirection) return;
    const defaults = STYLE_DEFAULTS[styleDirection];
    if (!defaults) return;
    set({
      modules: modules.map((m) => ({
        ...m,
        floorFinish: defaults.floor,
        wallColor: defaults.wall,
      })),
    });
  },

  setModulesFromGrid: (cells, rotation) => {
    const typeCounts: Record<string, number> = {};
    const activeCells = cells.filter((c) => c.moduleType !== null);
    const occupiedSet = new Set(activeCells.map((c) => `${c.row},${c.col}`));
    const modules: ModuleConfig[] = activeCells.map((c) => {
      const type = c.moduleType!;
      typeCounts[type] = (typeCounts[type] || 0);
      const label = generateLabel(type, typeCounts[type]);
      typeCounts[type]++;
      const presets = getPresetsForType(type);
      return {
        row: c.row,
        col: c.col,
        moduleType: type,
        label,
        layoutPreset: presets[0]?.id || "default",
        floorFinish: "oak",
        wallColor: "alabaster",
        furnitureOverrides: {},
        wallConfigs: computeWallConfigs(c.row, c.col, occupiedSet),
      };
    });
    set({ modules, gridRotation: rotation });
  },

  setFinishLevel: (level) => set({ finishLevel: level }),

  updateModuleConfig: (row, col, config) =>
    set((state) => ({
      modules: state.modules.map((m) =>
        m.row === row && m.col === col ? { ...m, ...config } : m
      ),
    })),

  updateWallConfig: (row, col, side, wallType) =>
    set((state) => ({
      modules: state.modules.map((m) => {
        if (m.row !== row || m.col !== col) return m;
        // Allow changing any wall type — user can set interior doors/windows between modules
        return { ...m, wallConfigs: { ...m.wallConfigs, [side]: wallType } };
      }),
    })),

  updateFurnitureOverride: (row, col, furnitureId, override) =>
    set((state) => ({
      modules: state.modules.map((m) => {
        if (m.row !== row || m.col !== col) return m;
        const presetKey = m.layoutPreset;
        const existingPreset = m.furnitureOverrides[presetKey] ?? {};
        return {
          ...m,
          furnitureOverrides: {
            ...m.furnitureOverrides,
            [presetKey]: {
              ...existingPreset,
              [furnitureId]: { ...existingPreset[furnitureId], ...override },
            },
          },
        };
      }),
    })),

  resetAllFurnitureOverrides: () =>
    set((state) => ({
      modules: state.modules.map((m) => ({
        ...m,
        furnitureOverrides: {},
      })),
    })),

  setSelectedModule: (m) => set({ selectedModule: m, selectedFurniture: null }),
  setSelectedFurniture: (id) => set({ selectedFurniture: id }),

  swapModules: (a, b) =>
    set((state) => {
      const modA = state.modules.find((m) => m.row === a.row && m.col === a.col);
      const modB = state.modules.find((m) => m.row === b.row && m.col === b.col);
      if (!modA || !modB) return state;
      return {
        modules: state.modules.map((m) => {
          if (m.row === a.row && m.col === a.col) {
            // Swap content (type, layout, materials, overrides) but keep position
            return { ...m, moduleType: modB.moduleType, label: modB.label, layoutPreset: modB.layoutPreset, floorFinish: modB.floorFinish, wallColor: modB.wallColor, furnitureOverrides: modB.furnitureOverrides };
          }
          if (m.row === b.row && m.col === b.col) {
            return { ...m, moduleType: modA.moduleType, label: modA.label, layoutPreset: modA.layoutPreset, floorFinish: modA.floorFinish, wallColor: modA.wallColor, furnitureOverrides: modA.furnitureOverrides };
          }
          return m;
        }),
      };
    }),

  saveToLocalStorage: () => {
    const { modules, finishLevel, gridRotation, styleDirection, styleDescription, stylePhoto, moodboardPins, savedRenders, moduleFixtures } = get();
    const data = { _v: STORE_VERSION, modules, finishLevel, gridRotation, styleDirection, styleDescription, stylePhoto, moodboardPins, savedRenders, moduleFixtures };
    try {
      localStorage.setItem("modulca-design", JSON.stringify(data));
    } catch {
      // storage full or unavailable
    }
  },

  loadFromLocalStorage: () => {
    try {
      const raw = localStorage.getItem("modulca-design");
      if (!raw) return;
      const data = JSON.parse(raw);
      // Version check — discard stale data from incompatible versions
      if (data._v !== STORE_VERSION) {
        localStorage.removeItem("modulca-design");
        return;
      }
      // Migrate modules missing wallConfigs (backward compatibility)
      const loadedModules: ModuleConfig[] = data.modules ?? [];
      const occupiedSet = new Set(loadedModules.map((m: ModuleConfig) => `${m.row},${m.col}`));
      const MODULE_SZ = 3;
      const migratedModules = loadedModules.map((m: ModuleConfig) => {
        // Sanitize furniture overrides: remove any corrupted position values
        const cleanedOverrides: Record<string, Record<string, FurnitureOverride>> = {};
        if (m.furnitureOverrides) {
          for (const [presetKey, items] of Object.entries(m.furnitureOverrides)) {
            cleanedOverrides[presetKey] = {};
            for (const [itemId, ov] of Object.entries(items as Record<string, FurnitureOverride>)) {
              const clean: FurnitureOverride = {};
              if (typeof ov.x === "number" && Number.isFinite(ov.x) && ov.x >= -0.5 && ov.x <= MODULE_SZ + 0.5) clean.x = ov.x;
              if (typeof ov.z === "number" && Number.isFinite(ov.z) && ov.z >= -0.5 && ov.z <= MODULE_SZ + 0.5) clean.z = ov.z;
              if (typeof ov.rotation === "number" && Number.isFinite(ov.rotation)) clean.rotation = ov.rotation;
              if (typeof ov.color === "string") clean.color = ov.color;
              if (Object.keys(clean).length > 0) cleanedOverrides[presetKey][itemId] = clean;
            }
          }
        }
        // Default adjacent walls to "shared" (open) only if no wallConfigs exist yet.
        // If user has customized a wall (e.g. to "door" or "window"), respect that choice.
        const existingConfigs = m.wallConfigs ?? computeWallConfigs(m.row, m.col, occupiedSet);
        const enforcedConfigs = { ...existingConfigs };
        // Only set to "shared" if the wall hasn't been loaded yet (was computed fresh)
        if (!m.wallConfigs) {
          if (occupiedSet.has(`${m.row - 1},${m.col}`)) enforcedConfigs.north = "shared";
          if (occupiedSet.has(`${m.row + 1},${m.col}`)) enforcedConfigs.south = "shared";
          if (occupiedSet.has(`${m.row},${m.col - 1}`)) enforcedConfigs.west = "shared";
          if (occupiedSet.has(`${m.row},${m.col + 1}`)) enforcedConfigs.east = "shared";
        }

        return {
          ...m,
          wallConfigs: enforcedConfigs,
          furnitureOverrides: cleanedOverrides,
        };
      });
      set({
        modules: migratedModules,
        finishLevel: data.finishLevel ?? "standard",
        gridRotation: data.gridRotation ?? 0,
        styleDirection: data.styleDirection ?? null,
        styleDescription: data.styleDescription ?? "",
        stylePhoto: data.stylePhoto ?? null,
        moodboardPins: data.moodboardPins ?? [],
        savedRenders: data.savedRenders ?? [],
        moduleFixtures: data.moduleFixtures ?? {},
      });
    } catch {
      // corrupted or unavailable
    }
  },

  getStats: () => {
    const { modules, finishLevel } = get();
    const totalModules = modules.length;
    const totalArea = totalModules * 9;
    const usableArea = totalModules * 7;
    const sharedWalls = countSharedWalls(modules);
    const finish = FINISH_LEVELS.find((f) => f.id === finishLevel) || FINISH_LEVELS[1];
    const moduleCost = totalModules * finish.pricePerModule;
    const sharedWallDiscount = sharedWalls * SHARED_WALL_DISCOUNT;
    const wallUpgradeCost = computeWallUpgradeCost(modules);
    const subtotal = moduleCost - sharedWallDiscount + wallUpgradeCost;
    const designFee = subtotal * DESIGN_FEE_PERCENTAGE;
    const totalEstimate = subtotal + designFee;

    return {
      totalModules,
      totalArea,
      usableArea,
      sharedWalls,
      moduleCost,
      sharedWallDiscount,
      wallUpgradeCost,
      designFee,
      totalEstimate,
    };
  },
}));

/* ------------------------------------------------------------------ */
/*  Auto-persistence: save on every module change, hydrate on startup  */
/* ------------------------------------------------------------------ */

if (typeof window !== "undefined") {
  // Auto-save whenever modules change
  useDesignStore.subscribe(
    (state, prev) => {
      if (state.modules !== prev.modules && state.modules.length > 0) {
        state.saveToLocalStorage();
      }
    },
  );

  // Auto-hydrate from localStorage on first load (client-only)
  const stored = localStorage.getItem("modulca-design");
  if (stored) {
    // Defer to avoid hydration mismatch with SSR
    queueMicrotask(() => {
      const { modules } = useDesignStore.getState();
      if (modules.length === 0) {
        useDesignStore.getState().loadFromLocalStorage();
      }
    });
  }
}
