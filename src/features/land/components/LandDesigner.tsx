"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Toolbar from "./Toolbar";
import ModulePalette from "./ModulePalette";
import AddressSearch from "./AddressSearch";
import StepNav from "@/features/design/components/shared/StepNav";
import { useLandStore } from "../store";
import type { GridCell } from "../store";
import { MODULE_TYPES } from "@/shared/types";
import { useAuthStore } from "@/features/auth/store";
import { getTierConfig } from "@/features/auth/types";
import { AuthNav } from "@/features/auth/components/AuthNav";

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
  const userTier = useAuthStore((s) => s.userTier);
  const maxModules = getTierConfig(userTier).features.maxModules;
  const placedModules = gridCells.filter((c) => c.moduleType !== null);
  const [showPresets, setShowPresets] = useState(true);
  const [mobilePanel, setMobilePanel] = useState<"presets" | "tools" | null>(null);
  const [mobileTopOpen, setMobileTopOpen] = useState(true);

  /* ---- Read URL params from Choose page (Step 1) ---- */
  const searchParams = useSearchParams();
  const terrainLat = searchParams.get("lat");
  const terrainLng = searchParams.get("lng");
  const terrainAddr = searchParams.get("address");
  const terrainCity = searchParams.get("city");

  const setMapCenter = useLandStore((s) => s.setMapCenter);
  const setMapZoom = useLandStore((s) => s.setMapZoom);

  useEffect(() => {
    if (terrainLat && terrainLng) {
      const lat = parseFloat(terrainLat);
      const lng = parseFloat(terrainLng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setMapCenter({ lat, lng });
        setMapZoom(18);
      }
    } else if (terrainAddr) {
      const query = [terrainAddr, terrainCity, "Romania"].filter(Boolean).join(", ");
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      )
        .then((res) => res.json())
        .then((data: { lat: string; lon: string }[]) => {
          if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            if (Number.isFinite(lat) && Number.isFinite(lng)) {
              setMapCenter({ lat, lng });
              setMapZoom(18);
            }
          }
        })
        .catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyPreset = (preset: PresetLayout) => {
    setGridCells(preset.cells);
    setPhase("modules");
    setShowPresets(false);
    setMobilePanel(null);
  };

  const showPresetsSection = showPresets && phase === "map" && gridCells.length === 0;

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* ============================================================ */}
      {/*  MOBILE HEADER (< md)                                        */}
      {/* ============================================================ */}
      <header className="flex md:hidden h-14 items-center justify-between border-b border-brand-bone-300/60 bg-white px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-brand-charcoal tracking-tight">
            Modul<span className="text-brand-olive-700">CA</span>
          </span>
        </Link>
        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                s === 2
                  ? "bg-brand-olive-700 text-white"
                  : "bg-brand-bone-200 text-brand-gray"
              }`}
            >
              {s}
            </span>
          ))}
        </div>
        <AuthNav />
      </header>

      {/* ============================================================ */}
      {/*  DESKTOP HEADER (md+)                                        */}
      {/* ============================================================ */}
      <header className="hidden md:flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-lg font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <StepNav activeStep={1} />
        <div className="flex items-center gap-3 shrink-0">
          <AuthNav />
        </div>
      </header>

      {/* ============================================================ */}
      {/*  MOBILE LAYOUT (< md): map-first with top/bottom bars        */}
      {/* ============================================================ */}
      <div className="flex flex-col flex-1 overflow-hidden md:hidden">
        {/* ---- TOP BAR: collapsible controls ---- */}
        <div className="bg-white border-b border-brand-bone-300/60">
          {/* Collapsed: single row with toggle */}
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-brand-charcoal truncate">
                {terrainAddr
                  ? `📍 ${terrainAddr}${terrainCity ? `, ${terrainCity}` : ""}`
                  : "📍 Search your land"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Presets toggle */}
              {showPresetsSection && (
                <button
                  onClick={() => setMobilePanel(mobilePanel === "presets" ? null : "presets")}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                    mobilePanel === "presets"
                      ? "bg-brand-olive-700 text-white"
                      : "bg-brand-bone-200 text-brand-gray"
                  }`}
                >
                  Presets
                </button>
              )}
              {/* Tools toggle */}
              {(phase === "grid" || phase === "modules") && (
                <button
                  onClick={() => setMobilePanel(mobilePanel === "tools" ? null : "tools")}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                    mobilePanel === "tools"
                      ? "bg-brand-olive-700 text-white"
                      : "bg-brand-bone-200 text-brand-gray"
                  }`}
                >
                  Tools
                </button>
              )}
              {/* Expand/collapse search */}
              <button
                onClick={() => setMobileTopOpen(!mobileTopOpen)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-brand-bone-200 text-brand-gray"
              >
                <svg className={`w-3.5 h-3.5 transition-transform ${mobileTopOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Expanded: address search + map layer */}
          {mobileTopOpen && (
            <div className="px-3 pb-2.5 space-y-2">
              <AddressSearch />
            </div>
          )}
        </div>

        {/* ---- DROPDOWN PANEL: Presets ---- */}
        {mobilePanel === "presets" && showPresetsSection && (
          <div className="bg-white border-b border-brand-bone-300/60 px-3 py-2.5">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {PRESET_LAYOUTS.map((preset) => {
                const exceedsLimit = maxModules !== -1 && preset.modules > maxModules;
                return (
                  <button
                    key={preset.id}
                    onClick={() => !exceedsLimit && applyPreset(preset)}
                    disabled={exceedsLimit}
                    className={`flex-shrink-0 w-20 rounded-lg border p-2 text-center transition-colors ${
                      exceedsLimit
                        ? "border-gray-100 bg-gray-50 opacity-40"
                        : "border-brand-bone-300/60 bg-brand-bone-100 active:bg-brand-olive-100"
                    }`}
                  >
                    <span className="text-lg block">{preset.icon}</span>
                    <span className="text-[9px] font-bold text-brand-charcoal block leading-tight">
                      {preset.label}
                    </span>
                    <span className="text-[8px] text-brand-gray block">
                      {preset.modules}mod
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ---- DROPDOWN PANEL: Tools ---- */}
        {mobilePanel === "tools" && (
          <div className="bg-white border-b border-brand-bone-300/60 px-3 py-2.5 max-h-[35vh] overflow-y-auto">
            <Toolbar />
            {phase === "modules" && (
              <div className="mt-2">
                <ModulePalette />
              </div>
            )}
          </div>
        )}

        {/* ---- MAP: takes all remaining space ---- */}
        <div className="relative flex-1 min-h-0">
          <MapView />

          {/* Phase indicator floating pill */}
          <div className="absolute top-2 left-2 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[9px] font-bold text-white uppercase tracking-wider">
            {phase === "map" ? "1. Draw Area" : phase === "grid" ? "2. Grid" : "3. Modules"}
          </div>

          {/* Module count chip — when modules placed but bottom bar shows Next */}
          {placedModules.length > 0 && (
            <div className="absolute top-2 right-2 rounded-full bg-white/90 backdrop-blur-sm shadow px-2.5 py-1 text-[10px] font-bold text-brand-charcoal">
              {placedModules.length}{maxModules !== -1 ? `/${maxModules}` : ""} modules · {placedModules.length * 9}m²
            </div>
          )}
        </div>

        {/* ---- BOTTOM BAR: fixed at bottom ---- */}
        <div className="bg-white border-t border-brand-bone-300/60 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
          {placedModules.length > 0 ? (
            <div className="flex items-center gap-2">
              <Link
                href="/project/demo/choose"
                className="px-3 py-2 rounded-lg border border-brand-bone-300 text-[10px] font-semibold text-brand-gray"
              >
                ← Back
              </Link>
              <Link
                href="/project/demo/design"
                className="flex-1 rounded-lg bg-brand-olive-700 py-3 text-center text-sm font-bold text-white active:scale-[0.98] transition-transform"
              >
                Next Step: Design →
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <Link
                href="/project/demo/choose"
                className="text-[10px] text-brand-gray font-medium"
              >
                ← Back to Choose
              </Link>
              <span className="text-[10px] text-brand-gray">Draw area on map to continue</span>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/*  DESKTOP LAYOUT (md+): sidebar + map                         */}
      {/* ============================================================ */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-80 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-5">
          <h2 className="mb-1 text-xl font-bold text-brand-teal-800">
            Step 2: Locate Your Land
          </h2>
          <p className="mb-5 text-sm text-gray-500">
            {terrainAddr
              ? `Selected terrain: ${terrainAddr}${terrainCity ? `, ${terrainCity}` : ""}`
              : "Search for your location, then click and drag on the map to draw your building area."}
          </p>

          {/* Quick Start Presets */}
          {showPresetsSection && (
            <div className="mb-5 rounded-lg border border-brand-amber-200 bg-brand-amber-50 p-4">
              <h4 className="mb-1 text-xs font-bold text-brand-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                ⚡ Quick Start
              </h4>
              <p className="mb-3 text-[11px] text-brand-amber-600">
                Choose a preset layout to get started quickly, or draw your own area on the map.
              </p>
              <div className="space-y-2">
                {PRESET_LAYOUTS.map((preset) => {
                  const exceedsLimit = maxModules !== -1 && preset.modules > maxModules;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => !exceedsLimit && applyPreset(preset)}
                      disabled={exceedsLimit}
                      className={`w-full flex items-center gap-3 rounded-lg border p-2.5 transition-colors text-left group ${
                        exceedsLimit
                          ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                          : "border-gray-200 bg-white hover:border-brand-amber-400 hover:bg-brand-amber-25"
                      }`}
                    >
                      <span className="text-xl flex-shrink-0">{preset.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-brand-teal-800 group-hover:text-brand-teal-600">
                            {preset.label}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">
                            {preset.modules} mod · {preset.area}
                            {exceedsLimit && " · ⬆ Upgrade"}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500">{preset.description}</span>
                      </div>
                    </button>
                  );
                })}
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

          {/* Module Types Legend */}
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
                {placedModules.length}{maxModules !== -1 ? `/${maxModules}` : ""} Module{placedModules.length !== 1 ? "s" : ""}
              </div>
              <div className="mt-1 text-sm text-brand-teal-600">
                {placedModules.length * 9}m&sup2; total / {placedModules.length * 7}m&sup2; usable
              </div>
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
              Next: Design →
            </Link>
          )}
          <Link
            href="/project/demo/choose"
            className="mt-3 w-full block text-center text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back to Choose
          </Link>
        </aside>

        {/* Map Area */}
        <div className="relative flex-1">
          <MapView />
        </div>
      </div>
    </div>
  );
}
