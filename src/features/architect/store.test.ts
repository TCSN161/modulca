import { describe, it, expect, beforeEach } from "vitest";
import { useArchitectStore } from "./store";

/* ═══════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════ */

function initFreshProject(id = "test-project") {
  // Reset store to null first to bypass the "same projectId" guard
  useArchitectStore.setState({ project: null });
  useArchitectStore.getState().initProject(id, "Test Project");
}

beforeEach(() => {
  localStorage.clear();
  useArchitectStore.setState({ project: null, activeTab: "overview" });
});

/* ═══════════════════════════════════════════════════════════
   initProject
   ═══════════════════════════════════════════════════════════ */

describe("initProject", () => {
  it("creates a default project with correct ID and name", () => {
    initFreshProject("proj-1");

    const proj = useArchitectStore.getState().project;
    expect(proj).not.toBeNull();
    expect(proj!.projectId).toBe("proj-1");
    expect(proj!.projectName).toBe("Test Project");
  });

  it("creates default project with 8 phases", () => {
    initFreshProject();

    const proj = useArchitectStore.getState().project!;
    const phaseIds = Object.keys(proj.phases);
    expect(phaseIds).toHaveLength(8);
    expect(phaseIds).toContain("strategic-brief");
    expect(phaseIds).toContain("handover");
  });

  it("all phases start as not-started", () => {
    initFreshProject();

    const proj = useArchitectStore.getState().project!;
    for (const phase of Object.values(proj.phases)) {
      expect(phase.status).toBe("not-started");
    }
  });

  it("has default empty client, no change orders, and DfMA items", () => {
    initFreshProject();

    const proj = useArchitectStore.getState().project!;
    expect(proj.client.name).toBe("");
    expect(proj.client.status).toBe("lead");
    expect(proj.changeOrders).toEqual([]);
    expect(proj.nextChangeOrderNumber).toBe(1);
    expect(proj.dfmaItems.length).toBeGreaterThan(0);
  });

  it("does not reinitialize if same projectId already loaded", () => {
    initFreshProject("proj-1");

    // Modify something
    useArchitectStore.getState().setPhaseStatus("strategic-brief", "in-progress");

    // Try to re-init with same ID
    useArchitectStore.getState().initProject("proj-1", "Overwrite Attempt");

    // Should keep the modified state
    const proj = useArchitectStore.getState().project!;
    expect(proj.phases["strategic-brief"].status).toBe("in-progress");
  });
});

/* ═══════════════════════════════════════════════════════════
   setPhaseStatus
   ═══════════════════════════════════════════════════════════ */

describe("setPhaseStatus", () => {
  it("updates a phase status", () => {
    initFreshProject();

    useArchitectStore.getState().setPhaseStatus("concept-design", "in-progress");

    const proj = useArchitectStore.getState().project!;
    expect(proj.phases["concept-design"].status).toBe("in-progress");
  });

  it("sets startedAt when transitioning to in-progress", () => {
    initFreshProject();

    useArchitectStore.getState().setPhaseStatus("concept-design", "in-progress");

    const proj = useArchitectStore.getState().project!;
    expect(proj.phases["concept-design"].startedAt).toBeTruthy();
  });

  it("sets completedAt when transitioning to completed", () => {
    initFreshProject();

    useArchitectStore.getState().setPhaseStatus("strategic-brief", "completed");

    const proj = useArchitectStore.getState().project!;
    expect(proj.phases["strategic-brief"].completedAt).toBeTruthy();
  });

  it("does not overwrite startedAt on repeated in-progress", () => {
    initFreshProject();

    useArchitectStore.getState().setPhaseStatus("concept-design", "in-progress");
    const first = useArchitectStore.getState().project!.phases["concept-design"].startedAt;

    // Set to review, then back to in-progress
    useArchitectStore.getState().setPhaseStatus("concept-design", "review");
    useArchitectStore.getState().setPhaseStatus("concept-design", "in-progress");

    const proj = useArchitectStore.getState().project!;
    expect(proj.phases["concept-design"].startedAt).toBe(first);
  });
});

/* ═══════════════════════════════════════════════════════════
   toggleGate
   ═══════════════════════════════════════════════════════════ */

describe("toggleGate", () => {
  it("toggles a gate from unchecked to checked", () => {
    initFreshProject();

    const proj = useArchitectStore.getState().project!;
    const gateId = proj.phases["strategic-brief"].gates[0].id;

    useArchitectStore.getState().toggleGate("strategic-brief", gateId);

    const updated = useArchitectStore.getState().project!;
    const gate = updated.phases["strategic-brief"].gates.find((g) => g.id === gateId)!;
    expect(gate.completed).toBe(true);
    expect(gate.completedAt).toBeTruthy();
  });

  it("toggles a gate back from checked to unchecked", () => {
    initFreshProject();

    const proj = useArchitectStore.getState().project!;
    const gateId = proj.phases["strategic-brief"].gates[0].id;

    // Toggle on
    useArchitectStore.getState().toggleGate("strategic-brief", gateId);
    // Toggle off
    useArchitectStore.getState().toggleGate("strategic-brief", gateId);

    const updated = useArchitectStore.getState().project!;
    const gate = updated.phases["strategic-brief"].gates.find((g) => g.id === gateId)!;
    expect(gate.completed).toBe(false);
    expect(gate.completedAt).toBeUndefined();
  });

  it("only affects the targeted gate", () => {
    initFreshProject();

    const proj = useArchitectStore.getState().project!;
    const gates = proj.phases["strategic-brief"].gates;
    expect(gates.length).toBeGreaterThan(1);

    useArchitectStore.getState().toggleGate("strategic-brief", gates[0].id);

    const updated = useArchitectStore.getState().project!;
    expect(updated.phases["strategic-brief"].gates[0].completed).toBe(true);
    expect(updated.phases["strategic-brief"].gates[1].completed).toBe(false);
  });
});

/* ═══════════════════════════════════════════════════════════
   addChangeOrder
   ═══════════════════════════════════════════════════════════ */

describe("addChangeOrder", () => {
  it("adds a change order with auto-incremented number", () => {
    initFreshProject();

    useArchitectStore.getState().addChangeOrder({
      title: "Move window",
      description: "Client wants window moved 0.5m left",
      requestedBy: "Client",
      requestDate: "2026-04-01",
      phaseId: "detailed-design",
      status: "proposed",
      impact: "low",
      costDelta: 200,
      scheduleDelta: 1,
      notes: "",
    });

    const proj = useArchitectStore.getState().project!;
    expect(proj.changeOrders).toHaveLength(1);
    expect(proj.changeOrders[0].number).toBe(1);
    expect(proj.changeOrders[0].title).toBe("Move window");
    expect(proj.nextChangeOrderNumber).toBe(2);
  });

  it("increments number for each subsequent change order", () => {
    initFreshProject();

    const baseCo = {
      title: "CO",
      description: "Desc",
      requestedBy: "Client",
      requestDate: "2026-04-01",
      phaseId: "detailed-design" as const,
      status: "proposed" as const,
      impact: "low" as const,
      costDelta: 0,
      scheduleDelta: 0,
      notes: "",
    };

    useArchitectStore.getState().addChangeOrder({ ...baseCo, title: "CO-1" });
    useArchitectStore.getState().addChangeOrder({ ...baseCo, title: "CO-2" });
    useArchitectStore.getState().addChangeOrder({ ...baseCo, title: "CO-3" });

    const proj = useArchitectStore.getState().project!;
    expect(proj.changeOrders).toHaveLength(3);
    expect(proj.changeOrders[0].number).toBe(1);
    expect(proj.changeOrders[1].number).toBe(2);
    expect(proj.changeOrders[2].number).toBe(3);
    expect(proj.nextChangeOrderNumber).toBe(4);
  });
});

/* ═══════════════════════════════════════════════════════════
   getPhaseProgress
   ═══════════════════════════════════════════════════════════ */

describe("getPhaseProgress", () => {
  it("returns 0% when no phases are completed", () => {
    initFreshProject();

    const progress = useArchitectStore.getState().getPhaseProgress();
    expect(progress.completed).toBe(0);
    expect(progress.total).toBe(8);
    expect(progress.percentage).toBe(0);
  });

  it("returns correct percentage when some phases completed", () => {
    initFreshProject();

    useArchitectStore.getState().setPhaseStatus("strategic-brief", "completed");
    useArchitectStore.getState().setPhaseStatus("concept-design", "completed");

    const progress = useArchitectStore.getState().getPhaseProgress();
    expect(progress.completed).toBe(2);
    expect(progress.total).toBe(8);
    expect(progress.percentage).toBe(25); // 2/8 = 25%
  });

  it("returns 100% when all phases completed", () => {
    initFreshProject();

    const phaseIds = Object.keys(useArchitectStore.getState().project!.phases);
    for (const id of phaseIds) {
      useArchitectStore.getState().setPhaseStatus(id as any, "completed");
    }

    const progress = useArchitectStore.getState().getPhaseProgress();
    expect(progress.completed).toBe(8);
    expect(progress.percentage).toBe(100);
  });

  it("returns default when no project loaded", () => {
    useArchitectStore.setState({ project: null });

    const progress = useArchitectStore.getState().getPhaseProgress();
    expect(progress.completed).toBe(0);
    expect(progress.total).toBe(8);
    expect(progress.percentage).toBe(0);
  });
});

/* ═══════════════════════════════════════════════════════════
   getDfmaProgress
   ═══════════════════════════════════════════════════════════ */

describe("getDfmaProgress", () => {
  it("returns all zeros for unchecked items", () => {
    initFreshProject();

    const progress = useArchitectStore.getState().getDfmaProgress();
    expect(progress.checked).toBe(0);
    expect(progress.total).toBeGreaterThan(0);
    expect(progress.criticalDone).toBe(0);
    expect(progress.critical).toBeGreaterThan(0);
  });

  it("tracks checked items correctly", () => {
    initFreshProject();

    const proj = useArchitectStore.getState().project!;
    const firstItemId = proj.dfmaItems[0].id;

    useArchitectStore.getState().toggleDfmaItem(firstItemId);

    const progress = useArchitectStore.getState().getDfmaProgress();
    expect(progress.checked).toBe(1);
  });

  it("tracks critical items separately", () => {
    initFreshProject();

    const proj = useArchitectStore.getState().project!;
    const criticalItem = proj.dfmaItems.find((i) => i.critical);
    expect(criticalItem).toBeDefined();

    useArchitectStore.getState().toggleDfmaItem(criticalItem!.id);

    const progress = useArchitectStore.getState().getDfmaProgress();
    expect(progress.criticalDone).toBe(1);
  });

  it("returns zeros when no project loaded", () => {
    useArchitectStore.setState({ project: null });

    const progress = useArchitectStore.getState().getDfmaProgress();
    expect(progress).toEqual({ checked: 0, total: 0, critical: 0, criticalDone: 0 });
  });
});
