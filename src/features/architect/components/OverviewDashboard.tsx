"use client";

import { useArchitectStore } from "../store";
import { PHASE_DEFINITIONS, PHASE_STATUS_CONFIG } from "../phases";

export default function OverviewDashboard() {
  const project = useArchitectStore((s) => s.project);
  const phaseProgress = useArchitectStore((s) => s.getPhaseProgress());
  const dfmaProgress = useArchitectStore((s) => s.getDfmaProgress());
  const totalFeeSpent = useArchitectStore((s) => s.getTotalFeeSpent());
  const totalHours = useArchitectStore((s) => s.getTotalHoursLogged());
  const coImpact = useArchitectStore((s) => s.getChangeOrderImpact());
  const setActiveTab = useArchitectStore((s) => s.setActiveTab);

  if (!project) return null;

  const totalFee = project.feeSnapshot.totalFee;
  const feeUsedPct = totalFee > 0 ? Math.round((totalFeeSpent / totalFee) * 100) : 0;

  // Find current active phase
  const activePhase = PHASE_DEFINITIONS.find(
    (def) => project.phases[def.id].status === "in-progress"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-brand-teal-800">{project.projectName}</h2>
        <p className="text-sm text-gray-500">
          {project.client.name ? `Client: ${project.client.name}` : "No client assigned"}{" "}
          {activePhase && (
            <span className="ml-2 text-brand-teal-600">
              &middot; Current: {activePhase.label}
            </span>
          )}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Phase Progress"
          value={`${phaseProgress.completed}/${phaseProgress.total}`}
          sub={`${phaseProgress.percentage}% complete`}
          color="teal"
          onClick={() => setActiveTab("phases")}
        />
        <KpiCard
          label="Fee Budget"
          value={totalFee > 0 ? `\u20AC${totalFee.toLocaleString()}` : "Not set"}
          sub={totalFee > 0 ? `${feeUsedPct}% spent` : "Set total fee in Fees tab"}
          color="amber"
          onClick={() => setActiveTab("fees")}
        />
        <KpiCard
          label="DfMA Checklist"
          value={`${dfmaProgress.checked}/${dfmaProgress.total}`}
          sub={`${dfmaProgress.criticalDone}/${dfmaProgress.critical} critical done`}
          color={dfmaProgress.criticalDone < dfmaProgress.critical ? "red" : "green"}
          onClick={() => setActiveTab("dfma")}
        />
        <KpiCard
          label="Change Orders"
          value={`${coImpact.approved + coImpact.pending}`}
          sub={coImpact.pending > 0 ? `${coImpact.pending} pending approval` : coImpact.approved > 0 ? `\u20AC${coImpact.totalCost.toLocaleString()} impact` : "No changes"}
          color={coImpact.pending > 0 ? "amber" : "gray"}
          onClick={() => setActiveTab("changes")}
        />
      </div>

      {/* Phase Pipeline */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
          Phase Pipeline
        </h3>
        <div className="flex items-center gap-1">
          {PHASE_DEFINITIONS.map((def, i) => {
            const phase = project.phases[def.id];
            const cfg = PHASE_STATUS_CONFIG[phase.status];
            return (
              <div key={def.id} className="flex items-center flex-1 min-w-0">
                <button
                  onClick={() => setActiveTab("phases")}
                  className={`flex-1 rounded-lg px-2 py-2 text-center transition-colors ${cfg.bg} hover:opacity-80`}
                  title={`${def.label} — ${cfg.label}`}
                >
                  <div className={`text-[9px] font-bold uppercase ${cfg.color}`}>
                    {def.number}
                  </div>
                  <div className="text-[8px] text-gray-600 truncate hidden sm:block">
                    {def.label}
                  </div>
                </button>
                {i < PHASE_DEFINITIONS.length - 1 && (
                  <div className={`mx-0.5 h-px w-2 ${phase.status === "completed" ? "bg-green-400" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {/* Hours Logged */}
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="text-[10px] font-bold text-gray-400 uppercase">Hours Logged</div>
          <div className="mt-1 text-xl font-bold text-brand-teal-800">{totalHours}h</div>
          <div className="text-[10px] text-gray-400">{project.timeEntries.length} entries</div>
        </div>

        {/* Milestones */}
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="text-[10px] font-bold text-gray-400 uppercase">Milestones</div>
          <div className="mt-1 text-xl font-bold text-brand-teal-800">
            {project.milestones.filter((m) => m.completed).length}/{project.milestones.length}
          </div>
          <div className="text-[10px] text-gray-400">
            {project.milestones.find((m) => !m.completed)
              ? `Next: ${project.milestones.find((m) => !m.completed)!.label}`
              : "All complete"}
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="text-[10px] font-bold text-gray-400 uppercase">Project Notes</div>
          <div className="mt-1 text-xl font-bold text-brand-teal-800">{project.notes.length}</div>
          <div className="text-[10px] text-gray-400">
            {project.notes.filter((n) => n.pinned).length} pinned
          </div>
        </div>
      </div>

      {/* Recent Activity / Pinned Notes */}
      {project.notes.filter((n) => n.pinned).length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="mb-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            Pinned Notes
          </h3>
          <div className="space-y-2">
            {project.notes
              .filter((n) => n.pinned)
              .slice(0, 3)
              .map((note) => (
                <div key={note.id} className="text-xs text-amber-800">
                  <span className="text-amber-500">{new Date(note.date).toLocaleDateString()}</span>{" "}
                  &mdash; {note.content}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  color,
  onClick,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  onClick?: () => void;
}) {
  const colorMap: Record<string, string> = {
    teal: "border-brand-teal-200 bg-brand-teal-50",
    amber: "border-amber-200 bg-amber-50",
    green: "border-green-200 bg-green-50",
    red: "border-red-200 bg-red-50",
    gray: "border-gray-200 bg-gray-50",
  };
  const textMap: Record<string, string> = {
    teal: "text-brand-teal-800",
    amber: "text-amber-800",
    green: "text-green-800",
    red: "text-red-800",
    gray: "text-gray-800",
  };
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-3 text-left transition-all hover:shadow-md ${colorMap[color] ?? colorMap.gray}`}
    >
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`mt-1 text-lg font-bold ${textMap[color] ?? textMap.gray}`}>{value}</div>
      <div className="text-[10px] text-gray-500">{sub}</div>
    </button>
  );
}
