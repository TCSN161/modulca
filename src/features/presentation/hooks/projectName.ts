"use client";

/**
 * BUG-ST07 (2026-11-26): the presentation cover and PDF filename always said
 * "My Modular Home" because the page never read the project's own name.
 *
 * Source order: cloud project record (projects.name, by URL id) → the
 * active-project ref in localStorage (only when its id matches, or on /demo)
 * → DEFAULT_PROJECT_NAME. A name the user typed in the field always wins.
 */

import { useEffect, useRef, useState } from "react";
import { getActiveProject, type ActiveProjectRef } from "@/features/design/projectSnapshot";
import { loadProject } from "@/features/auth/projectService";
import { useAuthStore } from "@/features/auth/store";

export const DEFAULT_PROJECT_NAME = "My Modular Home";

const clean = (s: unknown) => (typeof s === "string" && s.trim() ? s.trim() : null);

/** Pure: pick the best name we know for `projectId`. */
export function pickProjectName(
  projectId: string,
  active: ActiveProjectRef,
  cloudName?: string | null,
): string {
  const fromCloud = clean(cloudName);
  if (fromCloud) return fromCloud;
  const activeMatches = !active.id || active.id === projectId || projectId === "demo";
  const fromActive = activeMatches ? clean(active.name) : null;
  return fromActive ?? DEFAULT_PROJECT_NAME;
}

/** "Smoke Test 1.03" → "Smoke_Test_1.03_Presentation.pdf" (no path/reserved chars). */
export function presentationFileName(projectName: string, ext = "pdf"): string {
  const base = (clean(projectName) ?? DEFAULT_PROJECT_NAME)
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "ModulCA";
  return `${base}_Presentation.${ext}`;
}

/** Project name state for the presentation page, resolved from the snapshot. */
export function useProjectName(projectId: string): [string, (name: string) => void] {
  const userId = useAuthStore((s) => s.userId);
  const [name, setName] = useState(DEFAULT_PROJECT_NAME);
  const edited = useRef(false);

  useEffect(() => {
    const active = getActiveProject();
    if (!edited.current) setName(pickProjectName(projectId, active));
    if (!userId || projectId === "demo") return;
    let alive = true;
    loadProject(userId, projectId)
      .then((r) => {
        if (alive && r.ok && !edited.current) setName(pickProjectName(projectId, active, r.value.name));
      })
      .catch(() => { /* keep the local name */ });
    return () => { alive = false; };
  }, [projectId, userId]);

  const setByUser = (n: string) => {
    edited.current = true;
    setName(n);
  };
  return [name, setByUser];
}
