"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Building Permit Tracker — project management zone for tracking
 * the Romanian building permit process (Autorizatie de Construire).
 * Includes city selection with municipality contacts.
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

/* ── Romanian Municipality Contacts ── */
interface CityContact {
  city: string;
  county: string;
  urbanismOffice: string;
  phone: string;
  email: string;
  chiefArchitect: string;
  address: string;
  website?: string;
}

const CITY_CONTACTS: CityContact[] = [
  {
    city: "București",
    county: "București",
    urbanismOffice: "Direcția Generală de Urbanism și Amenajarea Teritoriului",
    phone: "+40 21 305 55 30",
    email: "urbanism@pmb.ro",
    chiefArchitect: "Arhitect Șef al Municipiului București",
    address: "Bd. Regina Elisabeta nr. 47, Sector 5",
    website: "https://www.pmb.ro",
  },
  {
    city: "Cluj-Napoca",
    county: "Cluj",
    urbanismOffice: "Direcția Urbanism",
    phone: "+40 264 596 030",
    email: "urbanism@pfrclujnapoca.ro",
    chiefArchitect: "Arhitect Șef Municipiul Cluj-Napoca",
    address: "Str. Moților nr. 3, Cluj-Napoca",
    website: "https://www.pfrclujnapoca.ro",
  },
  {
    city: "Timișoara",
    county: "Timiș",
    urbanismOffice: "Direcția Urbanism și Dezvoltare Urbană",
    phone: "+40 256 408 300",
    email: "urbanism@pfrmt.ro",
    chiefArchitect: "Arhitect Șef Municipiul Timișoara",
    address: "Bd. C.D. Loga nr. 1, Timișoara",
    website: "https://www.pfrmt.ro",
  },
  {
    city: "Iași",
    county: "Iași",
    urbanismOffice: "Direcția Arhitectură și Urbanism",
    phone: "+40 232 267 582",
    email: "urbanism@primaria-iasi.ro",
    chiefArchitect: "Arhitect Șef Municipiul Iași",
    address: "Bd. Ștefan cel Mare și Sfânt nr. 45, Iași",
    website: "https://www.primaria-iasi.ro",
  },
  {
    city: "Constanța",
    county: "Constanța",
    urbanismOffice: "Direcția Urbanism",
    phone: "+40 241 488 100",
    email: "urbanism@primaria-constanta.ro",
    chiefArchitect: "Arhitect Șef Municipiul Constanța",
    address: "Bd. Tomis nr. 51, Constanța",
    website: "https://www.primaria-constanta.ro",
  },
  {
    city: "Brașov",
    county: "Brașov",
    urbanismOffice: "Direcția Arhitect Șef",
    phone: "+40 268 416 550",
    email: "urbanism@brasovcity.ro",
    chiefArchitect: "Arhitect Șef Municipiul Brașov",
    address: "Bd. Eroilor nr. 8, Brașov",
    website: "https://www.brasovcity.ro",
  },
  {
    city: "Sibiu",
    county: "Sibiu",
    urbanismOffice: "Direcția Amenajarea Teritoriului și Urbanism",
    phone: "+40 269 208 800",
    email: "urbanism@sibiu.ro",
    chiefArchitect: "Arhitect Șef Municipiul Sibiu",
    address: "Str. Samuel Brukenthal nr. 2, Sibiu",
    website: "https://www.sibiu.ro",
  },
  {
    city: "Oradea",
    county: "Bihor",
    urbanismOffice: "Direcția Tehnică — Urbanism",
    phone: "+40 259 437 000",
    email: "urbanism@ofrradea.ro",
    chiefArchitect: "Arhitect Șef Municipiul Oradea",
    address: "Piața Unirii nr. 1, Oradea",
    website: "https://www.oradea.ro",
  },
  {
    city: "Craiova",
    county: "Dolj",
    urbanismOffice: "Direcția Urbanism și Amenajarea Teritoriului",
    phone: "+40 251 415 907",
    email: "urbanism@primariacraiova.ro",
    chiefArchitect: "Arhitect Șef Municipiul Craiova",
    address: "Str. A.I. Cuza nr. 7, Craiova",
    website: "https://www.primariacraiova.ro",
  },
  {
    city: "Galați",
    county: "Galați",
    urbanismOffice: "Direcția Urbanism și Amenajarea Teritoriului",
    phone: "+40 236 307 710",
    email: "urbanism@primaria.galati.ro",
    chiefArchitect: "Arhitect Șef Municipiul Galați",
    address: "Str. Domnească nr. 38, Galați",
    website: "https://www.primaria.galati.ro",
  },
  {
    city: "Ploiești",
    county: "Prahova",
    urbanismOffice: "Direcția Generală de Urbanism",
    phone: "+40 244 516 699",
    email: "urbanism@ploiesti.ro",
    chiefArchitect: "Arhitect Șef Municipiul Ploiești",
    address: "Piața Eroilor nr. 1A, Ploiești",
    website: "https://www.ploiesti.ro",
  },
  {
    city: "Pitești",
    county: "Argeș",
    urbanismOffice: "Direcția Urbanism",
    phone: "+40 248 213 994",
    email: "urbanism@primariapitesti.ro",
    chiefArchitect: "Arhitect Șef Municipiul Pitești",
    address: "Str. Victoriei nr. 24, Pitești",
    website: "https://www.primariapitesti.ro",
  },
];

/* ── Permit Steps ── */
const PERMIT_STEPS: PermitStep[] = [
  {
    id: "cu",
    label: "Urban Planning Certificate",
    labelRo: "Certificat de Urbanism (CU)",
    description: "Obtained from local city hall (primărie). Valid 12-24 months. Defines building parameters, setbacks, max height, and land use.",
    required: true,
  },
  {
    id: "geo",
    label: "Geotechnical Study",
    labelRo: "Studiu Geotehnic",
    description: "Soil survey for foundation design. Required by structural engineer. Typically costs €500-1,500.",
    required: true,
  },
  {
    id: "topo",
    label: "Topographic Survey",
    labelRo: "Ridicare Topografică",
    description: "Land survey showing boundaries, elevation, and existing structures. Must be done by authorized surveyor (ANCPI).",
    required: true,
  },
  {
    id: "dtac",
    label: "Technical Project (DTAC)",
    labelRo: "Proiect Tehnic (DTAC)",
    description: "Full architectural drawings package signed by a licensed architect. Includes architecture, structure, MEP installations.",
    required: true,
  },
  {
    id: "avize",
    label: "Utility Approvals",
    labelRo: "Avize Utilități",
    description: "Approvals from water (ApaNova/local), electricity (Enel/E-Distributie), gas (Distrigaz), and telecom providers.",
    required: true,
  },
  {
    id: "isu",
    label: "Fire Safety Approval",
    labelRo: "Aviz ISU (Pompieri)",
    description: "Fire safety review — required for buildings over 28m height or certain categories. Contact local ISU office.",
    required: false,
  },
  {
    id: "mediu",
    label: "Environmental Approval",
    labelRo: "Acord de Mediu",
    description: "Environmental impact assessment — required in protected areas or for buildings over certain size.",
    required: false,
  },
  {
    id: "ac",
    label: "Building Permit",
    labelRo: "Autorizație de Construire (AC)",
    description: "The actual building permit issued by city hall. Valid 12 months (extendable once for 12 months). Must be displayed on site.",
    required: true,
  },
  {
    id: "diriginte",
    label: "Site Supervisor",
    labelRo: "Diriginte de Șantier",
    description: "Licensed construction supervisor (diriginte de șantier) hired before work begins. Must be MDLPA-authorized.",
    required: true,
  },
  {
    id: "osb",
    label: "Start of Works Notice",
    labelRo: "Anunț Începere Lucrări",
    description: "Notify ISC (Inspectoratul de Stat în Construcții) minimum 10 days before starting construction.",
    required: true,
  },
  {
    id: "receptie",
    label: "Final Inspection",
    labelRo: "Recepție la Terminare",
    description: "Inspection by the building commission at completion. Required for occupancy permit and utility connections.",
    required: true,
  },
  {
    id: "intabulare",
    label: "Land Registry",
    labelRo: "Intabulare (ANCPI)",
    description: "Register the building in the national cadastre system (ANCPI/OCPI). Enables property sale, mortgage, and legal recognition.",
    required: true,
  },
];

const STORAGE_KEY = "modulca-permit-tracker";

interface PermitTrackerState {
  steps: Record<string, PermitStepState>;
  selectedCity: string;
}

function loadState(): PermitTrackerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Backward compat: old format stored steps directly
      if (parsed.steps) return parsed;
      return { steps: parsed, selectedCity: "" };
    }
  } catch { /* ignore */ }
  return { steps: {}, selectedCity: "" };
}

function saveState(state: PermitTrackerState) {
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
  const [selectedCity, setSelectedCity] = useState("");
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [showContacts, setShowContacts] = useState(false);

  useEffect(() => {
    if (open) {
      const state = loadState();
      setSteps(state.steps);
      setSelectedCity(state.selectedCity);
    }
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
      saveState({ steps: next, selectedCity });
      return next;
    });
  }, [selectedCity]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    saveState({ steps, selectedCity: city });
  };

  const cityContact = CITY_CONTACTS.find((c) => c.city === selectedCity);
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

          {/* City Selector */}
          <div className="mt-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Your City / Municipality</label>
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-brand-amber-500 focus:outline-none bg-white"
            >
              <option value="">Select your city...</option>
              {CITY_CONTACTS.map((c) => (
                <option key={c.city} value={c.city}>
                  {c.city} ({c.county})
                </option>
              ))}
            </select>
          </div>

          {/* City Contact Card */}
          {cityContact && (
            <div className="mt-3 rounded-lg border border-brand-teal-200 bg-brand-teal-50/50 p-3">
              <button
                onClick={() => setShowContacts(!showContacts)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-brand-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-xs font-bold text-brand-teal-800">
                    {cityContact.urbanismOffice}
                  </span>
                </div>
                <svg className={`h-4 w-4 text-brand-teal-600 transition-transform ${showContacts ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showContacts && (
                <div className="mt-2 pt-2 border-t border-brand-teal-200 space-y-2">
                  <div className="flex items-start gap-2">
                    <svg className="h-3.5 w-3.5 text-brand-teal-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <div className="text-[10px] text-gray-400">Chief Architect</div>
                      <div className="text-xs font-semibold text-brand-teal-800">{cityContact.chiefArchitect}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="h-3.5 w-3.5 text-brand-teal-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <div className="text-[10px] text-gray-400">Phone</div>
                      <a href={`tel:${cityContact.phone}`} className="text-xs font-semibold text-brand-teal-800 hover:underline">
                        {cityContact.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="h-3.5 w-3.5 text-brand-teal-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="text-[10px] text-gray-400">Email</div>
                      <a href={`mailto:${cityContact.email}`} className="text-xs font-semibold text-brand-teal-800 hover:underline">
                        {cityContact.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="h-3.5 w-3.5 text-brand-teal-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <div className="text-[10px] text-gray-400">Address</div>
                      <div className="text-xs text-brand-teal-800">{cityContact.address}</div>
                    </div>
                  </div>
                  {cityContact.website && (
                    <div className="flex items-start gap-2">
                      <svg className="h-3.5 w-3.5 text-brand-teal-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <div>
                        <div className="text-[10px] text-gray-400">Website</div>
                        <span className="text-xs text-brand-teal-800">{cityContact.website}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
            Based on Romanian building regulations (Legea 50/1991, modificată). Contact your local primărie for specific requirements.
          </p>
        </div>
      </div>
    </div>
  );
}
