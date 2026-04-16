"use client";

import { useState } from "react";
import { useArchitectStore } from "../store";
import { PHASE_DEFINITIONS } from "../phases";
import type { PhaseId } from "../types";

export default function FeeTracker() {
  const project = useArchitectStore((s) => s.project);
  const updateFeeSnapshot = useArchitectStore((s) => s.updateFeeSnapshot);
  const addTimeEntry = useArchitectStore((s) => s.addTimeEntry);
  const removeTimeEntry = useArchitectStore((s) => s.removeTimeEntry);
  const totalHours = useArchitectStore((s) => s.getTotalHoursLogged());

  const [newEntry, setNewEntry] = useState({
    phaseId: "concept-design" as PhaseId,
    hours: "",
    description: "",
    billable: true,
  });

  if (!project) return null;
  const { feeSnapshot } = project;

  const handleAddEntry = () => {
    const hours = parseFloat(newEntry.hours);
    if (!hours || hours <= 0 || !newEntry.description.trim()) return;
    addTimeEntry({
      phaseId: newEntry.phaseId,
      date: new Date().toISOString().split("T")[0],
      hours,
      description: newEntry.description.trim(),
      billable: newEntry.billable,
      rate: feeSnapshot.hourlyRate,
    });
    setNewEntry({ ...newEntry, hours: "", description: "" });
  };

  const totalFee = feeSnapshot.totalFee;
  const totalSpent = Object.values(project.phases).reduce((s, p) => s + p.feeSpent, 0);
  const pctUsed = totalFee > 0 ? Math.round((totalSpent / totalFee) * 100) : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-brand-teal-800">Fee & Time Tracking</h2>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Fee Configuration */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Project Fee</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-500 uppercase">Fee Model</label>
              <select
                value={feeSnapshot.feeModel}
                onChange={(e) => updateFeeSnapshot({ feeModel: e.target.value as any })}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-brand-teal-400 focus:outline-none"
              >
                <option value="fixed">Fixed Fee</option>
                <option value="hourly">Hourly Rate</option>
                <option value="percentage">% of Construction Cost</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-500 uppercase">Total Fee (&euro;)</label>
              <input
                type="number"
                value={totalFee || ""}
                onChange={(e) => updateFeeSnapshot({ totalFee: Number(e.target.value) || 0 })}
                placeholder="e.g., 15000"
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-brand-teal-400 focus:outline-none"
              />
            </div>
          </div>

          {feeSnapshot.feeModel === "percentage" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-bold text-gray-500 uppercase">Construction Cost</label>
                <input
                  type="number"
                  value={feeSnapshot.constructionCost || ""}
                  onChange={(e) => {
                    const cc = Number(e.target.value) || 0;
                    const pct = feeSnapshot.feePercentage || 10;
                    updateFeeSnapshot({ constructionCost: cc, totalFee: Math.round(cc * pct / 100) });
                  }}
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-brand-teal-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold text-gray-500 uppercase">Fee % (5-15%)</label>
                <input
                  type="number"
                  value={feeSnapshot.feePercentage || ""}
                  onChange={(e) => {
                    const pct = Number(e.target.value) || 0;
                    const cc = feeSnapshot.constructionCost || 0;
                    updateFeeSnapshot({ feePercentage: pct, totalFee: Math.round(cc * pct / 100) });
                  }}
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-brand-teal-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {(feeSnapshot.feeModel === "hourly" || feeSnapshot.feeModel === "hybrid") && (
            <div>
              <label className="mb-1 block text-[10px] font-bold text-gray-500 uppercase">Hourly Rate (&euro;)</label>
              <input
                type="number"
                value={feeSnapshot.hourlyRate || ""}
                onChange={(e) => updateFeeSnapshot({ hourlyRate: Number(e.target.value) || 0 })}
                placeholder="e.g., 75"
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-brand-teal-400 focus:outline-none"
              />
            </div>
          )}

          {/* Fee allocation by phase */}
          {totalFee > 0 && (
            <div className="mt-3">
              <h4 className="mb-2 text-[10px] font-bold text-gray-500 uppercase">Phase Budget Allocation</h4>
              <div className="space-y-1">
                {PHASE_DEFINITIONS.map((def) => {
                  const phase = project.phases[def.id];
                  const budget = phase.feeBudget;
                  const spent = phase.feeSpent;
                  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
                  return (
                    <div key={def.id} className="flex items-center gap-2 text-[10px]">
                      <span className="w-32 text-gray-600 truncate">{def.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct > 90 ? "bg-red-400" : pct > 60 ? "bg-amber-400" : "bg-brand-teal-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-20 text-right text-gray-500">
                        &euro;{spent.toLocaleString()} / {budget.toLocaleString()}
                      </span>
                      <span className="w-8 text-right font-bold text-gray-400">{def.feePercentage}%</span>
                    </div>
                  );
                })}
                <div className="flex items-center gap-2 border-t border-gray-100 pt-1 text-[10px] font-bold">
                  <span className="w-32 text-gray-700">Total</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pctUsed > 90 ? "bg-red-500" : "bg-brand-teal-500"}`}
                      style={{ width: `${Math.min(100, pctUsed)}%` }}
                    />
                  </div>
                  <span className="w-20 text-right text-gray-700">
                    &euro;{totalSpent.toLocaleString()} / {totalFee.toLocaleString()}
                  </span>
                  <span className="w-8 text-right text-gray-500">{pctUsed}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Time Tracking */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Time Log</h3>
            <span className="text-xs font-bold text-brand-teal-700">{totalHours}h total</span>
          </div>

          {/* Add entry form */}
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newEntry.phaseId}
                onChange={(e) => setNewEntry({ ...newEntry, phaseId: e.target.value as PhaseId })}
                className="rounded border border-gray-200 px-2 py-1 text-[11px] focus:outline-none"
              >
                {PHASE_DEFINITIONS.map((d) => (
                  <option key={d.id} value={d.id}>{d.number}. {d.label}</option>
                ))}
              </select>
              <input
                type="number"
                value={newEntry.hours}
                onChange={(e) => setNewEntry({ ...newEntry, hours: e.target.value })}
                placeholder="Hours"
                step="0.25"
                min="0.25"
                className="rounded border border-gray-200 px-2 py-1 text-[11px] focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <input
                value={newEntry.description}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                placeholder="What did you work on?"
                onKeyDown={(e) => e.key === "Enter" && handleAddEntry()}
                className="flex-1 rounded border border-gray-200 px-2 py-1 text-[11px] focus:outline-none"
              />
              <button
                onClick={handleAddEntry}
                className="rounded bg-brand-teal-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-brand-teal-700"
              >
                Log
              </button>
            </div>
            <label className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <input
                type="checkbox"
                checked={newEntry.billable}
                onChange={(e) => setNewEntry({ ...newEntry, billable: e.target.checked })}
                className="h-3 w-3 rounded border-gray-300"
              />
              Billable
            </label>
          </div>

          {/* Recent entries */}
          <div className="max-h-64 overflow-y-auto space-y-1">
            {project.timeEntries.length === 0 ? (
              <p className="text-center text-[11px] text-gray-400 py-4">No time entries yet</p>
            ) : (
              [...project.timeEntries].reverse().map((entry) => {
                const phase = PHASE_DEFINITIONS.find((d) => d.id === entry.phaseId);
                return (
                  <div key={entry.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 group">
                    <span className="text-[10px] text-gray-400 w-16">{entry.date}</span>
                    <span className="text-[10px] font-medium text-brand-teal-700 w-8">{entry.hours}h</span>
                    <span className="flex-1 text-[10px] text-gray-600 truncate">{entry.description}</span>
                    <span className="text-[9px] text-gray-400">{phase?.label}</span>
                    {!entry.billable && <span className="text-[8px] text-gray-300">NB</span>}
                    <button
                      onClick={() => removeTimeEntry(entry.id)}
                      className="text-[10px] text-red-400 opacity-0 group-hover:opacity-100"
                    >
                      &times;
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
