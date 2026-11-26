"use client";

import { create } from "zustand";
import type { LatLng, GridCell, MapLayer, LandPhase } from "./types";
import {
  isLandEmpty,
  readLandFromStorage,
  writeLandToStorage,
  type LandSnapshot,
} from "./persistence";

export type { LatLng, GridCell, MapLayer, LandPhase } from "./types";
export type { LandSnapshot } from "./persistence";

interface LandStore {
  // Map state
  mapCenter: LatLng;
  mapZoom: number;
  mapLayer: MapLayer;
  setMapCenter: (center: LatLng) => void;
  setMapZoom: (zoom: number) => void;
  setMapLayer: (layer: MapLayer) => void;

  // Building area polygon (user-drawn)
  polygon: LatLng[];
  isDrawing: boolean;
  addPolygonPoint: (point: LatLng) => void;
  removeLastPoint: () => void;
  clearPolygon: () => void;
  setIsDrawing: (drawing: boolean) => void;

  // Grid cells (generated from polygon)
  gridCells: GridCell[];
  gridOrigin: LatLng | null;
  gridRotation: number; // degrees
  setGridCells: (cells: GridCell[]) => void;
  setGridOrigin: (origin: LatLng) => void;
  setGridRotation: (angle: number) => void;

  // Module placement
  selectedModuleType: string | null;
  setSelectedModuleType: (type: string | null) => void;
  placeModule: (row: number, col: number) => void;
  removeModule: (row: number, col: number) => void;
  placePreset: (cells: [number, number, string][]) => void;
  clearAllModules: () => void;

  // Phase
  phase: LandPhase;
  setPhase: (phase: LandPhase) => void;

  // Persistence (BUG-X02)
  /** The persisted subset — what goes into localStorage and projects.data.land */
  getSnapshot: () => LandSnapshot;
  /** Replace persisted fields from a (validated) snapshot, e.g. cloud load */
  hydrate: (snapshot: Partial<LandSnapshot>) => void;
}

export const useLandStore = create<LandStore>((set, get) => ({
  // Default center: Bucharest
  mapCenter: { lat: 44.4268, lng: 26.1025 },
  mapZoom: 17,
  mapLayer: "satellite",
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  setMapLayer: (layer) => set({ mapLayer: layer }),

  polygon: [],
  isDrawing: false,
  addPolygonPoint: (point) =>
    set((state) => ({ polygon: [...state.polygon, point] })),
  removeLastPoint: () =>
    set((state) => ({ polygon: state.polygon.slice(0, -1) })),
  clearPolygon: () =>
    set({ polygon: [], gridCells: [], gridOrigin: null, gridRotation: 0 }),
  setIsDrawing: (drawing) => set({ isDrawing: drawing }),

  gridCells: [],
  gridOrigin: null,
  gridRotation: 0,
  setGridCells: (cells) => set({ gridCells: cells }),
  setGridOrigin: (origin) => set({ gridOrigin: origin }),
  setGridRotation: (angle) => set({ gridRotation: angle }),

  selectedModuleType: null,
  setSelectedModuleType: (type) => set({ selectedModuleType: type }),

  placeModule: (row, col) =>
    set((state) => ({
      gridCells: state.gridCells.map((cell) =>
        cell.row === row && cell.col === col
          ? { ...cell, moduleType: state.selectedModuleType }
          : cell
      ),
    })),

  removeModule: (row, col) =>
    set((state) => ({
      gridCells: state.gridCells.map((cell) =>
        cell.row === row && cell.col === col
          ? { ...cell, moduleType: null }
          : cell
      ),
    })),

  placePreset: (cells) =>
    set((state) => {
      const lookup = new Map(cells.map(([r, c, t]) => [`${r},${c}`, t]));
      return {
        gridCells: state.gridCells.map((cell) => {
          const key = `${cell.row},${cell.col}`;
          return lookup.has(key) ? { ...cell, moduleType: lookup.get(key)! } : cell;
        }),
      };
    }),

  clearAllModules: () =>
    set((state) => ({
      gridCells: state.gridCells.map((cell) => ({ ...cell, moduleType: null })),
    })),

  phase: "map",
  setPhase: (phase) => set({ phase }),

  getSnapshot: () => {
    const s = get();
    return {
      polygon: s.polygon,
      gridCells: s.gridCells,
      gridOrigin: s.gridOrigin,
      gridRotation: s.gridRotation,
      mapCenter: s.mapCenter,
      mapZoom: s.mapZoom,
      mapLayer: s.mapLayer,
      phase: s.phase,
    };
  },

  hydrate: (snapshot) => set({ ...snapshot }),
}));

/* ------------------------------------------------------------------ */
/*  Auto-persistence (mirrors the design store): save on change,      */
/*  hydrate once on startup if the in-memory store is still empty.    */
/* ------------------------------------------------------------------ */

if (typeof window !== "undefined") {
  useLandStore.subscribe((state, prev) => {
    if (
      state.polygon !== prev.polygon ||
      state.gridCells !== prev.gridCells ||
      state.gridOrigin !== prev.gridOrigin ||
      state.gridRotation !== prev.gridRotation ||
      state.mapCenter !== prev.mapCenter ||
      state.mapZoom !== prev.mapZoom ||
      state.mapLayer !== prev.mapLayer ||
      state.phase !== prev.phase
    ) {
      writeLandToStorage(state.getSnapshot());
    }
  });

  const stored = readLandFromStorage();
  if (Object.keys(stored).length > 0) {
    queueMicrotask(() => {
      const s = useLandStore.getState();
      if (isLandEmpty(s)) s.hydrate(stored);
    });
  }
}
