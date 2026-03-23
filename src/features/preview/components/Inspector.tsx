"use client";

import { useDesignStore } from "@/features/design/store";
import { MODULE_TYPES } from "@/shared/types";

export default function Inspector() {
  const { selectedModule, modules, getStats } = useDesignStore();
  const stats = getStats();

  const selectedMod = selectedModule
    ? modules.find(
        (m) => m.row === selectedModule.row && m.col === selectedModule.col
      )
    : null;

  const mt = selectedMod
    ? MODULE_TYPES.find((m) => m.id === selectedMod.moduleType)
    : null;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Inspector Header */}
      <div className="border-b border-gray-200 p-5">
        {selectedMod && mt ? (
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
              style={{ backgroundColor: mt.color + "30" }}
            >
              {mt.icon}
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase">
                Inspector
              </div>
              <div className="text-sm font-bold text-brand-teal-800">
                {selectedMod.label}
              </div>
              <div className="text-[10px] text-gray-400">
                {selectedMod.moduleType.charAt(0).toUpperCase() +
                  selectedMod.moduleType.slice(1)}{" "}
                Module
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase">
              Inspector
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Click a module in the 3D view to inspect it.
            </div>
          </div>
        )}
      </div>

      {/* Selected Module Details */}
      {selectedMod && (
        <>
          {/* Geometry Tab */}
          <div className="border-b border-gray-200 p-5">
            <div className="mb-3 flex gap-2">
              {["Geometry", "Material", "Metadata"].map((tab, i) => (
                <button
                  key={tab}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    i === 0
                      ? "bg-brand-teal-800 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <h4 className="mb-2 text-[10px] font-bold text-brand-amber-600 uppercase tracking-wider">
              Spatial Parameters
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-400">Width (X)</label>
                <div className="mt-0.5 flex items-center rounded border border-gray-200 bg-white px-2 py-1.5">
                  <span className="text-sm font-medium text-brand-teal-800">
                    3.00
                  </span>
                  <span className="ml-auto text-xs text-gray-400">m</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Height (Z)</label>
                <div className="mt-0.5 flex items-center rounded border border-gray-200 bg-white px-2 py-1.5">
                  <span className="text-sm font-medium text-brand-teal-800">
                    3.00
                  </span>
                  <span className="ml-auto text-xs text-gray-400">m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Module Type */}
          <div className="border-b border-gray-200 p-5">
            <h4 className="mb-2 text-[10px] font-bold text-brand-amber-600 uppercase tracking-wider">
              Module Type
            </h4>
            {mt && (
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                  style={{ backgroundColor: mt.color + "20" }}
                >
                  {mt.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-teal-800">
                    {mt.label}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Mod-Type-{mt.id.charAt(0).toUpperCase()}1
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Constraints */}
          <div className="border-b border-gray-200 p-5">
            <h4 className="mb-2 text-[10px] font-bold text-brand-amber-600 uppercase tracking-wider">
              Constraints
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Snap to Grid</span>
                <div className="h-5 w-9 rounded-full bg-brand-teal-600 p-0.5">
                  <div className="h-4 w-4 translate-x-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Locked Axis</span>
                <div className="h-5 w-9 rounded-full bg-gray-200 p-0.5">
                  <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Stats */}
      <div className="mt-auto border-t border-gray-200 p-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Coordinates: X: {selectedMod ? (selectedMod.col * 3).toFixed(2) : "0.00"} Y: 0.00
            Z: {selectedMod ? (selectedMod.row * 3).toFixed(2) : "0.00"}
          </span>
          <span className="font-semibold text-brand-teal-800">
            Total Area: {stats.totalArea}.00 m²
          </span>
        </div>
      </div>
    </div>
  );
}
