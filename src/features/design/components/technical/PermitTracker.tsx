"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Building Permit Tracker — project management zone for tracking
 * the Romanian building permit process (Autorizatie de Construire).
 * Users can check off completed steps and upload reference documents.
 */

interface PermitStep {
  id: string;
  label: string;
  labelRo: string;
  description: string;
  required: boolean;
}

interface PermitStepState {
  completed: boolean;
  docName: string | null;
  notes: string;
  completedDate: string | null;
}

const PERMIT_STEPS: PermitStep[] = [
  {
    id: "cu",
    label: "Urban Planning Certificate",
    labelRo: "Certificat de Urbanism (CU)",
    description: "Obtained from local city hall (primarie). Valid 12-24 months. Defines building parameters.",
    required: true,
  },
  {
    id: "geo",
    label: "Geotechnical Study",
    labelRo: "Studiu Geotehnic",
    description: "Soil survey for foundation design. Required by structural engineer.",
    required: true,
  },
  {
    id: "topo",
    label: "Topographic Survey",
    labelRo: "Ridicare Topografica",
    description: "Land survey showing boundaries, elevation, and existing structures.",
    required: true,
  },
  {
    id: "dtac",
    label: "Technical Project (DTAC)",
    labelRo: "Proiect Tehnic (DTAC)",
    description: "Full architectural drawings package signed by a licensed architect.",
    required: true,
  },
  {
    id: "avize",
    label: "Utility Approvals",
    labelRo: "Avize Utilitati",
    description: "Approvals from water, electricity, gas, and telecom providers.",
    required: true,
  },
  {
    id: "isu",
    label: "Fire Safety Approval",
    labelRo: "Aviz ISU (Pompieri)",
    description: "Fire safety review — required for buildings over certain size.",
    required: false,
  },
  {
    id: "mediu",
    label: "Environmental Approval",
    labelRo: "Acord de Mediu",
    description: "Environmental impact assessment — may be required depending on location.",
    required: false,
  },
  {
    id: "ac",
    label: "Building Permit",
    labelRo: "Autorizatie de Construire (AC)",
    description: "The actual building permit. Valid 12 months (extendable). Must be displayed on site.",
    required: true,
  },
  {
    id: "diriginte",
    label: "Site Supervisor",
    labelRo: "Diriginte de Santier",
    description: "Licensed construction supervisor hired before work begins.",
    required: true,
  },
  {
    id: "osb",
    label: "Start of Works Notice",
    labelRo: "Anunt Incepere Lucrari",
    description: "Notify ISC (Inspectoratul de Stat in Constructii) before starting construction.",
    required: true,
  },
  {
    id: "receptie",
    label: "Final Inspection",
    labelRo: "Receptie la Terminare",
    description: "Inspection by the building commission at completion. Required for occupancy.",
    required: true,
  },
  {
    id: "intabulare",
    label: "Land Registry",
    labelRo: "Intabulare (ANCPI)",
    description: "Register the building in the national cadastre system. Enables property sale/mortgage.",
    required: true,
  },
];

const STORAGE_KEY = "modulca-permit-tracker";

function loadState(): Record<string, PermitStepState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveState(state: Record<string, PermitStepState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export default function PermitTracker({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [steps, setSteps] = useState<Record<string, PermitStepState>>({});
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  useEffect(() => {
    if (open) setSteps(loadState());
  }, [open]);

  const updateStep = useCallback((id: string, update: Partial<PermitStepState>) => {
    setSteps((prev) => {
      const next = {
        ...prev,
        [id]: {
          ...{ completed: false, docName: null, notes: "", completedDate: null },
          ...prev[id],
          ...update,
        },
      };
      saveState(next);
      return next;
    });
  }, []);

  const completedCount = PERMIT_STEPS.filter((s) => steps[s.id]?.completed).length;
  const progress = Math.round((completedCount / PERMIT_STEPS.length) * 100);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Building Permit Tracker</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">Romanian Construction Authorization Process</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
              <span>{completedCount} of {PERMIT_STEPS.length} steps completed</span>
              <span className="font-bold text-brand-teal-800">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-teal-800 to-emerald-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {PERMIT_STEPS.map((step, i) => {
            const state = steps[step.id] || { completed: false, docName: null, notes: "", completedDate: null };
            const isExpanded = expandedStep === step.id;

            return (
              <div
                key={step.id}
                className={`rounded-lg border transition-colors ${
                  state.completed
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                {/* Main row */}
                <div className="flex items-center gap-3 px-3 py-2.5">
                  {/* Checkbox */}
                  <button
                    onClick={() => updateStep(step.id, {
                      completed: !state.completed,
                      completedDate: !state.completed ? new Date().toISOString().slice(0, 10) : null,
                    })}
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      state.completed
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-gray-300 hover:border-brand-amber-500"
                    }`}
                  >
                    {state.completed && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Step info */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedStep(isExpanded ? null : step.id)}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-bold">{i + 1}</span>
                      <span className={`text-xs font-semibold ${state.completed ? "text-emerald-700 line-through" : "text-gray-800"}`}>
                        {step.label}
                      </span>
                      {step.required && !state.completed && (
                        <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">REQUIRED</span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">{step.labelRo}</span>
                  </div>

                  {/* Document indicator */}
                  {state.docName && (
                    <div className="flex-shrink-0">
                      <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">DOC</span>
                    </div>
                  )}

                  {/* Expand arrow */}
                  <button onClick={() => setExpandedStep(isExpanded ? null : step.id)} className="flex-shrink-0 text-gray-400">
                    <svg className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-gray-100 space-y-3">
                    <p className="text-[11px] text-gray-500 leading-relaxed">{step.description}</p>

                    {/* Completion date */}
                    {state.completed && state.completedDate && (
                      <div className="text-[10px] text-emerald-600">
                        Completed on {state.completedDate}
                      </div>
                    )}

                    {/* Document upload placeholder */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Document Reference</label>
                      <input
                        type="text"
                        value={state.docName || ""}
                        onChange={(e) => updateStep(step.id, { docName: e.target.value || null })}
                        placeholder="e.g., CU_Nr_123_2026.pdf"
                        className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:border-brand-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Notes</label>
                      <textarea
                        value={state.notes}
                        onChange={(e) => updateStep(step.id, { notes: e.target.value })}
                        rows={2}
                        placeholder="Any notes about this step..."
                        className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:border-brand-amber-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-3 text-center">
          <p className="text-[10px] text-gray-400">
            Based on Romanian building regulations. Premium users get direct administration link management.
          </p>
        </div>
      </div>
    </div>
  );
}
