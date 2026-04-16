"use client";

import { useArchitectStore } from "../store";
import type { ClientStatus } from "../types";

const STATUS_OPTIONS: { value: ClientStatus; label: string; color: string }[] = [
  { value: "lead", label: "Lead", color: "bg-gray-100 text-gray-600" },
  { value: "proposal-sent", label: "Proposal Sent", color: "bg-blue-100 text-blue-700" },
  { value: "active", label: "Active Project", color: "bg-green-100 text-green-700" },
  { value: "on-hold", label: "On Hold", color: "bg-amber-100 text-amber-700" },
  { value: "completed", label: "Completed", color: "bg-brand-teal-100 text-brand-teal-700" },
  { value: "lost", label: "Lost", color: "bg-red-100 text-red-700" },
];

export default function ClientBrief() {
  const project = useArchitectStore((s) => s.project);
  const updateClient = useArchitectStore((s) => s.updateClient);
  const setClientStatus = useArchitectStore((s) => s.setClientStatus);

  if (!project) return null;
  const { client } = project;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-teal-800">Client Management</h2>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setClientStatus(opt.value)}
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold transition-colors ${
                client.status === opt.value ? opt.color + " ring-1 ring-current" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Client Details */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Client Details</h3>

          <Field label="Full Name" value={client.name} onChange={(v) => updateClient({ name: v })} placeholder="Client full name" />
          <Field label="Email" value={client.email} onChange={(v) => updateClient({ email: v })} placeholder="email@example.com" type="email" />
          <Field label="Phone" value={client.phone} onChange={(v) => updateClient({ phone: v })} placeholder="+40 7xx xxx xxx" />
          <Field label="Company" value={client.company || ""} onChange={(v) => updateClient({ company: v })} placeholder="Company name (optional)" />
          <Field label="Address" value={client.address || ""} onChange={(v) => updateClient({ address: v })} placeholder="Project site or client address" />
          <Field label="How They Found Us" value={client.source || ""} onChange={(v) => updateClient({ source: v })} placeholder="Referral, website, social..." />

          <div>
            <label className="mb-1 block text-[10px] font-bold text-gray-500 uppercase">Budget</label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">&euro;</span>
              <input
                type="number"
                value={client.budget || ""}
                onChange={(e) => updateClient({ budget: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Client's stated budget"
                className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-brand-teal-400 focus:outline-none focus:ring-1 focus:ring-brand-teal-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold text-gray-500 uppercase">Notes</label>
            <textarea
              value={client.notes}
              onChange={(e) => updateClient({ notes: e.target.value })}
              placeholder="Client preferences, important details, meeting notes..."
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-brand-teal-400 focus:outline-none focus:ring-1 focus:ring-brand-teal-400"
            />
          </div>
        </div>

        {/* Proposal Generator */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Proposal Template
          </h3>
          <p className="text-[11px] text-gray-400">
            Use the 80/20 tiered pricing strategy: offer 3 tiers to increase revenue by up to 27%.
            Based on Eric Reinholdt&apos;s &ldquo;Architect + Entrepreneur&rdquo; framework.
          </p>

          {/* Pre-built tier suggestions */}
          <div className="space-y-2">
            <ProposalTierCard
              tier="Essential"
              description="Core design services through planning permission"
              services={["Site survey & brief", "Concept design (2 options)", "Planning application drawings", "Basic cost estimate"]}
              feeHint="15-20% of construction cost"
            />
            <ProposalTierCard
              tier="Complete"
              description="Full design and technical documentation"
              services={["Everything in Essential", "Detailed design & material selection", "Technical/manufacturing drawings", "Tender documentation", "Contractor selection support"]}
              feeHint="25-30% of construction cost"
            />
            <ProposalTierCard
              tier="Executive"
              description="All-inclusive project management"
              services={["Everything in Complete", "Factory production monitoring", "Site supervision & assembly oversight", "Change order management", "Handover & 12-month review"]}
              feeHint="35-45% of construction cost"
            />
          </div>

          <div className="rounded-lg bg-amber-50 p-3 text-[10px] text-amber-800">
            <strong>Scope Creep Prevention:</strong> Define exact revision limits per phase.
            Any additional work requires a formal Change Order with written client approval
            before proceeding. Track revisions in the Phases tab.
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-bold text-gray-500 uppercase">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-brand-teal-400 focus:outline-none focus:ring-1 focus:ring-brand-teal-400"
      />
    </div>
  );
}

function ProposalTierCard({
  tier,
  description,
  services,
  feeHint,
}: {
  tier: string;
  description: string;
  services: string[];
  feeHint: string;
}) {
  return (
    <div className="rounded-lg border border-gray-100 p-3 hover:border-brand-teal-200 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-brand-teal-800">{tier}</span>
        <span className="text-[9px] text-gray-400">{feeHint}</span>
      </div>
      <p className="text-[10px] text-gray-500 mb-1.5">{description}</p>
      <ul className="space-y-0.5">
        {services.map((s, i) => (
          <li key={i} className="text-[10px] text-gray-600 flex items-start gap-1">
            <span className="text-brand-teal-400">&#10003;</span> {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
