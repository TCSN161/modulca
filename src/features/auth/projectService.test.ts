import { describe, it, expect, beforeEach } from "vitest";
import {
  listProjects,
  saveProject,
  loadProject,
  deleteProject,
} from "./projectService";

beforeEach(() => {
  localStorage.clear();
});

describe("listProjects", () => {
  it("returns empty array when no projects saved", async () => {
    const projects = await listProjects("user-1");
    expect(projects).toEqual([]);
  });

  it("returns saved projects from localStorage", async () => {
    const seed = [
      { id: "p1", name: "House A", data: { modules: [] }, thumbnail: null, deleted_at: null, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
    ];
    localStorage.setItem("modulca-projects", JSON.stringify(seed));
    const projects = await listProjects("user-1");
    expect(projects).toHaveLength(1);
    expect(projects[0].name).toBe("House A");
  });
});

describe("saveProject - create", () => {
  it("creates a new project with auto-generated ID", async () => {
    const result = await saveProject("user-1", {
      name: "My First House",
      data: { modules: [{ type: "living" }] },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.id).toMatch(/^local-\d+$/);
    expect(result.value.name).toBe("My First House");
    expect(result.value.data).toEqual({ modules: [{ type: "living" }] });
  });

  it("persists to localStorage", async () => {
    await saveProject("user-1", { name: "House B", data: {} });
    const raw = localStorage.getItem("modulca-projects");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe("House B");
  });

  it("prepends new projects (most recent first)", async () => {
    await saveProject("user-1", { name: "First", data: {} });
    await saveProject("user-1", { name: "Second", data: {} });
    const projects = await listProjects("user-1");
    expect(projects[0].name).toBe("Second");
    expect(projects[1].name).toBe("First");
  });
});

describe("saveProject - update", () => {
  it("updates existing project by ID", async () => {
    const created = await saveProject("user-1", { name: "Original", data: { v: 1 } });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const updated = await saveProject("user-1", { id: created.value.id, name: "Renamed", data: { v: 2 } });
    expect(updated.ok).toBe(true);
    if (!updated.ok) return;
    expect(updated.value.id).toBe(created.value.id);
    expect(updated.value.name).toBe("Renamed");
    expect(updated.value.data).toEqual({ v: 2 });
  });

  it("updates updated_at timestamp", async () => {
    const created = await saveProject("user-1", { name: "Test", data: {} });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const originalTime = created.value.updated_at;
    await new Promise((r) => setTimeout(r, 5));
    const updated = await saveProject("user-1", { id: created.value.id, name: "Test Updated", data: {} });
    expect(updated.ok).toBe(true);
    if (!updated.ok) return;
    expect(updated.value.updated_at).not.toBe(originalTime);
  });

  it("creates new project when ID does not match", async () => {
    await saveProject("user-1", { name: "Existing", data: {} });
    const result = await saveProject("user-1", { id: "nonexistent-id", name: "New One", data: {} });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.id).toMatch(/^local-\d+$/);
    expect(result.value.name).toBe("New One");
    const all = await listProjects("user-1");
    expect(all).toHaveLength(2);
  });
});

describe("loadProject", () => {
  it("loads a project by ID", async () => {
    const created = await saveProject("user-1", { name: "Loadable", data: { modules: ["a", "b"] } });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const loaded = await loadProject("user-1", created.value.id);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.value.name).toBe("Loadable");
    expect(loaded.value.data).toEqual({ modules: ["a", "b"] });
  });

  it("returns error for nonexistent ID", async () => {
    const loaded = await loadProject("user-1", "nope");
    expect(loaded.ok).toBe(false);
    if (loaded.ok) return;
    expect(loaded.error.code).toBe("NOT_FOUND");
  });
});

describe("deleteProject (soft delete)", () => {
  it("soft-deletes the project from active list", async () => {
    const created = await saveProject("user-1", { name: "To Delete", data: {} });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const result = await deleteProject("user-1", created.value.id);
    expect(result.ok).toBe(true);
    const remaining = await listProjects("user-1");
    expect(remaining).toHaveLength(0);
  });

  it("returns ok even if project does not exist (idempotent)", async () => {
    const result = await deleteProject("user-1", "nonexistent");
    expect(result.ok).toBe(true);
  });

  it("only deletes the targeted project", async () => {
    const a = await saveProject("user-1", { name: "Keep", data: {} });
    await new Promise((r) => setTimeout(r, 5));
    const b = await saveProject("user-1", { name: "Delete", data: {} });
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    await deleteProject("user-1", b.value.id);
    const remaining = await listProjects("user-1");
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(a.value.id);
  });
});

describe("edge cases", () => {
  it("handles corrupted localStorage gracefully", async () => {
    localStorage.setItem("modulca-projects", "NOT VALID JSON{{{");
    const projects = await listProjects("user-1");
    expect(projects).toEqual([]);
  });

  it("handles empty localStorage gracefully", async () => {
    localStorage.setItem("modulca-projects", "");
    const projects = await listProjects("user-1");
    expect(projects).toEqual([]);
  });

  it("preserves complex nested data", async () => {
    const complexData = {
      modules: [
        { type: "living", wallConfigs: { north: "solid", south: "door" } },
        { type: "bedroom", fixtures: [{ id: "bed", x: 1.5, z: 2.0 }] },
      ],
      finishLevel: "premium",
      styleDirection: "scandinavian",
    };
    const created = await saveProject("user-1", { name: "Complex", data: complexData });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const loaded = await loadProject("user-1", created.value.id);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.value.data).toEqual(complexData);
  });
});
