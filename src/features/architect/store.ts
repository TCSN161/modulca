"use client";

import { create } from "zustand";
import type {
  ArchitectProject,
  PhaseId,
  PhaseStatus,
  ClientInfo,
  ClientStatus,
  ChangeOrder,
  ChangeOrderStatus,
  TimeEntry,
  Milestone,
  ProjectNote,
  Proposal,
  FeeSnapshot,
} from "./types";
import {
  PHASE_DEFINITIONS,
  createDefaultPhase,
  createDefaultDfmaItems,
  DEFAULT_MILESTONES,
} from "./phases";

const STORE_VERSION = 1;
const STORAGE_KEY = "modulca-architect";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

/* ─── Store Interface ─── */

interface ArchitectStore {
  project: ArchitectProject | null;
  activeTab: "overview" | "phases" | "client" | "fees" | "changes" | "dfma" | "timeline" | "notes";

  // Init & persistence
  initProject: (projectId: string, projectName?: string) => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  setActiveTab: (tab: ArchitectStore["activeTab"]) => void;

  // Phase management
  setPhaseStatus: (phaseId: PhaseId, status: PhaseStatus) => void;
  toggleGate: (phaseId: PhaseId, gateId: string) => void;
  setPhaseNotes: (phaseId: PhaseId, notes: string) => void;
  addPhaseRevision: (phaseId: PhaseId) => void;

  // Client
  updateClient: (client: Partial<ClientInfo>) => void;
  setClientStatus: (status: ClientStatus) => void;

  // Proposals
  addProposal: (proposal: Omit<Proposal, "id">) => void;
  updateProposal: (id: string, updates: Partial<Proposal>) => void;
  removeProposal: (id: string) => void;

  // Fee tracking
  updateFeeSnapshot: (fee: Partial<FeeSnapshot>) => void;
  recalculatePhaseBudgets: () => void;

  // Time tracking
  addTimeEntry: (entry: Omit<TimeEntry, "id">) => void;
  removeTimeEntry: (id: string) => void;

  // Change orders
  addChangeOrder: (co: Omit<ChangeOrder, "id" | "number">) => void;
  updateChangeOrder: (id: string, updates: Partial<ChangeOrder>) => void;
  setChangeOrderStatus: (id: string, status: ChangeOrderStatus) => void;

  // DfMA checklist
  toggleDfmaItem: (itemId: string) => void;
  setDfmaItemNotes: (itemId: string, notes: string) => void;

  // Milestones
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  toggleMilestoneComplete: (id: string) => void;

  // Notes
  addNote: (content: string, phaseId?: PhaseId) => void;
  removeNote: (id: string) => void;
  toggleNotePin: (id: string) => void;

  // Computed
  getPhaseProgress: () => { completed: number; total: number; percentage: number };
  getDfmaProgress: () => { checked: number; total: number; critical: number; criticalDone: number };
  getTotalFeeSpent: () => number;
  getTotalHoursLogged: () => number;
  getChangeOrderImpact: () => { totalCost: number; totalDays: number; approved: number; pending: number };
}

/* ─── Default Project Factory ─── */

function createDefaultProject(projectId: string, name: string): ArchitectProject {
  const totalFee = 0; // User sets this via fee snapshot

  const phases: Record<PhaseId, any> = {} as any;
  for (const def of PHASE_DEFINITIONS) {
    phases[def.id] = createDefaultPhase(def, totalFee);
  }

  return {
    _v: STORE_VERSION,
    projectId,
    projectName: name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    client: {
      name: "",
      email: "",
      phone: "",
      notes: "",
      status: "lead",
    },
    proposals: [],
    phases,
    feeSnapshot: {
      totalFee: 0,
      feeModel: "fixed",
      currency: "EUR",
    },
    timeEntries: [],
    changeOrders: [],
    nextChangeOrderNumber: 1,
    dfmaItems: createDefaultDfmaItems(),
    milestones: DEFAULT_MILESTONES.map((m) => ({
      ...m,
      date: "",
      completed: false,
    })),
    notes: [],
  };
}

/* ─── Store ─── */

export const useArchitectStore = create<ArchitectStore>((set, get) => ({
  project: null,
  activeTab: "overview",

  setActiveTab: (tab) => set({ activeTab: tab }),

  initProject: (projectId, projectName) => {
    const existing = get().project;
    if (existing && existing.projectId === projectId) return;
    // Try loading from storage first
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}-${projectId}`);
      if (raw) {
        const data = JSON.parse(raw);
        if (data._v === STORE_VERSION) {
          set({ project: data });
          return;
        }
      }
    } catch { /* proceed with default */ }
    set({ project: createDefaultProject(projectId, projectName || "New Project") });
  },

  loadFromStorage: () => {
    const proj = get().project;
    if (!proj) return;
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}-${proj.projectId}`);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data._v === STORE_VERSION) set({ project: data });
    } catch { /* ignore */ }
  },

  saveToStorage: () => {
    const proj = get().project;
    if (!proj) return;
    try {
      const updated = { ...proj, updatedAt: new Date().toISOString() };
      localStorage.setItem(`${STORAGE_KEY}-${proj.projectId}`, JSON.stringify(updated));
      set({ project: updated });
    } catch { /* storage full */ }
  },

  // ── Phase Management ──

  setPhaseStatus: (phaseId, status) => {
    const proj = get().project;
    if (!proj) return;
    const phase = { ...proj.phases[phaseId], status };
    if (status === "in-progress" && !phase.startedAt) phase.startedAt = new Date().toISOString();
    if (status === "completed") phase.completedAt = new Date().toISOString();
    set({ project: { ...proj, phases: { ...proj.phases, [phaseId]: phase } } });
    get().saveToStorage();
  },

  toggleGate: (phaseId, gateId) => {
    const proj = get().project;
    if (!proj) return;
    const phase = proj.phases[phaseId];
    const gates = phase.gates.map((g) =>
      g.id === gateId
        ? { ...g, completed: !g.completed, completedAt: !g.completed ? new Date().toISOString() : undefined }
        : g
    );
    set({ project: { ...proj, phases: { ...proj.phases, [phaseId]: { ...phase, gates } } } });
    get().saveToStorage();
  },

  setPhaseNotes: (phaseId, notes) => {
    const proj = get().project;
    if (!proj) return;
    set({ project: { ...proj, phases: { ...proj.phases, [phaseId]: { ...proj.phases[phaseId], notes } } } });
    get().saveToStorage();
  },

  addPhaseRevision: (phaseId) => {
    const proj = get().project;
    if (!proj) return;
    const phase = proj.phases[phaseId];
    set({
      project: {
        ...proj,
        phases: { ...proj.phases, [phaseId]: { ...phase, revisionsUsed: phase.revisionsUsed + 1 } },
      },
    });
    get().saveToStorage();
  },

  // ── Client ──

  updateClient: (updates) => {
    const proj = get().project;
    if (!proj) return;
    set({ project: { ...proj, client: { ...proj.client, ...updates } } });
    get().saveToStorage();
  },

  setClientStatus: (status) => {
    const proj = get().project;
    if (!proj) return;
    set({ project: { ...proj, client: { ...proj.client, status } } });
    get().saveToStorage();
  },

  // ── Proposals ──

  addProposal: (proposal) => {
    const proj = get().project;
    if (!proj) return;
    set({ project: { ...proj, proposals: [...proj.proposals, { ...proposal, id: uid() }] } });
    get().saveToStorage();
  },

  updateProposal: (id, updates) => {
    const proj = get().project;
    if (!proj) return;
    set({
      project: {
        ...proj,
        proposals: proj.proposals.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      },
    });
    get().saveToStorage();
  },

  removeProposal: (id) => {
    const proj = get().project;
    if (!proj) return;
    set({ project: { ...proj, proposals: proj.proposals.filter((p) => p.id !== id) } });
    get().saveToStorage();
  },

  // ── Fee Tracking ──

  updateFeeSnapshot: (fee) => {
    const proj = get().project;
    if (!proj) return;
    set({ project: { ...proj, feeSnapshot: { ...proj.feeSnapshot, ...fee } } });
    get().recalculatePhaseBudgets();
    get().saveToStorage();
  },

  recalculatePhaseBudgets: () => {
    const proj = get().project;
    if (!proj) return;
    const total = proj.feeSnapshot.totalFee;
    const phases = { ...proj.phases };
    for (const def of PHASE_DEFINITIONS) {
      phases[def.id] = {
        ...phases[def.id],
        feeBudget: Math.round(total * phases[def.id].feePercentage / 100),
      };
    }
    set({ project: { ...proj, phases } });
  },

  // ── Time Tracking ──

  addTimeEntry: (entry) => {
    const proj = get().project;
    if (!proj) return;
    const te: TimeEntry = { ...entry, id: uid() };
    // Also update phase actual hours
    const phase = proj.phases[entry.phaseId];
    const updatedPhase = { ...phase, hoursActual: phase.hoursActual + entry.hours };
    set({
      project: {
        ...proj,
        timeEntries: [...proj.timeEntries, te],
        phases: { ...proj.phases, [entry.phaseId]: updatedPhase },
      },
    });
    get().saveToStorage();
  },

  removeTimeEntry: (id) => {
    const proj = get().project;
    if (!proj) return;
    const entry = proj.timeEntries.find((e) => e.id === id);
    if (!entry) return;
    const phase = proj.phases[entry.phaseId];
    set({
      project: {
        ...proj,
        timeEntries: proj.timeEntries.filter((e) => e.id !== id),
        phases: {
          ...proj.phases,
          [entry.phaseId]: { ...phase, hoursActual: Math.max(0, phase.hoursActual - entry.hours) },
        },
      },
    });
    get().saveToStorage();
  },

  // ── Change Orders ──

  addChangeOrder: (co) => {
    const proj = get().project;
    if (!proj) return;
    const changeOrder: ChangeOrder = {
      ...co,
      id: uid(),
      number: proj.nextChangeOrderNumber,
    };
    set({
      project: {
        ...proj,
        changeOrders: [...proj.changeOrders, changeOrder],
        nextChangeOrderNumber: proj.nextChangeOrderNumber + 1,
      },
    });
    get().saveToStorage();
  },

  updateChangeOrder: (id, updates) => {
    const proj = get().project;
    if (!proj) return;
    set({
      project: {
        ...proj,
        changeOrders: proj.changeOrders.map((co) => (co.id === id ? { ...co, ...updates } : co)),
      },
    });
    get().saveToStorage();
  },

  setChangeOrderStatus: (id, status) => {
    const proj = get().project;
    if (!proj) return;
    set({
      project: {
        ...proj,
        changeOrders: proj.changeOrders.map((co) =>
          co.id === id
            ? { ...co, status, ...(status === "approved" ? { approvedAt: new Date().toISOString() } : {}) }
            : co
        ),
      },
    });
    get().saveToStorage();
  },

  // ── DfMA Checklist ──

  toggleDfmaItem: (itemId) => {
    const proj = get().project;
    if (!proj) return;
    set({
      project: {
        ...proj,
        dfmaItems: proj.dfmaItems.map((item) =>
          item.id === itemId
            ? { ...item, checked: !item.checked, checkedAt: !item.checked ? new Date().toISOString() : undefined }
            : item
        ),
      },
    });
    get().saveToStorage();
  },

  setDfmaItemNotes: (itemId, notes) => {
    const proj = get().project;
    if (!proj) return;
    set({
      project: {
        ...proj,
        dfmaItems: proj.dfmaItems.map((item) =>
          item.id === itemId ? { ...item, notes } : item
        ),
      },
    });
    get().saveToStorage();
  },

  // ── Milestones ──

  updateMilestone: (id, updates) => {
    const proj = get().project;
    if (!proj) return;
    set({
      project: {
        ...proj,
        milestones: proj.milestones.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      },
    });
    get().saveToStorage();
  },

  toggleMilestoneComplete: (id) => {
    const proj = get().project;
    if (!proj) return;
    set({
      project: {
        ...proj,
        milestones: proj.milestones.map((m) =>
          m.id === id ? { ...m, completed: !m.completed, actualDate: !m.completed ? today() : undefined } : m
        ),
      },
    });
    get().saveToStorage();
  },

  // ── Notes ──

  addNote: (content, phaseId) => {
    const proj = get().project;
    if (!proj) return;
    const note: ProjectNote = { id: uid(), date: new Date().toISOString(), author: "Architect", content, phaseId };
    set({ project: { ...proj, notes: [note, ...proj.notes] } });
    get().saveToStorage();
  },

  removeNote: (id) => {
    const proj = get().project;
    if (!proj) return;
    set({ project: { ...proj, notes: proj.notes.filter((n) => n.id !== id) } });
    get().saveToStorage();
  },

  toggleNotePin: (id) => {
    const proj = get().project;
    if (!proj) return;
    set({
      project: {
        ...proj,
        notes: proj.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
      },
    });
    get().saveToStorage();
  },

  // ── Computed ──

  getPhaseProgress: () => {
    const proj = get().project;
    if (!proj) return { completed: 0, total: 8, percentage: 0 };
    const phases = Object.values(proj.phases);
    const completed = phases.filter((p) => p.status === "completed").length;
    return { completed, total: phases.length, percentage: Math.round((completed / phases.length) * 100) };
  },

  getDfmaProgress: () => {
    const proj = get().project;
    if (!proj) return { checked: 0, total: 0, critical: 0, criticalDone: 0 };
    const items = proj.dfmaItems;
    const critical = items.filter((i) => i.critical);
    return {
      checked: items.filter((i) => i.checked).length,
      total: items.length,
      critical: critical.length,
      criticalDone: critical.filter((i) => i.checked).length,
    };
  },

  getTotalFeeSpent: () => {
    const proj = get().project;
    if (!proj) return 0;
    return Object.values(proj.phases).reduce((sum, p) => sum + p.feeSpent, 0);
  },

  getTotalHoursLogged: () => {
    const proj = get().project;
    if (!proj) return 0;
    return proj.timeEntries.reduce((sum, e) => sum + e.hours, 0);
  },

  getChangeOrderImpact: () => {
    const proj = get().project;
    if (!proj) return { totalCost: 0, totalDays: 0, approved: 0, pending: 0 };
    const approved = proj.changeOrders.filter((co) => co.status === "approved");
    const pending = proj.changeOrders.filter((co) => co.status === "proposed" || co.status === "assessed");
    return {
      totalCost: approved.reduce((s, co) => s + co.costDelta, 0),
      totalDays: approved.reduce((s, co) => s + co.scheduleDelta, 0),
      approved: approved.length,
      pending: pending.length,
    };
  },
}));
