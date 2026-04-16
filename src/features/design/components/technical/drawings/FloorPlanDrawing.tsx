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
  moduleTypeLabel?: string;
  moduleLabel?: string;
}

export default function FloorPlanDrawing({
  floorColor,
  wallColor,
  floorMat,
  wallMat,
  preset,
  wallConfigs,
  moduleTypeLabel,
  moduleLabel,
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
      {/* ═══ SVG defs for patterns ═══ */}
      <defs>
        {/* Insulation zigzag fill for walls */}
        <pattern id="fp-insulation" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0,4 L2,0 L4,4 L6,0 L8,4" fill="none" stroke="#666" strokeWidth="0.4" />
          <path d="M0,8 L2,4 L4,8 L6,4 L8,8" fill="none" stroke="#666" strokeWidth="0.4" />
        </pattern>
        {/* Floor tile pattern */}
        <pattern id="fp-floor-tile" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill={floorColor} opacity="0.15" />
          <line x1="0" y1="20" x2="20" y2="20" stroke="#000" strokeWidth="0.15" opacity="0.12" />
          <line x1="20" y1="0" x2="20" y2="20" stroke="#000" strokeWidth="0.15" opacity="0.12" />
        </pattern>
        {/* Concrete hatch for structural elements */}
        <pattern id="fp-concrete" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#000" strokeWidth="0.3" opacity="0.15" />
        </pattern>
      </defs>

      {/* Grid reference markers — architectural style with circles */}
      <GridRef x={fpX - 28} y={fpY + w / 2} label="A" />
      <GridRef x={fpX + w + 28} y={fpY + w / 2} label="B" />
      <GridRef x={fpX + w / 2} y={fpY - 32} label="1" />
      <GridRef x={fpX + w / 2} y={fpY + w + 38} label="2" />

      {/* Grid lines — thin dashed lines connecting grid refs to the building */}
      <line x1={fpX - 18} y1={fpY + w / 2} x2={fpX} y2={fpY + w / 2} stroke="#000" strokeWidth="0.3" strokeDasharray="1,2" />
      <line x1={fpX + w} y1={fpY + w / 2} x2={fpX + w + 18} y2={fpY + w / 2} stroke="#000" strokeWidth="0.3" strokeDasharray="1,2" />
      <line x1={fpX + w / 2} y1={fpY - 22} x2={fpX + w / 2} y2={fpY} stroke="#000" strokeWidth="0.3" strokeDasharray="1,2" />
      <line x1={fpX + w / 2} y1={fpY + w} x2={fpX + w / 2} y2={fpY + w + 28} stroke="#000" strokeWidth="0.3" strokeDasharray="1,2" />

      {/* Floor fill with tile pattern */}
      <rect x={fpX + wt} y={fpY + wt} width={w - wt * 2} height={w - wt * 2} fill="url(#fp-floor-tile)" />

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

      {/* Room type label + area — architectural convention: centered, uppercase */}
      {moduleTypeLabel && (
        <g>
          <text
            x={fpX + w / 2}
            y={fpY + w / 2 - 8}
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
            fill="#000"
            opacity="0.3"
            letterSpacing="2"
          >
            {moduleTypeLabel.toUpperCase()}
          </text>
          <text
            x={fpX + w / 2}
            y={fpY + w / 2 + 6}
            fontSize="9"
            textAnchor="middle"
            fill="#333"
            opacity="0.45"
          >
            {(INT / 1000 * INT / 1000).toFixed(2)} m&sup2;
          </text>
          {moduleLabel && (
            <text
              x={fpX + w / 2}
              y={fpY + w / 2 + 18}
              fontSize="7"
              textAnchor="middle"
              fill="#888"
              opacity="0.35"
              letterSpacing="1"
            >
              [{moduleLabel}]
            </text>
          )}
        </g>
      )}

      {/* ═══ DIMENSION ANNOTATIONS — architectural style with oblique ticks ═══ */}

      {/* Exterior horizontal dimension (top) — with proper tick marks */}
      <DimensionLine
        x1={fpX} y1={fpY - 14} x2={fpX + w} y2={fpY - 14}
        label="3 000" offset={-6} fontSize={9}
      />

      {/* Interior horizontal dimension */}
      <DimensionLine
        x1={fpX + wt} y1={fpY + wt + 14} x2={fpX + w - wt} y2={fpY + wt + 14}
        label={String(INT)} offset={12} fontSize={8} thin
      />

      {/* Exterior vertical dimension (left) */}
      <DimensionLine
        x1={fpX - 14} y1={fpY} x2={fpX - 14} y2={fpY + w}
        label="3 000" offset={-6} fontSize={9} vertical
      />

      {/* Wall thickness dimension — short callout on north wall */}
      <DimensionLine
        x1={fpX + w + 10} y1={fpY} x2={fpX + w + 10} y2={fpY + wt}
        label={`${WALL_THICKNESS * 1000}`} offset={6} fontSize={7} thin
      />

      {/* North arrow — proper architectural symbol */}
      <NorthArrow cx={fpX + w - 22} cy={fpY + 32} />

      {/* Material callout leaders */}
      <MaterialCallout
        fromX={fpX + w / 2} fromY={fpY + w - wt - 8}
        toX={fpX + w + 54} toY={fpY + w - 62}
        label={`${floorMat?.label || "Oak"} floor finish`}
      />
      <MaterialCallout
        fromX={fpX + 8} fromY={fpY + w / 2}
        toX={fpX + w + 54} toY={fpY + w - 40}
        label={`${wallMat?.label || "Alabaster"} wall finish`}
      />

      {/* Section cut line A-A — standard chain-dot pattern */}
      <line
        x1={fpX - 10} y1={fpY + w / 2}
        x2={fpX + w + 10} y2={fpY + w / 2}
        stroke="#000" strokeWidth="0.8" strokeDasharray="12,3,2,3"
      />
      {/* Section markers — filled triangles pointing in cutting direction */}
      <g>
        <polygon
          points={`${fpX - 16},${fpY + w / 2 - 5} ${fpX - 16},${fpY + w / 2 + 5} ${fpX - 10},${fpY + w / 2}`}
          fill="#000"
        />
        <text x={fpX - 20} y={fpY + w / 2 + 4} fontSize="10" fontWeight="bold" fill="#000" textAnchor="middle">A</text>
        <polygon
          points={`${fpX + w + 16},${fpY + w / 2 - 5} ${fpX + w + 16},${fpY + w / 2 + 5} ${fpX + w + 10},${fpY + w / 2}`}
          fill="#000"
        />
        <text x={fpX + w + 20} y={fpY + w / 2 + 4} fontSize="10" fontWeight="bold" fill="#000" textAnchor="middle">A</text>
      </g>

      {/* Finish level indicator — small swatch in corner */}
      <rect x={fpX + 6} y={fpY + 6} width={14} height={14} fill={wallColor} stroke="#000" strokeWidth="0.3" opacity="0.6" rx="1" />
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Grid Reference Marker — circle with label                        */
/* ═══════════════════════════════════════════════════════════════════ */

function GridRef({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="10" fill="none" stroke="#000" strokeWidth="0.7" />
      <text x={x} y={y + 4} fontSize="11" fontWeight="bold" fill="#000" textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  North Arrow — proper architectural symbol                         */
/* ═══════════════════════════════════════════════════════════════════ */

function NorthArrow({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* Circle */}
      <circle cx={cx} cy={cy} r="14" fill="none" stroke="#000" strokeWidth="0.5" />
      {/* Arrow shaft */}
      <line x1={cx} y1={cy + 10} x2={cx} y2={cy - 10} stroke="#000" strokeWidth="0.8" />
      {/* Arrowhead — half-filled */}
      <polygon points={`${cx},${cy - 13} ${cx - 4},${cy - 5} ${cx},${cy - 7}`} fill="#000" />
      <polygon points={`${cx},${cy - 13} ${cx + 4},${cy - 5} ${cx},${cy - 7}`} fill="none" stroke="#000" strokeWidth="0.5" />
      {/* N label */}
      <text x={cx} y={cy - 17} fontSize="8" fontWeight="bold" textAnchor="middle" fill="#000">N</text>
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Dimension Line — proper architectural annotation                  */
/* ═══════════════════════════════════════════════════════════════════ */

function DimensionLine({
  x1, y1, x2, y2, label, offset, fontSize = 9, vertical = false, thin = false,
}: {
  x1: number; y1: number; x2: number; y2: number;
  label: string; offset: number; fontSize?: number;
  vertical?: boolean; thin?: boolean;
}) {
  const sw = thin ? 0.3 : 0.5;
  const tickLen = thin ? 3 : 4;

  if (vertical) {
    return (
      <g>
        {/* Main dimension line */}
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000" strokeWidth={sw} />
        {/* Oblique tick marks — 45-degree slashes (architectural standard) */}
        <line x1={x1 - tickLen} y1={y1 - tickLen} x2={x1 + tickLen} y2={y1 + tickLen} stroke="#000" strokeWidth={sw} />
        <line x1={x2 - tickLen} y1={y2 - tickLen} x2={x2 + tickLen} y2={y2 + tickLen} stroke="#000" strokeWidth={sw} />
        {/* Label */}
        <text
          x={x1 + offset} y={(y1 + y2) / 2}
          fontSize={fontSize} textAnchor="middle" fill="#000"
          transform={`rotate(-90, ${x1 + offset}, ${(y1 + y2) / 2})`}
        >
          {label}
        </text>
      </g>
    );
  }

  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y1} stroke="#000" strokeWidth={sw} />
      {/* Oblique tick marks */}
      <line x1={x1 - tickLen} y1={y1 - tickLen} x2={x1 + tickLen} y2={y1 + tickLen} stroke="#000" strokeWidth={sw} />
      <line x1={x2 - tickLen} y1={y1 - tickLen} x2={x2 + tickLen} y2={y1 + tickLen} stroke="#000" strokeWidth={sw} />
      {/* Label */}
      <text x={(x1 + x2) / 2} y={y1 + offset} fontSize={fontSize} textAnchor="middle" fill="#000">
        {label}
      </text>
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Material Callout — leader line with dot and label                 */
/* ═══════════════════════════════════════════════════════════════════ */

function MaterialCallout({
  fromX, fromY, toX, toY, label,
}: {
  fromX: number; fromY: number; toX: number; toY: number; label: string;
}) {
  return (
    <g>
      <circle cx={fromX} cy={fromY} r="1.5" fill="#555" />
      <line x1={fromX} y1={fromY} x2={toX - 4} y2={toY} stroke="#555" strokeWidth="0.3" />
      <line x1={toX - 4} y1={toY} x2={toX + 60} y2={toY} stroke="#555" strokeWidth="0.3" />
      <text x={toX} y={toY - 3} fontSize="7" fill="#555">{label}</text>
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

  // ── None: no wall line ──
  if (wallType === "none") {
    return null;
  }

  // ── Shared: dotted center line with label ──
  if (wallType === "shared") {
    return (
      <g>
        {isH ? (
          <line
            x1={x} y1={y + thickness / 2}
            x2={x + length} y2={y + thickness / 2}
            stroke="#888" strokeWidth="0.6" strokeDasharray="2,4"
          />
        ) : (
          <line
            x1={x + thickness / 2} y1={y}
            x2={x + thickness / 2} y2={y + length}
            stroke="#888" strokeWidth="0.6" strokeDasharray="2,4"
          />
        )}
        {/* Shared wall label */}
        {isH ? (
          <text x={x + length / 2} y={y + thickness / 2 - 4} fontSize="5" textAnchor="middle" fill="#aaa" letterSpacing="0.5">SHARED</text>
        ) : (
          <text x={x + thickness / 2 + 8} y={y + length / 2} fontSize="5" fill="#aaa" letterSpacing="0.5" transform={`rotate(-90, ${x + thickness / 2 + 8}, ${y + length / 2})`}>SHARED</text>
        )}
      </g>
    );
  }

  // ── Solid wall: outer lines + insulation fill (architectural convention) ──
  if (wallType === "solid") {
    return (
      <g>
        {/* Outer boundary — thick line (cut line convention) */}
        <rect
          x={x} y={y}
          width={isH ? length : thickness}
          height={isH ? thickness : length}
          fill="#000" stroke="none"
        />
        {/* Inner fill showing insulation pattern */}
        <rect
          x={isH ? x + 1 : x + 1}
          y={isH ? y + 1 : y + 1}
          width={isH ? length - 2 : thickness - 2}
          height={isH ? thickness - 2 : length - 2}
          fill="url(#fp-insulation)"
        />
      </g>
    );
  }

  // ── Door: opening in center with proper architectural door swing arc ──
  if (wallType === "door") {
    const openingW = doorW;
    const gapStart = (length - openingW) / 2;
    const gapEnd = gapStart + openingW;

    return (
      <g>
        {isH ? (
          <>
            {/* Left wall segment */}
            <rect x={x} y={y} width={gapStart} height={thickness} fill="#000" />
            <rect x={x + 1} y={y + 1} width={gapStart - 2} height={thickness - 2} fill="url(#fp-insulation)" />
            {/* Right wall segment */}
            <rect x={x + gapEnd} y={y} width={length - gapEnd} height={thickness} fill="#000" />
            <rect x={x + gapEnd + 1} y={y + 1} width={length - gapEnd - 2} height={thickness - 2} fill="url(#fp-insulation)" />
            {/* Door threshold line */}
            <line x1={x + gapStart} y1={y + thickness / 2} x2={x + gapEnd} y2={y + thickness / 2} stroke="#000" strokeWidth="0.3" strokeDasharray="1,1" />
            {/* Door swing */}
            <DoorSwing2D
              doorX={x + gapStart}
              doorY={doorSwingSide === "top" ? y : y + thickness}
              doorWidth={openingW}
              swingDir={doorSwingSide === "top" ? "up" : "down"}
              orientation="horizontal"
            />
            {/* Opening dimension */}
            <text x={x + gapStart + openingW / 2} y={y + thickness + 10} fontSize="6" textAnchor="middle" fill="#555">900</text>
          </>
        ) : (
          <>
            {/* Top wall segment */}
            <rect x={x} y={y} width={thickness} height={gapStart} fill="#000" />
            <rect x={x + 1} y={y + 1} width={thickness - 2} height={gapStart - 2} fill="url(#fp-insulation)" />
            {/* Bottom wall segment */}
            <rect x={x} y={y + gapEnd} width={thickness} height={length - gapEnd} fill="#000" />
            <rect x={x + 1} y={y + gapEnd + 1} width={thickness - 2} height={length - gapEnd - 2} fill="url(#fp-insulation)" />
            {/* Door threshold line */}
            <line x1={x + thickness / 2} y1={y + gapStart} x2={x + thickness / 2} y2={y + gapEnd} stroke="#000" strokeWidth="0.3" strokeDasharray="1,1" />
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

  // ── Window: opening with proper architectural double-line glass representation ──
  if (wallType === "window") {
    const openingW = winW;
    const gapStart = (length - openingW) / 2;
    const gapEnd = gapStart + openingW;

    return (
      <g>
        {isH ? (
          <>
            {/* Left wall segment */}
            <rect x={x} y={y} width={gapStart} height={thickness} fill="#000" />
            <rect x={x + 1} y={y + 1} width={gapStart - 2} height={thickness - 2} fill="url(#fp-insulation)" />
            {/* Right wall segment */}
            <rect x={x + gapEnd} y={y} width={length - gapEnd} height={thickness} fill="#000" />
            <rect x={x + gapEnd + 1} y={y + 1} width={length - gapEnd - 2} height={thickness - 2} fill="url(#fp-insulation)" />
            {/* Window reveal lines (jambs) */}
            <line x1={x + gapStart} y1={y} x2={x + gapStart} y2={y + thickness} stroke="#000" strokeWidth="0.5" />
            <line x1={x + gapEnd} y1={y} x2={x + gapEnd} y2={y + thickness} stroke="#000" strokeWidth="0.5" />
            {/* Double glass lines — architectural convention */}
            <line x1={x + gapStart + 2} y1={y + thickness * 0.35} x2={x + gapEnd - 2} y2={y + thickness * 0.35} stroke="#4DA6FF" strokeWidth="1.2" />
            <line x1={x + gapStart + 2} y1={y + thickness * 0.65} x2={x + gapEnd - 2} y2={y + thickness * 0.65} stroke="#4DA6FF" strokeWidth="1.2" />
            {/* Center mullion */}
            <line x1={x + gapStart + openingW / 2} y1={y + thickness * 0.25} x2={x + gapStart + openingW / 2} y2={y + thickness * 0.75} stroke="#000" strokeWidth="0.3" />
            {/* Opening dimension */}
            <text x={x + gapStart + openingW / 2} y={y + thickness + 10} fontSize="6" textAnchor="middle" fill="#555">1200</text>
          </>
        ) : (
          <>
            {/* Top wall segment */}
            <rect x={x} y={y} width={thickness} height={gapStart} fill="#000" />
            <rect x={x + 1} y={y + 1} width={thickness - 2} height={gapStart - 2} fill="url(#fp-insulation)" />
            {/* Bottom wall segment */}
            <rect x={x} y={y + gapEnd} width={thickness} height={length - gapEnd} fill="#000" />
            <rect x={x + 1} y={y + gapEnd + 1} width={thickness - 2} height={length - gapEnd - 2} fill="url(#fp-insulation)" />
            {/* Window reveal lines */}
            <line x1={x} y1={y + gapStart} x2={x + thickness} y2={y + gapStart} stroke="#000" strokeWidth="0.5" />
            <line x1={x} y1={y + gapEnd} x2={x + thickness} y2={y + gapEnd} stroke="#000" strokeWidth="0.5" />
            {/* Double glass lines */}
            <line x1={x + thickness * 0.35} y1={y + gapStart + 2} x2={x + thickness * 0.35} y2={y + gapEnd - 2} stroke="#4DA6FF" strokeWidth="1.2" />
            <line x1={x + thickness * 0.65} y1={y + gapStart + 2} x2={x + thickness * 0.65} y2={y + gapEnd - 2} stroke="#4DA6FF" strokeWidth="1.2" />
            {/* Center mullion */}
            <line x1={x + thickness * 0.25} y1={y + gapStart + openingW / 2} x2={x + thickness * 0.75} y2={y + gapStart + openingW / 2} stroke="#000" strokeWidth="0.3" />
          </>
        )}
      </g>
    );
  }

  // Fallback: solid
  return (
    <rect x={x} y={y} width={isH ? length : thickness} height={isH ? thickness : length} fill="#000" stroke="none" />
  );
}

/* Door swing arc helper — proper architectural representation */
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
    if (swingDir === "up") {
      return (
        <g>
          {/* Door leaf — thin line from hinge point */}
          <line x1={doorX} y1={doorY} x2={doorX} y2={doorY - doorWidth} stroke="#000" strokeWidth="0.8" />
          {/* Swing arc — 90-degree quarter circle */}
          <path d={`M ${doorX} ${doorY - doorWidth} A ${doorWidth} ${doorWidth} 0 0 1 ${doorX + doorWidth} ${doorY}`} fill="none" stroke="#000" strokeWidth="0.4" />
        </g>
      );
    }
    return (
      <g>
        <line x1={doorX} y1={doorY} x2={doorX} y2={doorY + doorWidth} stroke="#000" strokeWidth="0.8" />
        <path d={`M ${doorX} ${doorY + doorWidth} A ${doorWidth} ${doorWidth} 0 0 0 ${doorX + doorWidth} ${doorY}`} fill="none" stroke="#000" strokeWidth="0.4" />
      </g>
    );
  }

  // Vertical wall door swing
  if (swingDir === "right") {
    return (
      <g>
        <line x1={doorX} y1={doorY} x2={doorX + doorWidth} y2={doorY} stroke="#000" strokeWidth="0.8" />
        <path d={`M ${doorX + doorWidth} ${doorY} A ${doorWidth} ${doorWidth} 0 0 1 ${doorX} ${doorY + doorWidth}`} fill="none" stroke="#000" strokeWidth="0.4" />
      </g>
    );
  }
  return (
    <g>
      <line x1={doorX} y1={doorY} x2={doorX - doorWidth} y2={doorY} stroke="#000" strokeWidth="0.8" />
      <path d={`M ${doorX - doorWidth} ${doorY} A ${doorWidth} ${doorWidth} 0 0 0 ${doorX} ${doorY + doorWidth}`} fill="none" stroke="#000" strokeWidth="0.4" />
    </g>
  );
}
