"use client";

import { MODULE_TYPES } from "@/shared/types";
import type { ModuleConfig } from "../../store";
import { getPreset, FLOOR_MATERIALS, WALL_MATERIALS } from "../../layouts";

const CELL = 300; // px per 3m module
const WALL = 12;
const SCALE = CELL / 3; // 100px per meter
const OPENING_WIDTH = 60; // px width of shared-wall opening
const PADDING = 40; // px padding around the whole SVG

interface Props {
  modules: ModuleConfig[];
  selectedModule: { row: number; col: number } | null;
  onSelectModule: (m: { row: number; col: number }) => void;
}

/** Check if a neighbour exists at (row, col) */
function hasNeighbour(modules: ModuleConfig[], row: number, col: number): boolean {
  return modules.some((m) => m.row === row && m.col === col);
}

export default function CombinedFloorPlan({ modules, selectedModule, onSelectModule }: Props) {
  if (modules.length === 0) return null;

  // Compute bounding box of the grid
  const minRow = Math.min(...modules.map((m) => m.row));
  const maxRow = Math.max(...modules.map((m) => m.row));
  const minCol = Math.min(...modules.map((m) => m.col));
  const maxCol = Math.max(...modules.map((m) => m.col));

  const cols = maxCol - minCol + 1;
  const rows = maxRow - minRow + 1;

  const svgW = cols * CELL + WALL * 2 + PADDING * 2;
  const svgH = rows * CELL + WALL * 2 + PADDING * 2;

  return (
    <div className="flex flex-col items-center">
      <svg width={svgW} height={svgH} className="rounded-lg">
        {/* Background */}
        <rect width={svgW} height={svgH} fill="#F9FAFB" rx={8} />

        {modules.map((mod) => {
          const mt = MODULE_TYPES.find((t) => t.id === mod.moduleType);
          const color = mt?.color || "#888";
          const preset = getPreset(mod.moduleType, mod.layoutPreset);
          const furniture = preset?.furniture || [];
          const floorColor =
            FLOOR_MATERIALS.find((f) => f.id === mod.floorFinish)?.color || "#FFFFFF";
          const wallMat =
            WALL_MATERIALS.find((w) => w.id === mod.wallColor)?.color || "#E5E7EB";

          const isSelected =
            selectedModule?.row === mod.row && selectedModule?.col === mod.col;

          // Position of this module's top-left corner in SVG
          const ox = PADDING + WALL + (mod.col - minCol) * CELL;
          const oy = PADDING + WALL + (mod.row - minRow) * CELL;

          // Adjacency
          const hasTop = hasNeighbour(modules, mod.row - 1, mod.col);
          const hasBottom = hasNeighbour(modules, mod.row + 1, mod.col);
          const hasLeft = hasNeighbour(modules, mod.row, mod.col - 1);
          const hasRight = hasNeighbour(modules, mod.row, mod.col + 1);

          return (
            <g
              key={`${mod.row}-${mod.col}`}
              onClick={() => onSelectModule({ row: mod.row, col: mod.col })}
              className="cursor-pointer"
            >
              {/* Floor fill */}
              <rect x={ox} y={oy} width={CELL} height={CELL} fill={floorColor} />

              {/* Selection highlight */}
              {isSelected && (
                <rect
                  x={ox - 3}
                  y={oy - 3}
                  width={CELL + 6}
                  height={CELL + 6}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth={4}
                  rx={4}
                />
              )}

              {/* Walls — draw each side, skip or add opening for shared walls */}
              {/* Top wall */}
              {!hasTop ? (
                <line
                  x1={ox}
                  y1={oy}
                  x2={ox + CELL}
                  y2={oy}
                  stroke={color}
                  strokeWidth={WALL}
                />
              ) : (
                <>
                  <line
                    x1={ox}
                    y1={oy}
                    x2={ox + CELL / 2 - OPENING_WIDTH / 2}
                    y2={oy}
                    stroke={wallMat}
                    strokeWidth={WALL / 2}
                    strokeDasharray="4 3"
                  />
                  <line
                    x1={ox + CELL / 2 + OPENING_WIDTH / 2}
                    y1={oy}
                    x2={ox + CELL}
                    y2={oy}
                    stroke={wallMat}
                    strokeWidth={WALL / 2}
                    strokeDasharray="4 3"
                  />
                  {/* Door arc */}
                  <path
                    d={`M ${ox + CELL / 2 - OPENING_WIDTH / 2} ${oy}
                        A ${OPENING_WIDTH / 2} ${OPENING_WIDTH / 2} 0 0 1 ${ox + CELL / 2 + OPENING_WIDTH / 2} ${oy}`}
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth={1}
                    strokeDasharray="3 2"
                  />
                </>
              )}

              {/* Bottom wall */}
              {!hasBottom ? (
                <line
                  x1={ox}
                  y1={oy + CELL}
                  x2={ox + CELL}
                  y2={oy + CELL}
                  stroke={color}
                  strokeWidth={WALL}
                />
              ) : (
                <>
                  <line
                    x1={ox}
                    y1={oy + CELL}
                    x2={ox + CELL / 2 - OPENING_WIDTH / 2}
                    y2={oy + CELL}
                    stroke={wallMat}
                    strokeWidth={WALL / 2}
                    strokeDasharray="4 3"
                  />
                  <line
                    x1={ox + CELL / 2 + OPENING_WIDTH / 2}
                    y1={oy + CELL}
                    x2={ox + CELL}
                    y2={oy + CELL}
                    stroke={wallMat}
                    strokeWidth={WALL / 2}
                    strokeDasharray="4 3"
                  />
                  <path
                    d={`M ${ox + CELL / 2 - OPENING_WIDTH / 2} ${oy + CELL}
                        A ${OPENING_WIDTH / 2} ${OPENING_WIDTH / 2} 0 0 0 ${ox + CELL / 2 + OPENING_WIDTH / 2} ${oy + CELL}`}
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth={1}
                    strokeDasharray="3 2"
                  />
                </>
              )}

              {/* Left wall */}
              {!hasLeft ? (
                <line
                  x1={ox}
                  y1={oy}
                  x2={ox}
                  y2={oy + CELL}
                  stroke={color}
                  strokeWidth={WALL}
                />
              ) : (
                <>
                  <line
                    x1={ox}
                    y1={oy}
                    x2={ox}
                    y2={oy + CELL / 2 - OPENING_WIDTH / 2}
                    stroke={wallMat}
                    strokeWidth={WALL / 2}
                    strokeDasharray="4 3"
                  />
                  <line
                    x1={ox}
                    y1={oy + CELL / 2 + OPENING_WIDTH / 2}
                    x2={ox}
                    y2={oy + CELL}
                    stroke={wallMat}
                    strokeWidth={WALL / 2}
                    strokeDasharray="4 3"
                  />
                  <path
                    d={`M ${ox} ${oy + CELL / 2 - OPENING_WIDTH / 2}
                        A ${OPENING_WIDTH / 2} ${OPENING_WIDTH / 2} 0 0 0 ${ox} ${oy + CELL / 2 + OPENING_WIDTH / 2}`}
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth={1}
                    strokeDasharray="3 2"
                  />
                </>
              )}

              {/* Right wall */}
              {!hasRight ? (
                <line
                  x1={ox + CELL}
                  y1={oy}
                  x2={ox + CELL}
                  y2={oy + CELL}
                  stroke={color}
                  strokeWidth={WALL}
                />
              ) : (
                <>
                  <line
                    x1={ox + CELL}
                    y1={oy}
                    x2={ox + CELL}
                    y2={oy + CELL / 2 - OPENING_WIDTH / 2}
                    stroke={wallMat}
                    strokeWidth={WALL / 2}
                    strokeDasharray="4 3"
                  />
                  <line
                    x1={ox + CELL}
                    y1={oy + CELL / 2 + OPENING_WIDTH / 2}
                    x2={ox + CELL}
                    y2={oy + CELL}
                    stroke={wallMat}
                    strokeWidth={WALL / 2}
                    strokeDasharray="4 3"
                  />
                  <path
                    d={`M ${ox + CELL} ${oy + CELL / 2 - OPENING_WIDTH / 2}
                        A ${OPENING_WIDTH / 2} ${OPENING_WIDTH / 2} 0 0 1 ${ox + CELL} ${oy + CELL / 2 + OPENING_WIDTH / 2}`}
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth={1}
                    strokeDasharray="3 2"
                  />
                </>
              )}

              {/* Furniture */}
              {furniture.map((item) => {
                const px = ox + item.x * SCALE;
                const py = oy + item.z * SCALE;
                const pw = item.width * SCALE;
                const ph = item.depth * SCALE;
                return (
                  <g key={`${mod.row}-${mod.col}-${item.id}`}>
                    <rect
                      x={px}
                      y={py}
                      width={pw}
                      height={ph}
                      fill={item.color}
                      fillOpacity={0.3}
                      stroke={item.color}
                      strokeWidth={1}
                      rx={3}
                    />
                    <text
                      x={px + pw / 2}
                      y={py + ph / 2 + 3}
                      textAnchor="middle"
                      className="text-[6px] font-bold uppercase"
                      fill="#555"
                    >
                      {item.label}
                    </text>
                  </g>
                );
              })}

              {/* Module label (centered) */}
              <rect
                x={ox + CELL / 2 - 40}
                y={oy + CELL - 28}
                width={80}
                height={18}
                rx={4}
                fill={color}
                fillOpacity={0.85}
              />
              <text
                x={ox + CELL / 2}
                y={oy + CELL - 16}
                textAnchor="middle"
                className="text-[9px] font-bold"
                fill="white"
              >
                {mod.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        {MODULE_TYPES.filter((mt) => modules.some((m) => m.moduleType === mt.id)).map(
          (mt) => (
            <div key={mt.id} className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded"
                style={{ backgroundColor: mt.color }}
              />
              <span>{mt.label}</span>
            </div>
          )
        )}
        <div className="ml-4 flex items-center gap-1.5">
          <div className="h-px w-8 border-t-2 border-dashed border-gray-400" />
          <span>Shared wall / opening</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border-2 border-amber-400" />
          <span>Selected</span>
        </div>
      </div>

      {/* Scale */}
      <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400">
        <div className="flex items-center gap-1">
          <div className="h-px w-16 bg-gray-300" />
          <div className="h-2 w-px bg-gray-300" />
        </div>
        SCALE 1:50 &middot; Each module 3m &times; 3m
      </div>
    </div>
  );
}
