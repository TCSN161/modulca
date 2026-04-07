"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Toolbar from "./Toolbar";
import ModulePalette from "./ModulePalette";
import AddressSearch from "./AddressSearch";
import StepNav from "@/features/design/components/shared/StepNav";
import { useLandStore } from "../store";
import type { GridCell } from "../store";
import { MODULE_TYPES } from "@/shared/types";

/* ------------------------------------------------------------------ */
/*  Predefined building layouts                                        */
/* ------------------------------------------------------------------ */

interface PresetLayout {
  id: string;
  label: string;
  description: string;
  icon: string;
  modules: number;
  area: string;
  cells: GridCell[];
}

const PRESET_LAYOUTS: PresetLayout[] = [
  {
    id: "studio",
    label: "Studio",
    description: "Open-plan living + kitchenette",
    icon: "🏠",
    modules: 2,
    area: "18m²",
    cells: [
      { row: 0, col: 0, moduleType: "living" },
      { row: 0, col: 1, moduleType: "bathroom" },
    ],
  },
  {
    id: "small-house",
    label: "Small House",
    description: "1 bedroom, kitchen, bathroom",
    icon: "🏡",
    modules: 4,
    area: "36m²",
    cells: [
      { row: 0, col: 0, moduleType: "bedroom" },
      { row: 0, col: 1, moduleType: "bathroom" },
      { row: 1, col: 0, moduleType: "living" },
      { row: 1, col: 1, moduleType: "kitchen" },
    ],
  },
  {
    id: "family-home",
    label: "Family Home",
    description: "2 bedrooms, living, kitchen, bath",
    icon: "🏘️",
    modules: 6,
    area: "54m²",
    cells: [
      { row: 0, col: 0, moduleType: "bedroom" },
      { row: 0, col: 1, moduleType: "bedroom" },
      { row: 0, col: 2, moduleType: "bathroom" },
      { row: 1, col: 0, moduleType: "living" },
      { row: 1, col: 1, moduleType: "kitchen" },
      { row: 1, col: 2, moduleType: "storage" },
    ],
  },
  {
    id: "large-home",
    label: "Large Home",
    description: "3 bed, office, 2 bath, living, kitchen",
    icon: "🏛️",
    modules: 9,
    area: "81m²",
    cells: [
      { row: 0, col: 0, moduleType: "bedroom" },
      { row: 0, col: 1, moduleType: "bedroom" },
      { row: 0, col: 2, moduleType: "bedroom" },
      { row: 1, col: 0, moduleType: "bathroom" },
      { row: 1, col: 1, moduleType: "living" },
      { row: 1, col: 2, moduleType: "bathroom" },
      { row: 2, col: 0, moduleType: "office" },
      { row: 2, col: 1, moduleType: "kitchen" },
      { row: 2, col: 2, moduleType: "storage" },
    ],
  },
  {
    id: "villa",
    label: "Villa",
    description: "4 bed, office, 2 bath, living, dining, kitchen, storage",
    icon: "🏰",
    modules: 12,
    area: "108m²",
    cells: [
      { row: 0, col: 0, moduleType: "bedroom" },
      { row: 0, col: 1, moduleType: "bedroom" },
      { row: 0, col: 2, moduleType: "bathroom" },
      { row: 0, col: 3, moduleType: "storage" },
      { row: 1, col: 0, moduleType: "bedroom" },
      { row: 1, col: 1, moduleType: "living" },
      { row: 1, col: 2, moduleType: "living" },
      { row: 1, col: 3, moduleType: "office" },
      { row: 2, col: 0, moduleType: "bedroom" },
      { row: 2, col: 1, moduleType: "kitchen" },
      { row: 2, col: 2, moduleType: "kitchen" },
      { row: 2, col: 3, moduleType: "bathroom" },
    ],
  },
];

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

export default function LandDesigner() {
  const { phase, gridCells, setGridCells, setPhase } = useLandStore();
  const placedModules = gridCells.filter((c) => c.moduleType !== null);
  const [showPresets, setShowPresets] = useState(true);

  /** Apply a preset layout — sets grid cells and skips to modules phase */
  const applyPreset = (preset: PresetLayout) => {
    setGridCells(preset.cells);
    setPhase("modules");
    setShowPresets(false);
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Shared Header */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-lg font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <StepNav activeStep={0} />
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-brand-teal-800">
            Login
          </Link>
          <Link href="/dashboard" className="rounded-lg bg-brand-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-brand-teal-700">
            Dashboard
          </Link>
        </div>
      </header>

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

          {/* Quick Start Presets */}
          {showPresets && phase === "map" && gridCells.length === 0 && (
            <div className="mb-5 rounded-lg border border-brand-amber-200 bg-brand-amber-50 p-4">
              <h4 className="mb-1 text-xs font-bold text-brand-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                ⚡ Quick Start
              </h4>
              <p className="mb-3 text-[11px] text-brand-amber-600">
                Choose a preset layout to get started quickly, or draw your own area on the map.
              </p>
              <div className="space-y-2">
                {PRESET_LAYOUTS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="w-full flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-2.5
                               hover:border-brand-amber-400 hover:bg-brand-amber-25 transition-colors text-left group"
                  >
                    <span className="text-xl flex-shrink-0">{preset.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-brand-teal-800 group-hover:text-brand-teal-600">
                          {preset.label}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">
                          {preset.modules} mod · {preset.area}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500">{preset.description}</span>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowPresets(false)}
                className="mt-2 w-full text-center text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                Skip — I&apos;ll draw my own area
              </button>
            </div>
          )}

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
              href="/project/demo/marketplace"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-amber-500
                         px-6 py-3.5 text-sm font-semibold text-white transition-colors
                         hover:bg-brand-amber-600"
            >
              Next: Browse Land →
            </Link>
          )}
          {placedModules.length === 0 && phase === "map" && (
            <Link
              href="/project/demo/marketplace"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white
                         px-6 py-3 text-sm font-medium text-gray-600 transition-colors
                         hover:bg-gray-50 hover:border-brand-teal-300"
            >
              Or browse the Land Marketplace →
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
