import { MODULE_TYPES } from "@/shared/types";
import { getPreset, getPresetsForType, FLOOR_MATERIALS } from "../../../layouts";
import type { ModuleConfig, WallType } from "../../../store";
import { WALL_THICKNESS } from "../drawingConstants";

interface CombinedFloorPlanProps {
  modules: ModuleConfig[];
}

/**
 * Combined Floor Plan — renders ALL modules as a complete house layout.
 * Dynamically scales to fit any grid size within the 800x900 SVG viewBox.
 * Uses proper architectural conventions: cut-line walls, insulation patterns,
 * dimension chains, grid references, and standard symbols.
 */
export default function CombinedFloorPlanDrawing({ modules }: CombinedFloorPlanProps) {
  if (modules.length === 0) {
    return (
      <text x={400} y={400} textAnchor="middle" fontSize="14" fill="#999">
        No modules configured
      </text>
    );
  }

  // Compute grid bounds
  let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;
  for (const m of modules) {
    if (m.row < minRow) minRow = m.row;
    if (m.row > maxRow) maxRow = m.row;
    if (m.col < minCol) minCol = m.col;
    if (m.col > maxCol) maxCol = m.col;
  }
  const gridCols = maxCol - minCol + 1;
  const gridRows = maxRow - minRow + 1;
  const totalW_mm = gridCols * 3000;
  const totalH_mm = gridRows * 3000;

  // Scale to fit in drawing area
  const maxDrawW = 680;
  const maxDrawH = 600;
  const S = Math.min(maxDrawW / totalW_mm, maxDrawH / totalH_mm);
  const drawW = totalW_mm * S;
  const drawH = totalH_mm * S;
  const originX = (800 - drawW) / 2;
  const originY = 95 + (maxDrawH - drawH) / 2;

  const WT = WALL_THICKNESS * 1000 * S;

  // Build a set for quick lookup
  const modMap = new Map<string, ModuleConfig>();
  for (const m of modules) modMap.set(`${m.row},${m.col}`, m);

  // Total area
  const totalArea = modules.length * 9; // 3m x 3m = 9m2 each

  return (
    <g>
      {/* ═══ SVG Defs ═══ */}
      <defs>
        {/* Insulation zigzag for walls */}
        <pattern id="cp-insulation" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0,3 L1.5,0 L3,3 L4.5,0 L6,3" fill="none" stroke="#555" strokeWidth="0.3" />
          <path d="M0,6 L1.5,3 L3,6 L4.5,3 L6,6" fill="none" stroke="#555" strokeWidth="0.3" />
        </pattern>
      </defs>

      {/* ═══ DIMENSION CHAINS ═══ */}
      {/* Top — overall width with per-module breakdown */}
      {(() => {
        const dy = originY - 20;
        const chainDy = originY - 36;
        return (
          <g>
            {/* Overall dimension */}
            <line x1={originX} y1={chainDy} x2={originX + drawW} y2={chainDy} stroke="#000" strokeWidth="0.5" />
            <line x1={originX - 3} y1={chainDy - 3} x2={originX + 3} y2={chainDy + 3} stroke="#000" strokeWidth="0.5" />
            <line x1={originX + drawW - 3} y1={chainDy - 3} x2={originX + drawW + 3} y2={chainDy + 3} stroke="#000" strokeWidth="0.5" />
            <text x={originX + drawW / 2} y={chainDy - 5} fontSize="8" textAnchor="middle" fill="#000" fontWeight="bold">
              {totalW_mm}
            </text>

            {/* Per-module dimension chain */}
            {gridCols > 1 && Array.from({ length: gridCols }, (_, i) => {
              const x1 = originX + i * 3000 * S;
              const x2 = originX + (i + 1) * 3000 * S;
              return (
                <g key={`dim-col-${i}`}>
                  <line x1={x1} y1={dy} x2={x2} y2={dy} stroke="#000" strokeWidth="0.3" />
                  <line x1={x1 - 2} y1={dy - 2} x2={x1 + 2} y2={dy + 2} stroke="#000" strokeWidth="0.3" />
                  <line x1={x2 - 2} y1={dy - 2} x2={x2 + 2} y2={dy + 2} stroke="#000" strokeWidth="0.3" />
                  <text x={(x1 + x2) / 2} y={dy - 3} fontSize="7" textAnchor="middle" fill="#555">3000</text>
                </g>
              );
            })}

            {/* Extension lines */}
            <line x1={originX} y1={originY - 5} x2={originX} y2={chainDy - 2} stroke="#000" strokeWidth="0.2" />
            <line x1={originX + drawW} y1={originY - 5} x2={originX + drawW} y2={chainDy - 2} stroke="#000" strokeWidth="0.2" />
          </g>
        );
      })()}

      {/* Left — overall height */}
      {(() => {
        const dx = originX - 20;
        const chainDx = originX - 36;
        return (
          <g>
            {/* Overall dimension */}
            <line x1={chainDx} y1={originY} x2={chainDx} y2={originY + drawH} stroke="#000" strokeWidth="0.5" />
            <line x1={chainDx - 3} y1={originY - 3} x2={chainDx + 3} y2={originY + 3} stroke="#000" strokeWidth="0.5" />
            <line x1={chainDx - 3} y1={originY + drawH - 3} x2={chainDx + 3} y2={originY + drawH + 3} stroke="#000" strokeWidth="0.5" />
            <text
              x={chainDx - 5} y={originY + drawH / 2}
              fontSize="8" textAnchor="middle" fill="#000" fontWeight="bold"
              transform={`rotate(-90, ${chainDx - 5}, ${originY + drawH / 2})`}
            >
              {totalH_mm}
            </text>

            {/* Per-module vertical chain */}
            {gridRows > 1 && Array.from({ length: gridRows }, (_, i) => {
              const y1 = originY + i * 3000 * S;
              const y2 = originY + (i + 1) * 3000 * S;
              return (
                <g key={`dim-row-${i}`}>
                  <line x1={dx} y1={y1} x2={dx} y2={y2} stroke="#000" strokeWidth="0.3" />
                  <line x1={dx - 2} y1={y1 - 2} x2={dx + 2} y2={y1 + 2} stroke="#000" strokeWidth="0.3" />
                  <line x1={dx - 2} y1={y2 - 2} x2={dx + 2} y2={y2 + 2} stroke="#000" strokeWidth="0.3" />
                  <text
                    x={dx - 3} y={(y1 + y2) / 2}
                    fontSize="7" textAnchor="middle" fill="#555"
                    transform={`rotate(-90, ${dx - 3}, ${(y1 + y2) / 2})`}
                  >
                    3000
                  </text>
                </g>
              );
            })}

            {/* Extension lines */}
            <line x1={originX - 5} y1={originY} x2={chainDx - 2} y2={originY} stroke="#000" strokeWidth="0.2" />
            <line x1={originX - 5} y1={originY + drawH} x2={chainDx - 2} y2={originY + drawH} stroke="#000" strokeWidth="0.2" />
          </g>
        );
      })()}

      {/* ═══ GRID REFERENCE LABELS ═══ */}
      {/* Columns (A, B, C...) */}
      {Array.from({ length: gridCols }, (_, i) => {
        const cx = originX + (i + 0.5) * 3000 * S;
        const letter = String.fromCharCode(65 + i);
        return (
          <g key={`col-${i}`}>
            <circle cx={cx} cy={originY - 48} r="10" fill="none" stroke="#000" strokeWidth="0.7" />
            <text x={cx} y={originY - 44} fontSize="10" fontWeight="bold" textAnchor="middle" fill="#000">
              {letter}
            </text>
            {/* Grid line extending down */}
            <line x1={cx} y1={originY - 38} x2={cx} y2={originY} stroke="#000" strokeWidth="0.15" strokeDasharray="1,3" />
          </g>
        );
      })}

      {/* Rows (1, 2, 3...) */}
      {Array.from({ length: gridRows }, (_, i) => {
        const cy = originY + (i + 0.5) * 3000 * S;
        return (
          <g key={`row-${i}`}>
            <circle cx={originX - 48} cy={cy} r="10" fill="none" stroke="#000" strokeWidth="0.7" />
            <text x={originX - 48} y={cy + 4} fontSize="10" fontWeight="bold" textAnchor="middle" fill="#000">
              {i + 1}
            </text>
            {/* Grid line extending right */}
            <line x1={originX - 38} y1={cy} x2={originX} y2={cy} stroke="#000" strokeWidth="0.15" strokeDasharray="1,3" />
          </g>
        );
      })}

      {/* ═══ RENDER EACH MODULE ═══ */}
      {modules.map((mod) => {
        const col = mod.col - minCol;
        const row = mod.row - minRow;
        const mx = originX + col * 3000 * S;
        const my = originY + row * 3000 * S;
        const modW = 3000 * S;

        const floorMat = FLOOR_MATERIALS.find((f) => f.id === mod.floorFinish);
        const floorColor = floorMat?.color || "#D4A76A";
        const moduleType = MODULE_TYPES.find((mt) => mt.id === mod.moduleType);
        const mtColor = moduleType?.color || "#888";

        const preset = getPreset(mod.moduleType, mod.layoutPreset)
          || getPresetsForType(mod.moduleType)[0];
        const furniture = preset?.furniture || [];

        // Check neighbors for shared walls
        const hasNorth = modMap.has(`${mod.row - 1},${mod.col}`);
        const hasSouth = modMap.has(`${mod.row + 1},${mod.col}`);
        const hasWest = modMap.has(`${mod.row},${mod.col - 1}`);
        const hasEast = modMap.has(`${mod.row},${mod.col + 1}`);

        return (
          <g key={`mod-${mod.row}-${mod.col}`}>
            {/* Floor fill — subtle tile pattern */}
            <rect
              x={mx + WT}
              y={my + WT}
              width={modW - WT * 2}
              height={modW - WT * 2}
              fill={floorColor}
              opacity="0.12"
            />

            {/* ─── WALLS ─── */}
            {/* NORTH */}
            <CombinedWall wt={mod.wallConfigs?.north ?? (hasNorth ? "shared" : "solid")}
              x={mx} y={my} len={modW} thick={WT} orient="h" S={S} swingDir="down" />
            {/* SOUTH */}
            <CombinedWall wt={mod.wallConfigs?.south ?? (hasSouth ? "shared" : "solid")}
              x={mx} y={my + modW - WT} len={modW} thick={WT} orient="h" S={S} swingDir="up" />
            {/* WEST */}
            <CombinedWall wt={mod.wallConfigs?.west ?? (hasWest ? "shared" : "solid")}
              x={mx} y={my} len={modW} thick={WT} orient="v" S={S} swingDir="right" />
            {/* EAST */}
            <CombinedWall wt={mod.wallConfigs?.east ?? (hasEast ? "shared" : "solid")}
              x={mx + modW - WT} y={my} len={modW} thick={WT} orient="v" S={S} swingDir="left" />

            {/* Furniture */}
            {furniture.map((item) => {
              const fx = mx + WT + item.x * 1000 * S;
              const fy = my + WT + item.z * 1000 * S;
              const fw = item.width * 1000 * S;
              const fd = item.depth * 1000 * S;
              const patId = `ch-${mod.row}-${mod.col}-${item.id}`;
              return (
                <g key={item.id}>
                  <defs>
                    <pattern id={patId} width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <line x1="0" y1="0" x2="0" y2="3" stroke={item.color} strokeWidth="0.4" opacity="0.5" />
                    </pattern>
                  </defs>
                  <rect x={fx} y={fy} width={fw} height={fd} fill={`url(#${patId})`} stroke="#666" strokeWidth="0.3" />
                  {fw > 20 && fd > 10 && (
                    <text x={fx + fw / 2} y={fy + fd / 2 + 2} fontSize={Math.min(5, fw / 7)} textAnchor="middle" fill="#555">
                      {item.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Room type label (watermark style) */}
            <text
              x={mx + modW / 2}
              y={my + modW / 2 - 2}
              fontSize={Math.min(7, modW / 16)}
              fontWeight="bold"
              textAnchor="middle"
              fill="#000"
              opacity="0.18"
              letterSpacing="1"
            >
              {(moduleType?.label || mod.moduleType).toUpperCase()}
            </text>

            {/* Area label */}
            <text
              x={mx + modW / 2}
              y={my + modW / 2 + 8}
              fontSize={Math.min(5, modW / 22)}
              textAnchor="middle"
              fill="#555"
              opacity="0.3"
            >
              9.00 m&sup2;
            </text>

            {/* Module ID badge — colored accent strip at bottom */}
            <rect
              x={mx + modW / 2 - 24}
              y={my + modW - 17}
              width={48}
              height={10}
              rx="1.5"
              fill="white"
              fillOpacity="0.9"
              stroke={mtColor}
              strokeWidth="0.6"
            />
            <rect
              x={mx + modW / 2 - 24}
              y={my + modW - 17}
              width={3}
              height={10}
              rx="1.5"
              fill={mtColor}
            />
            <text
              x={mx + modW / 2 + 2}
              y={my + modW - 10}
              fontSize="5.5"
              fontWeight="bold"
              textAnchor="middle"
              fill="#333"
            >
              {mod.label}
            </text>
          </g>
        );
      })}

      {/* ═══ NORTH ARROW ═══ */}
      {(() => {
        const nx = originX + drawW + 35;
        const ny = originY + 25;
        return (
          <g>
            <circle cx={nx} cy={ny} r="14" fill="none" stroke="#000" strokeWidth="0.5" />
            <line x1={nx} y1={ny + 10} x2={nx} y2={ny - 10} stroke="#000" strokeWidth="0.8" />
            <polygon points={`${nx},${ny - 13} ${nx - 4},${ny - 5} ${nx},${ny - 7}`} fill="#000" />
            <polygon points={`${nx},${ny - 13} ${nx + 4},${ny - 5} ${nx},${ny - 7}`} fill="none" stroke="#000" strokeWidth="0.5" />
            <text x={nx} y={ny - 17} fontSize="8" fontWeight="bold" textAnchor="middle" fill="#000">N</text>
          </g>
        );
      })()}

      {/* ═══ LEGEND ═══ */}
      {(() => {
        const lx = originX + drawW + 18;
        const ly = originY + 65;
        const usedTypes = [...new Set(modules.map((m) => m.moduleType))];
        return (
          <g>
            {/* Legend box */}
            <rect x={lx - 4} y={ly - 14} width={75} height={usedTypes.length * 14 + 42} rx="2" fill="none" stroke="#000" strokeWidth="0.3" />
            <text x={lx} y={ly - 3} fontSize="6" fontWeight="bold" fill="#333" letterSpacing="0.5">LEGEND</text>
            <line x1={lx - 4} y1={ly + 2} x2={lx + 71} y2={ly + 2} stroke="#000" strokeWidth="0.3" />

            {usedTypes.map((typeId, i) => {
              const mt = MODULE_TYPES.find((t) => t.id === typeId);
              const count = modules.filter((m) => m.moduleType === typeId).length;
              return (
                <g key={typeId}>
                  <rect x={lx} y={ly + 8 + i * 14} width={8} height={8} rx="1" fill={mt?.color || "#888"} stroke="#000" strokeWidth="0.2" />
                  <text x={lx + 12} y={ly + 14 + i * 14} fontSize="5.5" fill="#555">
                    {mt?.label || typeId} ({count})
                  </text>
                </g>
              );
            })}

            {/* Summary stats */}
            <line x1={lx - 4} y1={ly + 8 + usedTypes.length * 14 + 4} x2={lx + 71} y2={ly + 8 + usedTypes.length * 14 + 4} stroke="#000" strokeWidth="0.2" />
            <text x={lx} y={ly + 8 + usedTypes.length * 14 + 16} fontSize="6" fill="#333" fontWeight="bold">
              {modules.length} modules
            </text>
            <text x={lx} y={ly + 8 + usedTypes.length * 14 + 26} fontSize="6" fill="#555">
              {totalArea.toFixed(0)} m&sup2; total
            </text>
          </g>
        );
      })()}

      {/* ═══ SECTION CUT LINE A-A (across the middle row) ═══ */}
      {(() => {
        const cutY = originY + drawH / 2;
        return (
          <g>
            <line x1={originX - 12} y1={cutY} x2={originX + drawW + 12} y2={cutY}
              stroke="#000" strokeWidth="0.6" strokeDasharray="12,3,2,3" />
            <polygon
              points={`${originX - 18},${cutY - 4} ${originX - 18},${cutY + 4} ${originX - 12},${cutY}`}
              fill="#000"
            />
            <text x={originX - 22} y={cutY + 4} fontSize="9" fontWeight="bold" fill="#000" textAnchor="middle">A</text>
            <polygon
              points={`${originX + drawW + 18},${cutY - 4} ${originX + drawW + 18},${cutY + 4} ${originX + drawW + 12},${cutY}`}
              fill="#000"
            />
            <text x={originX + drawW + 22} y={cutY + 4} fontSize="9" fontWeight="bold" fill="#000" textAnchor="middle">A</text>
          </g>
        );
      })()}
    </g>
  );
}

/* ═══ Wall segment for combined plan ═══ */
function CombinedWall({
  wt, x, y, len, thick, orient, S, swingDir,
}: {
  wt: WallType;
  x: number; y: number;
  len: number; thick: number;
  orient: "h" | "v";
  S: number;
  swingDir: "up" | "down" | "left" | "right";
}) {
  const isH = orient === "h";
  const doorW = 900 * S;
  const winW = 1200 * S;

  // None: no rendering
  if (wt === "none") return null;

  // Shared: dotted centerline
  if (wt === "shared") {
    return isH
      ? <line x1={x} y1={y + thick / 2} x2={x + len} y2={y + thick / 2} stroke="#888" strokeWidth="0.4" strokeDasharray="1.5,3" />
      : <line x1={x + thick / 2} y1={y} x2={x + thick / 2} y2={y + len} stroke="#888" strokeWidth="0.4" strokeDasharray="1.5,3" />;
  }

  // Solid wall — filled black with insulation pattern overlay
  if (wt === "solid") {
    return isH ? (
      <g>
        <rect x={x} y={y} width={len} height={thick} fill="#000" stroke="none" />
        <rect x={x + 0.5} y={y + 0.5} width={len - 1} height={thick - 1} fill="url(#cp-insulation)" />
      </g>
    ) : (
      <g>
        <rect x={x} y={y} width={thick} height={len} fill="#000" stroke="none" />
        <rect x={x + 0.5} y={y + 0.5} width={thick - 1} height={len - 1} fill="url(#cp-insulation)" />
      </g>
    );
  }

  // Door
  if (wt === "door") {
    const gap = (len - doorW) / 2;
    return isH ? (
      <g>
        <rect x={x} y={y} width={gap} height={thick} fill="#000" />
        <rect x={x + gap + doorW} y={y} width={len - gap - doorW} height={thick} fill="#000" />
        {/* Door swing arc */}
        {swingDir === "up" && (
          <g>
            <line x1={x + gap} y1={y} x2={x + gap} y2={y - doorW} stroke="#000" strokeWidth="0.5" />
            <path d={`M ${x + gap} ${y - doorW} A ${doorW} ${doorW} 0 0 1 ${x + gap + doorW} ${y}`} fill="none" stroke="#000" strokeWidth="0.3" />
          </g>
        )}
        {swingDir === "down" && (
          <g>
            <line x1={x + gap} y1={y + thick} x2={x + gap} y2={y + thick + doorW} stroke="#000" strokeWidth="0.5" />
            <path d={`M ${x + gap} ${y + thick + doorW} A ${doorW} ${doorW} 0 0 0 ${x + gap + doorW} ${y + thick}`} fill="none" stroke="#000" strokeWidth="0.3" />
          </g>
        )}
      </g>
    ) : (
      <g>
        <rect x={x} y={y} width={thick} height={gap} fill="#000" />
        <rect x={x} y={y + gap + doorW} width={thick} height={len - gap - doorW} fill="#000" />
        {swingDir === "right" && (
          <g>
            <line x1={x + thick} y1={y + gap} x2={x + thick + doorW} y2={y + gap} stroke="#000" strokeWidth="0.5" />
            <path d={`M ${x + thick + doorW} ${y + gap} A ${doorW} ${doorW} 0 0 1 ${x + thick} ${y + gap + doorW}`} fill="none" stroke="#000" strokeWidth="0.3" />
          </g>
        )}
        {swingDir === "left" && (
          <g>
            <line x1={x} y1={y + gap} x2={x - doorW} y2={y + gap} stroke="#000" strokeWidth="0.5" />
            <path d={`M ${x - doorW} ${y + gap} A ${doorW} ${doorW} 0 0 0 ${x} ${y + gap + doorW}`} fill="none" stroke="#000" strokeWidth="0.3" />
          </g>
        )}
      </g>
    );
  }

  // Window
  if (wt === "window") {
    const gap = (len - winW) / 2;
    return isH ? (
      <g>
        <rect x={x} y={y} width={gap} height={thick} fill="#000" />
        <rect x={x + gap + winW} y={y} width={len - gap - winW} height={thick} fill="#000" />
        {/* Double glass line */}
        <line x1={x + gap + 1} y1={y + thick * 0.35} x2={x + gap + winW - 1} y2={y + thick * 0.35} stroke="#4DA6FF" strokeWidth="0.8" />
        <line x1={x + gap + 1} y1={y + thick * 0.65} x2={x + gap + winW - 1} y2={y + thick * 0.65} stroke="#4DA6FF" strokeWidth="0.8" />
        {/* Jamb lines */}
        <line x1={x + gap} y1={y} x2={x + gap} y2={y + thick} stroke="#000" strokeWidth="0.3" />
        <line x1={x + gap + winW} y1={y} x2={x + gap + winW} y2={y + thick} stroke="#000" strokeWidth="0.3" />
      </g>
    ) : (
      <g>
        <rect x={x} y={y} width={thick} height={gap} fill="#000" />
        <rect x={x} y={y + gap + winW} width={thick} height={len - gap - winW} fill="#000" />
        {/* Double glass line */}
        <line x1={x + thick * 0.35} y1={y + gap + 1} x2={x + thick * 0.35} y2={y + gap + winW - 1} stroke="#4DA6FF" strokeWidth="0.8" />
        <line x1={x + thick * 0.65} y1={y + gap + 1} x2={x + thick * 0.65} y2={y + gap + winW - 1} stroke="#4DA6FF" strokeWidth="0.8" />
        {/* Jamb lines */}
        <line x1={x} y1={y + gap} x2={x + thick} y2={y + gap} stroke="#000" strokeWidth="0.3" />
        <line x1={x} y1={y + gap + winW} x2={x + thick} y2={y + gap + winW} stroke="#000" strokeWidth="0.3" />
      </g>
    );
  }

  // Fallback: solid
  return isH
    ? <rect x={x} y={y} width={len} height={thick} fill="#000" />
    : <rect x={x} y={y} width={thick} height={len} fill="#000" />;
}
