"use client";

import { useLandStore } from "../store";
import { MODULE_TYPES } from "@/shared/types";

export default function ModulePalette() {
  const { selectedModuleType, setSelectedModuleType, gridCells } = useLandStore();

  const placedModules = gridCells.filter((c) => c.moduleType !== null);
  const moduleCounts = MODULE_TYPES.map((mt) => ({
    ...mt,
    count: placedModules.filter((c) => c.moduleType === mt.id).length,
  }));

  return (
    <div className="flex flex-col gap-3">
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

      {/* Summary */}
      {placedModules.length > 0 && (
        <div className="mt-2 rounded-lg bg-brand-teal-50 p-3">
          <div className="text-sm font-semibold text-brand-teal-800">
            {placedModules.length} module{placedModules.length !== 1 ? "s" : ""} placed
          </div>
          <div className="text-xs text-brand-teal-600 mt-1">
            Total area: {placedModules.length * 9}m&sup2; exterior / {placedModules.length * 7}m&sup2; usable
          </div>
        </div>
      )}
    </div>
  );
}
