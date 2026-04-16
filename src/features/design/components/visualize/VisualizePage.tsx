"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useDesignStore } from "../../store";
import { useSaveDesign } from "../../hooks/useSaveDesign";
import { useLandStore } from "@/features/land/store";
import { MODULE_TYPES } from "@/shared/types";
import { getPreset, getPresetsForType } from "../../layouts";
import { FURNITURE_COLORS } from "../../styles";
import ConfigPanel from "../configure/ConfigPanel";
import StepNav from "../shared/StepNav";
import MobileStepFooter from "../shared/MobileStepFooter";
import { useProjectId } from "@/shared/hooks/useProjectId";

type ViewMode = "single" | "all";

const ModuleScene3D = dynamic(() => import("./ModuleScene3D"), { ssr: false });
const CombinedScene3D = dynamic(() => import("./CombinedScene3D"), { ssr: false });

export default function VisualizePage() {
  const projectId = useProjectId();
  const { gridCells, gridRotation } = useLandStore();
  const {
    setModulesFromGrid, modules, selectedModule, setSelectedModule,
    selectedFurniture, setSelectedFurniture, updateFurnitureOverride,
    resetAllFurnitureOverrides, styleDirection, loadFromLocalStorage,
  } = useDesignStore();
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [mobileSidebar, setMobileSidebar] = useState<"left" | "right" | null>(null);
  const { saved, handleSave } = useSaveDesign();

  useEffect(() => {
    if (modules.length > 0) return;
    loadFromLocalStorage();
    const loaded = useDesignStore.getState().modules;
    if (loaded.length === 0 && gridCells.some((c) => c.moduleType !== null)) {
      setModulesFromGrid(gridCells, gridRotation);
    }
  }, [modules.length, loadFromLocalStorage, gridCells, gridRotation, setModulesFromGrid]);

  useEffect(() => {
    if (modules.length > 0 && !selectedModule) {
      setSelectedModule({ row: modules[0].row, col: modules[0].col });
    }
  }, [modules, selectedModule, setSelectedModule]);

  const currentMod = selectedModule
    ? modules.find((m) => m.row === selectedModule.row && m.col === selectedModule.col) ?? null
    : modules.length > 0 ? modules[0] : null;

  const preset = currentMod
    ? getPreset(currentMod.moduleType, currentMod.layoutPreset)
      || getPresetsForType(currentMod.moduleType)[0]
    : null;
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
          <Link href={`/project/${projectId}/land`} className="mt-4 btn-accent inline-block">
            Go to Step 1
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Top Nav */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <StepNav activeStep={6} />
        <button
          onClick={handleSave}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${saved ? "bg-green-600" : "bg-brand-teal-800 hover:bg-brand-teal-700"}`}
        >
          {saved ? "Saved!" : "Save"}
        </button>
      </header>

      {/* Module selector bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 md:px-6 py-3 overflow-x-auto">
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
          <Link href={`/project/${projectId}/configure`} className="text-sm text-gray-500 hover:text-brand-teal-800">
            ← Back to Configure
          </Link>
          <Link
            href={`/project/${projectId}/render`}
            className="rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-amber-600"
          >
            Render View →
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {viewMode === "single" && (
          /* Left sidebar — furniture list + color picker */
          <aside className="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
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

            {/* Reset furniture positions */}
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={() => {
                  resetAllFurnitureOverrides();
                  useDesignStore.getState().saveToLocalStorage();
                }}
                className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
              >
                ↺ Reset All Furniture Positions
              </button>
              <p className="mt-1.5 text-[9px] text-gray-400">
                Resets furniture to default positions if they appear misplaced.
              </p>
            </div>

            {/* Controls info */}
            <div className="border-t border-gray-200 p-4">
              <h3 className="mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Controls
              </h3>
              <div className="space-y-1 text-[10px] text-gray-400">
                <div><kbd className="px-1 rounded bg-gray-200 text-gray-600">W</kbd><kbd className="px-1 rounded bg-gray-200 text-gray-600 ml-0.5">A</kbd><kbd className="px-1 rounded bg-gray-200 text-gray-600 ml-0.5">S</kbd><kbd className="px-1 rounded bg-gray-200 text-gray-600 ml-0.5">D</kbd>: Pan camera</div>
                <div><kbd className="px-1 rounded bg-gray-200 text-gray-600">Q</kbd> / <kbd className="px-1 rounded bg-gray-200 text-gray-600">E</kbd>: Lower / Raise camera</div>
                <div>Click: Select furniture</div>
                <div><kbd className="px-1 rounded bg-gray-200 text-gray-600">Shift</kbd> + drag: Move furniture</div>
                <div>Left-drag: Rotate camera</div>
                <div>Scroll: Zoom</div>
              </div>
            </div>
          </aside>
        )}

        {/* Center — 3D scene — keep both mounted to prevent Canvas remount flicker.
            Use visibility:hidden + absolute positioning instead of display:none (Tailwind "hidden")
            because display:none destroys the WebGL context and causes the 3D view to disappear. */}
        <main className="flex-1 overflow-hidden relative">
          {/* Mobile touch hint — visible only on small screens */}
          <div className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-[10px] pointer-events-none">
            Pinch to zoom &middot; Drag to rotate
          </div>
          <div
            className="absolute inset-0"
            style={{ visibility: viewMode === "all" ? "visible" : "hidden" }}
          >
            <CombinedScene3D />
            {/* Reset button for all-modules view */}
            <div className="absolute top-3 left-3 z-10">
              <button
                onClick={() => {
                  resetAllFurnitureOverrides();
                  useDesignStore.getState().saveToLocalStorage();
                }}
                className="rounded-lg border border-red-200 bg-white/90 backdrop-blur-sm px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 shadow-sm transition-colors"
              >
                ↺ Reset All Furniture Positions
              </button>
            </div>
          </div>
          <div
            className="absolute inset-0"
            style={{ visibility: viewMode === "single" ? "visible" : "hidden" }}
          >
            {currentMod && <ModuleScene3D module={currentMod} />}
          </div>
        </main>

        {/* Right — config panel (only in single mode) */}
        {viewMode === "single" && (
          <aside className="hidden md:block w-80 flex-shrink-0 border-l border-gray-200 bg-gray-50">
            {selectedModule && (
              <ConfigPanel moduleRow={selectedModule.row} moduleCol={selectedModule.col} />
            )}
          </aside>
        )}

        {/* Mobile FAB to toggle sidebars — above MobileStepFooter + MobileBottomNav */}
        {viewMode === "single" && (
          <div className="md:hidden fixed bottom-36 right-3 flex flex-col gap-2 z-50">
            <button
              onClick={() => setMobileSidebar(mobileSidebar === "left" ? null : "left")}
              className="h-12 w-12 rounded-full bg-brand-teal-800 text-white shadow-lg flex items-center justify-center text-lg"
              aria-label="Toggle furniture panel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
            </button>
            <button
              onClick={() => setMobileSidebar(mobileSidebar === "right" ? null : "right")}
              className="h-12 w-12 rounded-full bg-brand-amber-500 text-white shadow-lg flex items-center justify-center text-lg"
              aria-label="Toggle settings panel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
        )}

        {/* Mobile slide-over panel */}
        {mobileSidebar !== null && (
          <div className="md:hidden fixed inset-0 z-40">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30" onClick={() => setMobileSidebar(null)} />
            {/* Panel */}
            <aside
              className={`absolute top-0 bottom-0 w-full max-w-xs bg-white shadow-xl overflow-y-auto transition-transform ${
                mobileSidebar === "left" ? "left-0" : "right-0"
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <span className="text-sm font-bold text-brand-teal-800">
                  {mobileSidebar === "left" ? "Furniture" : "Settings"}
                </span>
                <button onClick={() => setMobileSidebar(null)} className="text-gray-400 hover:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {mobileSidebar === "left" ? (
                <div className="p-4">
                  <h3 className="mb-1 text-xs font-bold text-gray-500 uppercase tracking-wider">Furniture</h3>
                  <p className="text-[10px] text-gray-400 mb-3">Click a piece in 3D or below to select.</p>
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
                            isSelected ? "bg-brand-amber-50 border border-brand-amber-300" : "hover:bg-gray-50 border border-transparent"
                          }`}
                        >
                          <div className="h-4 w-4 rounded border border-gray-200 flex-shrink-0" style={{ backgroundColor: displayColor }} />
                          <span className={isSelected ? "font-semibold text-brand-teal-800" : "text-gray-600"}>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {selectedItem && currentMod && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Color — {selectedItem.label}</h4>
                      <div className="flex flex-wrap gap-2">
                        {colorPalette.map((c) => {
                          const override = (currentMod.furnitureOverrides[currentMod.layoutPreset] ?? {})[selectedItem.id];
                          const currentColor = override?.color || selectedItem.color;
                          const isActive = currentColor === c.color;
                          return (
                            <button
                              key={c.color}
                              onClick={() => updateFurnitureOverride(currentMod.row, currentMod.col, selectedItem.id, { color: c.color })}
                              className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all ${isActive ? "border-brand-amber-500" : "border-gray-100 hover:border-gray-200"}`}
                              title={c.label}
                            >
                              <div className="h-8 w-8 rounded" style={{ backgroundColor: c.color }} />
                              <span className="text-[8px] font-bold text-gray-500 uppercase">{c.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : mobileSidebar === "right" ? (
                selectedModule && <ConfigPanel moduleRow={selectedModule.row} moduleCol={selectedModule.col} />
              ) : null}
              {/* Reset button in mobile panel */}
              {mobileSidebar === "left" && (
                <div className="border-t border-gray-200 p-4">
                  <button
                    onClick={() => {
                      resetAllFurnitureOverrides();
                      useDesignStore.getState().saveToLocalStorage();
                    }}
                    className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                  >
                    ↺ Reset All Furniture Positions
                  </button>
                  <p className="mt-1.5 text-[9px] text-gray-400">
                    Resets furniture to default positions if they appear misplaced.
                  </p>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
      <MobileStepFooter activeStep={6} />
    </div>
  );
}
