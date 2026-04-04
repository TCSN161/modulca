"use client";

import { getSupabase, isDemoMode } from "@/shared/lib/supabase";

/**
 * Project persistence service.
 * Supabase when configured, localStorage fallback for demo.
 *
 * Project `data` field stores the full design state as JSON:
 *   { modules, gridCells, gridRotation, finishLevel, styleDirection, ... }
 */

export interface ProjectRecord {
  id: string;
  name: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const LOCAL_KEY = "modulca-projects";

/* ── localStorage helpers ── */

function loadLocalProjects(): ProjectRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalProjects(projects: ProjectRecord[]) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(projects)); } catch { /* */ }
}

/* ── Public API ── */

/** List all projects for current user */
export async function listProjects(userId: string): Promise<ProjectRecord[]> {
  const sb = getSupabase();

  if (!sb || isDemoMode) {
    return loadLocalProjects();
  }

  const { data, error } = await sb
    .from("projects")
    .select("id, name, data, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.warn("[projectService] list error:", error.message);
    return loadLocalProjects(); // fallback
  }

  return (data ?? []) as ProjectRecord[];
}

/** Save (create or update) a project */
export async function saveProject(
  userId: string,
  project: { id?: string; name: string; data: Record<string, unknown> }
): Promise<ProjectRecord | null> {
  const sb = getSupabase();
  const now = new Date().toISOString();

  if (!sb || isDemoMode) {
    // localStorage mode
    const projects = loadLocalProjects();
    const existing = project.id ? projects.find((p) => p.id === project.id) : null;

    if (existing) {
      existing.name = project.name;
      existing.data = project.data;
      existing.updated_at = now;
      saveLocalProjects(projects);
      return existing;
    }

    const newProject: ProjectRecord = {
      id: `local-${Date.now()}`,
      name: project.name,
      data: project.data,
      created_at: now,
      updated_at: now,
    };
    projects.unshift(newProject);
    saveLocalProjects(projects);
    return newProject;
  }

  // Supabase mode
  if (project.id) {
    const { data, error } = await sb
      .from("projects")
      .update({ name: project.name, data: project.data })
      .eq("id", project.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.warn("[projectService] update error:", error.message);
      return null;
    }
    return data as ProjectRecord;
  }

  const { data, error } = await sb
    .from("projects")
    .insert({ user_id: userId, name: project.name, data: project.data })
    .select()
    .single();

  if (error) {
    console.warn("[projectService] insert error:", error.message);
    return null;
  }
  return data as ProjectRecord;
}

/** Load a single project by ID */
export async function loadProject(userId: string, projectId: string): Promise<ProjectRecord | null> {
  const sb = getSupabase();

  if (!sb || isDemoMode) {
    const projects = loadLocalProjects();
    return projects.find((p) => p.id === projectId) ?? null;
  }

  const { data, error } = await sb
    .from("projects")
    .select("id, name, data, created_at, updated_at")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.warn("[projectService] load error:", error.message);
    return null;
  }
  return data as ProjectRecord;
}

/** Delete a project */
export async function deleteProject(userId: string, projectId: string): Promise<boolean> {
  const sb = getSupabase();

  if (!sb || isDemoMode) {
    const projects = loadLocalProjects();
    const filtered = projects.filter((p) => p.id !== projectId);
    saveLocalProjects(filtered);
    return true;
  }

  const { error } = await sb
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", userId);

  if (error) {
    console.warn("[projectService] delete error:", error.message);
    return false;
  }
  return true;
}
