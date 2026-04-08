"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import Toolbar from "./Toolbar";
import ModulePalette from "./ModulePalette";
import AddressSearch from "./AddressSearch";
import StepNav from "@/features/design/components/shared/StepNav";
import { useLandStore } from "../store";
import type { GridCell } from "../store";
import { MODULE_TYPES } from "@/shared/types";
import { useAuthStore } from "@/features/auth/store";
import { getTierConfig } from "@/features/auth/types";

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

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type LandMode = "chooser" | "have-land" | "want-to-buy" | "play";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function LandDesigner() {
  const router = useRouter();
  const { phase, gridCells, setGridCells, setPhase, setMapCenter, setMapZoom } = useLandStore();
  const userTier = useAuthStore((s) => s.userTier);
  const maxModules = getTierConfig(userTier).features.maxModules;
  const placedModules = gridCells.filter((c) => c.moduleType !== null);
  const [showPresets, setShowPresets] = useState(true);
  const [landMode, setLandMode] = useState<LandMode>("chooser");
  const [initialAddress, setInitialAddress] = useState("");

  // Read URL params on mount — apply coordinates and determine initial mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lat = params.get("lat");
    const lng = params.get("lng");
    const addr = params.get("address");
    const fromMkt = params.get("fromMarketplace") === "1";

    // Fly the map to the terrain's location
    if (lat && lng) {
      setMapCenter({ lat: parseFloat(lat), lng: parseFloat(lng) });
      setMapZoom(18);
    }

    // Pre-fill address search
    if (addr) setInitialAddress(addr);

    // Decide which mode to open
    if (fromMkt || (lat && lng)) {
      setLandMode("want-to-buy");
    } else if (phase !== "map" || gridCells.length > 0) {
      // User has in-progress work — skip the chooser
      setLandMode("play");
    }
    // Otherwise keep "chooser" so the overlay shows
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModeSelect = (mode: LandMode) => {
    if (mode === "want-to-buy") {
      // If not coming from marketplace, redirect there first
      const params = new URLSearchParams(window.location.search);
      if (params.get("fromMarketplace") !== "1") {
        router.push("/project/demo/marketplace");
        return;
      }
    }
    setLandMode(mode);
  };

  const applyPreset = (preset: PresetLayout) => {
    setGridCells(preset.cells);
    setPhase("modules");
    setShowPresets(false);
  };

  const modeSidebarLabel =
    landMode === "have-land" ? "Your Land" :
    landMode === "want-to-buy" ? "Marketplace Plot" :
    "Locate Your Land";

  const modeSidebarHint =
    landMode === "have-land"
      ? "Search for your address, then draw your building area on the satellite map."
      : landMode === "want-to-buy"
      ? initialAddress
        ? `Terrain from Marketplace: ${initialAddress}. Draw your building area below.`
        : "Location confirmed from Marketplace. Draw your building area on the satellite map."
      : "Pan to any location on the satellite map, then draw your building area.";

  return (
    <div className="flex h-screen flex-col bg-gray-50">

      {/* ── Mode Chooser Overlay ─────────────────────────── */}
      {landMode === "chooser" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="border-b border-gray-100 px-8 pt-8 pb-6 text-center">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-teal-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-teal-700">
                Step 2 of 13
              </div>
              <h1 className="text-2xl font-bold text-brand-teal-800">Where is your land?</h1>
              <p className="mt-1 text-sm text-gray-500">
                Choose how you&apos;d like to locate your building site
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">

              {/* Mode 1: I Have Land */}
              <button
                onClick={() => handleModeSelect("have-land")}
                className="group flex flex-col rounded-xl border-2 border-gray-200 p-5 text-left transition-all hover:border-brand-teal-500 hover:shadow-lg"
              >
                <span className="mb-3 text-3xl">🏡</span>
                <h3 className="mb-1 text-sm font-bold text-brand-teal-800 group-hover:text-brand-teal-600">
                  I Have Land
                </h3>
                <p className="flex-1 text-[11px] leading-relaxed text-gray-500">
                  Search for my address and draw my plot boundaries on the satellite map.
                </p>
                <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-teal-800 group-hover:text-brand-amber-500 transition-colors">
                  Use my land
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>

              {/* Mode 2: Browse Marketplace */}
              <button
                onClick={() => handleModeSelect("want-to-buy")}
                className="group flex flex-col rounded-xl border-2 border-gray-200 p-5 text-left transition-all hover:border-brand-amber-500 hover:shadow-lg"
              >
                <span className="mb-3 text-3xl">🔍</span>
                <h3 className="mb-1 text-sm font-bold text-brand-teal-800 group-hover:text-brand-teal-600">
                  Browse Marketplace
                </h3>
                <p className="flex-1 text-[11px] leading-relaxed text-gray-500">
                  Explore available terrains for sale and pick the perfect plot for your build.
                </p>
                <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-teal-800 group-hover:text-brand-amber-500 transition-colors">
                  View listings
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>

              {/* Mode 3: Let Me Play */}
              <button
                onClick={() => handleModeSelect("play")}
                className="group flex flex-col rounded-xl border-2 border-gray-200 p-5 text-left transition-all hover:border-brand-olive-500 hover:shadow-lg"
              >
                <span className="mb-3 text-3xl">✏️</span>
                <h3 className="mb-1 text-sm font-bold text-brand-teal-800 group-hover:text-brand-teal-600">
                  Let Me Play
                </h3>
                <p className="flex-1 text-[11px] leading-relaxed text-gray-500">
                  Free exploration mode — pan anywhere on the map and draw boundaries freely. No address needed.
                </p>
                <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-teal-800 group-hover:text-brand-amber-500 transition-colors">
                  Start free drawing
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Shared Header ─────────────────────────────────── */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-lg font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <StepNav activeStep={1} />
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-brand-teal-800">
            Login
          </Link>
          <Link href="/dashboard" className="rounded-lg bg-brand-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-brand-teal-700">
            Dashboard
          </Link>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Sidebar */}
        <aside className="w-80 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand-teal-800">
              Step 2: {modeSidebarLabel}
            </h2>
            {landMode !== "chooser" && (
              <button
                onClick={() => setLandMode("chooser")}
                className="rounded-full border border-gray-200 px-2.5 py-0.5 text-[10px] text-gray-500 hover:border-brand-teal-400 hover:text-brand-teal-600 transition-colors"
              >
                Change
              </button>
            )}
          </div>
          <p className="mb-5 text-sm text-gray-500">{modeSidebarHint}</p>

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

          {/* Address Search — shown for have-land and want-to-buy modes */}
          {(landMode === "have-land" || landMode === "want-to-buy") && (
            <div className="mb-5">
              <AddressSearch initialQuery={initialAddress} />
            </div>
          )}

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
                  const count = placedModules.filter((c) => c.moduleType === mt.id).length;
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
                Click on the grid to add modules. Each square represents a 3×3m prefabricated unit.
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
              Next: Design Your Home →
            </Link>
          )}
          {placedModules.length === 0 && phase === "map" && (
            <Link
              href="/project/demo/marketplace"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white
                         px-6 py-3 text-sm font-medium text-gray-600 transition-colors
                         hover:bg-gray-50 hover:border-brand-teal-300"
            >
              ← Browse the Land Marketplace
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
