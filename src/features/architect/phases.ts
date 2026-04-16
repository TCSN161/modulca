/**
 * Architect Phase Definitions
 * ───────────────────────────
 * 8 phases blending RIBA Plan of Work 2020 + AIA project phases,
 * adapted specifically for modular / prefab construction (DfMA).
 *
 * Sources:
 *  - RIBA Plan of Work 2020 (Stages 0-7)
 *  - AIA Basic Services (Pre-Design → CA)
 *  - Eric Reinholdt / 30X40 Design Workshop
 *  - Modular Building Institute DfMA guidelines
 */

import type {
  PhaseId,
  ProjectPhase,
  PhaseGate,
  DfmaItem,
  DfmaCategory,
  Milestone,
} from "./types";

/* ─── Phase Templates ─── */

export interface PhaseDefinition {
  id: PhaseId;
  number: number;
  label: string;
  labelRo: string;
  ribaStage: string;          // RIBA reference
  aiaPhase: string;           // AIA reference
  description: string;
  feePercentage: number;      // recommended fee allocation %
  revisionsMax: number;       // included revisions before change order
  deliverables: string[];
  clientDecisions: string[];
  modularNotes: string[];     // modular-specific considerations
  gateTemplates: Omit<PhaseGate, "completed" | "completedAt" | "notes">[];
}

export const PHASE_DEFINITIONS: PhaseDefinition[] = [
  {
    id: "strategic-brief",
    number: 1,
    label: "Strategic Brief",
    labelRo: "Brief Strategic",
    ribaStage: "RIBA 0-1",
    aiaPhase: "Pre-Design",
    description: "Define project goals, assess feasibility, establish budget and brief. Determine if modular construction is suitable for the site and requirements.",
    feePercentage: 5,
    revisionsMax: 2,
    deliverables: [
      "Client needs assessment",
      "Site feasibility analysis",
      "Modular feasibility report",
      "Project brief document",
      "Preliminary budget estimate",
      "Project timeline outline",
    ],
    clientDecisions: [
      "Confirm project goals and priorities",
      "Approve preliminary budget range",
      "Decide modular vs. traditional construction",
      "Authorize design team appointment",
    ],
    modularNotes: [
      "Assess site access for module delivery (truck turning radius, crane positioning)",
      "Check local regulations for modular/prefab construction",
      "Evaluate transport route from nearest manufacturers",
      "Determine if site conditions suit modular (slope, soil, access)",
    ],
    gateTemplates: [
      { id: "g-sb-1", label: "Client brief approved", description: "Client has signed off on project brief and goals" },
      { id: "g-sb-2", label: "Budget range confirmed", description: "Preliminary budget range agreed" },
      { id: "g-sb-3", label: "Modular feasibility confirmed", description: "Site and project suitable for modular construction" },
      { id: "g-sb-4", label: "Team appointed", description: "Design team and key consultants identified" },
    ],
  },
  {
    id: "concept-design",
    number: 2,
    label: "Concept Design",
    labelRo: "Design Concept",
    ribaStage: "RIBA 2",
    aiaPhase: "Schematic Design",
    description: "Develop initial design concepts. Create module layouts, explore spatial options, and engage manufacturer early for DfMA feedback.",
    feePercentage: 15,
    revisionsMax: 3,
    deliverables: [
      "Concept design drawings (plans, sections, elevations)",
      "Module configuration options (2-3 variants)",
      "Site layout with module placement",
      "Initial 3D visualizations",
      "Preliminary material palette",
      "Updated cost estimate",
    ],
    clientDecisions: [
      "Select preferred concept direction",
      "Approve module count and layout",
      "Confirm style direction and material palette",
      "Authorize specialist consultant appointments",
    ],
    modularNotes: [
      "Engage modular manufacturer early for production feasibility input",
      "Design with standard module dimensions (3m × 3m grid)",
      "Consider transport constraints in module sizing",
      "Optimize for repetitive elements to reduce factory costs",
      "Account for shared wall configurations early",
    ],
    gateTemplates: [
      { id: "g-cd-1", label: "Concept direction selected", description: "Client chose preferred design option" },
      { id: "g-cd-2", label: "Module layout approved", description: "Number and arrangement of modules confirmed" },
      { id: "g-cd-3", label: "Manufacturer consulted", description: "Factory production feasibility confirmed" },
      { id: "g-cd-4", label: "Planning pre-application done", description: "Local authority pre-application feedback received" },
    ],
  },
  {
    id: "detailed-design",
    number: 3,
    label: "Detailed Design",
    labelRo: "Design Detaliat",
    ribaStage: "RIBA 3",
    aiaPhase: "Design Development",
    description: "Refine design with full material selections, structural engineering, and building regulations compliance. Prepare design freeze for manufacturing.",
    feePercentage: 20,
    revisionsMax: 2,
    deliverables: [
      "Detailed floor plans with dimensions",
      "Complete material and finish schedule",
      "Structural engineering coordination",
      "MEP (mechanical/electrical/plumbing) design",
      "Planning application documents",
      "Updated project cost estimate",
      "Design freeze documentation",
    ],
    clientDecisions: [
      "Final material and finish selections",
      "Approve planning submission",
      "Sign design freeze agreement",
      "Confirm construction budget commitment",
    ],
    modularNotes: [
      "DESIGN FREEZE: All module specifications must be finalized before factory production",
      "Coordinate MEP routing at module-to-module connection points",
      "Specify wall thickness configurations (15/25/30cm) per module",
      "Detail connection hardware between modules",
      "Ensure all elements can be manufactured in factory setting",
      "Changes after this point require formal Change Orders",
    ],
    gateTemplates: [
      { id: "g-dd-1", label: "Materials finalized", description: "All material selections confirmed and priced" },
      { id: "g-dd-2", label: "Planning submitted", description: "Planning application submitted to local authority" },
      { id: "g-dd-3", label: "Design freeze signed", description: "Client signed design freeze — no changes without formal CO" },
      { id: "g-dd-4", label: "Structural approved", description: "Structural engineer signed off on design" },
      { id: "g-dd-5", label: "MEP coordinated", description: "All MEP routes confirmed at module connections" },
    ],
  },
  {
    id: "technical-manufacturing",
    number: 4,
    label: "Technical & Manufacturing",
    labelRo: "Tehnic & Fabricare",
    ribaStage: "RIBA 4",
    aiaPhase: "Construction Documents",
    description: "Produce detailed technical drawings for building regulations and factory production. LOD 400-500 level specifications for manufacturing.",
    feePercentage: 25,
    revisionsMax: 1,
    deliverables: [
      "Full technical drawing set (floor plans, sections, elevations, details)",
      "Factory production drawings (LOD 400+)",
      "Building regulations submission",
      "Tender documentation for contractors",
      "Module specification sheets",
      "Assembly sequence drawings",
      "Connection detail drawings",
    ],
    clientDecisions: [
      "Approve tender documents",
      "Confirm contractor procurement method",
      "Review final cost before construction commitment",
    ],
    modularNotes: [
      "Production drawings require LOD 400-500 (millimeter precision)",
      "Include lifting point details for crane operations",
      "Specify transport reinforcement requirements",
      "Detail all module-to-module connection hardware",
      "Create assembly sequence for on-site crane operations",
      "Include quality control checkpoints for factory inspection",
    ],
    gateTemplates: [
      { id: "g-tm-1", label: "Building regs approved", description: "Building regulations approval received" },
      { id: "g-tm-2", label: "Production drawings complete", description: "Factory-ready drawings at LOD 400+" },
      { id: "g-tm-3", label: "Tender docs issued", description: "Tender documentation sent to contractors" },
      { id: "g-tm-4", label: "DfMA checklist complete", description: "All critical DfMA items verified" },
    ],
  },
  {
    id: "procurement",
    number: 5,
    label: "Procurement & Bidding",
    labelRo: "Achiziții & Licitare",
    ribaStage: "RIBA 4-5",
    aiaPhase: "Bidding & Negotiation",
    description: "Select manufacturer and site contractor. Evaluate bids, negotiate contracts, finalize procurement.",
    feePercentage: 5,
    revisionsMax: 0,
    deliverables: [
      "Qualified bidder list",
      "Bid comparison analysis",
      "Contractor/manufacturer recommendation",
      "Contract documents",
      "Production schedule from manufacturer",
    ],
    clientDecisions: [
      "Select manufacturer and site contractor",
      "Approve contract terms",
      "Authorize production start",
    ],
    modularNotes: [
      "Evaluate manufacturer's factory capacity and lead times",
      "Check manufacturer quality certifications (ISO, CE marking)",
      "Confirm transport logistics and module delivery schedule",
      "Review manufacturer's change order process and timelines",
      "Consider factory visit to assess production capabilities",
    ],
    gateTemplates: [
      { id: "g-pr-1", label: "Bids received", description: "All bids received and evaluated" },
      { id: "g-pr-2", label: "Contractor selected", description: "Client approved manufacturer/contractor selection" },
      { id: "g-pr-3", label: "Contracts signed", description: "All contracts executed" },
    ],
  },
  {
    id: "factory-site",
    number: 6,
    label: "Factory + Site Prep",
    labelRo: "Fabrică + Pregătire Teren",
    ribaStage: "RIBA 5a",
    aiaPhase: "Construction Administration",
    description: "Parallel workflows: factory manufactures modules while site is prepared (foundations, services). This is the key efficiency advantage of modular construction.",
    feePercentage: 15,
    revisionsMax: 0,
    deliverables: [
      "Factory production monitoring reports",
      "Site preparation progress reports",
      "Quality inspection results (factory and site)",
      "Module delivery logistics plan",
      "Submittal reviews and RFI responses",
    ],
    clientDecisions: [
      "Approve factory inspection results",
      "Confirm site readiness for delivery",
      "Authorize any change orders (with cost/schedule impact)",
    ],
    modularNotes: [
      "PARALLEL TRACKING: Monitor factory progress AND site prep simultaneously",
      "Factory: Track production milestones for each module",
      "Site: Foundation, utilities, crane pad, access road must be ready before delivery",
      "Schedule factory inspections at key production milestones",
      "Coordinate delivery dates with site readiness and crane availability",
      "Weather windows for module delivery and crane operations",
    ],
    gateTemplates: [
      { id: "g-fs-1", label: "Factory QC passed", description: "All modules passed factory quality control" },
      { id: "g-fs-2", label: "Site foundations complete", description: "Foundations ready to receive modules" },
      { id: "g-fs-3", label: "Utilities connected", description: "Site services (water, electric, sewer) ready at connection points" },
      { id: "g-fs-4", label: "Delivery logistics confirmed", description: "Transport route, dates, and crane booked" },
    ],
  },
  {
    id: "assembly",
    number: 7,
    label: "Assembly & Construction",
    labelRo: "Asamblare & Construcție",
    ribaStage: "RIBA 5b",
    aiaPhase: "Construction Administration",
    description: "Module delivery, crane assembly, on-site connections, finishing works, and inspections.",
    feePercentage: 10,
    revisionsMax: 0,
    deliverables: [
      "Assembly supervision reports",
      "Connection inspection records",
      "Snagging/punch list",
      "As-built documentation",
      "Compliance certificates",
    ],
    clientDecisions: [
      "Approve punch list completion",
      "Accept practical completion",
      "Confirm any remaining change orders",
    ],
    modularNotes: [
      "Assembly typically 1-3 days for residential (vs. months for traditional)",
      "Crane operations require certified operator and clear weather",
      "Module-to-module connections must be inspected and sealed",
      "Service connections (MEP) between modules need testing",
      "Weatherproofing at module joints is critical",
      "Maintain assembly sequence as specified in technical drawings",
    ],
    gateTemplates: [
      { id: "g-as-1", label: "Modules delivered", description: "All modules delivered to site intact" },
      { id: "g-as-2", label: "Assembly complete", description: "All modules placed and structurally connected" },
      { id: "g-as-3", label: "Services connected", description: "MEP connections between modules complete and tested" },
      { id: "g-as-4", label: "Punch list clear", description: "All snagging items resolved" },
      { id: "g-as-5", label: "Practical completion", description: "Building inspector signed practical completion" },
    ],
  },
  {
    id: "handover",
    number: 8,
    label: "Handover & Use",
    labelRo: "Predare & Utilizare",
    ribaStage: "RIBA 6-7",
    aiaPhase: "Post-Construction",
    description: "Transfer building to client. Provide manuals, warranties, defect rectification. Monitor building performance.",
    feePercentage: 5,
    revisionsMax: 0,
    deliverables: [
      "Building operations manual",
      "Warranty documentation",
      "As-built drawings (final)",
      "Energy performance certificate",
      "Defect liability tracking",
      "12-month review report",
    ],
    clientDecisions: [
      "Accept building handover",
      "Confirm defect liability period start",
      "Schedule 12-month review",
    ],
    modularNotes: [
      "Provide module-specific maintenance guidance",
      "Document connection point locations for future maintenance access",
      "Module manufacturer warranty typically separate from site contractor",
      "Track thermal performance (verify U-values match specifications)",
      "Review for potential future module additions/modifications",
    ],
    gateTemplates: [
      { id: "g-ho-1", label: "Handover complete", description: "All documentation transferred to client" },
      { id: "g-ho-2", label: "Defects rectified", description: "All defects identified and resolved" },
      { id: "g-ho-3", label: "12-month review done", description: "Post-occupancy review completed" },
    ],
  },
];

/* ─── DfMA Checklist Templates ─── */

export interface DfmaTemplate {
  id: string;
  category: DfmaCategory;
  label: string;
  description: string;
  phaseRelevant: PhaseId[];
  critical: boolean;
}

export const DFMA_CHECKLIST_TEMPLATES: DfmaTemplate[] = [
  // Transport
  { id: "dfma-t1", category: "transport", label: "Module dimensions fit transport", description: "Each module ≤3.5m wide × 3.5m high × 12m long for standard road transport", phaseRelevant: ["concept-design", "detailed-design"], critical: true },
  { id: "dfma-t2", category: "transport", label: "Transport route surveyed", description: "Route from factory to site checked for clearance, turns, bridge loads", phaseRelevant: ["procurement", "factory-site"], critical: true },
  { id: "dfma-t3", category: "transport", label: "Lifting points designed", description: "Structural lifting points specified for crane operations", phaseRelevant: ["technical-manufacturing"], critical: true },
  { id: "dfma-t4", category: "transport", label: "Transport reinforcement specified", description: "Temporary bracing for transport loads detailed", phaseRelevant: ["technical-manufacturing"], critical: false },

  // Structural
  { id: "dfma-s1", category: "structural", label: "Module-to-module connections detailed", description: "All structural connections between adjacent modules specified", phaseRelevant: ["detailed-design", "technical-manufacturing"], critical: true },
  { id: "dfma-s2", category: "structural", label: "Foundation interface detailed", description: "Module-to-foundation connection system specified", phaseRelevant: ["technical-manufacturing"], critical: true },
  { id: "dfma-s3", category: "structural", label: "Stacking loads verified", description: "For multi-story: upper modules' loads on lower verified", phaseRelevant: ["detailed-design"], critical: true },
  { id: "dfma-s4", category: "structural", label: "Shared wall discount applied", description: "Cost savings from shared walls correctly calculated", phaseRelevant: ["concept-design", "detailed-design"], critical: false },

  // MEP
  { id: "dfma-m1", category: "mep", label: "Inter-module MEP alignment", description: "Electrical, plumbing, HVAC connections align precisely at module boundaries", phaseRelevant: ["detailed-design", "technical-manufacturing"], critical: true },
  { id: "dfma-m2", category: "mep", label: "Service access points documented", description: "All module connection points for maintenance access are documented", phaseRelevant: ["technical-manufacturing", "handover"], critical: false },
  { id: "dfma-m3", category: "mep", label: "Wet room modules identified", description: "Bathroom and kitchen modules have factory-installed plumbing", phaseRelevant: ["concept-design"], critical: false },

  // Connections
  { id: "dfma-c1", category: "connections", label: "Weatherproofing at joints", description: "Rain/wind sealing system specified for all module-to-module joints", phaseRelevant: ["technical-manufacturing", "assembly"], critical: true },
  { id: "dfma-c2", category: "connections", label: "Thermal bridging prevented", description: "Insulation continuity ensured at module connections", phaseRelevant: ["detailed-design", "technical-manufacturing"], critical: true },
  { id: "dfma-c3", category: "connections", label: "Fire stopping at boundaries", description: "Fire barriers between modules comply with regulations", phaseRelevant: ["technical-manufacturing"], critical: true },

  // Tolerances
  { id: "dfma-tol1", category: "tolerances", label: "Manufacturing tolerances specified", description: "±2mm for module frame, ±5mm for overall dimensions", phaseRelevant: ["technical-manufacturing"], critical: true },
  { id: "dfma-tol2", category: "tolerances", label: "Site tolerance allowance", description: "Foundation levels within ±5mm for module seating", phaseRelevant: ["factory-site"], critical: true },

  // Factory
  { id: "dfma-f1", category: "factory", label: "Production sequence defined", description: "Module manufacturing order optimized for factory workflow", phaseRelevant: ["technical-manufacturing", "factory-site"], critical: false },
  { id: "dfma-f2", category: "factory", label: "Factory QC checkpoints set", description: "Quality control inspections at key production stages", phaseRelevant: ["factory-site"], critical: true },
  { id: "dfma-f3", category: "factory", label: "Repetitive elements maximized", description: "Identical modules and components reduce waste and cost", phaseRelevant: ["concept-design", "detailed-design"], critical: false },

  // Site
  { id: "dfma-site1", category: "site", label: "Crane access and pad", description: "Crane position, reach, and ground bearing capacity confirmed", phaseRelevant: ["procurement", "factory-site"], critical: true },
  { id: "dfma-site2", category: "site", label: "Assembly sequence planned", description: "Module placement order accounts for crane reach and access", phaseRelevant: ["technical-manufacturing", "assembly"], critical: true },

  // Regulatory
  { id: "dfma-r1", category: "regulatory", label: "Modular construction permitted", description: "Local authority accepts modular/prefab construction method", phaseRelevant: ["strategic-brief"], critical: true },
  { id: "dfma-r2", category: "regulatory", label: "Factory inspection regime", description: "Third-party inspection for off-site manufacturing arranged", phaseRelevant: ["factory-site"], critical: false },
  { id: "dfma-r3", category: "regulatory", label: "Transport permits obtained", description: "Special transport permits for oversize loads if required", phaseRelevant: ["factory-site"], critical: false },
];

/* ─── Default Milestone Templates ─── */

export const DEFAULT_MILESTONES: Omit<Milestone, "date" | "actualDate" | "completed">[] = [
  { id: "ms-brief", label: "Brief Approved", phaseId: "strategic-brief", description: "Client signs off on project brief" },
  { id: "ms-concept", label: "Concept Selected", phaseId: "concept-design", description: "Design direction chosen from options" },
  { id: "ms-planning", label: "Planning Submitted", phaseId: "detailed-design", description: "Planning application filed" },
  { id: "ms-freeze", label: "Design Freeze", phaseId: "detailed-design", description: "No further design changes — manufacturing can begin" },
  { id: "ms-planning-approved", label: "Planning Approved", phaseId: "detailed-design", description: "Planning permission granted" },
  { id: "ms-tender", label: "Tender Issued", phaseId: "technical-manufacturing", description: "Tender documents sent to bidders" },
  { id: "ms-contract", label: "Contract Signed", phaseId: "procurement", description: "Manufacturer/contractor contract executed" },
  { id: "ms-factory-start", label: "Factory Production Start", phaseId: "factory-site", description: "Module manufacturing begins" },
  { id: "ms-site-ready", label: "Site Ready", phaseId: "factory-site", description: "Foundations and services complete" },
  { id: "ms-delivery", label: "Module Delivery", phaseId: "assembly", description: "Modules arrive on site" },
  { id: "ms-assembly", label: "Assembly Complete", phaseId: "assembly", description: "All modules placed and connected" },
  { id: "ms-handover", label: "Handover", phaseId: "handover", description: "Building handed over to client" },
];

/* ─── Helpers ─── */

export function getPhaseDefinition(id: PhaseId): PhaseDefinition {
  return PHASE_DEFINITIONS.find((p) => p.id === id)!;
}

export function createDefaultPhase(def: PhaseDefinition, totalFee: number): ProjectPhase {
  return {
    id: def.id,
    status: "not-started",
    feePercentage: def.feePercentage,
    hoursPlanned: 0,
    hoursActual: 0,
    feeBudget: Math.round(totalFee * def.feePercentage / 100),
    feeSpent: 0,
    revisionsUsed: 0,
    revisionsMax: def.revisionsMax,
    gates: def.gateTemplates.map((g) => ({ ...g, completed: false })),
    notes: "",
  };
}

export function createDefaultDfmaItems(): DfmaItem[] {
  return DFMA_CHECKLIST_TEMPLATES.map((t) => ({
    ...t,
    checked: false,
    phaseRelevant: t.phaseRelevant,
  }));
}

/** Category labels for DfMA display */
export const DFMA_CATEGORY_LABELS: Record<DfmaCategory, { label: string; icon: string }> = {
  transport: { label: "Transport & Logistics", icon: "🚛" },
  structural: { label: "Structural", icon: "🏗️" },
  mep: { label: "MEP Systems", icon: "⚡" },
  connections: { label: "Module Connections", icon: "🔗" },
  tolerances: { label: "Tolerances & Precision", icon: "📐" },
  factory: { label: "Factory Production", icon: "🏭" },
  site: { label: "Site Operations", icon: "🏠" },
  regulatory: { label: "Regulatory & Compliance", icon: "📋" },
};

/** Phase status display config */
export const PHASE_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  "not-started": { label: "Not Started", color: "text-gray-400", bg: "bg-gray-100" },
  "in-progress": { label: "In Progress", color: "text-blue-600", bg: "bg-blue-50" },
  "review": { label: "Under Review", color: "text-amber-600", bg: "bg-amber-50" },
  "completed": { label: "Completed", color: "text-green-600", bg: "bg-green-50" },
  "blocked": { label: "Blocked", color: "text-red-600", bg: "bg-red-50" },
};
