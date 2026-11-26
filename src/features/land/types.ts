/**
 * Land feature types — pure, no React/Zustand imports.
 * Re-exported from ./store for backwards compatibility.
 */

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

export type LandPhase = "map" | "draw" | "grid" | "modules";
