"use client";

import { useState } from "react";
import { useArchitectStore } from "../store";
import { PHASE_DEFINITIONS } from "../phases";
import type { PhaseId, ChangeOrderStatus, ChangeOrderImpact } from "../types";

const IMPACT_CONFIG: Record<ChangeOrderImpact, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-green-100 text-green-700" },
  medium: { label: "Medium", color: "bg-amber-100 text-amber-700" },
  high: { label: "High", color: "bg-orange-100 text-orange-700" },
  critical: { label: "Critical", color: "bg-red-100 text-red-700" },
};

const STATUS_FLOW: Record<ChangeOrderStatus, { label: string; color: string }> = {
  proposed: { label: "Proposed", color: "bg-blue-100 text-blue-700" },
  assessed: { label: "Assessed", color: "bg-purple-100 text-purple-700" },
  approved: { label: "Approved", color: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
  implemented: { label: "Implemented", color: "bg-brand-teal-100 text-brand-teal-700" },
};

export default function ChangeOrders() {
  const project = useArchitectStore((s) => s.project);
  const addChangeOrder = useArchitectStore((s) => s.addChangeOrder);
  const setChangeOrderStatus = useArchitectStore((s) => s.setChangeOrderStatus);
  const coImpact = useArchitectStore((s) => s.getChangeOrderImpact());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    requestedBy: "",
    phaseId: "detailed-design" as PhaseId,
    impact: "medium" as ChangeOrderImpact,
    costDelta: "",
    scheduleDelta: "",
  });

  if (!project) return null;

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addChangeOrder({
      title: form.title.trim(),
      description: form.description.trim(),
      requestedBy: form.requestedBy || project.client.name || "Client",
      requestDate: new Date().toISOString().split("T")[0],
      phaseId: form.phaseId,
      status: "proposed",
      impact: form.impact,
      costDelta: Number(form.costDelta) || 0,
      scheduleDelta: Number(form.scheduleDelta) || 0,
      notes: "",
    });
    setForm({ title: "", description: "", requestedBy: "", phaseId: "detailed-design", impact: "medium", costDelta: "", scheduleDelta: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-brand-teal-800">Change Orders</h2>
          <p className="text-xs text-gray-400">
            Track scope changes with cost and schedule impact. Every change after design freeze requires formal approval.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-brand-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-teal-700"
        >
          + New Change Order
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Total COs" value={project.changeOrders.length.toString()} />
        <SummaryCard label="Pending" value={coImpact.pending.toString()} color={coImpact.pending > 0 ? "amber" : "gray"} />
        <SummaryCard label="Cost Impact" value={`\u20AC${coImpact.totalCost.toLocaleString()}`} color={coImpact.totalCost > 0 ? "red" : "green"} />
        <SummaryCard label="Schedule Impact" value={`${coImpact.totalDays > 0 ? "+" : ""}${coImpact.totalDays}d`} color={coImpact.totalDays > 0 ? "red" : "gray"} />
      </div>

      {/* New CO form */}
      {showForm && (
        <div className="rounded-xl border border-brand-teal-200 bg-brand-teal-50 p-4 space-y-3">
          <h3 className="text-xs font-bold text-brand-teal-800 uppercase">New Change Order (CO-{String(project.nextChangeOrderNumber).padStart(3, "0")})</h3>
          <div className="grid gap-3 lg:grid-cols-2">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Change title" className="rounded border border-gray-200 px-2 py-1.5 text-xs focus:outline-none" />
            <input value={form.requestedBy} onChange={(e) => setForm({ ...form, requestedBy: e.target.value })} placeholder={`Requested by (default: ${project.client.name || "Client"})`} className="rounded border border-gray-200 px-2 py-1.5 text-xs focus:outline-none" />
          </div>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the change, deviation from original scope, and reason..." rows={2} className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs focus:outline-none" />
          <div className="grid grid-cols-4 gap-2">
            <select value={form.phaseId} onChange={(e) => setForm({ ...form, phaseId: e.target.value as PhaseId })} className="rounded border border-gray-200 px-2 py-1 text-[11px]">
              {PHASE_DEFINITIONS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
            <select value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value as ChangeOrderImpact })} className="rounded border border-gray-200 px-2 py-1 text-[11px]">
              {(Object.keys(IMPACT_CONFIG) as ChangeOrderImpact[]).map((k) => <option key={k} value={k}>{IMPACT_CONFIG[k].label}</option>)}
            </select>
            <input type="number" value={form.costDelta} onChange={(e) => setForm({ ...form, costDelta: e.target.value })} placeholder="Cost +/- EUR" className="rounded border border-gray-200 px-2 py-1 text-[11px]" />
            <input type="number" value={form.scheduleDelta} onChange={(e) => setForm({ ...form, scheduleDelta: e.target.value })} placeholder="Days +/-" className="rounded border border-gray-200 px-2 py-1 text-[11px]" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="rounded bg-brand-teal-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-teal-700">Create</button>
            <button onClick={() => setShowForm(false)} className="rounded bg-gray-200 px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-300">Cancel</button>
          </div>
        </div>
      )}

      {/* CO List */}
      <div className="space-y-2">
        {project.changeOrders.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-400">No change orders yet</p>
            <p className="mt-1 text-xs text-gray-300">Changes after design freeze should be tracked here</p>
          </div>
        ) : (
          [...project.changeOrders].reverse().map((co) => {
            const phase = PHASE_DEFINITIONS.find((d) => d.id === co.phaseId);
            const impactCfg = IMPACT_CONFIG[co.impact];
            const statusCfg = STATUS_FLOW[co.status];
            return (
              <div key={co.id} className="rounded-xl border border-gray-200 bg-white p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-800">CO-{String(co.number).padStart(3, "0")}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${statusCfg.color}`}>{statusCfg.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${impactCfg.color}`}>{impactCfg.label}</span>
                  <span className="flex-1" />
                  <span className="text-[10px] text-gray-400">{phase?.label}</span>
                </div>
                <div className="text-xs font-medium text-gray-700">{co.title}</div>
                {co.description && <div className="mt-0.5 text-[11px] text-gray-500">{co.description}</div>}
                <div className="mt-2 flex items-center gap-3 text-[10px]">
                  <span className="text-gray-400">By: {co.requestedBy}</span>
                  <span className="text-gray-400">{co.requestDate}</span>
                  {co.costDelta !== 0 && (
                    <span className={co.costDelta > 0 ? "text-red-500 font-bold" : "text-green-600 font-bold"}>
                      {co.costDelta > 0 ? "+" : ""}&euro;{co.costDelta.toLocaleString()}
                    </span>
                  )}
                  {co.scheduleDelta !== 0 && (
                    <span className={co.scheduleDelta > 0 ? "text-red-500" : "text-green-600"}>
                      {co.scheduleDelta > 0 ? "+" : ""}{co.scheduleDelta}d
                    </span>
                  )}
                  {/* Status advancement buttons */}
                  <span className="flex-1" />
                  {co.status === "proposed" && (
                    <button onClick={() => setChangeOrderStatus(co.id, "assessed")} className="rounded bg-purple-100 px-2 py-0.5 text-[9px] font-bold text-purple-700 hover:bg-purple-200">Assess</button>
                  )}
                  {co.status === "assessed" && (
                    <>
                      <button onClick={() => setChangeOrderStatus(co.id, "approved")} className="rounded bg-green-100 px-2 py-0.5 text-[9px] font-bold text-green-700 hover:bg-green-200">Approve</button>
                      <button onClick={() => setChangeOrderStatus(co.id, "rejected")} className="rounded bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-700 hover:bg-red-200">Reject</button>
                    </>
                  )}
                  {co.status === "approved" && (
                    <button onClick={() => setChangeOrderStatus(co.id, "implemented")} className="rounded bg-brand-teal-100 px-2 py-0.5 text-[9px] font-bold text-brand-teal-700 hover:bg-brand-teal-200">Mark Done</button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color = "gray" }: { label: string; value: string; color?: string }) {
  const colors: Record<string, string> = {
    gray: "border-gray-200",
    amber: "border-amber-200 bg-amber-50",
    red: "border-red-200 bg-red-50",
    green: "border-green-200 bg-green-50",
  };
  return (
    <div className={`rounded-lg border p-3 ${colors[color] ?? colors.gray}`}>
      <div className="text-[10px] font-bold text-gray-500 uppercase">{label}</div>
      <div className="mt-0.5 text-lg font-bold text-gray-800">{value}</div>
    </div>
  );
}
