"use client";

import { MODULE_TYPES } from "@/shared/types";
import type { ModuleConfig, WallType, WallSide } from "../../store";
import { useDesignStore } from "../../store";
import { getPreset, FLOOR_MATERIALS } from "../../layouts";

const SIZE = 300; // px for 3000mm
const WALL = 12;
const SCALE = SIZE / 3; // 100px per meter

const WALL_TYPE_LABELS: Record<WallType, string> = {
  solid: "Solid",
  window: "Window",
  door: "Door",
  none: "Open",
  shared: "Shared",
};

const WALL_TYPE_CYCLE: WallType[] = ["solid", "window", "door", "none"];
const SHARED_WALL_CYCLE: WallType[] = ["shared", "door", "none"];

function nextWallType(current: WallType, isInterior: boolean): WallType {
  if (isInterior) {
    const idx = SHARED_WALL_CYCLE.indexOf(current);
    return SHARED_WALL_CYCLE[((idx >= 0 ? idx : 0) + 1) % SHARED_WALL_CYCLE.length];
  }
  const idx = WALL_TYPE_CYCLE.indexOf(current);
  return WALL_TYPE_CYCLE[(idx + 1) % WALL_TYPE_CYCLE.length];
}

/** Render a wall segment in the SVG based on type */
function WallSegment({
  x1, y1, x2, y2, wallType, moduleColor,
}: {
  x1: number; y1: number; x2: number; y2: number;
  wallType: WallType; moduleColor: string;
}) {
  const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const isHorizontal = Math.abs(y1 - y2) < 1;

  switch (wallType) {
    case "solid":
      return (
        <line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={moduleColor} strokeWidth={WALL} strokeLinecap="round" />
      );

    case "window": {
      const gapW = len * 0.35;
      const halfGap = gapW / 2;
      if (isHorizontal) {
        return (
          <g>
            <line x1={x1} y1={y1} x2={midX - halfGap} y2={y1}
              stroke={moduleColor} strokeWidth={WALL} strokeLinecap="round" />
            <line x1={midX + halfGap} y1={y1} x2={x2} y2={y2}
              stroke={moduleColor} strokeWidth={WALL} strokeLinecap="round" />
            {/* Window glass */}
            <rect x={midX - halfGap} y={midY - WALL / 2} width={gapW} height={WALL}
              fill="#b8d4e3" stroke="#6ba3c7" strokeWidth={1} rx={1} />
          </g>
        );
      }
      return (
        <g>
          <line x1={x1} y1={y1} x2={x1} y2={midY - halfGap}
            stroke={moduleColor} strokeWidth={WALL} strokeLinecap="round" />
          <line x1={x1} y1={midY + halfGap} x2={x2} y2={y2}
            stroke={moduleColor} strokeWidth={WALL} strokeLinecap="round" />
          <rect x={midX - WALL / 2} y={midY - halfGap} width={WALL} height={gapW}
            fill="#b8d4e3" stroke="#6ba3c7" strokeWidth={1} rx={1} />
        </g>
      );
    }

    case "door": {
      const gapW = len * 0.3;
      const halfGap = gapW / 2;
      if (isHorizontal) {
        return (
          <g>
            <line x1={x1} y1={y1} x2={midX - halfGap} y2={y1}
              stroke={moduleColor} strokeWidth={WALL} strokeLinecap="round" />
            <line x1={midX + halfGap} y1={y1} x2={x2} y2={y2}
              stroke={moduleColor} strokeWidth={WALL} strokeLinecap="round" />
            {/* Door swing arc */}
            <path
              d={`M ${midX - halfGap} ${y1} A ${gapW} ${gapW} 0 0 1 ${midX + halfGap} ${y1}`}
              fill="none" stroke="#9ca3af" strokeWidth={1} strokeDasharray="3 2" />
          </g>
        );
      }
      return (
        <g>
          <line x1={x1} y1={y1} x2={x1} y2={midY - halfGap}
            stroke={moduleColor} strokeWidth={WALL} strokeLinecap="round" />
          <line x1={x1} y1={midY + halfGap} x2={x2} y2={y2}
            stroke={moduleColor} strokeWidth={WALL} strokeLinecap="round" />
          <path
            d={`M ${x1} ${midY - halfGap} A ${gapW} ${gapW} 0 0 1 ${x1} ${midY + halfGap}`}
            fill="none" stroke="#9ca3af" strokeWidth={1} strokeDasharray="3 2" />
        </g>
      );
    }

    case "none":
      return (
        <line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#d1d5db" strokeWidth={1} strokeDasharray="6 4" />
      );

    case "shared":
      return (
        <line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#f59e0b" strokeWidth={2} strokeDasharray="8 4" />
      );
  }
}

interface Props {
  module: ModuleConfig;
}

export default function ModuleFloorPlan({ module }: Props) {
  const mt = MODULE_TYPES.find((m) => m.id === module.moduleType);
  const color = mt?.color || "#888";
  const updateWallConfig = useDesignStore((s) => s.updateWallConfig);
  const modules = useDesignStore((s) => s.modules);

  const preset = getPreset(module.moduleType, module.layoutPreset);
  const furniture = preset?.furniture || [];

  const floorColor = FLOOR_MATERIALS.find((f) => f.id === module.floorFinish)?.color || "#FFFFFF";
  const wc = module.wallConfigs ?? { north: "solid" as WallType, south: "solid" as WallType, east: "solid" as WallType, west: "solid" as WallType };

  // Detect interior walls (between adjacent modules)
  const occupied = new Set(modules.map((m) => `${m.row},${m.col}`));
  const isInterior: Record<WallSide, boolean> = {
    north: occupied.has(`${module.row - 1},${module.col}`),
    south: occupied.has(`${module.row + 1},${module.col}`),
    west: occupied.has(`${module.row},${module.col - 1}`),
    east: occupied.has(`${module.row},${module.col + 1}`),
  };

  const handleWallClick = (side: WallSide) => {
    const next = nextWallType(wc[side], isInterior[side]);
    if (updateWallConfig) {
      updateWallConfig(module.row, module.col, side, next);
    }
  };

  // Wall coordinates (outer edges)
  const o = WALL; // offset
  const walls: { side: WallSide; x1: number; y1: number; x2: number; y2: number }[] = [
    { side: "north", x1: o, y1: o, x2: o + SIZE, y2: o },
    { side: "south", x1: o, y1: o + SIZE, x2: o + SIZE, y2: o + SIZE },
    { side: "west", x1: o, y1: o, x2: o, y2: o + SIZE },
    { side: "east", x1: o + SIZE, y1: o, x2: o + SIZE, y2: o + SIZE },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Dimension label top */}
      <div className="mb-2 text-xs font-medium text-brand-teal-500 tracking-wider">
        3000MM
      </div>

      <div className="relative">
        {/* Dimension label right */}
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 rotate-90 text-xs font-medium text-brand-teal-500 tracking-wider whitespace-nowrap">
          3000MM
        </div>

        {/* Wall type buttons around the floor plan */}
        {/* North */}
        <button
          onClick={() => handleWallClick("north")}
          className={`absolute -top-7 left-1/2 -translate-x-1/2 rounded px-2 py-0.5 text-[9px] font-bold uppercase transition-colors ${
            wc.north === "shared" ? "bg-amber-100 text-amber-600 hover:bg-amber-200 cursor-pointer" : "bg-gray-100 text-gray-600 hover:bg-brand-teal-100 hover:text-brand-teal-800 cursor-pointer"
          }`}
        >
          N: {WALL_TYPE_LABELS[wc.north]}
        </button>
        {/* South */}
        <button
          onClick={() => handleWallClick("south")}
          className={`absolute -bottom-7 left-1/2 -translate-x-1/2 rounded px-2 py-0.5 text-[9px] font-bold uppercase transition-colors ${
            wc.south === "shared" ? "bg-amber-100 text-amber-600 hover:bg-amber-200 cursor-pointer" : "bg-gray-100 text-gray-600 hover:bg-brand-teal-100 hover:text-brand-teal-800 cursor-pointer"
          }`}
        >
          S: {WALL_TYPE_LABELS[wc.south]}
        </button>
        {/* West */}
        <button
          onClick={() => handleWallClick("west")}
          className={`absolute -left-16 top-1/2 -translate-y-1/2 rounded px-2 py-0.5 text-[9px] font-bold uppercase transition-colors ${
            wc.west === "shared" ? "bg-amber-100 text-amber-600 hover:bg-amber-200 cursor-pointer" : "bg-gray-100 text-gray-600 hover:bg-brand-teal-100 hover:text-brand-teal-800 cursor-pointer"
          }`}
        >
          W: {WALL_TYPE_LABELS[wc.west]}
        </button>
        {/* East */}
        <button
          onClick={() => handleWallClick("east")}
          className={`absolute -right-16 top-1/2 -translate-y-1/2 rounded px-2 py-0.5 text-[9px] font-bold uppercase transition-colors ${
            wc.east === "shared" ? "bg-amber-100 text-amber-600 hover:bg-amber-200 cursor-pointer" : "bg-gray-100 text-gray-600 hover:bg-brand-teal-100 hover:text-brand-teal-800 cursor-pointer"
          }`}
        >
          E: {WALL_TYPE_LABELS[wc.east]}
        </button>

        <svg
          width={SIZE + WALL * 2}
          height={SIZE + WALL * 2}
          className="rounded-lg"
        >
          {/* Inner floor area */}
          <rect
            x={WALL}
            y={WALL}
            width={SIZE}
            height={SIZE}
            fill={floorColor}
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />

          {/* Walls rendered by type */}
          {walls.map((w) => (
            <WallSegment
              key={w.side}
              x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2}
              wallType={wc[w.side]}
              moduleColor={color}
            />
          ))}

          {/* Furniture items from layout preset */}
          {furniture.map((item) => {
            const px = WALL + item.x * SCALE;
            const py = WALL + item.z * SCALE;
            const pw = item.width * SCALE;
            const ph = item.depth * SCALE;
            return (
              <g key={item.id}>
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
                  className="text-[7px] font-bold uppercase"
                  fill="#555"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Module label */}
      <div
        className="mt-3 inline-flex rounded-md px-3 py-1 text-xs font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {module.label}
      </div>

      {/* Wall legend */}
      <div className="mt-3 flex items-center gap-3 text-[9px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded-sm" style={{ backgroundColor: color }} /> Solid
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded-sm bg-blue-300" /> Window
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded-sm bg-gray-300 border border-dashed border-gray-400" /> Door
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-px w-4 border-t border-dashed border-gray-400" /> Open
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-px w-4 border-t-2 border-dashed border-amber-400" /> Shared
        </span>
      </div>

      {/* Scale */}
      <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400">
        <div className="flex items-center gap-1">
          <div className="h-px w-16 bg-gray-300" />
          <div className="h-2 w-px bg-gray-300" />
        </div>
        SCALE 1:50
      </div>
    </div>
  );
}
