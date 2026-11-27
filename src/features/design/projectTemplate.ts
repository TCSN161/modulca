"use client";

/**
 * Project templates (BUG-ST10).
 * ────────────────────────────
 * `/project/new` used to save only `{ preset }`, which nothing read, so the
 * chosen template ("Compact House") was ignored. Now the preset's cells become
 * the land grid and the design modules, saved in projects.data like any other
 * project, so the cloud load (applyProjectSnapshot) restores them.
 */

import { BUILDING_PRESETS, type BuildingPreset } from "@/shared/types";
import type { GridCell } from "@/features/land/types";
import { useLandStore } from "@/features/land/store";
import { useDesignStore } from "./store";

export function findPreset(id: string | null | undefined): BuildingPreset | undefined {
  return id ? BUILDING_PRESETS.find((p) => p.id === id) : undefined;
}

export function presetCells(preset: BuildingPreset): GridCell[] {
  return preset.cells.map(([row, col, moduleType]) => ({ row, col, moduleType }));
}

/**
 * Apply the template to the land + design stores and return the projects.data
 * to save. No preset → `{}` (unchanged behaviour: the user starts on Land).
 */
export function applyTemplate(presetId: string | null | undefined): Record<string, unknown> {
  const preset = findPreset(presetId);
  if (!preset) return {};
  const cells = presetCells(preset);
  useLandStore.getState().setGridCells(cells);
  useDesignStore.getState().setModulesFromGrid(cells, 0);
  return {
    preset: preset.id,
    gridCells: cells,
    gridRotation: 0,
    modules: useDesignStore.getState().modules,
    // a new project starts with no products / renders of the previous one
    selectedProducts: [],
  };
}
