"use client";

/**
 * Project snapshot — the ONE place that assembles / restores projects.data.
 * ────────────────────────────────────────────────────────────────────────
 * Replaces the 4 hand-built payloads that used to live in FinalizePage,
 * useSaveDesign, CloudSaveButton and CloudSyncProvider
 * (MCA-SPEC-EXPRESS-MODE-v1 §5, MAIN row). Express uses the same functions.
 *
 * Lives in features/design (not auth/projectService) so the persistence
 * service stays free of store imports.
 */

import { useDesignStore } from "./store";
import {
  getSelectedProducts,
  setSelectedProducts,
  parseSelectedProducts,
  hasPendingSelectedProducts,
  clearPendingSelectedProducts,
} from "./productSelection";
import { useLandStore } from "@/features/land/store";
import { landToProjectData, landFromProjectData } from "@/features/land/persistence";
import {
  saveProject,
  type ProjectDesignData,
  type ProjectRecord,
  type ProjectResult,
} from "@/features/auth/projectService";

export const ACTIVE_PROJECT_KEY = "modulca-active-project";

/** design store + land (BUG-X02) + selected products (BUG-X03) */
export function getProjectSnapshot(): ProjectDesignData {
  const d = useDesignStore.getState();
  return {
    modules: d.modules,
    finishLevel: d.finishLevel,
    styleDirection: d.styleDirection ?? undefined,
    styleDescription: d.styleDescription,
    stylePhoto: d.stylePhoto,
    moodboardPins: d.moodboardPins,
    savedRenders: d.savedRenders,
    moduleFixtures: d.moduleFixtures as Record<string, unknown>,
    ...landToProjectData(useLandStore.getState().getSnapshot()),
    selectedProducts: getSelectedProducts(),
  };
}

/**
 * Inverse of getProjectSnapshot: hydrate design + land + products from projects.data.
 * BUG-ST06: products edited locally and not yet saved for `opts.projectId` are kept
 * (the cloud copy is older); the next auto-save sends them up.
 */
export function applyProjectSnapshot(
  data: Record<string, unknown>,
  opts: { projectId?: string } = {},
): void {
  const patch: Record<string, unknown> = {};
  if (Array.isArray(data.modules) && data.modules.length > 0) patch.modules = data.modules;
  if (typeof data.finishLevel === "string") patch.finishLevel = data.finishLevel;
  if (typeof data.gridRotation === "number") patch.gridRotation = data.gridRotation;
  if (typeof data.styleDirection === "string") patch.styleDirection = data.styleDirection;
  if (typeof data.styleDescription === "string") patch.styleDescription = data.styleDescription;
  if (typeof data.stylePhoto === "string") patch.stylePhoto = data.stylePhoto;
  if (Array.isArray(data.moodboardPins)) patch.moodboardPins = data.moodboardPins;
  if (Array.isArray(data.savedRenders)) patch.savedRenders = data.savedRenders;
  if (data.moduleFixtures && typeof data.moduleFixtures === "object") patch.moduleFixtures = data.moduleFixtures;
  if (Object.keys(patch).length > 0) useDesignStore.setState(patch);

  useLandStore.getState().hydrate(landFromProjectData(data));
  if (Array.isArray(data.selectedProducts) && !hasPendingSelectedProducts(opts.projectId)) {
    setSelectedProducts(parseSelectedProducts(data.selectedProducts), { source: "cloud" });
  }
}

export interface ActiveProjectRef {
  id?: string;
  name?: string;
}

export function getActiveProject(): ActiveProjectRef {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ACTIVE_PROJECT_KEY);
    const p = raw ? JSON.parse(raw) : null;
    if (!p || typeof p !== "object") return {};
    return {
      id: typeof p.id === "string" ? p.id : undefined,
      name: typeof p.name === "string" ? p.name : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Save the current snapshot and bind it as the active project.
 * `id` defaults to the active project (update); none → insert.
 */
export async function saveActiveProject(
  userId: string,
  name: string,
  id?: string,
): Promise<ProjectResult<ProjectRecord>> {
  const startedAt = Date.now();
  const result = await saveProject(userId, {
    id: id ?? getActiveProject().id,
    name,
    data: getProjectSnapshot(),
  });
  if (result.ok && typeof window !== "undefined") {
    clearPendingSelectedProducts(startedAt);
    try {
      localStorage.setItem(
        ACTIVE_PROJECT_KEY,
        JSON.stringify({ id: result.value.id, name: result.value.name ?? name }),
      );
    } catch {
      /* non-fatal */
    }
  }
  return result;
}
