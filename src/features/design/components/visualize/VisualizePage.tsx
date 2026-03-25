"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useDesignStore } from "../../store";
import { useSaveDesign } from "../../hooks/useSaveDesign";
import { useLandStore } from "@/features/land/store";
import { MODULE_TYPES } from "@/shared/types";
import { getPreset } from "../../layouts";
import { FURNITURE_COLORS } from "../../styles";
import ConfigPanel from "../configure/ConfigPanel";
import StepNav from "../shared/StepNav";

type ViewMode = "single" | "all";

const ModuleScene3D = dynamic(() => import("./ModuleScene3D"), { ssr: false });
const CombinedScene3D = dynamic(() => import("./CombinedScene3D"), { ssr: false });

export default function VisualizePage() {
  const { gridCells, gridRotation } = useLandStore();
  const {
    setModulesFromGrid, modules, selectedModule, setSelectedModule,
    selectedFurniture, setSelectedFurniture, updateFurnitureOverride,
    styleDirection,
  } = useDesignStore();
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const { saved, handleSave } = useSaveDesign();

  useEffect(() => {
    if (gridCells.length > 0 && modules.length === 0) {
      setModulesFromGrid(gridCells, gridRotation);
    }
  }, [gridCells, gridRotation, setModulesFromGrid, modules.length]);

  useEffect(() => {
    if (modules.length > 0 && !selectedModule) {
      setSelectedModule({ row: modules[0].row, col: modules[0].col });
    }
  }, [modules, selectedModule, setSelectedModule]);

  const currentMod = selectedModule
    ? modules.find((m) => m.row === selectedModule.row && m.col === selectedModule.col)
    : null;

  const preset = currentMod ? getPreset(currentMod.moduleType, currentMod.layoutPreset) : null;
  const furnitureList = preset?.furniture || [];
  const selectedItem = furnitureList.find((f) => f.id === selectedFurniture);

  // Color palette based on style direction
  const colorPalette = styleDirection
    ? FURNITURE_COLORS[styleDirection] || FURNITURE_COLORS.scandinavian
    : FURNITURE_COLORS.scandinavian;

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
        <StepNav activeStep={5} />
        <button
          onClick={handleSave}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${saved ? "bg-green-600" : "bg-brand-teal-800 hover:bg-brand-teal-700"}`}
        >
          {saved ? "Saved!" : "Save"}
        </button>
      </header>

      {/* Module selector bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-6 py-3 overflow-x-auto">
        {/* View mode toggle */}
        <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
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

        <div className="mx-2 h-6 w-px bg-gray-200" />

        {modules.map((mod) => {
          const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
          const isActive = selectedModule?.row === mod.row && selectedModule?.col === mod.col;
          return (
            <button
              key={`${mod.row}-${mod.col}`}
              onClick={() => {
                setSelectedModule({ row: mod.row, col: mod.col });
                if (viewMode === "all") setViewMode("single");
              }}
              className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm whitespace-nowrap transition-all ${
                isActive
                  ? "border-brand-amber-500 bg-brand-amber-50"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div className="h-4 w-4 rounded" style={{ backgroundColor: mt?.color || "#888" }} />
              <span className={isActive ? "font-semibold text-brand-teal-800" : "text-gray-600"}>
                {mod.label}
              </span>
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <Link href="/project/demo/configure" className="text-sm text-gray-500 hover:text-brand-teal-800">
            ← Back to Configure
          </Link>
          <Link
            href="/project/demo/render"
            className="rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-amber-600"
          >
            Render View →
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {viewMode === "single" && (
          /* Left sidebar — furniture list + color picker */
          <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
            <div className="p-4">
              <h3 className="mb-1 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Furniture
              </h3>
              <p className="text-[10px] text-gray-400 mb-3">
                Click a piece in 3D or below to select. Drag in 3D to reposition.
              </p>

              {/* Furniture list */}
              <div className="space-y-1">
                {furnitureList.map((item) => {
                  const isSelected = selectedFurniture === item.id;
                  const override = currentMod ? (currentMod.furnitureOverrides[currentMod.layoutPreset] ?? {})[item.id] : undefined;
                  const displayColor = override?.color || item.color;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedFurniture(isSelected ? null : item.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                        isSelected
                          ? "bg-brand-amber-50 border border-brand-amber-300"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <div
                        className="h-4 w-4 rounded border border-gray-200 flex-shrink-0"
                        style={{ backgroundColor: displayColor }}
                      />
                      <span className={isSelected ? "font-semibold text-brand-teal-800" : "text-gray-600"}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color picker for selected furniture */}
            {selectedItem && currentMod && (
              <div className="border-t border-gray-200 p-4">
                <h4 className="mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Color — {selectedItem.label}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {colorPalette.map((c) => {
                    const override = (currentMod.furnitureOverrides[currentMod.layoutPreset] ?? {})[selectedItem.id];
                    const currentColor = override?.color || selectedItem.color;
                    const isActive = currentColor === c.color;
                    return (
                      <button
                        key={c.color}
                        onClick={() =>
                          updateFurnitureOverride(
                            currentMod.row,
                            currentMod.col,
                            selectedItem.id,
                            { color: c.color }
                          )
                        }
                        className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all ${
                          isActive ? "border-brand-amber-500" : "border-gray-100 hover:border-gray-200"
                        }`}
                        title={c.label}
                      >
                        <div
                          className="h-8 w-8 rounded"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-[8px] font-bold text-gray-500 uppercase">
                          {c.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Reset button */}
                <button
                  onClick={() =>
                    updateFurnitureOverride(
                      currentMod.row,
                      currentMod.col,
                      selectedItem.id,
                      { color: selectedItem.color }
                    )
                  }
                  className="mt-3 text-[10px] text-gray-400 hover:text-brand-teal-800 underline"
                >
                  Reset to default color
                </button>
              </div>
            )}

            {/* Controls info */}
            <div className="border-t border-gray-200 p-4">
              <h3 className="mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Controls
              </h3>
              <div className="space-y-1 text-[10px] text-gray-400">
                <div>Click furniture: Select</div>
                <div>Drag furniture: Move</div>
                <div>Right-drag: Rotate camera</div>
                <div>Scroll: Zoom</div>
              </div>
            </div>
          </aside>
        )}

        {/* Center — 3D scene */}
        <main className="flex-1 overflow-hidden">
          {viewMode === "all" ? (
            <CombinedScene3D />
          ) : (
            currentMod && <ModuleScene3D module={currentMod} />
          )}
        </main>

        {/* Right — config panel (only in single mode) */}
        {viewMode === "single" && (
          <aside className="w-80 flex-shrink-0 border-l border-gray-200 bg-gray-50">
            {selectedModule && (
              <ConfigPanel moduleRow={selectedModule.row} moduleCol={selectedModule.col} />
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
