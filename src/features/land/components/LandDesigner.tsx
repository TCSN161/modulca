"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Toolbar from "./Toolbar";
import ModulePalette from "./ModulePalette";
import AddressSearch from "./AddressSearch";
import { useLandStore } from "../store";
import { MODULE_TYPES } from "@/shared/types";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

const STEPS = [
  { num: 1, label: "Locate Land", href: "#" },
  { num: 2, label: "Design Modules", href: "/project/demo/design" },
  { num: 3, label: "Get Plans", href: "/project/demo/output" },
];

export default function LandDesigner() {
  const { phase, gridCells } = useLandStore();
  const placedModules = gridCells.filter((c) => c.moduleType !== null);
  const currentStep = 1;

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Top Nav */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-gray-500 sm:flex">
          <span className="hover:text-brand-teal-800 cursor-pointer">How It Works</span>
          <span className="hover:text-brand-teal-800 cursor-pointer">Pricing</span>
          <span className="hover:text-brand-teal-800 cursor-pointer">For Builders</span>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-brand-teal-800">
            Login
          </Link>
          <Link href="/register" className="rounded-lg bg-brand-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-brand-teal-700">
            Get Started
          </Link>
        </div>
      </header>

      {/* Step Progress Bar */}
      <div className="flex items-center justify-center gap-16 border-b border-gray-200 bg-white py-4">
        {STEPS.map((step) => (
          <div key={step.num} className="flex flex-col items-center gap-1.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                step.num === currentStep
                  ? "bg-brand-teal-800 text-white"
                  : step.num < currentStep
                  ? "bg-brand-teal-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step.num}
            </div>
            <span
              className={`text-xs font-medium ${
                step.num === currentStep
                  ? "text-brand-teal-800"
                  : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-80 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-5">
          <h2 className="mb-1 text-xl font-bold text-brand-teal-800">
            Step 1: Locate Your Land
          </h2>
          <p className="mb-5 text-sm text-gray-500">
            Search for your location, then click and drag on the map to draw your building area.
          </p>

          {/* Address Search */}
          <div className="mb-5">
            <AddressSearch />
          </div>

          {/* Drawing / Grid controls */}
          <Toolbar />

          {/* Module Palette (in modules phase) */}
          {phase === "modules" && (
            <div className="mt-5">
              <ModulePalette />
            </div>
          )}

          {/* Module Types Legend (always visible) */}
          {(phase === "grid" || phase === "modules") && (
            <div className="mt-5 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Module Types
              </h4>
              <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
                {MODULE_TYPES.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-sm text-gray-600">
                    <div
                      className="h-3 w-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: m.color }}
                    />
                    {m.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Area Summary */}
          {placedModules.length > 0 && (
            <div className="mt-5 rounded-lg border border-brand-teal-100 bg-brand-teal-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Selected Area
                </h4>
                <span className="rounded-full bg-brand-amber-100 px-2 py-0.5 text-[10px] font-bold text-brand-amber-700 uppercase">
                  Live Preview
                </span>
              </div>
              <div className="text-lg font-bold text-brand-teal-800">
                {placedModules.length} Module{placedModules.length !== 1 ? "s" : ""}
              </div>
              <div className="mt-1 text-sm text-brand-teal-600">
                {placedModules.length * 9}m&sup2; total / {placedModules.length * 7}m&sup2; usable
              </div>
              {/* Mini breakdown */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {MODULE_TYPES.filter((mt) =>
                  placedModules.some((c) => c.moduleType === mt.id)
                ).map((mt) => {
                  const count = placedModules.filter(
                    (c) => c.moduleType === mt.id
                  ).length;
                  return (
                    <span
                      key={mt.id}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: mt.color }}
                    >
                      {mt.label.slice(0, 3).toUpperCase()} {count}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info tip */}
          {(phase === "grid" || phase === "modules") && (
            <div className="mt-4 flex gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
              <span className="text-blue-500 text-sm flex-shrink-0">&#9432;</span>
              <p className="text-xs text-blue-700">
                Click on the grid to add modules. Each square represents a 3x3m prefabricated unit.
              </p>
            </div>
          )}

          {/* Next Step CTA */}
          {placedModules.length > 0 && (
            <Link
              href="/project/demo/design"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-amber-500
                         px-6 py-3.5 text-sm font-semibold text-white transition-colors
                         hover:bg-brand-amber-600"
            >
              Next: Design Modules →
            </Link>
          )}
        </aside>

        {/* Map Area */}
        <div className="relative flex-1">
          <MapView />
        </div>
      </div>
    </div>
  );
}
