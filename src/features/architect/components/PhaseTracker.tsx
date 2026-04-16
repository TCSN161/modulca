"use client";

import { useState } from "react";
import { useArchitectStore } from "../store";
import { PHASE_DEFINITIONS, PHASE_STATUS_CONFIG } from "../phases";
import type { PhaseId, PhaseStatus } from "../types";

const STATUS_OPTIONS: PhaseStatus[] = ["not-started", "in-progress", "review", "completed", "blocked"];

export default function PhaseTracker() {
  const project = useArchitectStore((s) => s.project);
  const setPhaseStatus = useArchitectStore((s) => s.setPhaseStatus);
  const toggleGate = useArchitectStore((s) => s.toggleGate);
  const setPhaseNotes = useArchitectStore((s) => s.setPhaseNotes);
  const addPhaseRevision = useArchitectStore((s) => s.addPhaseRevision);
  const [expanded, setExpanded] = useState<PhaseId | null>(null);

  if (!project) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-teal-800">Project Phases</h2>
        <p className="text-xs text-gray-400">RIBA + AIA adapted for modular construction</p>
      </div>

      {PHASE_DEFINITIONS.map((def) => {
        const phase = project.phases[def.id];
        const cfg = PHASE_STATUS_CONFIG[phase.status];
        const isExpanded = expanded === def.id;
        const gatesCompleted = phase.gates.filter((g) => g.completed).length;
        const feePct = phase.feeBudget > 0 ? Math.round((phase.feeSpent / phase.feeBudget) * 100) : 0;

        return (
          <div
            key={def.id}
            className={`rounded-xl border bg-white transition-all ${
              phase.status === "in-progress" ? "border-blue-300 shadow-sm" : "border-gray-200"
            }`}
          >
            {/* Phase Header */}
            <button
              onClick={() => setExpanded(isExpanded ? null : def.id)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              {/* Phase number */}
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
                phase.status === "completed" ? "bg-green-500" :
                phase.status === "in-progress" ? "bg-blue-500" :
                phase.status === "blocked" ? "bg-red-500" : "bg-gray-300"
              }`}>
                {phase.status === "completed" ? "✓" : def.number}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">{def.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  <span className="text-[9px] text-gray-400">{def.ribaStage} / {def.aiaPhase}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-gray-500 truncate">{def.description}</div>
              </div>

              {/* Quick stats */}
              <div className="hidden sm:flex items-center gap-3 text-[10px] text-gray-400">
                <span>Gates: {gatesCompleted}/{phase.gates.length}</span>
                <span>Rev: {phase.revisionsUsed}/{phase.revisionsMax}</span>
                <span>{def.feePercentage}% fee</span>
              </div>

              <svg
                className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-gray-100 p-4 space-y-4">
                {/* Status selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Status:</span>
                  <div className="flex gap-1">
                    {STATUS_OPTIONS.map((s) => {
                      const sc = PHASE_STATUS_CONFIG[s];
                      return (
                        <button
                          key={s}
                          onClick={() => setPhaseStatus(def.id, s)}
                          className={`rounded-full px-2 py-0.5 text-[9px] font-medium transition-colors ${
                            phase.status === s
                              ? `${sc.bg} ${sc.color} ring-1 ring-current`
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          }`}
                        >
                          {sc.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Two-column layout */}
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Left: Gate checklist */}
                  <div>
                    <h4 className="mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Completion Gates
                    </h4>
                    <div className="space-y-1.5">
                      {phase.gates.map((gate) => (
                        <label
                          key={gate.id}
                          className="flex items-start gap-2 rounded-lg p-1.5 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={gate.completed}
                            onChange={() => toggleGate(def.id, gate.id)}
                            className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500"
                          />
                          <div>
                            <div className={`text-xs font-medium ${gate.completed ? "text-green-700 line-through" : "text-gray-700"}`}>
                              {gate.label}
                            </div>
                            <div className="text-[10px] text-gray-400">{gate.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Right: Deliverables & Info */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="mb-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Deliverables
                      </h4>
                      <ul className="space-y-0.5">
                        {def.deliverables.map((d, i) => (
                          <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1">
                            <span className="text-gray-300 mt-0.5">&#8226;</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="mb-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Client Decisions Required
                      </h4>
                      <ul className="space-y-0.5">
                        {def.clientDecisions.map((d, i) => (
                          <li key={i} className="text-[11px] text-amber-700 flex items-start gap-1">
                            <span className="text-amber-300 mt-0.5">&#9679;</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Modular-specific notes */}
                    {def.modularNotes.length > 0 && (
                      <div className="rounded-lg bg-blue-50 p-2.5">
                        <h4 className="mb-1 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                          Modular/DfMA Notes
                        </h4>
                        <ul className="space-y-0.5">
                          {def.modularNotes.map((n, i) => (
                            <li key={i} className="text-[11px] text-blue-800 flex items-start gap-1">
                              <span className="text-blue-400 mt-0.5">&#9654;</span>
                              {n}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fee & revision info */}
                <div className="flex items-center gap-4 border-t border-gray-100 pt-3 text-[10px]">
                  <div>
                    <span className="font-bold text-gray-500">Budget:</span>{" "}
                    <span className="text-brand-teal-700">&euro;{phase.feeBudget.toLocaleString()}</span>
                    {phase.feeSpent > 0 && (
                      <span className={`ml-1 ${feePct > 100 ? "text-red-500" : "text-gray-400"}`}>
                        ({feePct}% used)
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-gray-500">Hours:</span>{" "}
                    <span className="text-brand-teal-700">{phase.hoursActual}h</span>
                    {phase.hoursPlanned > 0 && (
                      <span className="text-gray-400"> / {phase.hoursPlanned}h planned</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-500">Revisions:</span>{" "}
                    <span className={phase.revisionsUsed >= phase.revisionsMax ? "text-red-500 font-bold" : "text-brand-teal-700"}>
                      {phase.revisionsUsed}/{phase.revisionsMax}
                    </span>
                    {phase.revisionsUsed < phase.revisionsMax && (
                      <button
                        onClick={() => addPhaseRevision(def.id)}
                        className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[9px] text-gray-500 hover:bg-gray-200"
                      >
                        +1 Rev
                      </button>
                    )}
                  </div>
                </div>

                {/* Phase notes */}
                <div>
                  <textarea
                    value={phase.notes}
                    onChange={(e) => setPhaseNotes(def.id, e.target.value)}
                    placeholder="Phase notes..."
                    rows={2}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 placeholder:text-gray-300 focus:border-brand-teal-400 focus:outline-none focus:ring-1 focus:ring-brand-teal-400"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
