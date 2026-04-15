"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWizardStore } from "@/features/wizard/store";
import { useQuizStore } from "@/features/quiz/store";
import { AuthNav } from "@/features/auth/components/AuthNav";
import { STYLE_DIRECTIONS } from "@/features/design/styles";
import type { WizardInput } from "@/features/wizard/types";
import type { StyleDirectionId } from "@/features/design/store";

/* ------------------------------------------------------------------ */
/*  Step definitions                                                    */
/* ------------------------------------------------------------------ */

type WizardStep = "household" | "budget" | "style" | "extras" | "preview";

const STEPS: { id: WizardStep; label: string; icon: string }[] = [
  { id: "household", label: "Household", icon: "👨‍👩‍👧‍👦" },
  { id: "budget", label: "Budget", icon: "💰" },
  { id: "style", label: "Style", icon: "🎨" },
  { id: "extras", label: "Extras", icon: "✨" },
  { id: "preview", label: "Preview", icon: "🏠" },
];

const HOUSEHOLD_OPTIONS = [
  { size: 1, label: "1 Person", desc: "Studio or compact home", icon: "🧑" },
  { size: 2, label: "2 People", desc: "Couple or roommates", icon: "👫" },
  { size: 3, label: "3 People", desc: "Small family", icon: "👨‍👩‍👧" },
  { size: 4, label: "4 People", desc: "Family with 2 kids", icon: "👨‍👩‍👧‍👦" },
  { size: 5, label: "5+ People", desc: "Large family", icon: "👨‍👩‍👧‍👦" },
];

const BUDGET_OPTIONS: { id: WizardInput["budgetLevel"]; label: string; desc: string; icon: string }[] = [
  { id: "tight", label: "Economy", desc: "Essential quality, smart savings", icon: "🌱" },
  { id: "moderate", label: "Standard", desc: "Best value, good quality", icon: "⭐" },
  { id: "generous", label: "Premium", desc: "Top materials, luxury finishes", icon: "💎" },
];

/* ------------------------------------------------------------------ */
/*  Main Wizard Page                                                    */
/* ------------------------------------------------------------------ */

export default function WizardPage() {
  const router = useRouter();
  const quizProfile = useQuizStore((s) => s.profile);
  const { generatedDesign, generate, generateFromQuiz, applyToProject, setInput, reset } = useWizardStore();

  const [step, setStep] = useState<WizardStep>("household");
  const [householdSize, setHouseholdSize] = useState(3);
  const [budget, setBudget] = useState<WizardInput["budgetLevel"]>("moderate");
  const [style, setStyle] = useState<StyleDirectionId>("warm-contemporary");
  const [wantsTerrace, setWantsTerrace] = useState(true);
  const [wantsOffice, setWantsOffice] = useState(false);
  const [applying, setApplying] = useState(false);

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const freeStyles = STYLE_DIRECTIONS.filter((s) => s.tier === "free");
  const premiumStyles = STYLE_DIRECTIONS.filter((s) => s.tier === "premium");

  // Generate preview when reaching preview step
  const handlePreview = () => {
    const input: WizardInput = {
      householdSize,
      budgetLevel: budget,
      stylePreference: style,
      floors: 1,
      wantsTerrace,
      wantsOffice,
    };
    setInput(input);
    generate();
    setStep("preview");
  };

  // Generate from existing quiz profile
  const handleFromQuiz = () => {
    const ok = generateFromQuiz();
    if (ok) setStep("preview");
  };

  // Apply design and navigate to project
  const handleApply = () => {
    setApplying(true);
    applyToProject();
    setTimeout(() => {
      router.push("/project/new");
    }, 400);
  };

  // Regenerate with current inputs
  const handleRegenerate = () => {
    generate();
  };

  const nextStep = () => {
    const idx = stepIndex;
    if (idx < STEPS.length - 2) {
      setStep(STEPS[idx + 1].id);
    } else if (idx === STEPS.length - 2) {
      handlePreview();
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-bone-100 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
            <span className="ml-2 text-xs font-normal text-gray-400">Quick Design</span>
          </Link>
          <AuthNav />
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1">
              <button
                onClick={() => i < stepIndex ? setStep(s.id) : undefined}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  i === stepIndex
                    ? "bg-brand-teal-800 text-white shadow-md"
                    : i < stepIndex
                    ? "bg-brand-teal-100 text-brand-teal-800 cursor-pointer hover:bg-brand-teal-200"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <span>{s.icon}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-6 ${i < stepIndex ? "bg-brand-teal-300" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Quiz shortcut banner */}
        {quizProfile && step !== "preview" && (
          <div className="mb-6 rounded-xl border border-brand-amber-200 bg-gradient-to-r from-brand-amber-50 to-amber-50 p-4 text-center">
            <p className="text-sm text-brand-amber-700">
              You already completed the architectural quiz!
            </p>
            <button
              onClick={handleFromQuiz}
              className="mt-2 rounded-lg bg-brand-amber-500 px-5 py-2 text-sm font-bold text-white hover:bg-brand-amber-600 transition-colors"
            >
              Generate Design from Quiz Results
            </button>
          </div>
        )}

        {/* ── Step 1: Household ── */}
        {step === "household" && (
          <div className="mx-auto max-w-xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">How many people will live here?</h2>
              <p className="mt-1 text-sm text-gray-500">This determines the number of rooms and modules</p>
            </div>
            <div className="grid gap-3">
              {HOUSEHOLD_OPTIONS.map((opt) => (
                <button
                  key={opt.size}
                  onClick={() => setHouseholdSize(opt.size)}
                  className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                    householdSize === opt.size
                      ? "border-brand-teal-800 bg-brand-teal-50 shadow-md"
                      : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                  }`}
                >
                  <span className="text-3xl">{opt.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-800">{opt.label}</div>
                    <div className="text-xs text-gray-500">{opt.desc}</div>
                  </div>
                  {householdSize === opt.size && (
                    <span className="ml-auto text-brand-teal-800 text-lg">&#10003;</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Budget ── */}
        {step === "budget" && (
          <div className="mx-auto max-w-xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">What's your budget level?</h2>
              <p className="mt-1 text-sm text-gray-500">This affects material quality and finish level</p>
            </div>
            <div className="grid gap-3">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setBudget(opt.id)}
                  className={`flex items-center gap-4 rounded-xl border-2 p-5 text-left transition-all ${
                    budget === opt.id
                      ? "border-brand-teal-800 bg-brand-teal-50 shadow-md"
                      : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                  }`}
                >
                  <span className="text-3xl">{opt.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-800">{opt.label}</div>
                    <div className="text-xs text-gray-500">{opt.desc}</div>
                  </div>
                  {budget === opt.id && (
                    <span className="ml-auto text-brand-teal-800 text-lg">&#10003;</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Style ── */}
        {step === "style" && (
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Choose your design style</h2>
              <p className="mt-1 text-sm text-gray-500">This sets materials, colors, and mood for your home</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...freeStyles, ...premiumStyles].map((dir) => (
                <button
                  key={dir.id}
                  onClick={() => setStyle(dir.id as StyleDirectionId)}
                  className={`rounded-xl border-2 p-3 text-center transition-all ${
                    style === dir.id
                      ? "border-brand-teal-800 bg-brand-teal-50 shadow-md"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  {/* Color swatches */}
                  <div className="flex justify-center gap-1 mb-2">
                    {dir.palette.slice(0, 4).map((c, i) => (
                      <div
                        key={i}
                        className="h-5 w-5 rounded-full border border-gray-200"
                        style={{ backgroundColor: c.color }}
                      />
                    ))}
                  </div>
                  <div className="text-xs font-semibold text-gray-800">{dir.label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{dir.tagline}</div>
                  {dir.tier === "premium" && (
                    <span className="mt-1 inline-block rounded-full bg-brand-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-brand-amber-700">
                      Premium
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 4: Extras ── */}
        {step === "extras" && (
          <div className="mx-auto max-w-xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Any extras?</h2>
              <p className="mt-1 text-sm text-gray-500">Optional additions to your home</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setWantsTerrace(!wantsTerrace)}
                className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                  wantsTerrace
                    ? "border-brand-teal-800 bg-brand-teal-50"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <span className="text-3xl">🌿</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">Terrace</div>
                  <div className="text-xs text-gray-500">Outdoor living space (1 module, 9m²)</div>
                </div>
                <div className={`h-6 w-6 rounded-md border-2 flex items-center justify-center ${
                  wantsTerrace ? "border-brand-teal-800 bg-brand-teal-800 text-white" : "border-gray-300"
                }`}>
                  {wantsTerrace && <span className="text-xs">&#10003;</span>}
                </div>
              </button>

              <button
                onClick={() => setWantsOffice(!wantsOffice)}
                className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                  wantsOffice
                    ? "border-brand-teal-800 bg-brand-teal-50"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <span className="text-3xl">💼</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">Home Office</div>
                  <div className="text-xs text-gray-500">Dedicated workspace module (1 module, 9m²)</div>
                </div>
                <div className={`h-6 w-6 rounded-md border-2 flex items-center justify-center ${
                  wantsOffice ? "border-brand-teal-800 bg-brand-teal-800 text-white" : "border-gray-300"
                }`}>
                  {wantsOffice && <span className="text-xs">&#10003;</span>}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Preview ── */}
        {step === "preview" && generatedDesign && (
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Design is Ready!</h2>
              <p className="mt-2 text-sm text-gray-500">{generatedDesign.description}</p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="rounded-xl bg-white border border-gray-100 p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-brand-teal-800">{generatedDesign.modules.length}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Modules</div>
              </div>
              <div className="rounded-xl bg-white border border-gray-100 p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-brand-teal-800">{generatedDesign.modules.length * 9}m²</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Total Area</div>
              </div>
              <div className="rounded-xl bg-white border border-gray-100 p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-brand-teal-800">{generatedDesign.rooms.bedrooms}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Bedrooms</div>
              </div>
              <div className="rounded-xl bg-white border border-gray-100 p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-brand-amber-600">
                  €{generatedDesign.estimatedCost.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Est. Cost</div>
              </div>
            </div>

            {/* Module grid visual */}
            <div className="rounded-xl bg-white border border-gray-200 p-6 mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Layout Preview</h3>
              <ModuleGridPreview modules={generatedDesign.modules} />
            </div>

            {/* Room breakdown */}
            <div className="rounded-xl bg-white border border-gray-200 p-5 mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Room Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(generatedDesign.rooms)
                  .filter(([key, val]) => key !== "totalModules" && (val as number) > 0)
                  .map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                      <span className="text-sm">{getRoomIcon(key)}</span>
                      <div>
                        <div className="text-xs font-semibold text-gray-700 capitalize">{key}</div>
                        <div className="text-[10px] text-gray-400">{val as number} module{(val as number) > 1 ? "s" : ""}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Design info */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-xs font-semibold text-gray-700 capitalize">
                  {(generatedDesign.styleDirection ?? "").replace(/-/g, " ")}
                </div>
                <div className="text-[10px] text-gray-400">Style</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-xs font-semibold text-gray-700 capitalize">{generatedDesign.finishLevel}</div>
                <div className="text-[10px] text-gray-400">Finish</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-xs font-semibold text-gray-700 capitalize">
                  {generatedDesign.layoutShape.replace("-", " ")}
                </div>
                <div className="text-[10px] text-gray-400">Layout</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="mt-8 flex items-center justify-between">
          {stepIndex > 0 && step !== "preview" ? (
            <button
              onClick={prevStep}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step === "preview" ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleRegenerate}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Regenerate
              </button>
              <button
                onClick={() => { reset(); setStep("household"); }}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="rounded-lg bg-brand-amber-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-amber-600 transition-colors disabled:opacity-60 shadow-md"
              >
                {applying ? "Applying..." : "Use This Design →"}
              </button>
            </div>
          ) : (
            <button
              onClick={nextStep}
              className="rounded-lg bg-brand-teal-800 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-teal-700 transition-colors shadow-md"
            >
              {stepIndex === STEPS.length - 2 ? "Generate Design" : "Next"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Module Grid Preview (visual layout)                                */
/* ------------------------------------------------------------------ */

const MODULE_COLORS: Record<string, string> = {
  bedroom: "#4A90D9",
  kitchen: "#E8913A",
  bathroom: "#2ABFBF",
  living: "#6BBF59",
  office: "#8B6DB5",
  storage: "#8E99A4",
  hallway: "#D4A76A",
  terrace: "#68B584",
};

function ModuleGridPreview({ modules }: { modules: { row: number; col: number; moduleType: string; label: string }[] }) {
  const minRow = Math.min(...modules.map((m) => m.row));
  const maxRow = Math.max(...modules.map((m) => m.row));
  const minCol = Math.min(...modules.map((m) => m.col));
  const maxCol = Math.max(...modules.map((m) => m.col));

  const rows = maxRow - minRow + 1;
  const cols = maxCol - minCol + 1;
  const cellSize = Math.min(80, Math.floor(600 / Math.max(rows, cols)));

  const grid = new Map<string, typeof modules[0]>();
  modules.forEach((m) => grid.set(`${m.row},${m.col}`, m));

  return (
    <div className="flex justify-center">
      <div
        className="inline-grid gap-1"
        style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}
      >
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const mod = grid.get(`${r + minRow},${c + minCol}`);
            if (!mod) return <div key={`${r}-${c}`} style={{ width: cellSize, height: cellSize }} />;
            return (
              <div
                key={`${r}-${c}`}
                className="rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-sm"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: MODULE_COLORS[mod.moduleType] ?? "#999",
                }}
              >
                <span className="text-lg">{getRoomIcon(mod.moduleType)}</span>
                <span className="text-[8px] opacity-80 mt-0.5">{mod.moduleType}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function getRoomIcon(type: string): string {
  const icons: Record<string, string> = {
    bedroom: "🛏️",
    kitchen: "🍳",
    bathroom: "🛁",
    living: "🛋️",
    office: "💼",
    storage: "📦",
    hallway: "🚪",
    terrace: "🌿",
  };
  return icons[type] ?? "📦";
}
