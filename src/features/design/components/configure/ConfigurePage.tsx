"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ModuleFloorPlan from "./ModuleFloorPlan";
import CombinedFloorPlan from "./CombinedFloorPlan";
import ConfigPanel from "./ConfigPanel";
import { useDesignStore } from "../../store";
import { useSaveDesign } from "../../hooks/useSaveDesign";
import { useLandStore } from "@/features/land/store";
import { MODULE_TYPES } from "@/shared/types";
import StepNav from "../shared/StepNav";

type ViewMode = "single" | "all";

export default function ConfigurePage() {
  const { gridCells, gridRotation } = useLandStore();
  const { setModulesFromGrid, modules, selectedModule, setSelectedModule } =
    useDesignStore();
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [sidebarTooltip, setSidebarTooltip] = useState<string | null>(null);
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
        {/* Left sidebar — module list */}
        <aside className="w-48 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          <div className="p-4">
            <h3 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
              Project Info
            </h3>
            <div className="text-sm font-bold text-brand-teal-800">Project Alpha</div>
            <div className="text-xs text-gray-400">Residential Complex</div>
          </div>
          <nav className="px-2">
            {[
              { id: "projects", label: "Projects", icon: "📁" },
              { id: "blueprints", label: "Blueprints", icon: "📐" },
              { id: "team", label: "Team", icon: "👥" },
              { id: "settings", label: "Settings", icon: "⚙" },
            ].map((item) => (
              <div key={item.id} className="relative">
                <button
                  onClick={() => {
                    setSidebarTooltip(item.id);
                    setTimeout(() => setSidebarTooltip(null), 2000);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
                {sidebarTooltip === item.id && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-lg z-10">
                    Coming soon
                  </div>
                )}
              </div>
            ))}
          </nav>
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
