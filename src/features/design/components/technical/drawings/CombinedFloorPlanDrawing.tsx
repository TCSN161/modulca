import { MODULE_TYPES } from "@/shared/types";
import { getPreset, getPresetsForType, FLOOR_MATERIALS } from "../../../layouts";
import type { ModuleConfig, WallType } from "../../../store";
import { WALL_THICKNESS } from "../drawingConstants";

interface CombinedFloorPlanProps {
  modules: ModuleConfig[];
}

/**
 * Combined Floor Plan — renders ALL modules as a complete house layout.
 * Dynamically scales to fit any grid size within the 800×900 SVG viewBox.
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
  const totalW_mm = gridCols * 3000; // mm
  const totalH_mm = gridRows * 3000;

  // Scale to fit in drawing area (usable: ~720 wide, ~640 tall)
  const maxDrawW = 700;
  const maxDrawH = 620;
  const S = Math.min(maxDrawW / totalW_mm, maxDrawH / totalH_mm);
  const drawW = totalW_mm * S;
  const drawH = totalH_mm * S;
  const originX = (800 - drawW) / 2;
  const originY = 90 + (maxDrawH - drawH) / 2;

  const WT = WALL_THICKNESS * 1000 * S; // wall thickness in px

  // Build a set for quick lookup
  const modMap = new Map<string, ModuleConfig>();
  for (const m of modules) modMap.set(`${m.row},${m.col}`, m);

  return (
    <g>
      {/* Overall dimension lines */}
      {/* Top — total width */}
      {(() => {
        const dy = originY - 18;
        const x1 = originX;
        const x2 = originX + drawW;
        return (
          <g>
            <line x1={x1} y1={dy} x2={x2} y2={dy} stroke="#000" strokeWidth="0.5" />
            <line x1={x1} y1={dy - 4} x2={x1} y2={dy + 4} stroke="#000" strokeWidth="0.5" />
            <line x1={x2} y1={dy - 4} x2={x2} y2={dy + 4} stroke="#000" strokeWidth="0.5" />
            <text x={(x1 + x2) / 2} y={dy - 5} fontSize="9" textAnchor="middle" fill="#000">
              {totalW_mm}
            </text>
          </g>
        );
      })()}

      {/* Left — total height */}
      {(() => {
        const dx = originX - 18;
        const y1 = originY;
        const y2 = originY + drawH;
        return (
          <g>
            <line x1={dx} y1={y1} x2={dx} y2={y2} stroke="#000" strokeWidth="0.5" />
            <line x1={dx - 4} y1={y1} x2={dx + 4} y2={y1} stroke="#000" strokeWidth="0.5" />
            <line x1={dx - 4} y1={y2} x2={dx + 4} y2={y2} stroke="#000" strokeWidth="0.5" />
            <text
              x={dx - 5}
              y={(y1 + y2) / 2}
              fontSize="9"
              textAnchor="middle"
              fill="#000"
              transform={`rotate(-90, ${dx - 5}, ${(y1 + y2) / 2})`}
            >
              {totalH_mm}
            </text>
          </g>
        );
      })()}

      {/* Grid reference labels — columns (A, B, C...) */}
      {Array.from({ length: gridCols }, (_, i) => {
        const cx = originX + (i + 0.5) * 3000 * S;
        const letter = String.fromCharCode(65 + i);
        return (
          <g key={`col-${i}`}>
            <circle cx={cx} cy={originY - 35} r="9" fill="none" stroke="#000" strokeWidth="0.5" />
            <text x={cx} y={originY - 31} fontSize="10" fontWeight="bold" textAnchor="middle" fill="#000">
              {letter}
            </text>
          </g>
        );
      })}

      {/* Grid reference labels — rows (1, 2, 3...) */}
      {Array.from({ length: gridRows }, (_, i) => {
        const cy = originY + (i + 0.5) * 3000 * S;
        return (
          <g key={`row-${i}`}>
            <circle cx={originX - 35} cy={cy} r="9" fill="none" stroke="#000" strokeWidth="0.5" />
            <text x={originX - 35} y={cy + 4} fontSize="10" fontWeight="bold" textAnchor="middle" fill="#000">
              {i + 1}
            </text>
          </g>
        );
      })}

      {/* Render each module */}
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
            {/* Floor fill */}
            <rect
              x={mx + WT}
              y={my + WT}
              width={modW - WT * 2}
              height={modW - WT * 2}
              fill={floorColor}
              opacity="0.2"
            />

            {/* Walls — driven by wallConfigs, with neighbor awareness */}
            {/* NORTH wall */}
            <CombinedWall wt={mod.wallConfigs?.north ?? (hasNorth ? "shared" : "solid")}
              x={mx} y={my} len={modW} thick={WT} orient="h" S={S} swingDir="down" />
            {/* SOUTH wall */}
            <CombinedWall wt={mod.wallConfigs?.south ?? (hasSouth ? "shared" : "solid")}
              x={mx} y={my + modW - WT} len={modW} thick={WT} orient="h" S={S} swingDir="up" />
            {/* WEST wall */}
            <CombinedWall wt={mod.wallConfigs?.west ?? (hasWest ? "shared" : "solid")}
              x={mx} y={my} len={modW} thick={WT} orient="v" S={S} swingDir="right" />
            {/* EAST wall */}
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
                  {/* Only show label if piece is large enough */}
                  {fw > 20 && fd > 10 && (
                    <text x={fx + fw / 2} y={fy + fd / 2 + 2} fontSize={Math.min(6, fw / 6)} textAnchor="middle" fill="#555">
                      {item.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Room label with module type color */}
            <rect
              x={mx + modW / 2 - 28}
              y={my + modW - 20}
              width={56}
              height={12}
              rx="2"
              fill="white"
              fillOpacity="0.85"
              stroke={mtColor}
              strokeWidth="0.5"
            />
            <text
              x={mx + modW / 2}
              y={my + modW - 11}
              fontSize="6"
              fontWeight="bold"
              textAnchor="middle"
              fill="#333"
            >
              {mod.label}
            </text>
          </g>
        );
      })}

      {/* North arrow */}
      {(() => {
        const nx = originX + drawW + 30;
        const ny = originY + 30;
        return (
          <g>
            <line x1={nx} y1={ny + 20} x2={nx} y2={ny - 8} stroke="#000" strokeWidth="1" />
            <polygon points={`${nx},${ny - 12} ${nx - 5},${ny - 2} ${nx + 5},${ny - 2}`} fill="#000" />
            <text x={nx} y={ny - 16} fontSize="9" fontWeight="bold" textAnchor="middle" fill="#000">N</text>
          </g>
        );
      })()}

      {/* Legend */}
      {(() => {
        const lx = originX + drawW + 15;
        const ly = originY + 80;
        const usedTypes = [...new Set(modules.map((m) => m.moduleType))];
        return (
          <g>
            <text x={lx} y={ly - 8} fontSize="7" fontWeight="bold" fill="#333">LEGEND</text>
            {usedTypes.map((typeId, i) => {
              const mt = MODULE_TYPES.find((t) => t.id === typeId);
              return (
                <g key={typeId}>
                  <rect x={lx} y={ly + i * 14} width={8} height={8} rx="1" fill={mt?.color || "#888"} />
                  <text x={lx + 12} y={ly + i * 14 + 7} fontSize="6" fill="#555">
                    {mt?.label || typeId}
                  </text>
                </g>
              );
            })}
            <text x={lx} y={ly + usedTypes.length * 14 + 12} fontSize="6" fill="#999">
              {modules.length} modules
            </text>
            <text x={lx} y={ly + usedTypes.length * 14 + 22} fontSize="6" fill="#999">
              {(modules.length * 9).toFixed(0)} m2 total
            </text>
          </g>
        );
      })()}
    </g>
  );
}

/* ── Wall segment for combined plan ── */
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

  if (wt === "none" || wt === "shared") {
    return isH
      ? <line x1={x} y1={y + thick / 2} x2={x + len} y2={y + thick / 2} stroke="#999" strokeWidth="0.3" strokeDasharray="2,2" />
      : <line x1={x + thick / 2} y1={y} x2={x + thick / 2} y2={y + len} stroke="#999" strokeWidth="0.3" strokeDasharray="2,2" />;
  }

  if (wt === "solid") {
    return isH
      ? <rect x={x} y={y} width={len} height={thick} fill="#333" stroke="#000" strokeWidth="0.3" />
      : <rect x={x} y={y} width={thick} height={len} fill="#333" stroke="#000" strokeWidth="0.3" />;
  }

  if (wt === "door") {
    const gap = (len - doorW) / 2;
    return isH ? (
      <g>
        <rect x={x} y={y} width={gap} height={thick} fill="#333" stroke="#000" strokeWidth="0.3" />
        <rect x={x + gap + doorW} y={y} width={len - gap - doorW} height={thick} fill="#333" stroke="#000" strokeWidth="0.3" />
        {swingDir === "up" && (
          <g>
            <line x1={x + gap} y1={y} x2={x + gap} y2={y - doorW} stroke="#000" strokeWidth="0.5" />
            <path d={`M ${x + gap} ${y - doorW} A ${doorW} ${doorW} 0 0 1 ${x + gap + doorW} ${y}`} fill="none" stroke="#000" strokeWidth="0.3" strokeDasharray="2,1" />
          </g>
        )}
        {swingDir === "down" && (
          <g>
            <line x1={x + gap} y1={y + thick} x2={x + gap} y2={y + thick + doorW} stroke="#000" strokeWidth="0.5" />
            <path d={`M ${x + gap} ${y + thick + doorW} A ${doorW} ${doorW} 0 0 0 ${x + gap + doorW} ${y + thick}`} fill="none" stroke="#000" strokeWidth="0.3" strokeDasharray="2,1" />
          </g>
        )}
      </g>
    ) : (
      <g>
        <rect x={x} y={y} width={thick} height={gap} fill="#333" stroke="#000" strokeWidth="0.3" />
        <rect x={x} y={y + gap + doorW} width={thick} height={len - gap - doorW} fill="#333" stroke="#000" strokeWidth="0.3" />
        {swingDir === "right" && (
          <g>
            <line x1={x + thick} y1={y + gap} x2={x + thick + doorW} y2={y + gap} stroke="#000" strokeWidth="0.5" />
            <path d={`M ${x + thick + doorW} ${y + gap} A ${doorW} ${doorW} 0 0 1 ${x + thick} ${y + gap + doorW}`} fill="none" stroke="#000" strokeWidth="0.3" strokeDasharray="2,1" />
          </g>
        )}
        {swingDir === "left" && (
          <g>
            <line x1={x} y1={y + gap} x2={x - doorW} y2={y + gap} stroke="#000" strokeWidth="0.5" />
            <path d={`M ${x - doorW} ${y + gap} A ${doorW} ${doorW} 0 0 0 ${x} ${y + gap + doorW}`} fill="none" stroke="#000" strokeWidth="0.3" strokeDasharray="2,1" />
          </g>
        )}
      </g>
    );
  }

  if (wt === "window") {
    const gap = (len - winW) / 2;
    return isH ? (
      <g>
        <rect x={x} y={y} width={gap} height={thick} fill="#333" stroke="#000" strokeWidth="0.3" />
        <rect x={x + gap + winW} y={y} width={len - gap - winW} height={thick} fill="#333" stroke="#000" strokeWidth="0.3" />
        <line x1={x + gap} y1={y + thick / 2 - 0.5} x2={x + gap + winW} y2={y + thick / 2 - 0.5} stroke="#4DA6FF" strokeWidth="1" />
        <line x1={x + gap} y1={y + thick / 2 + 0.5} x2={x + gap + winW} y2={y + thick / 2 + 0.5} stroke="#4DA6FF" strokeWidth="1" />
      </g>
    ) : (
      <g>
        <rect x={x} y={y} width={thick} height={gap} fill="#333" stroke="#000" strokeWidth="0.3" />
        <rect x={x} y={y + gap + winW} width={thick} height={len - gap - winW} fill="#333" stroke="#000" strokeWidth="0.3" />
        <line x1={x + thick / 2 - 0.5} y1={y + gap} x2={x + thick / 2 - 0.5} y2={y + gap + winW} stroke="#4DA6FF" strokeWidth="1" />
        <line x1={x + thick / 2 + 0.5} y1={y + gap} x2={x + thick / 2 + 0.5} y2={y + gap + winW} stroke="#4DA6FF" strokeWidth="1" />
      </g>
    );
  }

  // Fallback: solid
  return isH
    ? <rect x={x} y={y} width={len} height={thick} fill="#333" stroke="#000" strokeWidth="0.3" />
    : <rect x={x} y={y} width={thick} height={len} fill="#333" stroke="#000" strokeWidth="0.3" />;
}
