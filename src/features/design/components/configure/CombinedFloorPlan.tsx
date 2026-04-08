"use client";

import React from "react";
import { MODULE_TYPES } from "@/shared/types";
import type { ModuleConfig, WallType } from "../../store";
import { getPreset, getPresetsForType, FLOOR_MATERIALS } from "../../layouts";

const CELL = 300; // px per 3m module
const WALL = 12;
const SCALE = CELL / 3; // 100px per meter
const OPENING_WIDTH = 60; // px width of shared-wall opening
const WINDOW_WIDTH = 120; // px width of window opening
const PADDING = 40; // px padding around the whole SVG

interface Props {
  modules: ModuleConfig[];
  selectedModule: { row: number; col: number } | null;
  onSelectModule: (m: { row: number; col: number }) => void;
}

/** Render an SVG wall segment based on its type */
function renderWall(
  key: string,
  wallType: WallType,
  x1: number, y1: number, x2: number, y2: number,
  color: string,
  isHorizontal: boolean,
): React.ReactNode[] {
  const elements: React.ReactNode[] = [];

  if (wallType === "none") return elements;

  if (wallType === "solid") {
    elements.push(
      <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={WALL} />
    );
    return elements;
  }

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  if (wallType === "window") {
    // Solid wall with a glass (blue) section in the middle
    if (isHorizontal) {
      elements.push(
        <line key={`${key}-l`} x1={x1} y1={y1} x2={midX - WINDOW_WIDTH / 2} y2={y1} stroke={color} strokeWidth={WALL} />,
        <line key={`${key}-r`} x1={midX + WINDOW_WIDTH / 2} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={WALL} />,
        <line key={`${key}-glass`} x1={midX - WINDOW_WIDTH / 2} y1={y1} x2={midX + WINDOW_WIDTH / 2} y2={y1} stroke="#5bb8f0" strokeWidth={WALL - 2} strokeLinecap="round" />,
        // Window tick marks
        <line key={`${key}-t1`} x1={midX - WINDOW_WIDTH / 2} y1={y1 - WALL / 2 - 2} x2={midX - WINDOW_WIDTH / 2} y2={y1 + WALL / 2 + 2} stroke={color} strokeWidth={2} />,
        <line key={`${key}-t2`} x1={midX + WINDOW_WIDTH / 2} y1={y1 - WALL / 2 - 2} x2={midX + WINDOW_WIDTH / 2} y2={y1 + WALL / 2 + 2} stroke={color} strokeWidth={2} />,
      );
    } else {
      elements.push(
        <line key={`${key}-l`} x1={x1} y1={y1} x2={x1} y2={midY - WINDOW_WIDTH / 2} stroke={color} strokeWidth={WALL} />,
        <line key={`${key}-r`} x1={x1} y1={midY + WINDOW_WIDTH / 2} x2={x2} y2={y2} stroke={color} strokeWidth={WALL} />,
        <line key={`${key}-glass`} x1={x1} y1={midY - WINDOW_WIDTH / 2} x2={x1} y2={midY + WINDOW_WIDTH / 2} stroke="#5bb8f0" strokeWidth={WALL - 2} strokeLinecap="round" />,
        <line key={`${key}-t1`} x1={x1 - WALL / 2 - 2} y1={midY - WINDOW_WIDTH / 2} x2={x1 + WALL / 2 + 2} y2={midY - WINDOW_WIDTH / 2} stroke={color} strokeWidth={2} />,
        <line key={`${key}-t2`} x1={x1 - WALL / 2 - 2} y1={midY + WINDOW_WIDTH / 2} x2={x1 + WALL / 2 + 2} y2={midY + WINDOW_WIDTH / 2} stroke={color} strokeWidth={2} />,
      );
    }
    return elements;
  }

  if (wallType === "door") {
    // Wall with door opening + arc
    if (isHorizontal) {
      elements.push(
        <line key={`${key}-l`} x1={x1} y1={y1} x2={midX - OPENING_WIDTH / 2} y2={y1} stroke={color} strokeWidth={WALL} />,
        <line key={`${key}-r`} x1={midX + OPENING_WIDTH / 2} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={WALL} />,
        <path
          key={`${key}-arc`}
          d={`M ${midX - OPENING_WIDTH / 2} ${y1} A ${OPENING_WIDTH / 2} ${OPENING_WIDTH / 2} 0 0 1 ${midX + OPENING_WIDTH / 2} ${y1}`}
          fill="none" stroke="#9ca3af" strokeWidth={1} strokeDasharray="3 2"
        />,
      );
    } else {
      elements.push(
        <line key={`${key}-l`} x1={x1} y1={y1} x2={x1} y2={midY - OPENING_WIDTH / 2} stroke={color} strokeWidth={WALL} />,
        <line key={`${key}-r`} x1={x1} y1={midY + OPENING_WIDTH / 2} x2={x2} y2={y2} stroke={color} strokeWidth={WALL} />,
        <path
          key={`${key}-arc`}
          d={`M ${x1} ${midY - OPENING_WIDTH / 2} A ${OPENING_WIDTH / 2} ${OPENING_WIDTH / 2} 0 0 0 ${x1} ${midY + OPENING_WIDTH / 2}`}
          fill="none" stroke="#9ca3af" strokeWidth={1} strokeDasharray="3 2"
        />,
      );
    }
    return elements;
  }

  // "shared" — open zone, no wall. Just a light dashed boundary to indicate the connection
  elements.push(
    <line
      key={key}
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="#c8e6c9" strokeWidth={1} strokeDasharray="6 4"
      opacity={0.6}
    />,
    <text
      key={`${key}-label`}
      x={midX} y={isHorizontal ? y1 - 6 : midY}
      textAnchor="middle"
      fontSize={7} fill="#66bb6a" fontWeight="bold"
    >
      OPEN
    </text>,
  );

  return elements;
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
          const preset = getPreset(mod.moduleType, mod.layoutPreset)
            || getPresetsForType(mod.moduleType)[0];
          const furniture = preset?.furniture || [];
          const floorColor =
            FLOOR_MATERIALS.find((f) => f.id === mod.floorFinish)?.color || "#FFFFFF";

          const isSelected =
            selectedModule?.row === mod.row && selectedModule?.col === mod.col;

          // Position of this module's top-left corner in SVG
          const ox = PADDING + WALL + (mod.col - minCol) * CELL;
          const oy = PADDING + WALL + (mod.row - minRow) * CELL;

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

              {/* Walls — render based on wallConfigs (solid/window/door/none/shared) */}
              {/* North wall (top) */}
              {renderWall(
                `${mod.row}-${mod.col}-n`, mod.wallConfigs.north,
                ox, oy, ox + CELL, oy, color, true,
              )}
              {/* South wall (bottom) */}
              {renderWall(
                `${mod.row}-${mod.col}-s`, mod.wallConfigs.south,
                ox, oy + CELL, ox + CELL, oy + CELL, color, true,
              )}
              {/* West wall (left) */}
              {renderWall(
                `${mod.row}-${mod.col}-w`, mod.wallConfigs.west,
                ox, oy, ox, oy + CELL, color, false,
              )}
              {/* East wall (right) */}
              {renderWall(
                `${mod.row}-${mod.col}-e`, mod.wallConfigs.east,
                ox + CELL, oy, ox + CELL, oy + CELL, color, false,
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
          <div className="h-px w-8 bg-blue-400" style={{ height: 3 }} />
          <span>Window</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-px w-8 border-t-2 border-dashed border-gray-400" />
          <span>Door / Shared</span>
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
