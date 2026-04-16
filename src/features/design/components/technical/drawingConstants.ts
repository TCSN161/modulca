import type { FLOOR_MATERIALS, WALL_MATERIALS, getPreset } from "../../layouts";

export const WALL_THICKNESS = 0.25; // meters — default 25cm (standard exterior)
export const EXT = 3000; // exterior in mm
export const INT = EXT - WALL_THICKNESS * 2 * 1000; // interior in mm = 2500

/** Convert WallThickness (cm) to meters for drawing calculations */
export function wallThicknessMeters(cm: 15 | 25 | 30): number {
  return cm / 100;
}

/** Interior dimension in mm for a given thickness (cm) */
export function interiorDimension(thicknessCm: 15 | 25 | 30): number {
  return EXT - (thicknessCm / 100) * 2 * 1000;
}
export const CEIL_H = 2700; // mm
export const FLOOR_SLAB = 200; // mm
export const TOTAL_H = CEIL_H + FLOOR_SLAB; // 2900mm

/* ─── Drawing type label map ─── */
export const DRAWING_LABELS: Record<string, string> = {
  "combined-plan": "COMBINED FLOOR PLAN",
  "floor-plan": "FLOOR PLAN",
  "section-aa": "SECTION A-A",
  "front-elevation": "FRONT ELEVATION",
  "wall-detail": "WALL CORNER DETAIL",
  "mep-plan": "MEP PLAN",
  "foundation-detail": "FOUNDATION DETAIL",
};

export const DRAWING_SCALES: Record<string, string> = {
  "combined-plan": "1:50",
  "floor-plan": "1:25",
  "section-aa": "1:25",
  "front-elevation": "1:25",
  "wall-detail": "1:5",
  "mep-plan": "1:25",
  "foundation-detail": "1:10",
};

export type FloorMat = ReturnType<typeof FLOOR_MATERIALS.find>;
export type WallMat = ReturnType<typeof WALL_MATERIALS.find>;
export type Preset = ReturnType<typeof getPreset>;
