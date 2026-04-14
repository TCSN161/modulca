import {
  WALL_THICKNESS,
  EXT,
  INT,
  type FloorMat,
  type WallMat,
  type Preset,
} from "../drawingConstants";
import type { WallConfigs, WallType } from "../../../store";

interface FloorPlanProps {
  floorColor: string;
  wallColor: string;
  floorMat: FloorMat;
  wallMat: WallMat;
  preset: Preset;
  wallConfigs?: WallConfigs;
}

export default function FloorPlanDrawing({
  floorColor,
  wallColor,
  floorMat,
  wallMat,
  preset,
  wallConfigs,
}: FloorPlanProps) {
  const S = 550 / 3000;
  const fpX = (800 - EXT * S) / 2;
  const fpY = 100;
  const w = EXT * S;
  const wt = WALL_THICKNESS * 1000 * S;

  const north = wallConfigs?.north ?? "solid";
  const south = wallConfigs?.south ?? "solid";
  const east = wallConfigs?.east ?? "solid";
  const west = wallConfigs?.west ?? "solid";

  // Door/window dimensions in px
  const doorW = 900 * S;
  const winW = 1200 * S;

  return (
    <g>
      {/* Grid reference markers */}
      <text x={fpX - 22} y={fpY + w / 2 + 3} fontSize="12" fontWeight="bold" fill="#000" textAnchor="middle">A</text>
      <text x={fpX + w + 22} y={fpY + w / 2 + 3} fontSize="12" fontWeight="bold" fill="#000" textAnchor="middle">B</text>
      <text x={fpX + w / 2} y={fpY - 25} fontSize="12" fontWeight="bold" fill="#000" textAnchor="middle">1</text>
      <text x={fpX + w / 2} y={fpY + w + 35} fontSize="12" fontWeight="bold" fill="#000" textAnchor="middle">2</text>

      {/* Grid circles */}
      <circle cx={fpX - 22} cy={fpY + w / 2} r="9" fill="none" stroke="#000" strokeWidth="0.5" />
      <circle cx={fpX + w + 22} cy={fpY + w / 2} r="9" fill="none" stroke="#000" strokeWidth="0.5" />
      <circle cx={fpX + w / 2} cy={fpY - 28} r="9" fill="none" stroke="#000" strokeWidth="0.5" />
      <circle cx={fpX + w / 2} cy={fpY + w + 32} r="9" fill="none" stroke="#000" strokeWidth="0.5" />

      {/* Floor fill (interior) */}
      <rect x={fpX + wt} y={fpY + wt} width={w - wt * 2} height={w - wt * 2} fill={floorColor} opacity="0.25" />

      {/* ─── WALLS — driven by wallConfigs ─── */}
      {/* NORTH wall */}
      <WallSegment2D
        wallType={north}
        x={fpX} y={fpY}
        length={w} thickness={wt}
        orientation="horizontal"
        doorW={doorW} winW={winW}
      />

      {/* SOUTH wall */}
      <WallSegment2D
        wallType={south}
        x={fpX} y={fpY + w - wt}
        length={w} thickness={wt}
        orientation="horizontal"
        doorW={doorW} winW={winW}
        doorSwingSide="top"
      />

      {/* WEST wall */}
      <WallSegment2D
        wallType={west}
        x={fpX} y={fpY}
        length={w} thickness={wt}
        orientation="vertical"
        doorW={doorW} winW={winW}
        doorSwingSide="right"
      />

      {/* EAST wall */}
      <WallSegment2D
        wallType={east}
        x={fpX + w - wt} y={fpY}
        length={w} thickness={wt}
        orientation="vertical"
        doorW={doorW} winW={winW}
        doorSwingSide="left"
      />

      {/* Furniture from layout preset */}
      {preset?.furniture.map((item) => {
        const fx = fpX + wt + item.x * 1000 * S;
        const fy = fpY + wt + item.z * 1000 * S;
        const fw = item.width * 1000 * S;
        const fd = item.depth * 1000 * S;
        const patternId = `hatch-${item.id}`;
        return (
          <g key={item.id}>
            <defs>
              <pattern id={patternId} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="4" stroke={item.color} strokeWidth="0.5" opacity="0.5" />
              </pattern>
            </defs>
            <rect x={fx} y={fy} width={fw} height={fd} fill={`url(#${patternId})`} stroke="#555" strokeWidth="0.5" />
            <text x={fx + fw / 2} y={fy + fd / 2 + 2} fontSize="7" textAnchor="middle" fill="#444">{item.label}</text>
          </g>
        );
      })}

      {/* Dimension lines - exterior horizontal (top) */}
      {(() => {
        const dy = fpY - 12;
        return (
          <g>
            <line x1={fpX} y1={dy} x2={fpX + w} y2={dy} stroke="#000" strokeWidth="0.5" />
            <line x1={fpX} y1={dy - 4} x2={fpX} y2={dy + 4} stroke="#000" strokeWidth="0.5" />
            <line x1={fpX + w} y1={dy - 4} x2={fpX + w} y2={dy + 4} stroke="#000" strokeWidth="0.5" />
            <text x={fpX + w / 2} y={dy - 4} fontSize="9" textAnchor="middle" fill="#000">3000</text>
          </g>
        );
      })()}

      {/* Dimension lines - interior horizontal */}
      {(() => {
        const dy = fpY + wt + 12;
        const x1 = fpX + wt;
        const x2 = fpX + w - wt;
        return (
          <g>
            <line x1={x1} y1={dy} x2={x2} y2={dy} stroke="#000" strokeWidth="0.3" />
            <line x1={x1} y1={dy - 3} x2={x1} y2={dy + 3} stroke="#000" strokeWidth="0.3" />
            <line x1={x2} y1={dy - 3} x2={x2} y2={dy + 3} stroke="#000" strokeWidth="0.3" />
            <text x={(x1 + x2) / 2} y={dy + 12} fontSize="8" textAnchor="middle" fill="#555">{INT}</text>
          </g>
        );
      })()}

      {/* Dimension lines - exterior vertical (left) */}
      {(() => {
        const dx = fpX - 12;
        return (
          <g>
            <line x1={dx} y1={fpY} x2={dx} y2={fpY + w} stroke="#000" strokeWidth="0.5" />
            <line x1={dx - 4} y1={fpY} x2={dx + 4} y2={fpY} stroke="#000" strokeWidth="0.5" />
            <line x1={dx - 4} y1={fpY + w} x2={dx + 4} y2={fpY + w} stroke="#000" strokeWidth="0.5" />
            <text x={dx - 4} y={fpY + w / 2} fontSize="9" textAnchor="middle" fill="#000" transform={`rotate(-90, ${dx - 4}, ${fpY + w / 2})`}>3000</text>
          </g>
        );
      })()}

      {/* North arrow */}
      {(() => {
        const nx = fpX + w - 20;
        const ny = fpY + 30;
        return (
          <g>
            <line x1={nx} y1={ny + 20} x2={nx} y2={ny - 8} stroke="#000" strokeWidth="1" />
            <polygon points={`${nx},${ny - 12} ${nx - 5},${ny - 2} ${nx + 5},${ny - 2}`} fill="#000" />
            <text x={nx} y={ny - 16} fontSize="9" fontWeight="bold" textAnchor="middle" fill="#000">N</text>
          </g>
        );
      })()}

      {/* Material callout */}
      <line x1={fpX + w / 2} y1={fpY + w - wt - 8} x2={fpX + w + 50} y2={fpY + w - 60} stroke="#666" strokeWidth="0.3" />
      <circle cx={fpX + w / 2} cy={fpY + w - wt - 8} r="2" fill="#666" />
      <text x={fpX + w + 54} y={fpY + w - 58} fontSize="8" fill="#666">{floorMat?.label || "Oak"} floor</text>

      <line x1={fpX + 8} y1={fpY + w / 2} x2={fpX + w + 50} y2={fpY + w - 38} stroke="#666" strokeWidth="0.3" />
      <circle cx={fpX + 8} cy={fpY + w / 2} r="2" fill="#666" />
      <text x={fpX + w + 54} y={fpY + w - 36} fontSize="8" fill="#666">{wallMat?.label || "Alabaster"} wall</text>

      {/* Section cut line A-A */}
      <line x1={fpX - 8} y1={fpY + w / 2} x2={fpX + w + 8} y2={fpY + w / 2} stroke="#000" strokeWidth="0.8" strokeDasharray="8,3,2,3" />
      <text x={fpX - 16} y={fpY + w / 2 + 4} fontSize="10" fontWeight="bold" fill="#000">A</text>
      <text x={fpX + w + 12} y={fpY + w / 2 + 4} fontSize="10" fontWeight="bold" fill="#000">A</text>

      {/* Wall color swatch */}
      <rect x={fpX + 10} y={fpY + 10} width={20} height={20} fill={wallColor} stroke="#000" strokeWidth="0.3" opacity="0.6" />
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Wall segment helper — renders one wall based on WallType          */
/* ═══════════════════════════════════════════════════════════════════ */

function WallSegment2D({
  wallType,
  x, y,
  length,
  thickness,
  orientation,
  doorW,
  winW,
  doorSwingSide,
}: {
  wallType: WallType;
  x: number;
  y: number;
  length: number;
  thickness: number;
  orientation: "horizontal" | "vertical";
  doorW: number;
  winW: number;
  doorSwingSide?: "top" | "bottom" | "left" | "right";
}) {
  const isH = orientation === "horizontal";

  // ── None / Shared: thin dashed line, no solid wall ──
  if (wallType === "none" || wallType === "shared") {
    return (
      <g>
        {isH ? (
          <line
            x1={x} y1={y + thickness / 2}
            x2={x + length} y2={y + thickness / 2}
            stroke="#999" strokeWidth="0.5" strokeDasharray="4,3"
          />
        ) : (
          <line
            x1={x + thickness / 2} y1={y}
            x2={x + thickness / 2} y2={y + length}
            stroke="#999" strokeWidth="0.5" strokeDasharray="4,3"
          />
        )}
        {/* Shared wall label */}
        {wallType === "shared" && (
          isH ? (
            <text x={x + length / 2} y={y + thickness / 2 - 4} fontSize="6" textAnchor="middle" fill="#aaa">shared</text>
          ) : (
            <text x={x + thickness / 2 + 8} y={y + length / 2} fontSize="6" fill="#aaa" transform={`rotate(-90, ${x + thickness / 2 + 8}, ${y + length / 2})`}>shared</text>
          )
        )}
      </g>
    );
  }

  // ── Solid wall: full thick filled rectangle ──
  if (wallType === "solid") {
    return (
      <rect
        x={x} y={y}
        width={isH ? length : thickness}
        height={isH ? thickness : length}
        fill="#333" stroke="#000" strokeWidth="0.5"
      />
    );
  }

  // ── Door: opening in center with door swing arc ──
  if (wallType === "door") {
    const openingW = doorW;
    const gapStart = (length - openingW) / 2;
    const gapEnd = gapStart + openingW;

    return (
      <g>
        {isH ? (
          <>
            {/* Left segment */}
            <rect x={x} y={y} width={gapStart} height={thickness} fill="#333" stroke="#000" strokeWidth="0.5" />
            {/* Right segment */}
            <rect x={x + gapEnd} y={y} width={length - gapEnd} height={thickness} fill="#333" stroke="#000" strokeWidth="0.5" />
            {/* Door swing */}
            <DoorSwing2D
              doorX={x + gapStart}
              doorY={doorSwingSide === "top" ? y : y + thickness}
              doorWidth={openingW}
              swingDir={doorSwingSide === "top" ? "up" : "down"}
              orientation="horizontal"
            />
          </>
        ) : (
          <>
            {/* Top segment */}
            <rect x={x} y={y} width={thickness} height={gapStart} fill="#333" stroke="#000" strokeWidth="0.5" />
            {/* Bottom segment */}
            <rect x={x} y={y + gapEnd} width={thickness} height={length - gapEnd} fill="#333" stroke="#000" strokeWidth="0.5" />
            {/* Door swing */}
            <DoorSwing2D
              doorX={doorSwingSide === "left" ? x + thickness : x}
              doorY={y + gapStart}
              doorWidth={openingW}
              swingDir={doorSwingSide === "left" ? "right" : "left"}
              orientation="vertical"
            />
          </>
        )}
      </g>
    );
  }

  // ── Window: opening with glass line ──
  if (wallType === "window") {
    const openingW = winW;
    const gapStart = (length - openingW) / 2;
    const gapEnd = gapStart + openingW;

    return (
      <g>
        {isH ? (
          <>
            <rect x={x} y={y} width={gapStart} height={thickness} fill="#333" stroke="#000" strokeWidth="0.5" />
            <rect x={x + gapEnd} y={y} width={length - gapEnd} height={thickness} fill="#333" stroke="#000" strokeWidth="0.5" />
            {/* Window glass lines */}
            <line x1={x + gapStart} y1={y + thickness / 2 - 1} x2={x + gapEnd} y2={y + thickness / 2 - 1} stroke="#4DA6FF" strokeWidth="1.5" />
            <line x1={x + gapStart} y1={y + thickness / 2 + 1} x2={x + gapEnd} y2={y + thickness / 2 + 1} stroke="#4DA6FF" strokeWidth="1.5" />
            {/* Window sill ticks */}
            <line x1={x + gapStart} y1={y} x2={x + gapStart} y2={y + thickness} stroke="#000" strokeWidth="0.5" />
            <line x1={x + gapEnd} y1={y} x2={x + gapEnd} y2={y + thickness} stroke="#000" strokeWidth="0.5" />
          </>
        ) : (
          <>
            <rect x={x} y={y} width={thickness} height={gapStart} fill="#333" stroke="#000" strokeWidth="0.5" />
            <rect x={x} y={y + gapEnd} width={thickness} height={length - gapEnd} fill="#333" stroke="#000" strokeWidth="0.5" />
            {/* Window glass lines */}
            <line x1={x + thickness / 2 - 1} y1={y + gapStart} x2={x + thickness / 2 - 1} y2={y + gapEnd} stroke="#4DA6FF" strokeWidth="1.5" />
            <line x1={x + thickness / 2 + 1} y1={y + gapStart} x2={x + thickness / 2 + 1} y2={y + gapEnd} stroke="#4DA6FF" strokeWidth="1.5" />
            {/* Window sill ticks */}
            <line x1={x} y1={y + gapStart} x2={x + thickness} y2={y + gapStart} stroke="#000" strokeWidth="0.5" />
            <line x1={x} y1={y + gapEnd} x2={x + thickness} y2={y + gapEnd} stroke="#000" strokeWidth="0.5" />
          </>
        )}
      </g>
    );
  }

  // Fallback: solid
  return (
    <rect x={x} y={y} width={isH ? length : thickness} height={isH ? thickness : length} fill="#333" stroke="#000" strokeWidth="0.5" />
  );
}

/* Door swing arc helper */
function DoorSwing2D({
  doorX,
  doorY,
  doorWidth,
  swingDir,
  orientation,
}: {
  doorX: number;
  doorY: number;
  doorWidth: number;
  swingDir: "up" | "down" | "left" | "right";
  orientation: "horizontal" | "vertical";
}) {
  if (orientation === "horizontal") {
    // Door leaf line + arc
    if (swingDir === "up") {
      return (
        <g>
          <line x1={doorX} y1={doorY} x2={doorX} y2={doorY - doorWidth} stroke="#000" strokeWidth="1" />
          <path d={`M ${doorX} ${doorY - doorWidth} A ${doorWidth} ${doorWidth} 0 0 1 ${doorX + doorWidth} ${doorY}`} fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="3,2" />
        </g>
      );
    }
    // down
    return (
      <g>
        <line x1={doorX} y1={doorY} x2={doorX} y2={doorY + doorWidth} stroke="#000" strokeWidth="1" />
        <path d={`M ${doorX} ${doorY + doorWidth} A ${doorWidth} ${doorWidth} 0 0 0 ${doorX + doorWidth} ${doorY}`} fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="3,2" />
      </g>
    );
  }

  // Vertical wall door swing
  if (swingDir === "right") {
    return (
      <g>
        <line x1={doorX} y1={doorY} x2={doorX + doorWidth} y2={doorY} stroke="#000" strokeWidth="1" />
        <path d={`M ${doorX + doorWidth} ${doorY} A ${doorWidth} ${doorWidth} 0 0 1 ${doorX} ${doorY + doorWidth}`} fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="3,2" />
      </g>
    );
  }
  // left
  return (
    <g>
      <line x1={doorX} y1={doorY} x2={doorX - doorWidth} y2={doorY} stroke="#000" strokeWidth="1" />
      <path d={`M ${doorX - doorWidth} ${doorY} A ${doorWidth} ${doorWidth} 0 0 0 ${doorX} ${doorY + doorWidth}`} fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="3,2" />
    </g>
  );
}
