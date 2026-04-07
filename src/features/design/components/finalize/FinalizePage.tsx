"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDesignStore } from "../../store";
import { MODULE_TYPES, FINISH_LEVELS } from "@/shared/types";
import StepNav from "../shared/StepNav";

const MAX_FREE_PROJECTS = 3;
type ContactMode = null | "quote" | "consultation";

interface SavedProject {
  id: string;
  name: string;
  date: string;
  modules: number;
  totalCost: number;
  style: string | null;
}

export default function FinalizePage() {
  const modules = useDesignStore((s) => s.modules);
  const finishLevel = useDesignStore((s) => s.finishLevel);
  const styleDirection = useDesignStore((s) => s.styleDirection);
  const getStats = useDesignStore((s) => s.getStats);
  const stats = getStats();

  const [projectName, setProjectName] = useState("My Modular Home");
  const [saved, setSaved] = useState(false);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [contactMode, setContactMode] = useState<ContactMode>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [contactSent, setContactSent] = useState(false);

  const finish = FINISH_LEVELS.find((f) => f.id === finishLevel) || FINISH_LEVELS[1];

  useEffect(() => {
    try {
      const raw = localStorage.getItem("modulca-projects");
      if (raw) setSavedProjects(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const handleSaveProject = () => {
    if (savedProjects.length >= MAX_FREE_PROJECTS) {
      setShowUpgrade(true);
      return;
    }

    const project: SavedProject = {
      id: `proj-${Date.now()}`,
      name: projectName,
      date: new Date().toISOString(),
      modules: modules.length,
      totalCost: stats.totalEstimate,
      style: styleDirection,
    };

    const updated = [...savedProjects, project];
    setSavedProjects(updated);
    localStorage.setItem("modulca-projects", JSON.stringify(updated));

    // Also save the full design data tagged with this project id
    const designData = localStorage.getItem("modulca-design");
    if (designData) {
      localStorage.setItem(`modulca-design-${project.id}`, designData);
    }

    setSaved(true);
  };

  // Module type summary
  const typeCounts: Record<string, number> = {};
  for (const m of modules) {
    typeCounts[m.moduleType] = (typeCounts[m.moduleType] || 0) + 1;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-6 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-bold text-brand-teal-800 tracking-tight">
            Modul<span className="text-brand-amber-500">CA</span>
          </Link>
        </div>
        <StepNav activeStep={11} />
        <div className="w-24" />
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-12 px-6">
          {/* Success banner */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-4">
              <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-brand-teal-800 mb-2">
              Your Design is Complete!
            </h1>
            <p className="text-gray-500 max-w-md mx-auto">
              You&apos;ve successfully designed your modular building. Review the summary below and save your project.
            </p>
          </div>

          {/* Project summary card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-brand-teal-800 mb-4">Project Summary</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Location</div>
                <div className="text-sm font-medium text-brand-teal-800">Demo Location</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Style</div>
                <div className="text-sm font-medium text-brand-teal-800 capitalize">{styleDirection || "Not selected"}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Finish Level</div>
                <div className="text-sm font-medium text-brand-teal-800">{finish.label}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Area</div>
                <div className="text-sm font-medium text-brand-teal-800">{stats.totalArea}m² ({stats.usableArea}m² usable)</div>
              </div>
            </div>

            {/* Module breakdown */}
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Modules ({stats.totalModules})</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(typeCounts).map(([type, count]) => {
                const mt = MODULE_TYPES.find((m) => m.id === type);
                return (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: mt?.color || "#888" }}
                  >
                    {mt?.label || type} x{count}
                  </span>
                );
              })}
            </div>

            {/* Cost breakdown */}
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Cost Estimate</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{stats.totalModules} modules ({finish.label})</span>
                <span className="font-medium">&euro;{stats.moduleCost.toLocaleString()}</span>
              </div>
              {stats.sharedWallDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Shared wall discount ({stats.sharedWalls} walls)</span>
                  <span className="font-medium">-&euro;{stats.sharedWallDiscount.toLocaleString()}</span>
                </div>
              )}
              {stats.wallUpgradeCost !== 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Wall upgrades</span>
                  <span className="font-medium">{stats.wallUpgradeCost > 0 ? "+" : ""}&euro;{stats.wallUpgradeCost.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Design fee (8%)</span>
                <span className="font-medium">&euro;{Math.round(stats.designFee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-brand-teal-800">Total Estimate</span>
                <span className="text-lg font-bold text-brand-amber-600">&euro;{Math.round(stats.totalEstimate).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Save project */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-brand-teal-800 mb-4">Save Your Project</h2>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber-400"
                placeholder="Project name..."
              />
              <button
                onClick={handleSaveProject}
                disabled={saved}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  saved
                    ? "bg-emerald-100 text-emerald-700 cursor-default"
                    : "bg-brand-amber-500 text-white hover:bg-brand-amber-600"
                }`}
              >
                {saved ? "Saved!" : "Save Project"}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              {savedProjects.length}/{MAX_FREE_PROJECTS} free projects used.
              {savedProjects.length >= MAX_FREE_PROJECTS - 1 && !saved && " Upgrade to Pro for unlimited projects."}
            </p>
          </div>

          {/* Upgrade modal */}
          {showUpgrade && (
            <div className="bg-gradient-to-br from-brand-teal-800 to-brand-teal-700 rounded-xl shadow-lg p-6 mb-6 text-white">
              <h2 className="text-lg font-bold mb-2">Upgrade to ModulCA Pro</h2>
              <p className="text-sm text-brand-teal-200 mb-4">
                You&apos;ve used all {MAX_FREE_PROJECTS} free project slots. Upgrade to save unlimited projects and unlock premium features.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-sm font-semibold mb-1">Free Plan</div>
                  <ul className="text-xs text-brand-teal-200 space-y-1">
                    <li>- {MAX_FREE_PROJECTS} saved projects</li>
                    <li>- Basic AI renders</li>
                    <li>- PDF exports</li>
                  </ul>
                </div>
                <div className="bg-white/10 rounded-lg p-4 ring-2 ring-brand-amber-400">
                  <div className="text-sm font-semibold mb-1 text-brand-amber-400">Pro Plan &mdash; &euro;29/mo</div>
                  <ul className="text-xs text-brand-teal-200 space-y-1">
                    <li>- Unlimited projects</li>
                    <li>- HD AI renders</li>
                    <li>- Priority support</li>
                    <li>- Real product catalog</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/pricing" className="px-5 py-2 rounded-lg bg-brand-amber-500 text-white text-sm font-semibold hover:bg-brand-amber-600 transition-colors">
                  Upgrade Now
                </Link>
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="px-5 py-2 rounded-lg border border-white/30 text-sm hover:bg-white/10 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          )}

          {/* Next steps */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-brand-teal-800 mb-4">What&apos;s Next?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link href="/project/demo/presentation" className="text-center p-4 rounded-lg bg-brand-amber-50 border border-brand-amber-200 hover:bg-brand-amber-100 transition-colors">
                <div className="text-2xl mb-2">🎨</div>
                <div className="text-xs font-semibold text-brand-amber-700 mb-1">Create Presentation</div>
                <div className="text-[10px] text-gray-400">Generate a professional PDF deck</div>
              </Link>
              <button onClick={() => { setContactMode("quote"); setContactSent(false); }} className="text-center p-4 rounded-lg bg-brand-teal-50 border border-brand-teal-200 hover:bg-brand-teal-100 transition-colors">
                <div className="text-2xl mb-2">📋</div>
                <div className="text-xs font-semibold text-brand-teal-700 mb-1">Request a Quote</div>
                <div className="text-[10px] text-gray-400">Get a detailed cost breakdown</div>
              </button>
              <button onClick={() => { setContactMode("consultation"); setContactSent(false); }} className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
                <div className="text-2xl mb-2">📞</div>
                <div className="text-xs font-semibold text-blue-700 mb-1">Book Consultation</div>
                <div className="text-[10px] text-gray-400">Speak with an architect</div>
              </button>
              <Link href="/project/demo/design" className="text-center p-4 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="text-2xl mb-2">🔄</div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Revise Design</div>
                <div className="text-[10px] text-gray-400">Go back and make changes</div>
              </Link>
            </div>

            {/* Contact Form Modal */}
            {contactMode && (
              <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-brand-teal-800">
                    {contactMode === "quote" ? "Request a Quote" : "Book a Consultation"}
                  </h3>
                  <button onClick={() => setContactMode(null)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {contactSent ? (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-3">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      {contactMode === "quote" ? "Quote request sent!" : "Consultation request sent!"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">We&apos;ll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">
                      {contactMode === "quote"
                        ? `Your project details (${stats.totalModules} modules, ${stats.totalArea}m², ~€${Math.round(stats.totalEstimate).toLocaleString()}) will be included automatically.`
                        : "Schedule a free 30-minute call with one of our modular construction architects."}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Your name"
                        className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber-400"
                      />
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="Email address"
                        className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber-400"
                      />
                    </div>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="Phone number (optional)"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber-400"
                    />
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      rows={3}
                      placeholder={contactMode === "quote" ? "Any specific requirements or questions..." : "Preferred date/time and topics to discuss..."}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber-400 resize-none"
                    />
                    <button
                      onClick={() => {
                        // Save to localStorage for demo (in production: send to API/email)
                        try {
                          const requests = JSON.parse(localStorage.getItem("modulca-contact-requests") || "[]");
                          requests.push({
                            type: contactMode,
                            ...contactForm,
                            project: { modules: stats.totalModules, area: stats.totalArea, estimate: stats.totalEstimate, style: styleDirection },
                            date: new Date().toISOString(),
                          });
                          localStorage.setItem("modulca-contact-requests", JSON.stringify(requests));
                        } catch { /* ignore */ }
                        setContactSent(true);
                      }}
                      disabled={!contactForm.name.trim() || !contactForm.email.trim()}
                      className="w-full rounded-lg bg-brand-amber-500 px-4 py-3 text-sm font-bold text-white hover:bg-brand-amber-600 transition-colors disabled:opacity-50"
                    >
                      {contactMode === "quote" ? "Send Quote Request" : "Book Consultation"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/project/demo/products"
              className="text-sm text-brand-teal-800 hover:text-brand-amber-500 transition-colors"
            >
              &larr; Back to Products
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/project/demo/presentation"
                className="px-6 py-3 rounded-lg bg-brand-amber-500 text-white text-sm font-semibold hover:bg-brand-amber-600 transition-colors"
              >
                Create Presentation &rarr;
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-lg bg-brand-teal-800 text-white text-sm font-semibold hover:bg-brand-teal-700 transition-colors"
              >
                My Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
