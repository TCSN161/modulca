"use client";

import { getSupabase, isDemoMode } from "@/shared/lib/supabase";

/**
 * Project persistence service.
 * Supabase when configured, localStorage fallback for demo.
 *
 * Project `data` field stores the full design state as JSON:
 *   { modules, gridCells, gridRotation, finishLevel, styleDirection, ... }
 */

/* ── Types ── */

export interface ProjectDesignData {
  modules?: unknown[];
  gridCells?: unknown[];
  gridRotation?: number;
  finishLevel?: string;
  styleDirection?: string;
  styleDescription?: string;
  stylePhoto?: string | null;
  moodboardPins?: unknown[];
  savedRenders?: unknown[];
  moduleFixtures?: Record<string, unknown>;
  [key: string]: unknown; // forward compat
}

export interface ProjectRecord {
  id: string;
  name: string;
  data: ProjectDesignData;
  thumbnail: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectSavePayload {
  id?: string;
  name: string;
  data: ProjectDesignData;
  thumbnail?: string;
}

export type ProjectServiceError = {
  code: "SUPABASE_ERROR" | "NOT_FOUND" | "STORAGE_ERROR";
  message: string;
};

export type ProjectResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: ProjectServiceError };

const LOCAL_KEY = "modulca-projects";
const SELECT_COLS = "id, name, data, thumbnail, deleted_at, created_at, updated_at";

/* ── localStorage helpers ── */

function loadLocalProjects(): ProjectRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    // Normalize legacy records missing new fields
    return (parsed as ProjectRecord[]).map((p) => ({
      ...p,
      thumbnail: p.thumbnail ?? null,
      deleted_at: p.deleted_at ?? null,
    }));
  } catch { return []; }
}

function saveLocalProjects(projects: ProjectRecord[]) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(projects)); } catch { /* */ }
}

/* ── Public API ── */

/** List all active (non-deleted) projects for current user */
export async function listProjects(userId: string): Promise<ProjectRecord[]> {
  const sb = getSupabase();

  if (!sb || isDemoMode) {
    return loadLocalProjects().filter((p) => !p.deleted_at);
  }

  const { data, error } = await sb
    .from("projects")
    .select(SELECT_COLS)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    console.warn("[projectService] list error:", error.message);
    return loadLocalProjects().filter((p) => !p.deleted_at); // fallback
  }

  return (data ?? []) as ProjectRecord[];
}

/** List soft-deleted projects (trash) */
export async function listDeletedProjects(userId: string): Promise<ProjectRecord[]> {
  const sb = getSupabase();

  if (!sb || isDemoMode) {
    return loadLocalProjects().filter((p) => !!p.deleted_at);
  }

  const { data, error } = await sb
    .from("projects")
    .select(SELECT_COLS)
    .eq("user_id", userId)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) {
    console.warn("[projectService] listDeleted error:", error.message);
    return [];
  }

  return (data ?? []) as ProjectRecord[];
}

/** Save (create or update) a project */
export async function saveProject(
  userId: string,
  project: ProjectSavePayload
): Promise<ProjectResult<ProjectRecord>> {
  const sb = getSupabase();
  const now = new Date().toISOString();

  if (!sb || isDemoMode) {
    // localStorage mode
    const projects = loadLocalProjects();
    const existing = project.id ? projects.find((p) => p.id === project.id) : null;

    if (existing) {
      existing.name = project.name;
      existing.data = project.data;
      existing.thumbnail = project.thumbnail ?? existing.thumbnail;
      existing.updated_at = now;
      saveLocalProjects(projects);
      return { ok: true, value: existing };
    }

    const newProject: ProjectRecord = {
      id: `local-${Date.now()}`,
      name: project.name,
      data: project.data,
      thumbnail: project.thumbnail ?? null,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    };
    projects.unshift(newProject);
    saveLocalProjects(projects);
    return { ok: true, value: newProject };
  }

  // Supabase mode
  if (project.id) {
    const updatePayload: Record<string, unknown> = {
      name: project.name,
      data: project.data,
    };
    if (project.thumbnail !== undefined) updatePayload.thumbnail = project.thumbnail;

    const { data, error } = await sb
      .from("projects")
      .update(updatePayload)
      .eq("id", project.id)
      .eq("user_id", userId)
      .select(SELECT_COLS)
      .single();

    if (error) {
      console.warn("[projectService] update error:", error.message);
      return { ok: false, error: { code: "SUPABASE_ERROR", message: error.message } };
    }
    return { ok: true, value: data as ProjectRecord };
  }

  const { data, error } = await sb
    .from("projects")
    .insert({
      user_id: userId,
      name: project.name,
      data: project.data,
      thumbnail: project.thumbnail ?? null,
    })
    .select(SELECT_COLS)
    .single();

  if (error) {
    console.warn("[projectService] insert error:", error.message);
    return { ok: false, error: { code: "SUPABASE_ERROR", message: error.message } };
  }
  return { ok: true, value: data as ProjectRecord };
}

/** Load a single project by ID */
export async function loadProject(userId: string, projectId: string): Promise<ProjectResult<ProjectRecord>> {
  const sb = getSupabase();

  if (!sb || isDemoMode) {
    const projects = loadLocalProjects();
    const found = projects.find((p) => p.id === projectId);
    if (!found) return { ok: false, error: { code: "NOT_FOUND", message: "Project not found" } };
    return { ok: true, value: found };
  }

  const { data, error } = await sb
    .from("projects")
    .select(SELECT_COLS)
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.warn("[projectService] load error:", error.message);
    return { ok: false, error: { code: "SUPABASE_ERROR", message: error.message } };
  }
  return { ok: true, value: data as ProjectRecord };
}

/** Soft-delete a project (move to trash) */
export async function deleteProject(userId: string, projectId: string): Promise<ProjectResult<boolean>> {
  const sb = getSupabase();
  const now = new Date().toISOString();

  if (!sb || isDemoMode) {
    const projects = loadLocalProjects();
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      project.deleted_at = now;
      saveLocalProjects(projects);
    }
    return { ok: true, value: true };
  }

  const { error } = await sb
    .from("projects")
    .update({ deleted_at: now })
    .eq("id", projectId)
    .eq("user_id", userId);

  if (error) {
    console.warn("[projectService] delete error:", error.message);
    return { ok: false, error: { code: "SUPABASE_ERROR", message: error.message } };
  }
  return { ok: true, value: true };
}

/** Restore a soft-deleted project */
export async function restoreProject(userId: string, projectId: string): Promise<ProjectResult<boolean>> {
  const sb = getSupabase();

  if (!sb || isDemoMode) {
    const projects = loadLocalProjects();
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      project.deleted_at = null;
      saveLocalProjects(projects);
    }
    return { ok: true, value: true };
  }

  const { error } = await sb
    .from("projects")
    .update({ deleted_at: null })
    .eq("id", projectId)
    .eq("user_id", userId);

  if (error) {
    console.warn("[projectService] restore error:", error.message);
    return { ok: false, error: { code: "SUPABASE_ERROR", message: error.message } };
  }
  return { ok: true, value: true };
}

/** Duplicate a project */
export async function duplicateProject(
  userId: string,
  projectId: string,
  newName?: string,
): Promise<ProjectResult<ProjectRecord>> {
  const original = await loadProject(userId, projectId);
  if (!original.ok) return original;

  return saveProject(userId, {
    name: newName || `${original.value.name} (Copy)`,
    data: original.value.data,
    thumbnail: original.value.thumbnail ?? undefined,
  });
}
