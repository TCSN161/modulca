/**
 * Architect Workflow Types
 * ────────────────────────
 * Professional workspace for architects managing modular construction projects.
 * Combines RIBA Plan of Work + AIA phases, adapted for DfMA (Design for
 * Manufacture and Assembly). Gated to Architect+ tier.
 *
 * Key concepts:
 *  - 8 project phases (Strategic Brief → In Use)
 *  - Fee tracking per phase with budget vs actual
 *  - Client management with proposal generation
 *  - DfMA checklist for modular-specific quality gates
 *  - Change order tracking with cost/schedule impact
 *  - Project timeline with milestones
 */

/* ─── Phase System ─── */

export type PhaseId =
  | "strategic-brief"
  | "concept-design"
  | "detailed-design"
  | "technical-manufacturing"
  | "procurement"
  | "factory-site"
  | "assembly"
  | "handover";

export type PhaseStatus = "not-started" | "in-progress" | "review" | "completed" | "blocked";

export interface PhaseGate {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  completedAt?: string; // ISO date
  notes?: string;
}

export interface ProjectPhase {
  id: PhaseId;
  status: PhaseStatus;
  startedAt?: string;
  completedAt?: string;
  feePercentage: number;      // planned % of total fee for this phase
  hoursPlanned: number;       // planned hours
  hoursActual: number;        // actual hours logged
  feeBudget: number;          // EUR budgeted (computed from total × %)
  feeSpent: number;           // EUR actually invoiced/spent
  revisionsUsed: number;      // how many design revisions in this phase
  revisionsMax: number;       // max revisions before change order
  gates: PhaseGate[];         // completion criteria
  notes: string;
}

/* ─── Client Management ─── */

export type ClientStatus = "lead" | "proposal-sent" | "active" | "on-hold" | "completed" | "lost";

export interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  notes: string;
  status: ClientStatus;
  firstContact?: string;     // ISO date
  budget?: number;            // client's stated budget EUR
  source?: string;            // how they found you
}

export interface ProposalTier {
  id: string;
  label: string;              // e.g., "Essential", "Complete", "Executive"
  description: string;
  services: string[];         // included services
  fee: number;                // EUR
  timeline: string;           // e.g., "8-10 weeks"
}

export interface Proposal {
  id: string;
  client: string;             // client name ref
  projectName: string;
  date: string;
  tiers: ProposalTier[];
  selectedTier?: string;      // which tier was chosen
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  validUntil?: string;
  notes: string;
}

/* ─── Fee & Time Tracking ─── */

export interface TimeEntry {
  id: string;
  phaseId: PhaseId;
  date: string;
  hours: number;
  description: string;
  billable: boolean;
  rate?: number;              // hourly rate EUR
}

export interface FeeSnapshot {
  totalFee: number;           // total project fee EUR
  feeModel: "fixed" | "hourly" | "percentage" | "hybrid";
  constructionCost?: number;  // if percentage-based
  feePercentage?: number;     // if percentage-based (typically 5-15%)
  hourlyRate?: number;        // if hourly
  currency: string;
}

/* ─── Change Orders ─── */

export type ChangeOrderStatus = "proposed" | "assessed" | "approved" | "rejected" | "implemented";
export type ChangeOrderImpact = "low" | "medium" | "high" | "critical";

export interface ChangeOrder {
  id: string;
  number: number;             // sequential CO-001, CO-002...
  title: string;
  description: string;
  requestedBy: string;        // client name or "architect"
  requestDate: string;
  phaseId: PhaseId;
  status: ChangeOrderStatus;
  impact: ChangeOrderImpact;
  costDelta: number;          // EUR impact (+/-)
  scheduleDelta: number;      // days impact (+/-)
  approvedAt?: string;
  approvedBy?: string;
  notes: string;
}

/* ─── DfMA Checklist ─── */

export type DfmaCategory =
  | "transport"
  | "structural"
  | "mep"
  | "connections"
  | "tolerances"
  | "factory"
  | "site"
  | "regulatory";

export interface DfmaItem {
  id: string;
  category: DfmaCategory;
  label: string;
  description: string;
  phaseRelevant: PhaseId[];   // which phases this applies to
  checked: boolean;
  checkedAt?: string;
  checkedBy?: string;
  notes?: string;
  critical: boolean;          // blocks phase completion if unchecked
}

/* ─── Milestones & Timeline ─── */

export interface Milestone {
  id: string;
  label: string;
  date: string;               // target date
  actualDate?: string;        // actual completion date
  phaseId: PhaseId;
  completed: boolean;
  description?: string;
}

/* ─── Project Notes / Activity ─── */

export interface ProjectNote {
  id: string;
  date: string;
  author: string;
  content: string;
  phaseId?: PhaseId;
  pinned?: boolean;
}

/* ─── Architect Project (aggregate root) ─── */

export interface ArchitectProject {
  /** Version for localStorage migration */
  _v: number;
  /** Link to design project ID */
  projectId: string;
  projectName: string;
  projectAddress?: string;
  createdAt: string;
  updatedAt: string;

  // Client
  client: ClientInfo;
  proposals: Proposal[];

  // Phases & fees
  phases: Record<PhaseId, ProjectPhase>;
  feeSnapshot: FeeSnapshot;
  timeEntries: TimeEntry[];

  // Change management
  changeOrders: ChangeOrder[];
  nextChangeOrderNumber: number;

  // DfMA
  dfmaItems: DfmaItem[];

  // Timeline
  milestones: Milestone[];

  // Notes
  notes: ProjectNote[];
}
