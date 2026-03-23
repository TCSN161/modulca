"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDesignStore, type WallType, type WallSide } from "../store";
import { MODULE_TYPES } from "@/shared/types";

const CELL_PX = 140; // pixels per 3m module
const PADDING = 40;
const WALL_HIT_ZONE = 10; // clickable edge thickness in pixels

const WALL_TYPE_CYCLE: WallType[] = ["solid", "window", "door", "none"];

function nextWallType(current: WallType): WallType {
  const idx = WALL_TYPE_CYCLE.indexOf(current);
  return WALL_TYPE_CYCLE[(idx + 1) % WALL_TYPE_CYCLE.length];
}

const WALL_COLORS: Record<WallType, string> = {
  solid: "#1B3A4B",
  window: "#38bdf8",
  door: "#f59e0b",
  none: "#d1d5db",
  shared: "#94a3b8",
};

const WALL_LABELS: Record<WallType, string> = {
  solid: "S",
  window: "W",
  door: "D",
  none: "",
  shared: "",
};

const LABEL_ABBREV: Record<string, string> = {
  bedroom: "BED",
  kitchen: "KIT",
  bathroom: "BATH",
  living: "LIV",
  office: "OFC",
  storage: "STR",
};

export default function FloorPlan() {
  const { modules, selectedModule, setSelectedModule, updateWallConfig } = useDesignStore();
  const router = useRouter();

  const handleWallClick = useCallback(
    (row: number, col: number, side: WallSide, currentType: WallType, e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentType === "shared") return; // shared walls are not editable
      updateWallConfig(row, col, side, nextWallType(currentType));
    },
    [updateWallConfig]
  );

  // Compute grid bounds
  const { minRow, minCol, rows, cols } = useMemo(() => {
    if (modules.length === 0) return { minRow: 0, minCol: 0, rows: 0, cols: 0 };
    const rs = modules.map((m) => m.row);
    const cs = modules.map((m) => m.col);
    const minR = Math.min(...rs);
    const maxR = Math.max(...rs);
    const minC = Math.min(...cs);
    const maxC = Math.max(...cs);
    return { minRow: minR, minCol: minC, rows: maxR - minR + 1, cols: maxC - minC + 1 };
  }, [modules]);

  const width = cols * CELL_PX + PADDING * 2;
  const height = rows * CELL_PX + PADDING * 2;

  if (modules.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        No modules placed. Go back to Step 1 to place modules.
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center overflow-auto bg-gray-100 p-8">
      <div className="relative" style={{ width, height }}>
        {/* North arrow */}
        <div className="absolute -top-2 left-4 flex flex-col items-center text-gray-400">
          <span className="text-lg">↑</span>
          <span className="text-[10px] font-bold tracking-wider">NORTH</span>
        </div>

        {/* Grid */}
        <svg width={width} height={height} className="rounded-xl bg-white shadow-sm border border-gray-200">
          {/* Grid lines (light) */}
          {Array.from({ length: rows + 1 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1={PADDING}
              y1={PADDING + i * CELL_PX}
              x2={PADDING + cols * CELL_PX}
              y2={PADDING + i * CELL_PX}
              stroke="#e5e7eb"
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: cols + 1 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={PADDING + i * CELL_PX}
              y1={PADDING}
              x2={PADDING + i * CELL_PX}
              y2={PADDING + rows * CELL_PX}
              stroke="#e5e7eb"
              strokeWidth={0.5}
            />
          ))}

          {/* Module cells */}
          {modules.map((mod) => {
            const x = PADDING + (mod.col - minCol) * CELL_PX;
            const y = PADDING + (mod.row - minRow) * CELL_PX;
            const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
            const color = mt?.color || "#ccc";
            const isSelected =
              selectedModule?.row === mod.row && selectedModule?.col === mod.col;
            const abbrev = LABEL_ABBREV[mod.moduleType] || mod.moduleType.slice(0, 3).toUpperCase();

            const wc = mod.wallConfigs;

            // Wall rendering helper: returns stroke props based on wall type
            const wallStroke = (wt: WallType) => ({
              stroke: WALL_COLORS[wt],
              strokeWidth: wt === "shared" ? 1 : wt === "none" ? 1 : 3,
              strokeDasharray: wt === "shared" ? "4 3" : wt === "none" ? "2 4" : wt === "window" ? "8 4" : "none",
            });

            return (
              <g
                key={`${mod.row}-${mod.col}`}
                onClick={() => setSelectedModule({ row: mod.row, col: mod.col })}
                onDoubleClick={() => {
                  setSelectedModule({ row: mod.row, col: mod.col });
                  router.push("/project/demo/configure");
                }}
                className="cursor-pointer"
              >
                {/* Fill */}
                <rect
                  x={x + 2}
                  y={y + 2}
                  width={CELL_PX - 4}
                  height={CELL_PX - 4}
                  fill={color}
                  fillOpacity={0.15}
                  rx={4}
                />

                {/* Selection highlight */}
                {isSelected && (
                  <rect
                    x={x + 1}
                    y={y + 1}
                    width={CELL_PX - 2}
                    height={CELL_PX - 2}
                    fill="none"
                    stroke="#E8913A"
                    strokeWidth={3}
                    rx={4}
                  />
                )}

                {/* Walls — styled per wall config type */}
                {/* North (top) */}
                <line
                  x1={x} y1={y} x2={x + CELL_PX} y2={y}
                  {...wallStroke(wc.north)}
                />
                {/* South (bottom) */}
                <line
                  x1={x} y1={y + CELL_PX} x2={x + CELL_PX} y2={y + CELL_PX}
                  {...wallStroke(wc.south)}
                />
                {/* West (left) */}
                <line
                  x1={x} y1={y} x2={x} y2={y + CELL_PX}
                  {...wallStroke(wc.west)}
                />
                {/* East (right) */}
                <line
                  x1={x + CELL_PX} y1={y} x2={x + CELL_PX} y2={y + CELL_PX}
                  {...wallStroke(wc.east)}
                />

                {/* Clickable wall hit zones (visible on selected module) */}
                {isSelected && (
                  <>
                    {/* North hit zone */}
                    <rect
                      x={x} y={y - WALL_HIT_ZONE / 2}
                      width={CELL_PX} height={WALL_HIT_ZONE}
                      fill="transparent"
                      className={wc.north !== "shared" ? "cursor-pointer" : "cursor-not-allowed"}
                      onClick={(e) => handleWallClick(mod.row, mod.col, "north", wc.north, e)}
                    >
                      <title>{`North: ${wc.north}`}</title>
                    </rect>
                    {/* South hit zone */}
                    <rect
                      x={x} y={y + CELL_PX - WALL_HIT_ZONE / 2}
                      width={CELL_PX} height={WALL_HIT_ZONE}
                      fill="transparent"
                      className={wc.south !== "shared" ? "cursor-pointer" : "cursor-not-allowed"}
                      onClick={(e) => handleWallClick(mod.row, mod.col, "south", wc.south, e)}
                    >
                      <title>{`South: ${wc.south}`}</title>
                    </rect>
                    {/* West hit zone */}
                    <rect
                      x={x - WALL_HIT_ZONE / 2} y={y}
                      width={WALL_HIT_ZONE} height={CELL_PX}
                      fill="transparent"
                      className={wc.west !== "shared" ? "cursor-pointer" : "cursor-not-allowed"}
                      onClick={(e) => handleWallClick(mod.row, mod.col, "west", wc.west, e)}
                    >
                      <title>{`West: ${wc.west}`}</title>
                    </rect>
                    {/* East hit zone */}
                    <rect
                      x={x + CELL_PX - WALL_HIT_ZONE / 2} y={y}
                      width={WALL_HIT_ZONE} height={CELL_PX}
                      fill="transparent"
                      className={wc.east !== "shared" ? "cursor-pointer" : "cursor-not-allowed"}
                      onClick={(e) => handleWallClick(mod.row, mod.col, "east", wc.east, e)}
                    >
                      <title>{`East: ${wc.east}`}</title>
                    </rect>

                    {/* Wall type indicators (small labels on each edge) */}
                    {WALL_LABELS[wc.north] && (
                      <text x={x + CELL_PX / 2} y={y + 12} textAnchor="middle" className="text-[9px] font-bold" fill={WALL_COLORS[wc.north]}>
                        {WALL_LABELS[wc.north]}
                      </text>
                    )}
                    {WALL_LABELS[wc.south] && (
                      <text x={x + CELL_PX / 2} y={y + CELL_PX - 5} textAnchor="middle" className="text-[9px] font-bold" fill={WALL_COLORS[wc.south]}>
                        {WALL_LABELS[wc.south]}
                      </text>
                    )}
                    {WALL_LABELS[wc.west] && (
                      <text x={x + 10} y={y + CELL_PX / 2 + 3} textAnchor="middle" className="text-[9px] font-bold" fill={WALL_COLORS[wc.west]}>
                        {WALL_LABELS[wc.west]}
                      </text>
                    )}
                    {WALL_LABELS[wc.east] && (
                      <text x={x + CELL_PX - 10} y={y + CELL_PX / 2 + 3} textAnchor="middle" className="text-[9px] font-bold" fill={WALL_COLORS[wc.east]}>
                        {WALL_LABELS[wc.east]}
                      </text>
                    )}
                  </>
                )}

                {/* Label */}
                <text
                  x={x + CELL_PX / 2}
                  y={y + CELL_PX / 2 - 8}
                  textAnchor="middle"
                  className="text-xs font-bold"
                  fill="#1B3A4B"
                >
                  {mod.label}
                </text>

                {/* Size label */}
                <text
                  x={x + CELL_PX / 2}
                  y={y + CELL_PX / 2 + 10}
                  textAnchor="middle"
                  className="text-[10px]"
                  fill="#6b7280"
                >
                  9.0m²
                </text>

                {/* Abbreviation badge */}
                <rect
                  x={x + CELL_PX - 36}
                  y={y + 6}
                  width={30}
                  height={16}
                  rx={3}
                  fill={color}
                  fillOpacity={0.3}
                />
                <text
                  x={x + CELL_PX - 21}
                  y={y + 17}
                  textAnchor="middle"
                  className="text-[9px] font-bold"
                  fill={color}
                >
                  {abbrev}
                </text>
              </g>
            );
          })}

          {/* Scale bar */}
          <g transform={`translate(${width - PADDING - 100}, ${height - 20})`}>
            <line x1={0} y1={0} x2={CELL_PX} y2={0} stroke="#666" strokeWidth={2} />
            <line x1={0} y1={-4} x2={0} y2={4} stroke="#666" strokeWidth={1.5} />
            <line x1={CELL_PX} y1={-4} x2={CELL_PX} y2={4} stroke="#666" strokeWidth={1.5} />
            <text x={CELL_PX / 2} y={-6} textAnchor="middle" className="text-[10px] font-medium" fill="#666">
              SCALE 1:50
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
