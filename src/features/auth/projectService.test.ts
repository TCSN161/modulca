import { describe, it, expect, beforeEach } from "vitest";
import {
  listProjects,
  saveProject,
  loadProject,
  deleteProject,
} from "./projectService";

/**
 * Project Service tests — localStorage fallback mode.
 * In the test environment, Supabase is not configured (no env vars),
 * so all operations fall through to localStorage, which is mocked
 * in src/__tests__/setup.ts.
 */

beforeEach(() => {
  localStorage.clear();
});

/* ═══════════════════════════════════════════════════════════
   listProjects
   ═══════════════════════════════════════════════════════════ */

describe("listProjects", () => {
  it("returns empty array when no projects saved", async () => {
    const projects = await listProjects("user-1");
    expect(projects).toEqual([]);
  });

  it("returns saved projects from localStorage", async () => {
    // Pre-seed localStorage
    const seed = [
      { id: "p1", name: "House A", data: { modules: [] }, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
    ];
    localStorage.setItem("modulca-projects", JSON.stringify(seed));

    const projects = await listProjects("user-1");
    expect(projects).toHaveLength(1);
    expect(projects[0].name).toBe("House A");
  });
});

/* ═══════════════════════════════════════════════════════════
   saveProject — create
   ═══════════════════════════════════════════════════════════ */

describe("saveProject — create", () => {
  it("creates a new project with auto-generated ID", async () => {
    const result = await saveProject("user-1", {
      name: "My First House",
      data: { modules: [{ type: "living" }] },
    });

    expect(result).not.toBeNull();
    expect(result!.id).toMatch(/^local-\d+$/);
    expect(result!.name).toBe("My First House");
    expect(result!.data).toEqual({ modules: [{ type: "living" }] });
    expect(result!.created_at).toBeTruthy();
    expect(result!.updated_at).toBeTruthy();
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

/* ═══════════════════════════════════════════════════════════
   saveProject — update
   ═══════════════════════════════════════════════════════════ */

describe("saveProject — update", () => {
  it("updates existing project by ID", async () => {
    const created = await saveProject("user-1", { name: "Original", data: { v: 1 } });
    expect(created).not.toBeNull();

    const updated = await saveProject("user-1", {
      id: created!.id,
      name: "Renamed",
      data: { v: 2 },
    });

    expect(updated).not.toBeNull();
    expect(updated!.id).toBe(created!.id);
    expect(updated!.name).toBe("Renamed");
    expect(updated!.data).toEqual({ v: 2 });
  });

  it("updates updated_at timestamp", async () => {
    const created = await saveProject("user-1", { name: "Test", data: {} });
    const originalTime = created!.updated_at;

    // Small delay to ensure different timestamp
    await new Promise((r) => setTimeout(r, 5));

    const updated = await saveProject("user-1", {
      id: created!.id,
      name: "Test Updated",
      data: {},
    });

    expect(updated!.updated_at).not.toBe(originalTime);
  });

  it("creates new project when ID doesn't match", async () => {
    await saveProject("user-1", { name: "Existing", data: {} });

    const result = await saveProject("user-1", {
      id: "nonexistent-id",
      name: "New One",
      data: {},
    });

    // Since ID doesn't exist, it creates a new project
    expect(result).not.toBeNull();
    expect(result!.id).toMatch(/^local-\d+$/);
    expect(result!.name).toBe("New One");

    const all = await listProjects("user-1");
    expect(all).toHaveLength(2);
  });
});

/* ═══════════════════════════════════════════════════════════
   loadProject
   ═══════════════════════════════════════════════════════════ */

describe("loadProject", () => {
  it("loads a project by ID", async () => {
    const created = await saveProject("user-1", {
      name: "Loadable",
      data: { modules: ["a", "b"] },
    });

    const loaded = await loadProject("user-1", created!.id);
    expect(loaded).not.toBeNull();
    expect(loaded!.name).toBe("Loadable");
    expect(loaded!.data).toEqual({ modules: ["a", "b"] });
  });

  it("returns null for nonexistent ID", async () => {
    const loaded = await loadProject("user-1", "nope");
    expect(loaded).toBeNull();
  });
});

/* ═══════════════════════════════════════════════════════════
   deleteProject
   ═══════════════════════════════════════════════════════════ */

describe("deleteProject", () => {
  it("removes the project from localStorage", async () => {
    const created = await saveProject("user-1", { name: "To Delete", data: {} });

    const success = await deleteProject("user-1", created!.id);
    expect(success).toBe(true);

    const remaining = await listProjects("user-1");
    expect(remaining).toHaveLength(0);
  });

  it("returns true even if project doesn't exist (idempotent)", async () => {
    const success = await deleteProject("user-1", "nonexistent");
    expect(success).toBe(true);
  });

  it("only deletes the targeted project", async () => {
    const a = await saveProject("user-1", { name: "Keep", data: {} });
    // Small delay to ensure different Date.now() for unique local- ID
    await new Promise((r) => setTimeout(r, 5));
    const b = await saveProject("user-1", { name: "Delete", data: {} });

    expect(a!.id).not.toBe(b!.id); // guard: IDs must differ

    await deleteProject("user-1", b!.id);

    const remaining = await listProjects("user-1");
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(a!.id);
  });
});

/* ═══════════════════════════════════════════════════════════
   Edge cases
   ═══════════════════════════════════════════════════════════ */

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

    const created = await saveProject("user-1", {
      name: "Complex",
      data: complexData,
    });
    const loaded = await loadProject("user-1", created!.id);

    expect(loaded!.data).toEqual(complexData);
  });
});
