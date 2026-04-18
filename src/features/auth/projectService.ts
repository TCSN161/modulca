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

/**
 * SELECT columns — base set that exists in migration 004 (projects table v1).
 * Extended columns (thumbnail, deleted_at) are added by migration 008.
 * We request the extended set but fall back automatically if the live DB
 * hasn't been migrated yet (PGRST204 "column not found" triggers fallback).
 */
const SELECT_COLS_BASE = "id, name, data, created_at, updated_at";
const SELECT_COLS_EXTENDED = "id, name, data, thumbnail, deleted_at, created_at, updated_at";

/**
 * Detect missing-column errors from Supabase/PostgREST so we can fall back
 * to the base schema without breaking the user flow.
 * Error codes/messages we recognise:
 *   - PGRST204 — "Could not find the 'X' column of 'Y' in the schema cache"
 *   - 42703 — PostgreSQL "column does not exist"
 */
function isMissingColumnError(err: { code?: string; message?: string } | null | undefined): boolean {
  if (!err) return false;
  if (err.code === "PGRST204" || err.code === "42703") return true;
  const msg = err.message?.toLowerCase() ?? "";
  return msg.includes("could not find") && msg.includes("column");
}

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

  // Try extended schema first (with thumbnail + deleted_at)
  const extendedResult = await sb
    .from("projects")
    .select(SELECT_COLS_EXTENDED)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (!extendedResult.error) {
    return (extendedResult.data ?? []) as ProjectRecord[];
  }

  // Fallback: base schema (pre-migration-008 DBs don't have these columns)
  if (isMissingColumnError(extendedResult.error)) {
    const baseResult = await sb
      .from("projects")
      .select(SELECT_COLS_BASE)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (!baseResult.error) {
      return (baseResult.data ?? []).map((p) => ({
        ...(p as Partial<ProjectRecord> & { id: string; name: string; data: ProjectDesignData; created_at: string; updated_at: string }),
        thumbnail: null,
        deleted_at: null,
      })) as ProjectRecord[];
    }
    console.warn("[projectService] list fallback error:", baseResult.error.message);
  } else {
    console.warn("[projectService] list error:", extendedResult.error.message);
  }

  return loadLocalProjects().filter((p) => !p.deleted_at); // final fallback
}

/** List soft-deleted projects (trash) — requires migration 008 */
export async function listDeletedProjects(userId: string): Promise<ProjectRecord[]> {
  const sb = getSupabase();

  if (!sb || isDemoMode) {
    return loadLocalProjects().filter((p) => !!p.deleted_at);
  }

  const { data, error } = await sb
    .from("projects")
    .select(SELECT_COLS_EXTENDED)
    .eq("user_id", userId)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) {
    // Pre-migration-008 DBs have no deleted_at column — trash folder is empty
    if (isMissingColumnError(error)) return [];
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
    // UPDATE: try with extended columns, fall back to base if schema lacks them
    const extendedPayload: Record<string, unknown> = {
      name: project.name,
      data: project.data,
    };
    if (project.thumbnail !== undefined) extendedPayload.thumbnail = project.thumbnail;

    const updateResult = await sb
      .from("projects")
      .update(extendedPayload)
      .eq("id", project.id)
      .eq("user_id", userId)
      .select(SELECT_COLS_EXTENDED)
      .single();

    if (!updateResult.error) {
      return { ok: true, value: updateResult.data as ProjectRecord };
    }

    if (isMissingColumnError(updateResult.error)) {
      // Fallback: update without thumbnail, return with null placeholders
      const basePayload = { name: project.name, data: project.data };
      const fbResult = await sb
        .from("projects")
        .update(basePayload)
        .eq("id", project.id)
        .eq("user_id", userId)
        .select(SELECT_COLS_BASE)
        .single();
      if (!fbResult.error && fbResult.data) {
        return { ok: true, value: { ...(fbResult.data as Record<string, unknown>), thumbnail: null, deleted_at: null } as unknown as ProjectRecord };
      }
    }

    console.warn("[projectService] update error:", updateResult.error.message);
    return { ok: false, error: { code: "SUPABASE_ERROR", message: updateResult.error.message } };
  }

  // INSERT: try with extended columns, fall back if needed
  const extendedInsert: Record<string, unknown> = {
    user_id: userId,
    name: project.name,
    data: project.data,
  };
  if (project.thumbnail !== undefined) extendedInsert.thumbnail = project.thumbnail;

  const insertResult = await sb
    .from("projects")
    .insert(extendedInsert)
    .select(SELECT_COLS_EXTENDED)
    .single();

  if (!insertResult.error) {
    return { ok: true, value: insertResult.data as ProjectRecord };
  }

  if (isMissingColumnError(insertResult.error)) {
    // Fallback: insert without thumbnail (pre-migration-008 schema)
    const baseInsert = { user_id: userId, name: project.name, data: project.data };
    const fbResult = await sb
      .from("projects")
      .insert(baseInsert)
      .select(SELECT_COLS_BASE)
      .single();
    if (!fbResult.error && fbResult.data) {
      return { ok: true, value: { ...(fbResult.data as Record<string, unknown>), thumbnail: null, deleted_at: null } as unknown as ProjectRecord };
    }
    if (fbResult.error) {
      console.warn("[projectService] insert fallback error:", fbResult.error.message);
      return { ok: false, error: { code: "SUPABASE_ERROR", message: fbResult.error.message } };
    }
  }

  console.warn("[projectService] insert error:", insertResult.error.message);
  return { ok: false, error: { code: "SUPABASE_ERROR", message: insertResult.error.message } };
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

  const extended = await sb
    .from("projects")
    .select(SELECT_COLS_EXTENDED)
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (!extended.error) {
    return { ok: true, value: extended.data as ProjectRecord };
  }

  // Fallback for pre-migration-008 schema
  if (isMissingColumnError(extended.error)) {
    const base = await sb
      .from("projects")
      .select(SELECT_COLS_BASE)
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();
    if (!base.error && base.data) {
      return { ok: true, value: { ...(base.data as Record<string, unknown>), thumbnail: null, deleted_at: null } as unknown as ProjectRecord };
    }
  }

  console.warn("[projectService] load error:", extended.error.message);
  return { ok: false, error: { code: extended.error.code === "PGRST116" ? "NOT_FOUND" : "SUPABASE_ERROR", message: extended.error.message } };
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

  // Try soft-delete first (requires migration 008)
  const softResult = await sb
    .from("projects")
    .update({ deleted_at: now })
    .eq("id", projectId)
    .eq("user_id", userId);

  if (!softResult.error) {
    return { ok: true, value: true };
  }

  // Pre-migration-008 schema: hard-delete instead (no grace period available)
  if (isMissingColumnError(softResult.error)) {
    const hardResult = await sb
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", userId);
    if (!hardResult.error) return { ok: true, value: true };
    console.warn("[projectService] hard-delete error:", hardResult.error.message);
    return { ok: false, error: { code: "SUPABASE_ERROR", message: hardResult.error.message } };
  }

  console.warn("[projectService] delete error:", softResult.error.message);
  return { ok: false, error: { code: "SUPABASE_ERROR", message: softResult.error.message } };
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
