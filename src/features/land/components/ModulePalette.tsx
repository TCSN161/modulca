"use client";

import { useState } from "react";
import { useLandStore } from "../store";
import { MODULE_TYPES, BUILDING_PRESETS } from "@/shared/types";
import type { BuildingPreset } from "@/shared/types";

type Tab = "modules" | "presets";

export default function ModulePalette() {
  const { selectedModuleType, setSelectedModuleType, gridCells, placePreset, clearAllModules } = useLandStore();
  const [tab, setTab] = useState<Tab>("modules");
  const [presetCategory, setPresetCategory] = useState<string>("house");

  const placedModules = gridCells.filter((c) => c.moduleType !== null);
  const moduleCounts = MODULE_TYPES.map((mt) => ({
    ...mt,
    count: placedModules.filter((c) => c.moduleType === mt.id).length,
  }));

  const filteredPresets = BUILDING_PRESETS.filter((p) => p.category === presetCategory);

  const handlePlacePreset = (preset: BuildingPreset) => {
    // Check if preset cells fit within available grid
    const available = new Set(gridCells.map((c) => `${c.row},${c.col}`));
    const fits = preset.cells.every(([r, c]) => available.has(`${r},${c}`));
    if (!fits) {
      // Try to find an offset that works
      const minRow = Math.min(...gridCells.map((c) => c.row));
      const minCol = Math.min(...gridCells.map((c) => c.col));
      const offsetCells: [number, number, string][] = preset.cells.map(([r, c, t]) => [r + minRow, c + minCol, t]);
      const offsetFits = offsetCells.every(([r, c]) => available.has(`${r},${c}`));
      if (offsetFits) {
        clearAllModules();
        placePreset(offsetCells);
        return;
      }
      alert("Grid is too small for this building layout. Draw a larger area first.");
      return;
    }
    clearAllModules();
    placePreset(preset.cells);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Tab toggle */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setTab("modules")}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            tab === "modules" ? "bg-brand-teal-800 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Modules
        </button>
        <button
          onClick={() => setTab("presets")}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            tab === "presets" ? "bg-brand-teal-800 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Building Presets
        </button>
      </div>

      {tab === "modules" ? (
        <>
          <h3 className="text-sm font-semibold text-brand-teal-800 uppercase tracking-wider">
            Modules
          </h3>
          <p className="text-xs text-gray-500">
            Select a module type, then click grid cells to place it. Click a placed module to remove it.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {MODULE_TYPES.map((mod) => {
              const isSelected = selectedModuleType === mod.id;
              const count = moduleCounts.find((m) => m.id === mod.id)?.count || 0;
              return (
                <button
                  key={mod.id}
                  onClick={() =>
                    setSelectedModuleType(isSelected ? null : mod.id)
                  }
                  className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-left text-sm transition-all ${
                    isSelected
                      ? "border-brand-amber-500 bg-brand-amber-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div
                    className="h-6 w-6 rounded flex-shrink-0"
                    style={{ backgroundColor: mod.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{mod.label}</div>
                    {count > 0 && (
                      <div className="text-xs text-gray-500">{count} placed</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <h3 className="text-sm font-semibold text-brand-teal-800 uppercase tracking-wider">
            Building Presets
          </h3>
          <p className="text-xs text-gray-500">
            Place a complete building layout on your grid with one click.
          </p>

          {/* Category filter */}
          <div className="flex gap-1">
            {(["house", "studio", "cabin"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setPresetCategory(cat)}
                className={`flex-1 rounded-lg py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                  presetCategory === cat
                    ? "bg-brand-amber-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Preset cards */}
          <div className="space-y-2">
            {filteredPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePlacePreset(preset)}
                className="w-full rounded-lg border-2 border-gray-200 bg-white p-3 text-left hover:border-brand-amber-400 hover:bg-brand-amber-50 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-brand-teal-800">{preset.label}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{preset.description}</div>
                  </div>
                  <div className="text-[10px] text-gray-400 whitespace-nowrap">
                    {preset.cells.length} modules
                  </div>
                </div>
                {/* Mini grid preview */}
                <div className="mt-2 flex gap-0.5 flex-wrap">
                  {preset.cells.map(([r, c, type], i) => {
                    const mt = MODULE_TYPES.find((m) => m.id === type);
                    return (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-sm"
                        style={{ backgroundColor: mt?.color || "#888" }}
                        title={`${mt?.label || type} (${r},${c})`}
                      />
                    );
                  })}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Summary */}
      {placedModules.length > 0 && (
        <div className="mt-2 rounded-lg bg-brand-teal-50 p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-brand-teal-800">
              {placedModules.length} module{placedModules.length !== 1 ? "s" : ""} placed
            </div>
            <button
              onClick={clearAllModules}
              className="text-[10px] text-red-500 hover:underline"
            >
              Clear all
            </button>
          </div>
          <div className="text-xs text-brand-teal-600 mt-1">
            Total area: {placedModules.length * 9}m&sup2; exterior / {placedModules.length * 7}m&sup2; usable
          </div>
        </div>
      )}
    </div>
  );
}
