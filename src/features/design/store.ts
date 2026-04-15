"use client";

import { create } from "zustand";
import { MODULE_TYPES, FINISH_LEVELS, SHARED_WALL_DISCOUNT, DESIGN_FEE_PERCENTAGE } from "@/shared/types";
import type { GridCell } from "@/features/land/store";
import { getPresetsForType } from "./layouts";
import { useQuizStore } from "@/features/quiz/store";

/**
 * Bump this when the localStorage schema changes.
 * Old data with a different version will be discarded on load.
 */
const STORE_VERSION = 2;

export type FinishLevelId = "basic" | "standard" | "premium";
export type StyleDirectionId = "scandinavian" | "industrial" | "warm-contemporary" | "mediterranean" | "japanese-wabi-sabi" | "traditional-romanian" | "biophilic-organic" | "eclectic-mixed" | null;
export type WallType = "solid" | "window" | "door" | "none" | "shared";
export type WallSide = "north" | "south" | "east" | "west";
export type WallThickness = 15 | 20 | 30; // cm — 15 interior/shared, 20 standard exterior, 30 enhanced insulation

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
  /** Auto-generated description for presentation (Step 13) */
  description?: string;
  /** The prompt used to generate this render */
  prompt?: string;
  /** Render mode: text2img or img2img */
  mode?: "text2img" | "img2img";
  /** Resolution used */
  resolution?: string;
}

export interface WallConfigs {
  north: WallType;
  south: WallType;
  east: WallType;
  west: WallType;
}

/** Per-side wall thickness in cm. Auto-computed from wall types if not set. */
export interface WallThicknessConfigs {
  north: WallThickness;
  south: WallThickness;
  east: WallThickness;
  west: WallThickness;
}

/** Wall layer compositions by thickness class */
export const WALL_THICKNESS_SPECS: Record<WallThickness, {
  label: string;
  labelRo: string;
  layers: string;
  uValue: number;  // W/(m²·K) — lower is better insulation
  costPerWall: number; // EUR per wall segment
}> = {
  15: {
    label: "Interior (15cm)",
    labelRo: "Interior (15cm)",
    layers: "12.5mm gypsum + 80mm steel frame + 40mm mineral wool + 12.5mm gypsum",
    uValue: 0.55,
    costPerWall: 0,  // included in base
  },
  20: {
    label: "Standard Exterior (20cm)",
    labelRo: "Exterior Standard (20cm)",
    layers: "15mm cladding + 25mm air gap + 80mm insulation + 60mm frame + 15mm interior",
    uValue: 0.28,
    costPerWall: 0,  // included in base exterior
  },
  30: {
    label: "Enhanced Insulation (30cm)",
    labelRo: "Izolație Îmbunătățită (30cm)",
    layers: "20mm cladding + 25mm air gap + 120mm mineral wool + 80mm SIP + 5mm vapour barrier + 15mm interior + 35mm additional insulation",
    uValue: 0.15,
    costPerWall: 450,  // EUR premium per wall segment
  },
};

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
  /** Per-side wall thickness (cm). Auto-populated from wall types if missing. */
  wallThicknessConfigs?: WallThicknessConfigs;
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
  updateWallThickness: (row: number, col: number, side: WallSide, thickness: WallThickness) => void;
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
    thicknessUpgradeCost: number;
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

/** Compute default wall thickness from wall type */
export function defaultThicknessForWallType(wallType: WallType): WallThickness {
  switch (wallType) {
    case "shared":  return 15; // interior shared wall — thinnest
    case "none":    return 15; // placeholder, no physical wall
    case "solid":   return 20; // standard exterior
    case "window":  return 20; // exterior with window
    case "door":    return 20; // exterior with door
    default:        return 20;
  }
}

/** Auto-compute thickness configs from wall types */
export function computeWallThicknessDefaults(wallConfigs: WallConfigs): WallThicknessConfigs {
  return {
    north: defaultThicknessForWallType(wallConfigs.north),
    south: defaultThicknessForWallType(wallConfigs.south),
    east: defaultThicknessForWallType(wallConfigs.east),
    west: defaultThicknessForWallType(wallConfigs.west),
  };
}

/** Get the effective thickness configs (user-set or auto-default) */
export function getEffectiveThickness(mod: ModuleConfig): WallThicknessConfigs {
  if (mod.wallThicknessConfigs) return mod.wallThicknessConfigs;
  return computeWallThicknessDefaults(mod.wallConfigs);
}

/** Compute thickness upgrade cost for all modules */
function computeThicknessUpgradeCost(modules: ModuleConfig[]): number {
  let cost = 0;
  for (const mod of modules) {
    const tc = getEffectiveThickness(mod);
    for (const side of ["north", "south", "east", "west"] as WallSide[]) {
      const t = tc[side];
      cost += WALL_THICKNESS_SPECS[t].costPerWall;
    }
  }
  return cost;
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
  occupiedSet: Set<string>,
  moduleType?: string
): WallConfigs {
  const sides: WallSide[] = ["north", "south", "east", "west"];
  const deltas: Record<WallSide, string> = {
    north: `${row - 1},${col}`,
    south: `${row + 1},${col}`,
    west: `${row},${col - 1}`,
    east: `${row},${col + 1}`,
  };

  // Base: shared if neighbor, solid if exterior
  const cfg: WallConfigs = {
    north: occupiedSet.has(deltas.north) ? "shared" : "solid",
    south: occupiedSet.has(deltas.south) ? "shared" : "solid",
    west: occupiedSet.has(deltas.west) ? "shared" : "solid",
    east: occupiedSet.has(deltas.east) ? "shared" : "solid",
  };

  // Smart defaults: assign door + windows on exterior walls
  const exteriorSides = sides.filter((s) => cfg[s] === "solid");
  if (exteriorSides.length === 0) return cfg; // fully interior module

  // Rooms that don't get an exterior door (accessed via hallway/interior)
  const noExteriorDoor = ["bathroom", "storage"];
  // Rooms that prefer windows on all exterior walls
  const prefersWindows = ["bedroom", "living", "office", "kitchen"];
  // Terrace: open walls (none)
  const isOpenType = moduleType === "terrace";

  if (isOpenType) {
    // Terrace: exterior walls become "none" (open)
    for (const s of exteriorSides) cfg[s] = "none";
    return cfg;
  }

  // Pick one exterior wall for the door (prefer south > east > west > north)
  const doorPriority: WallSide[] = ["south", "east", "west", "north"];
  if (!noExteriorDoor.includes(moduleType || "")) {
    for (const s of doorPriority) {
      if (cfg[s] === "solid") {
        cfg[s] = "door";
        break;
      }
    }
  }

  // Assign windows on remaining solid exterior walls for room types that want them
  if (prefersWindows.includes(moduleType || "")) {
    for (const s of exteriorSides) {
      if (cfg[s] === "solid") cfg[s] = "window";
    }
  }

  // Bathroom: one small window if it has an exterior wall (not the door one)
  if (moduleType === "bathroom") {
    for (const s of exteriorSides) {
      if (cfg[s] === "solid") { cfg[s] = "window"; break; }
    }
  }

  return cfg;
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
  mediterranean: { floor: "terracotta", wall: "cream" },
  "japanese-wabi-sabi": { floor: "bamboo", wall: "parchment" },
  "traditional-romanian": { floor: "oak", wall: "ivory" },
  "biophilic-organic": { floor: "oak", wall: "moss" },
  "eclectic-mixed": { floor: "walnut", wall: "sand" },
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
    // Check for quiz profile to auto-apply style defaults
    const quizStore = useQuizStore.getState();
    const quizStyle = quizStore.getDesignStyleDirection();
    const quizFinish = quizStore.getDesignFinishLevel();
    const styleDefaults = quizStyle ? STYLE_DEFAULTS[quizStyle] : null;
    const defaultFloor = styleDefaults?.floor ?? "oak";
    const defaultWall = styleDefaults?.wall ?? "alabaster";

    const typeCounts: Record<string, number> = {};
    const activeCells = cells.filter((c) => c.moduleType !== null);
    const occupiedSet = new Set(activeCells.map((c) => `${c.row},${c.col}`));
    const modules: ModuleConfig[] = activeCells.map((c) => {
      const type = c.moduleType!;
      typeCounts[type] = (typeCounts[type] || 0);
      const label = generateLabel(type, typeCounts[type]);
      typeCounts[type]++;
      const presets = getPresetsForType(type);
      const wc = computeWallConfigs(c.row, c.col, occupiedSet, type);
      return {
        row: c.row,
        col: c.col,
        moduleType: type,
        label,
        layoutPreset: presets[0]?.id || "default",
        floorFinish: defaultFloor,
        wallColor: defaultWall,
        furnitureOverrides: {},
        wallConfigs: wc,
        wallThicknessConfigs: computeWallThicknessDefaults(wc),
      };
    });
    set({
      modules,
      gridRotation: rotation,
      ...(quizStyle ? { styleDirection: quizStyle as StyleDirectionId } : {}),
      ...(quizFinish ? { finishLevel: quizFinish } : {}),
    });
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
        const newWallConfigs = { ...m.wallConfigs, [side]: wallType };
        // Auto-update thickness when wall type changes (unless user already customized)
        const currentThickness = m.wallThicknessConfigs;
        const newThickness = currentThickness
          ? { ...currentThickness, [side]: defaultThicknessForWallType(wallType) }
          : undefined; // let it auto-compute from defaults
        return { ...m, wallConfigs: newWallConfigs, wallThicknessConfigs: newThickness };
      }),
    })),

  updateWallThickness: (row, col, side, thickness) =>
    set((state) => ({
      modules: state.modules.map((m) => {
        if (m.row !== row || m.col !== col) return m;
        // Initialize thickness configs from defaults if not yet set
        const current = m.wallThicknessConfigs ?? computeWallThicknessDefaults(m.wallConfigs);
        return { ...m, wallThicknessConfigs: { ...current, [side]: thickness } };
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
        // Compute smart wall configs if none exist, or upgrade old all-solid configs
        let enforcedConfigs: WallConfigs;
        if (!m.wallConfigs) {
          // No configs at all — compute fresh with smart defaults
          enforcedConfigs = computeWallConfigs(m.row, m.col, occupiedSet, m.moduleType);
        } else {
          enforcedConfigs = { ...m.wallConfigs };
          // Check if user has ever customized any wall (has door/window/none set)
          const hasCustom = (["north", "south", "east", "west"] as WallSide[]).some(
            (s) => enforcedConfigs[s] === "door" || enforcedConfigs[s] === "window" || enforcedConfigs[s] === "none"
          );
          if (!hasCustom) {
            // All walls are solid/shared — user never configured, apply smart defaults
            enforcedConfigs = computeWallConfigs(m.row, m.col, occupiedSet, m.moduleType);
          }
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
    const thicknessUpgradeCost = computeThicknessUpgradeCost(modules);
    const subtotal = moduleCost - sharedWallDiscount + wallUpgradeCost + thicknessUpgradeCost;
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
      thicknessUpgradeCost,
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
