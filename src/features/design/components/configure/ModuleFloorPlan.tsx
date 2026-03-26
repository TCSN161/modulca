"use client";

import { MODULE_TYPES } from "@/shared/types";
import type { ModuleConfig, WallType, WallSide, WallConfigs } from "../../store";
import { useDesignStore } from "../../store";
import { getPreset, FLOOR_MATERIALS } from "../../layouts";

const SIZE = 300; // px for 3000mm
const WALL = 12;
const SCALE = SIZE / 3; // 100px per meter
const POLE_SIZE = 8; // corner pole/column size for "none" walls

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

/** Small inline SVG icon for a wall type (used in buttons) */
function WallTypeIcon({ type, color }: { type: WallType; color: string }) {
  const w = 32;
  const h = 14;
  const y = h / 2;

  switch (type) {
    case "solid":
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <line x1={1} y1={y} x2={w - 1} y2={y}
            stroke={color} strokeWidth={5} strokeLinecap="round" />
        </svg>
      );
    case "window":
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <line x1={1} y1={y} x2={9} y2={y}
            stroke={color} strokeWidth={5} strokeLinecap="round" />
          <line x1={w - 9} y1={y} x2={w - 1} y2={y}
            stroke={color} strokeWidth={5} strokeLinecap="round" />
          <rect x={10} y={y - 4} width={w - 20} height={8}
            fill="#b8d4e3" stroke="#6ba3c7" strokeWidth={1} rx={1} />
        </svg>
      );
    case "door":
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <line x1={1} y1={y} x2={9} y2={y}
            stroke={color} strokeWidth={5} strokeLinecap="round" />
          <line x1={w - 9} y1={y} x2={w - 1} y2={y}
            stroke={color} strokeWidth={5} strokeLinecap="round" />
          <path
            d={`M 10 ${y} A 11 11 0 0 1 ${w - 10} ${y}`}
            fill="none" stroke="#9ca3af" strokeWidth={1} strokeDasharray="2 1" />
        </svg>
      );
    case "none":
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <rect x={1} y={y - 3} width={5} height={6} fill="#6b7280" rx={1} />
          <rect x={w - 6} y={y - 3} width={5} height={6} fill="#6b7280" rx={1} />
          <line x1={7} y1={y} x2={w - 7} y2={y}
            stroke="#d1d5db" strokeWidth={1} strokeDasharray="3 2" />
        </svg>
      );
    case "shared":
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <line x1={1} y1={y} x2={w - 1} y2={y}
            stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 2" />
        </svg>
      );
  }
}

/** Label text for each wall type */
function wallTypeLabel(type: WallType): string {
  switch (type) {
    case "solid": return "Full Wall";
    case "window": return "Window";
    case "door": return "Door";
    case "none": return "No Wall";
    case "shared": return "Shared";
  }
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
      const gapW = len * 0.4;
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
              fill="#b8d4e3" stroke="#6ba3c7" strokeWidth={1.5} rx={2} />
            {/* Glass center line */}
            <line x1={midX - halfGap + 2} y1={midY} x2={midX + halfGap - 2} y2={midY}
              stroke="#6ba3c7" strokeWidth={0.5} />
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
            fill="#b8d4e3" stroke="#6ba3c7" strokeWidth={1.5} rx={2} />
          <line x1={midX} y1={midY - halfGap + 2} x2={midX} y2={midY + halfGap - 2}
            stroke="#6ba3c7" strokeWidth={0.5} />
        </g>
      );
    }

    case "door": {
      const gapW = len * 0.3;
      const halfGap = gapW / 2;
      if (isHorizontal) {
        const arcY = y1 - gapW; // swing upward
        return (
          <g>
            <line x1={x1} y1={y1} x2={midX - halfGap} y2={y1}
              stroke={moduleColor} strokeWidth={WALL} strokeLinecap="round" />
            <line x1={midX + halfGap} y1={y1} x2={x2} y2={y2}
              stroke={moduleColor} strokeWidth={WALL} strokeLinecap="round" />
            {/* Door panel line */}
            <line x1={midX - halfGap} y1={y1} x2={midX - halfGap} y2={arcY}
              stroke="#6b7280" strokeWidth={1.5} />
            {/* Door swing arc */}
            <path
              d={`M ${midX - halfGap} ${arcY} A ${gapW} ${gapW} 0 0 1 ${midX + halfGap} ${y1}`}
              fill="none" stroke="#9ca3af" strokeWidth={1} strokeDasharray="3 2" />
          </g>
        );
      }
      {
        const arcX = x1 + gapW; // swing rightward
        return (
          <g>
            <line x1={x1} y1={y1} x2={x1} y2={midY - halfGap}
              stroke={moduleColor} strokeWidth={WALL} strokeLinecap="round" />
            <line x1={x1} y1={midY + halfGap} x2={x2} y2={y2}
              stroke={moduleColor} strokeWidth={WALL} strokeLinecap="round" />
            {/* Door panel line */}
            <line x1={x1} y1={midY - halfGap} x2={arcX} y2={midY - halfGap}
              stroke="#6b7280" strokeWidth={1.5} />
            {/* Door swing arc */}
            <path
              d={`M ${arcX} ${midY - halfGap} A ${gapW} ${gapW} 0 0 1 ${x1} ${midY + halfGap}`}
              fill="none" stroke="#9ca3af" strokeWidth={1} strokeDasharray="3 2" />
          </g>
        );
      }
    }

    case "none":
      return (
        <g>
          {/* Corner poles/columns */}
          <rect x={x1 - POLE_SIZE / 2} y={y1 - POLE_SIZE / 2}
            width={POLE_SIZE} height={POLE_SIZE}
            fill="#6b7280" rx={2} />
          <rect x={x2 - POLE_SIZE / 2} y={y2 - POLE_SIZE / 2}
            width={POLE_SIZE} height={POLE_SIZE}
            fill="#6b7280" rx={2} />
          {/* Dashed boundary line */}
          <line x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#d1d5db" strokeWidth={1} strokeDasharray="6 4" />
        </g>
      );

    case "shared":
      return (
        <line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#f59e0b" strokeWidth={3} strokeDasharray="8 4"
          strokeLinecap="round" />
      );
  }
}

/** Cycle direction label (shows what clicking will do) */
function cycleHint(current: WallType, isInterior: boolean): string {
  const next = nextWallType(current, isInterior);
  return `Click: ${wallTypeLabel(next)}`;
}

interface Props {
  module: ModuleConfig;
}

export default function ModuleFloorPlan({ module }: Props) {
  const mt = MODULE_TYPES.find((m) => m.id === module.moduleType);
  const color = mt?.color || "#888";
  const updateWallConfig = useDesignStore((s) => s.updateWallConfig);
  const modules = useDesignStore((s) => s.modules);

  // Read the live module from the store so wall config changes via dropdowns
  // trigger a re-render of this component (the prop alone may be stale).
  const liveModule = modules.find(
    (m) => m.row === module.row && m.col === module.col
  ) ?? module;

  const preset = getPreset(liveModule.moduleType, liveModule.layoutPreset);
  const furniture = preset?.furniture || [];

  const floorColor = FLOOR_MATERIALS.find((f) => f.id === liveModule.floorFinish)?.color || "#FFFFFF";
  const wc: WallConfigs = liveModule.wallConfigs ?? { north: "solid", south: "solid", east: "solid", west: "solid" };

  // Detect interior walls (between adjacent modules)
  const occupied = new Set(modules.map((m) => `${m.row},${m.col}`));
  const isInterior: Record<WallSide, boolean> = {
    north: occupied.has(`${module.row - 1},${module.col}`),
    south: occupied.has(`${module.row + 1},${module.col}`),
    west: occupied.has(`${module.row},${module.col - 1}`),
    east: occupied.has(`${module.row},${module.col + 1}`),
  };

  const setWallType = (side: WallSide, type: WallType) => {
    if (updateWallConfig) {
      updateWallConfig(module.row, module.col, side, type);
    }
  };

  const handleWallClick = (side: WallSide) => {
    const next = nextWallType(wc[side], isInterior[side]);
    setWallType(side, next);
  };

  // Wall coordinates (outer edges)
  const o = WALL; // offset
  const walls: { side: WallSide; x1: number; y1: number; x2: number; y2: number }[] = [
    { side: "north", x1: o, y1: o, x2: o + SIZE, y2: o },
    { side: "south", x1: o, y1: o + SIZE, x2: o + SIZE, y2: o + SIZE },
    { side: "west", x1: o, y1: o, x2: o, y2: o + SIZE },
    { side: "east", x1: o + SIZE, y1: o, x2: o + SIZE, y2: o + SIZE },
  ];

  /** Wall type picker for a given side */
  function WallPicker({ side, position }: { side: WallSide; position: "top" | "bottom" | "left" | "right" }) {
    const current = wc[side];
    const interior = isInterior[side];
    const cycle = interior ? SHARED_WALL_CYCLE : WALL_TYPE_CYCLE;
    const sideLabel = side.charAt(0).toUpperCase();

    const positionClasses: Record<string, string> = {
      top: "absolute -top-12 left-1/2 -translate-x-1/2",
      bottom: "absolute -bottom-12 left-1/2 -translate-x-1/2",
      left: "absolute top-1/2 -translate-y-1/2 -left-[76px]",
      right: "absolute top-1/2 -translate-y-1/2 -right-[76px]",
    };

    return (
      <div className={`${positionClasses[position]} flex items-center gap-0.5`}>
        <span className="text-[9px] font-bold text-gray-400 mr-0.5 w-3">{sideLabel}</span>
        {cycle.map((type) => {
          const isActive = current === type;
          return (
            <button
              key={type}
              onClick={() => interior && type === "shared" ? handleWallClick(side) : setWallType(side, type)}
              title={`${wallTypeLabel(type)}${isActive ? " (active)" : ""}`}
              className={`flex items-center rounded px-1 py-0.5 transition-all border ${
                isActive
                  ? type === "shared"
                    ? "border-amber-400 bg-amber-50 shadow-sm"
                    : "border-brand-teal-400 bg-brand-teal-50 shadow-sm"
                  : "border-transparent bg-gray-50 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              <WallTypeIcon type={type} color={isActive ? color : "#9ca3af"} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Dimension label top */}
      <div className="mb-1 text-xs font-medium text-brand-teal-500 tracking-wider">
        3000MM
      </div>

      <div className="relative" style={{ margin: "16px 80px" }}>
        {/* Dimension label right */}
        <div className="absolute -right-16 top-1/2 -translate-y-1/2 rotate-90 text-xs font-medium text-brand-teal-500 tracking-wider whitespace-nowrap">
          3000MM
        </div>

        {/* Wall type pickers around the floor plan */}
        <WallPicker side="north" position="top" />
        <WallPicker side="south" position="bottom" />
        <WallPicker side="west" position="left" />
        <WallPicker side="east" position="right" />

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
            <g
              key={w.side}
              className="cursor-pointer"
              onClick={() => handleWallClick(w.side)}
            >
              <WallSegment
                x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2}
                wallType={wc[w.side]}
                moduleColor={color}
              />
              {/* Invisible wider hit area for clicking walls */}
              <line
                x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2}
                stroke="transparent" strokeWidth={20}
              />
            </g>
          ))}

          {/* Hover tooltips on walls */}
          {walls.map((w) => {
            const mx = (w.x1 + w.x2) / 2;
            const my = (w.y1 + w.y2) / 2;
            const isH = Math.abs(w.y1 - w.y2) < 1;
            const textY = isH ? (w.y1 < SIZE / 2 ? my + 20 : my - 12) : my;
            const textX = isH ? mx : (w.x1 < SIZE / 2 ? mx + 20 : mx - 20);
            return (
              <text
                key={`label-${w.side}`}
                x={textX}
                y={textY}
                textAnchor="middle"
                className="text-[8px] fill-gray-400 pointer-events-none select-none"
              >
                {cycleHint(wc[w.side], isInterior[w.side])}
              </text>
            );
          })}

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
      <div className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          Wall Types
        </div>
        <div className="grid grid-cols-5 gap-3 text-[10px] text-gray-600">
          <div className="flex flex-col items-center gap-1.5">
            <WallTypeIcon type="solid" color={color} />
            <span className="font-semibold">Full Wall</span>
            <span className="text-[8px] text-gray-400 text-center leading-tight">Complete wall, solid</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <WallTypeIcon type="window" color={color} />
            <span className="font-semibold">Window</span>
            <span className="text-[8px] text-gray-400 text-center leading-tight">Wall with glass opening</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <WallTypeIcon type="door" color={color} />
            <span className="font-semibold">Door</span>
            <span className="text-[8px] text-gray-400 text-center leading-tight">Wall with door swing</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <WallTypeIcon type="none" color="#6b7280" />
            <span className="font-semibold">No Wall</span>
            <span className="text-[8px] text-gray-400 text-center leading-tight">Corner poles only</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <WallTypeIcon type="shared" color="#f59e0b" />
            <span className="font-semibold">Shared</span>
            <span className="text-[8px] text-gray-400 text-center leading-tight">Adjacent module wall</span>
          </div>
        </div>
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
