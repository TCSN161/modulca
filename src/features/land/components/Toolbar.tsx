"use client";

import { useCallback } from "react";
import { useLandStore, type MapLayer } from "../store";
import { generateGrid } from "../utils/grid";

const MAP_LAYERS: { id: MapLayer; label: string }[] = [
  { id: "satellite", label: "Satellite" },
  { id: "hybrid", label: "Hybrid" },
  { id: "streets", label: "Streets" },
];

export default function Toolbar() {
  const {
    phase,
    setPhase,
    polygon,
    setIsDrawing,
    clearPolygon,
    removeLastPoint,
    setGridCells,
    gridCells,
    gridRotation,
    setGridRotation,
    mapLayer,
    setMapLayer,
  } = useLandStore();

  const rebuildGrid = useCallback(
    (rotation: number) => {
      if (polygon.length >= 3) {
        const { cells } = generateGrid(polygon, rotation);
        setGridCells(cells);
      }
    },
    [polygon, setGridCells]
  );

  const startDrawing = () => {
    clearPolygon();
    setIsDrawing(true);
    setPhase("draw");
  };

  const finishDrawing = () => {
    setIsDrawing(false);
    if (polygon.length >= 3) {
      rebuildGrid(0);
      setGridRotation(0);
      setPhase("grid");
    }
  };

  const handleRotation = (angle: number) => {
    setGridRotation(angle);
    rebuildGrid(angle);
  };

  const goToModules = () => {
    setPhase("modules");
  };

  const resetAll = () => {
    clearPolygon();
    setIsDrawing(false);
    setPhase("map");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Map layer toggle */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Map Layer
        </label>
        <div className="mt-1 flex rounded-lg border border-gray-200 overflow-hidden">
          {MAP_LAYERS.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setMapLayer(layer.id)}
              className={`flex-1 px-2 py-1.5 text-xs font-medium transition-colors ${
                mapLayer === layer.id
                  ? "bg-brand-teal-800 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1.5 text-xs font-medium">
        {[
          { key: "draw", label: "1. Draw Area", active: phase === "map" || phase === "draw" },
          { key: "grid", label: "2. Grid", active: phase === "grid" },
          { key: "modules", label: "3. Modules", active: phase === "modules" },
        ].map((step, i) => (
          <span key={step.key} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-gray-300">→</span>}
            <span
              className={
                step.active
                  ? "text-brand-amber-500 font-bold"
                  : "text-gray-400"
              }
            >
              {step.label}
            </span>
          </span>
        ))}
      </div>

      {/* Actions based on phase */}
      {phase === "map" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-500">
            Navigate the map to find your plot. Zoom in for better precision.
          </p>
          <button onClick={startDrawing} className="btn-accent w-full">
            Draw Building Area
          </button>
        </div>
      )}

      {phase === "draw" && (
        <div className="flex flex-col gap-2">
          <div className="rounded-lg bg-brand-amber-50 border border-brand-amber-200 p-3 text-sm text-brand-amber-700">
            <strong>Click on the map</strong> to place corners of your building area.
            {polygon.length > 0 && (
              <span className="block mt-1 font-medium">
                {polygon.length} point{polygon.length !== 1 ? "s" : ""} placed
                {polygon.length < 3 && ` (need ${3 - polygon.length} more)`}
              </span>
            )}
          </div>
          {polygon.length > 0 && (
            <button
              onClick={removeLastPoint}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Undo Last Point
            </button>
          )}
          <button
            onClick={finishDrawing}
            disabled={polygon.length < 3}
            className="btn-accent w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Finish Drawing
          </button>
          <button onClick={resetAll} className="btn-outline w-full text-sm">
            Cancel
          </button>
        </div>
      )}

      {(phase === "grid" || phase === "modules") && (
        <div className="flex flex-col gap-3">
          {/* Grid info */}
          <div className="rounded-lg bg-brand-teal-50 border border-brand-teal-200 p-3 text-sm text-brand-teal-700">
            <span className="font-semibold">{gridCells.length}</span> cells
            (3×3m) fit your area.
            <span className="block mt-0.5 text-xs">
              Buildable: {gridCells.length * 9}m²
            </span>
          </div>

          {/* Rotation control */}
          <div>
            <label className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>Grid Rotation</span>
              <span className="text-brand-teal-700 normal-case font-bold">
                {gridRotation}°
              </span>
            </label>
            <input
              type="range"
              min={-90}
              max={90}
              step={1}
              value={gridRotation}
              onChange={(e) => handleRotation(Number(e.target.value))}
              className="mt-1 w-full accent-brand-amber-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>-90°</span>
              <button
                onClick={() => handleRotation(0)}
                className="text-brand-amber-500 hover:underline font-medium"
              >
                Reset to 0°
              </button>
              <span>90°</span>
            </div>
          </div>

          {phase === "grid" && (
            <button onClick={goToModules} className="btn-accent w-full">
              Place Modules
            </button>
          )}

          <button onClick={startDrawing} className="btn-outline w-full text-sm">
            Redraw Area
          </button>
        </div>
      )}
    </div>
  );
}
