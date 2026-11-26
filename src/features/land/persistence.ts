/**
 * Land persistence — pure helpers for localStorage["modulca-land"].
 * ──────────────────────────────────────────────────────────────
 * Fixes BUG-X02 (MCA-SPEC-EXPRESS-MODE-v1 §8): the land store was
 * memory-only, so polygon / gridCells / mapCenter were lost on reload
 * and never reached projects.data.
 *
 * No React, no Zustand — the store wires these in (see store.ts).
 */

import type { LatLng, GridCell, MapLayer, LandPhase } from "./types";

export const LAND_STORAGE_KEY = "modulca-land";
export const LAND_STORAGE_VERSION = 1;

/** The persisted subset of the land store (UI flags like isDrawing are not saved). */
export interface LandSnapshot {
  polygon: LatLng[];
  gridCells: GridCell[];
  gridOrigin: LatLng | null;
  gridRotation: number;
  mapCenter: LatLng;
  mapZoom: number;
  mapLayer: MapLayer;
  phase: LandPhase;
}

const PHASES: readonly LandPhase[] = ["map", "draw", "grid", "modules"];
const LAYERS: readonly MapLayer[] = ["satellite", "streets", "hybrid"];

function isLatLng(v: unknown): v is LatLng {
  return (
    !!v &&
    typeof v === "object" &&
    Number.isFinite((v as LatLng).lat) &&
    Number.isFinite((v as LatLng).lng)
  );
}

function isGridCell(v: unknown): v is GridCell {
  if (!v || typeof v !== "object") return false;
  const c = v as GridCell;
  return (
    Number.isInteger(c.row) &&
    Number.isInteger(c.col) &&
    (c.moduleType === null || typeof c.moduleType === "string")
  );
}

/**
 * Validate an unknown blob (localStorage or projects.data.land) into a
 * partial snapshot. Invalid fields are dropped, never thrown on.
 */
export function parseLandSnapshot(raw: unknown): Partial<LandSnapshot> {
  if (!raw || typeof raw !== "object") return {};
  const d = raw as Record<string, unknown>;
  const out: Partial<LandSnapshot> = {};
  if (Array.isArray(d.polygon)) out.polygon = d.polygon.filter(isLatLng);
  if (Array.isArray(d.gridCells)) out.gridCells = d.gridCells.filter(isGridCell);
  if (d.gridOrigin === null || isLatLng(d.gridOrigin)) out.gridOrigin = d.gridOrigin as LatLng | null;
  if (typeof d.gridRotation === "number" && Number.isFinite(d.gridRotation)) out.gridRotation = d.gridRotation;
  if (isLatLng(d.mapCenter)) out.mapCenter = d.mapCenter;
  if (typeof d.mapZoom === "number" && Number.isFinite(d.mapZoom)) out.mapZoom = d.mapZoom;
  if (typeof d.mapLayer === "string" && LAYERS.includes(d.mapLayer as MapLayer)) out.mapLayer = d.mapLayer as MapLayer;
  if (typeof d.phase === "string" && PHASES.includes(d.phase as LandPhase)) out.phase = d.phase as LandPhase;
  return out;
}

/** True when the snapshot holds nothing worth saving (fresh, untouched store). */
export function isLandEmpty(s: Pick<LandSnapshot, "polygon" | "gridCells">): boolean {
  return s.polygon.length === 0 && s.gridCells.length === 0;
}

/* ── projects.data mapping ──
 * Top-level `gridCells` / `gridRotation` stay where ProjectDesignData always
 * had them (backwards compatible with existing saved projects); the rest of
 * the land state goes under `land`.
 */

export interface LandProjectData {
  gridCells: GridCell[];
  gridRotation: number;
  land: Omit<LandSnapshot, "gridCells" | "gridRotation">;
}

export function landToProjectData(s: LandSnapshot): LandProjectData {
  const { gridCells, gridRotation, ...rest } = s;
  return { gridCells, gridRotation, land: rest };
}

/** Inverse of landToProjectData. Accepts any projects.data blob (old projects have no `land`). */
export function landFromProjectData(data: Record<string, unknown>): Partial<LandSnapshot> {
  const land = data.land && typeof data.land === "object" ? (data.land as Record<string, unknown>) : {};
  const merged: Record<string, unknown> = { ...land };
  if (data.gridCells !== undefined) merged.gridCells = data.gridCells;
  if (data.gridRotation !== undefined) merged.gridRotation = data.gridRotation;
  const parsed = parseLandSnapshot(merged);
  // Same guard as the old CloudSyncProvider hydration: an empty array never wipes the grid.
  if (parsed.gridCells && parsed.gridCells.length === 0) delete parsed.gridCells;
  return parsed;
}

export function writeLandToStorage(s: LandSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAND_STORAGE_KEY, JSON.stringify({ _v: LAND_STORAGE_VERSION, ...s }));
  } catch {
    /* quota / private mode — non-fatal */
  }
}

export function readLandFromStorage(): Partial<LandSnapshot> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LAND_STORAGE_KEY);
    if (!raw) return {};
    return parseLandSnapshot(JSON.parse(raw));
  } catch {
    return {};
  }
}
