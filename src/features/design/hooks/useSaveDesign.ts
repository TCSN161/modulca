"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDesignStore } from "../store";
import { useAuthStore } from "@/features/auth/store";
import { loadProject } from "@/features/auth/projectService";
import { useProjectId } from "@/shared/hooks/useProjectId";
import { applyProjectSnapshot, saveActiveProject, getActiveProject } from "../projectSnapshot";

/**
 * Hook that provides save-button state and handler.
 * Hybrid persistence: always saves to localStorage,
 * AND to Supabase when user is authenticated + project is not "demo".
 *
 * Returns { saved, saving, handleSave, cloudSynced }
 */
export function useSaveDesign() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudProjectIdRef = useRef<string | null>(null);

  const saveToLocalStorage = useDesignStore((s) => s.saveToLocalStorage);
  const projectId = useProjectId();
  const userId = useAuthStore((s) => s.userId);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const isCloudEligible = isAuthenticated && userId && projectId !== "demo";

  const handleSave = useCallback(async () => {
    // 1. Always persist to localStorage (instant)
    saveToLocalStorage();

    // 2. If authenticated, also persist to Supabase
    if (isCloudEligible && userId) {
      setSaving(true);
      try {
        // Single save path: snapshot (design + land + products) + active-project binding
        const state = useDesignStore.getState();
        const result = await saveActiveProject(
          userId,
          getActiveProject().name ?? `Project ${state.modules.length} modules`,
          cloudProjectIdRef.current ?? (projectId !== "demo" ? projectId : undefined),
        );

        if (result.ok) {
          cloudProjectIdRef.current = result.value.id;
          setCloudSynced(true);
        }
      } catch (err) {
        console.warn("[useSaveDesign] cloud save failed:", err);
      } finally {
        setSaving(false);
      }
    }

    // Visual feedback
    setSaved(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSaved(false), 2000);
  }, [saveToLocalStorage, isCloudEligible, userId, projectId]);

  return { saved, saving, cloudSynced, handleSave } as const;
}

/**
 * Hook that loads a cloud project into the design store on mount.
 * If project has cloud data in Supabase, hydrates from it;
 * otherwise falls back to localStorage (existing behavior).
 */
export function useCloudLoad() {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  const projectId = useProjectId();
  const userId = useAuthStore((s) => s.userId);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const modules = useDesignStore((s) => s.modules);
  const loadFromLocalStorage = useDesignStore((s) => s.loadFromLocalStorage);

  useEffect(() => {
    if (loadedRef.current) return;
    if (modules.length > 0) return; // already has data

    const isCloudEligible = isAuthenticated && userId && projectId !== "demo";

    if (!isCloudEligible) {
      // Fall back to localStorage (existing behavior)
      loadFromLocalStorage();
      loadedRef.current = true;
      setLoaded(true);
      return;
    }

    // Try loading from Supabase
    setLoading(true);
    loadedRef.current = true;

    loadProject(userId, projectId)
      .then((result) => {
        if (result.ok && result.value?.data) {
          const d = result.value.data as Record<string, unknown>;
          // Hydrate design + land + products (single restore path)
          applyProjectSnapshot(d, { projectId });
        } else {
          // No cloud data — fall back to localStorage
          loadFromLocalStorage();
        }
        setLoaded(true);
      })
      .catch(() => {
        loadFromLocalStorage();
        setLoaded(true);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, userId, projectId, modules.length, loadFromLocalStorage]);

  return { loading, loaded };
}
