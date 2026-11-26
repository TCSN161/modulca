"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/features/auth/store";
import { useDesignStore } from "../../store";
import { applyProjectSnapshot, saveActiveProject } from "../../projectSnapshot";
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

        // Hydrate design + land + products (single restore path)
        applyProjectSnapshot(d);

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
  // BUG-ST27: a new or removed render must reach the project row too
  const savedRenders = useDesignStore((s) => s.savedRenders);

  useEffect(() => {
    // Skip if not authenticated or demo project
    if (!isAuthenticated || !userId || projectId === "demo") return;
    if (!hydrated) return; // don't save before initial load
    if (modules.length === 0) return; // nothing to save

    // Clear previous timer
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    // Debounced save
    saveTimerRef.current = setTimeout(() => {
      // Get project name from localStorage
      let projectName = "Untitled Project";
      try {
        const raw = localStorage.getItem("modulca-active-project");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.name) projectName = parsed.name;
        }
      } catch { /* */ }

      // Single save path: snapshot (design + land + products) + active-project binding
      saveActiveProject(userId, projectName, projectId).catch((err) => {
        console.warn("[CloudSync] Auto-save failed:", err);
      });
    }, DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [isAuthenticated, userId, projectId, hydrated, modules, finishLevel, styleDirection, savedRenders]);

  return <>{children}</>;
}
