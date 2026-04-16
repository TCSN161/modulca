"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/features/auth/store";
import { useDesignStore } from "../../store";
import { useLandStore } from "@/features/land/store";
import { loadProject, saveProject, listProjects } from "@/features/auth/projectService";
import { useProjectId } from "@/shared/hooks/useProjectId";

/**
 * CloudSyncProvider — wraps the project layout to handle:
 * 1. Loading project data from Supabase on mount (cloud → store)
 * 2. Migrating localStorage projects to Supabase on first auth
 * 3. Debounced auto-save on store changes
 *
 * Render this inside the project [id] layout.
 */

const MIGRATION_KEY = "modulca-cloud-migrated";
const DEBOUNCE_MS = 5000; // auto-save after 5s of inactivity

export default function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const projectId = useProjectId();
  const { isAuthenticated, userId } = useAuthStore();
  const loadedRef = useRef(false);
  const [hydrated, setHydrated] = useState(false);

  // ── 1. Cloud Load: Hydrate design store from Supabase on mount ──
  useEffect(() => {
    if (loadedRef.current) return;
    if (!isAuthenticated || !userId) {
      setHydrated(true);
      return;
    }
    if (projectId === "demo") {
      setHydrated(true);
      return;
    }

    loadedRef.current = true;

    loadProject(userId, projectId)
      .then((result) => {
        if (!result.ok) {
          setHydrated(true);
          return;
        }

        const d = result.value.data as Record<string, unknown>;

        // Hydrate design store
        const designPatch: Record<string, unknown> = {};
        if (Array.isArray(d.modules) && d.modules.length > 0) designPatch.modules = d.modules;
        if (typeof d.finishLevel === "string") designPatch.finishLevel = d.finishLevel;
        if (typeof d.styleDirection === "string") designPatch.styleDirection = d.styleDirection;
        if (typeof d.styleDescription === "string") designPatch.styleDescription = d.styleDescription;
        if (typeof d.stylePhoto === "string") designPatch.stylePhoto = d.stylePhoto;
        if (Array.isArray(d.moodboardPins)) designPatch.moodboardPins = d.moodboardPins;
        if (Array.isArray(d.savedRenders)) designPatch.savedRenders = d.savedRenders;
        if (d.moduleFixtures && typeof d.moduleFixtures === "object") designPatch.moduleFixtures = d.moduleFixtures;

        if (Object.keys(designPatch).length > 0) {
          useDesignStore.setState(designPatch);
        }

        // Hydrate land store (grid cells, rotation)
        if (Array.isArray(d.gridCells) && d.gridCells.length > 0) {
          useLandStore.getState().setGridCells(d.gridCells as { row: number; col: number; moduleType: string | null }[]);
        }
        if (typeof d.gridRotation === "number") {
          useLandStore.getState().setGridRotation(d.gridRotation);
        }

        setHydrated(true);
      })
      .catch(() => {
        setHydrated(true);
      });
  }, [isAuthenticated, userId, projectId]);

  // ── 2. localStorage → Supabase migration on first auth ──
  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    // Only migrate once
    try {
      if (localStorage.getItem(MIGRATION_KEY)) return;
    } catch {
      return;
    }

    (async () => {
      try {
        // Check if user already has cloud projects
        const existing = await listProjects(userId);
        if (existing.length > 0) {
          // User already has cloud projects, skip migration
          localStorage.setItem(MIGRATION_KEY, "1");
          return;
        }

        // Load local projects
        const localRaw = localStorage.getItem("modulca-projects");
        if (!localRaw) {
          localStorage.setItem(MIGRATION_KEY, "1");
          return;
        }

        const localProjects = JSON.parse(localRaw);
        if (!Array.isArray(localProjects) || localProjects.length === 0) {
          localStorage.setItem(MIGRATION_KEY, "1");
          return;
        }

        // Migrate each local project to Supabase
        for (const lp of localProjects) {
          if (!lp.name || !lp.data) continue;
          await saveProject(userId, { name: lp.name, data: lp.data });
        }

        localStorage.setItem(MIGRATION_KEY, "1");
        console.info(`[CloudSync] Migrated ${localProjects.length} local project(s) to cloud`);
      } catch (err) {
        console.warn("[CloudSync] Migration failed:", err);
      }
    })();
  }, [isAuthenticated, userId]);

  // ── 3. Debounced auto-save on design store changes ──
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modules = useDesignStore((s) => s.modules);
  const finishLevel = useDesignStore((s) => s.finishLevel);
  const styleDirection = useDesignStore((s) => s.styleDirection);

  useEffect(() => {
    // Skip if not authenticated or demo project
    if (!isAuthenticated || !userId || projectId === "demo") return;
    if (!hydrated) return; // don't save before initial load
    if (modules.length === 0) return; // nothing to save

    // Clear previous timer
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    // Debounced save
    saveTimerRef.current = setTimeout(() => {
      const state = useDesignStore.getState();
      const { gridCells, gridRotation } = useLandStore.getState();

      const data: Record<string, unknown> = {
        modules: state.modules,
        finishLevel: state.finishLevel,
        gridRotation,
        styleDirection: state.styleDirection,
        styleDescription: state.styleDescription,
        stylePhoto: state.stylePhoto,
        moodboardPins: state.moodboardPins,
        savedRenders: state.savedRenders,
        moduleFixtures: state.moduleFixtures,
        gridCells: gridCells.filter((c) => c.moduleType !== null),
      };

      // Get project name from localStorage
      let projectName = "Untitled Project";
      try {
        const raw = localStorage.getItem("modulca-active-project");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.name) projectName = parsed.name;
        }
      } catch { /* */ }

      saveProject(userId, {
        id: projectId,
        name: projectName,
        data,
      }).catch((err) => {
        console.warn("[CloudSync] Auto-save failed:", err);
      });
    }, DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [isAuthenticated, userId, projectId, hydrated, modules, finishLevel, styleDirection]);

  return <>{children}</>;
}
