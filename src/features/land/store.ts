"use client";

import { create } from "zustand";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface GridCell {
  row: number;
  col: number;
  moduleType: string | null;
}

export type MapLayer = "satellite" | "streets" | "hybrid";

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

  // Phase
  phase: "map" | "draw" | "grid" | "modules";
  setPhase: (phase: "map" | "draw" | "grid" | "modules") => void;
}

export const useLandStore = create<LandStore>((set) => ({
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

  phase: "map",
  setPhase: (phase) => set({ phase }),
}));
