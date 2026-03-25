"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ModuleFloorPlan from "./ModuleFloorPlan";
import CombinedFloorPlan from "./CombinedFloorPlan";
import ConfigPanel from "./ConfigPanel";
import { useDesignStore } from "../../store";
import type { WallSide, WallType, WallConfigs, ModuleConfig } from "../../store";
import { useSaveDesign } from "../../hooks/useSaveDesign";
import { useLandStore } from "@/features/land/store";
import { MODULE_TYPES, FINISH_LEVELS } from "@/shared/types";
import { getPreset, FLOOR_MATERIALS, WALL_MATERIALS } from "../../layouts";
import StepNav from "../shared/StepNav";

type ViewMode = "single" | "all";

/** Wall upgrade pricing (EUR) — mirrors store constants */
const WALL_PRICES: Record<WallType, number> = {
  solid: 0,
  window: 800,
  door: 600,
  none: -200,
  shared: 0,
};

const WALL_SIDES: WallSide[] = ["north", "south", "east", "west"];
const EXTERIOR_WALL_OPTIONS: WallType[] = ["solid", "window", "door", "none"];
const INTERIOR_WALL_OPTIONS: WallType[] = ["shared", "door", "none"];

function wallLabel(type: WallType): string {
  switch (type) {
    case "solid": return "Solid Wall";
    case "window": return "Window";
    case "door": return "Door";
    case "none": return "No Wall";
    case "shared": return "Shared";
  }
}

function wallPriceLabel(type: WallType): string {
  const p = WALL_PRICES[type];
  if (p > 0) return `+\u20AC${p}`;
  if (p < 0) return `\u20AC${p}`;
  return "included";
}

function sideLabel(side: WallSide): string {
  return side.charAt(0).toUpperCase() + side.slice(1);
}

/** Compute the wall-upgrade cost delta for one module */
function moduleWallCost(wc: WallConfigs): number {
  let cost = 0;
  for (const s of WALL_SIDES) cost += WALL_PRICES[wc[s]];
  return cost;
}

/** Sidebar section: Wall configuration dropdowns + module inspection */
function WallSidebar({ mod }: { mod: ModuleConfig }) {
  const updateWallConfig = useDesignStore((s) => s.updateWallConfig);
  const modules = useDesignStore((s) => s.modules);
  const finishLevel = useDesignStore((s) => s.finishLevel);

  const mt = MODULE_TYPES.find((t) => t.id === mod.moduleType);
  const preset = getPreset(mod.moduleType, mod.layoutPreset);
  const floorMat = FLOOR_MATERIALS.find((f) => f.id === mod.floorFinish);
  const wallMat = WALL_MATERIALS.find((w) => w.id === mod.wallColor);
  const furnitureCount = preset?.furniture.length ?? 0;
  const finish = FINISH_LEVELS.find((f) => f.id === finishLevel);
  const basePrice = finish?.pricePerModule ?? 0;
  const wallCost = moduleWallCost(mod.wallConfigs);
  const estimatedCost = basePrice + wallCost;

  // Detect interior walls
  const occupied = new Set(modules.map((m) => `${m.row},${m.col}`));
  const isInterior: Record<WallSide, boolean> = {
    north: occupied.has(`${mod.row - 1},${mod.col}`),
    south: occupied.has(`${mod.row + 1},${mod.col}`),
    west: occupied.has(`${mod.row},${mod.col - 1}`),
    east: occupied.has(`${mod.row},${mod.col + 1}`),
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Module Inspection */}
      <div>
        <h3 className="mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Module Info
        </h3>
        <div
          className="mb-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: mt?.color ?? "#888" }}
        >
          {mt?.icon} {mod.label}
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-gray-500">Type</span>
            <span className="font-medium text-brand-teal-800">{mt?.label ?? mod.moduleType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Layout</span>
            <span className="font-medium text-brand-teal-800">{preset?.label ?? "Default"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Floor</span>
            <span className="font-medium text-brand-teal-800">{floorMat?.label ?? mod.floorFinish}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Wall Color</span>
            <span className="font-medium text-brand-teal-800">{wallMat?.label ?? mod.wallColor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Furniture</span>
            <span className="font-medium text-brand-teal-800">{furnitureCount} items</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-gray-100">
            <span className="text-gray-500 font-semibold">Est. Cost</span>
            <span className="font-bold text-brand-amber-600">&euro;{estimatedCost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Wall Configuration */}
      <div>
        <h3 className="mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Wall Config
        </h3>
        <div className="space-y-2">
          {WALL_SIDES.map((side) => {
            const current = mod.wallConfigs[side];
            const interior = isInterior[side];
            const options = interior ? INTERIOR_WALL_OPTIONS : EXTERIOR_WALL_OPTIONS;
            return (
              <div key={side} className="rounded-md border border-gray-100 bg-white p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    {sideLabel(side)}
                    {interior && (
                      <span className="ml-1 text-amber-500 font-normal normal-case">(interior)</span>
                    )}
                  </span>
                  <span className={`text-[10px] font-semibold ${WALL_PRICES[current] > 0 ? "text-red-500" : WALL_PRICES[current] < 0 ? "text-green-600" : "text-gray-400"}`}>
                    {wallPriceLabel(current)}
                  </span>
                </div>
                <select
                  value={current}
                  onChange={(e) => updateWallConfig(mod.row, mod.col, side, e.target.value as WallType)}
                  className="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-brand-teal-800 focus:outline-none focus:ring-1 focus:ring-brand-teal-400"
                >
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {wallLabel(opt)} ({wallPriceLabel(opt)})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
        {/* Wall pricing impact total */}
        <div className="mt-2 flex items-center justify-between rounded-md bg-gray-50 px-2 py-1.5 text-[10px]">
          <span className="font-semibold text-gray-500 uppercase">Wall Impact</span>
          <span className={`font-bold ${wallCost > 0 ? "text-red-500" : wallCost < 0 ? "text-green-600" : "text-gray-400"}`}>
            {wallCost > 0 ? "+" : ""}&euro;{wallCost.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ConfigurePage() {
  const { gridCells, gridRotation } = useLandStore();
  const { setModulesFromGrid, modules, selectedModule, setSelectedModule } =
    useDesignStore();
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const { saved, handleSave } = useSaveDesign();

  // Import modules from Step 1 if needed
  useEffect(() => {
    if (gridCells.length > 0 && modules.length === 0) {
      setModulesFromGrid(gridCells, gridRotation);
    }
  }, [gridCells, gridRotation, setModulesFromGrid, modules.length]);

  // Default to first module if none selected
  useEffect(() => {
    if (modules.length > 0 && !selectedModule) {
      setSelectedModule({ row: modules[0].row, col: modules[0].col });
    }
  }, [modules, selectedModule, setSelectedModule]);

  const currentMod = selectedModule
    ? modules.find(
        (m) => m.row === selectedModule.row && m.col === selectedModule.col
      )
    : null;

  if (modules.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No modules configured yet.</p>
          <Link href="/project/demo/land" className="mt-4 btn-accent inline-block">
            Go to Step 1
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Top Nav */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <StepNav activeStep={4} />
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${saved ? "bg-green-600" : "bg-brand-teal-800 hover:bg-brand-teal-700"}`}
          >
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </header>

      {/* Module selector bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-6 py-3 overflow-x-auto">
        {modules.map((mod) => {
          const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
          const isActive =
            selectedModule?.row === mod.row && selectedModule?.col === mod.col;
          return (
            <button
              key={`${mod.row}-${mod.col}`}
              onClick={() => setSelectedModule({ row: mod.row, col: mod.col })}
              className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm whitespace-nowrap transition-all ${
                isActive
                  ? "border-brand-amber-500 bg-brand-amber-50"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div
                className="h-4 w-4 rounded"
                style={{ backgroundColor: mt?.color || "#888" }}
              />
              <span className={isActive ? "font-semibold text-brand-teal-800" : "text-gray-600"}>
                {mod.label}
              </span>
            </button>
          );
        })}

        {/* View mode toggle */}
        <div className="ml-4 flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
          <button
            onClick={() => setViewMode("single")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              viewMode === "single"
                ? "bg-white text-brand-teal-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Single Module
          </button>
          <button
            onClick={() => setViewMode("all")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              viewMode === "all"
                ? "bg-white text-brand-teal-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All Modules
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/project/demo/style"
            className="text-sm text-gray-500 hover:text-brand-teal-800"
          >
            ← Back to Style
          </Link>
          <Link
            href="/project/demo/visualize"
            className="rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-amber-600"
          >
            3D Preview →
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — wall configuration */}
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          {currentMod ? (
            <WallSidebar mod={currentMod} />
          ) : (
            <div className="p-4 text-sm text-gray-400">Select a module</div>
          )}
        </aside>

        {/* Center — floor plan */}
        <main className="flex-1 flex items-center justify-center overflow-auto bg-gray-100 p-8">
          {viewMode === "single" ? (
            currentMod && <ModuleFloorPlan module={currentMod} />
          ) : (
            <CombinedFloorPlan
              modules={modules}
              selectedModule={selectedModule}
              onSelectModule={setSelectedModule}
            />
          )}
        </main>

        {/* Right — config panel */}
        <aside className="w-80 flex-shrink-0 border-l border-gray-200 bg-gray-50">
          {selectedModule && (
            <ConfigPanel
              moduleRow={selectedModule.row}
              moduleCol={selectedModule.col}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
