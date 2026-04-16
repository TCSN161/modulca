"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDesignStore } from "../store";
import { useAuthStore } from "@/features/auth/store";
import { saveProject, loadProject } from "@/features/auth/projectService";
import { useProjectId } from "@/shared/hooks/useProjectId";

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
        const state = useDesignStore.getState();
        const data: Record<string, unknown> = {
          modules: state.modules,
          finishLevel: state.finishLevel,
          gridRotation: state.gridRotation,
          styleDirection: state.styleDirection,
          styleDescription: state.styleDescription,
          stylePhoto: state.stylePhoto,
          moodboardPins: state.moodboardPins,
          savedRenders: state.savedRenders,
          moduleFixtures: state.moduleFixtures,
        };

        const result = await saveProject(userId, {
          id: cloudProjectIdRef.current ?? (projectId !== "demo" ? projectId : undefined),
          name: `Project ${state.modules.length} modules`,
          data,
        });

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
          // Hydrate store with cloud data via Zustand setState
          const patch: Record<string, unknown> = {};
          if (Array.isArray(d.modules) && d.modules.length > 0) patch.modules = d.modules;
          if (typeof d.finishLevel === "string") patch.finishLevel = d.finishLevel;
          if (typeof d.gridRotation === "number") patch.gridRotation = d.gridRotation;
          if (typeof d.styleDirection === "string") patch.styleDirection = d.styleDirection;
          if (typeof d.styleDescription === "string") patch.styleDescription = d.styleDescription;
          if (typeof d.stylePhoto === "string") patch.stylePhoto = d.stylePhoto;
          if (Array.isArray(d.moodboardPins)) patch.moodboardPins = d.moodboardPins;
          if (Array.isArray(d.savedRenders)) patch.savedRenders = d.savedRenders;
          if (d.moduleFixtures && typeof d.moduleFixtures === "object") patch.moduleFixtures = d.moduleFixtures;

          if (Object.keys(patch).length > 0) {
            useDesignStore.setState(patch);
          }
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
