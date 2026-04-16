import {
  WALL_THICKNESS,
  EXT,
  CEIL_H,
  FLOOR_SLAB,
  TOTAL_H,
  type FloorMat,
} from "../drawingConstants";
import type { WallConfigs, WallType } from "../../../store";

interface SectionAAProps {
  floorColor: string;
  wallColor: string;
  floorMat: FloorMat;
  wallConfigs?: WallConfigs;
}

export default function SectionAADrawing({ floorColor, wallColor, floorMat, wallConfigs }: SectionAAProps) {
  const secS = 500 / 3000;
  const secX = (800 - EXT * secS) / 2;
  const sw = EXT * secS;
  const hScale = 450 / TOTAL_H;
  const baseY = 720;

  const floorSlabH = FLOOR_SLAB * hScale;
  const ceilH = CEIL_H * hScale;
  const wallThickPx = WALL_THICKNESS * 1000 * secS;
  const insulH = 100 * hScale;
  const floorFinishH = 20 * hScale;
  const roofMembraneH = 8 * hScale;

  // Section A-A cuts through the module laterally, showing west (left) and east (right) walls
  const westWall = wallConfigs?.west ?? "solid";
  const eastWall = wallConfigs?.east ?? "solid";

  return (
    <g>
      {/* ═══ SVG Defs for hatching patterns ═══ */}
      <defs>
        {/* CLT / timber structural hatching — diagonal cross-hatch */}
        <pattern id="sec-clt-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#000" strokeWidth="0.4" opacity="0.35" />
        </pattern>
        {/* Concrete hatching — dots/stipple pattern */}
        <pattern id="sec-concrete" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.4" fill="#000" opacity="0.25" />
          <circle cx="3" cy="3" r="0.3" fill="#000" opacity="0.2" />
        </pattern>
        {/* Insulation — zigzag pattern */}
        <pattern id="sec-insulation" width="10" height="6" patternUnits="userSpaceOnUse">
          <path d="M0,3 L2.5,0 L5,3 L7.5,0 L10,3" fill="none" stroke="#666" strokeWidth="0.3" />
          <path d="M0,6 L2.5,3 L5,6 L7.5,3 L10,6" fill="none" stroke="#666" strokeWidth="0.3" />
        </pattern>
        {/* Earth/ground hatching */}
        <pattern id="sec-earth" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
          <line x1="0" y1="4" x2="8" y2="4" stroke="#000" strokeWidth="0.3" opacity="0.2" />
          <line x1="2" y1="0" x2="2" y2="8" stroke="#000" strokeWidth="0.15" opacity="0.1" />
        </pattern>
        {/* EPDM membrane */}
        <pattern id="sec-epdm" width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill="#444" opacity="0.4" />
        </pattern>
      </defs>

      {/* ═══ FOUNDATION / BASE ═══ */}
      {/* Ground fill below foundation */}
      <rect x={secX - 25} y={baseY + 12} width={sw + 50} height={30} fill="url(#sec-earth)" />

      {/* Foundation pad */}
      <rect x={secX - 15} y={baseY} width={sw + 30} height={12} fill="#bbb" stroke="#000" strokeWidth="1" />
      <rect x={secX - 15} y={baseY} width={sw + 30} height={12} fill="url(#sec-concrete)" />

      {/* ═══ FLOOR SLAB ═══ */}
      <rect x={secX} y={baseY - floorSlabH} width={sw} height={floorSlabH} fill="#ccc" stroke="#000" strokeWidth="1.5" />
      <rect x={secX} y={baseY - floorSlabH} width={sw} height={floorSlabH} fill="url(#sec-concrete)" />
      {/* Slab label */}
      <text x={secX + sw / 2} y={baseY - floorSlabH / 2 + 3} fontSize="6" textAnchor="middle" fill="#333" fontWeight="bold">
        REINFORCED CONCRETE SLAB {FLOOR_SLAB}mm
      </text>

      {/* ═══ FLOOR FINISH LAYER ═══ */}
      <rect x={secX + wallThickPx} y={baseY - floorSlabH - floorFinishH} width={sw - wallThickPx * 2} height={floorFinishH} fill={floorColor} opacity="0.5" stroke="#000" strokeWidth="0.5" />
      <text x={secX + sw / 2} y={baseY - floorSlabH - floorFinishH / 2 + 2} fontSize="5" textAnchor="middle" fill="#333">
        {floorMat?.label || "Floor Finish"} 20mm
      </text>

      {/* ═══ LEFT WALL (West) ═══ */}
      <SectionWall
        wallType={westWall}
        x={secX}
        y={baseY - floorSlabH - ceilH}
        width={wallThickPx}
        height={ceilH + floorSlabH}
        side="left"
      />

      {/* ═══ RIGHT WALL (East) ═══ */}
      <SectionWall
        wallType={eastWall}
        x={secX + sw - wallThickPx}
        y={baseY - floorSlabH - ceilH}
        width={wallThickPx}
        height={ceilH + floorSlabH}
        side="right"
      />

      {/* ═══ CEILING SLAB ═══ */}
      <rect x={secX} y={baseY - floorSlabH - ceilH - floorSlabH} width={sw} height={floorSlabH} fill="#ccc" stroke="#000" strokeWidth="1.5" />
      <rect x={secX} y={baseY - floorSlabH - ceilH - floorSlabH} width={sw} height={floorSlabH} fill="url(#sec-concrete)" />
      <text x={secX + sw / 2} y={baseY - floorSlabH - ceilH - floorSlabH / 2 + 3} fontSize="6" textAnchor="middle" fill="#333" fontWeight="bold">
        CEILING SLAB {FLOOR_SLAB}mm
      </text>

      {/* ═══ ROOF INSULATION ═══ */}
      <rect x={secX - 4} y={baseY - floorSlabH - ceilH - floorSlabH - insulH} width={sw + 8} height={insulH} fill="#FFE4B5" opacity="0.4" stroke="#000" strokeWidth="0.5" />
      <rect x={secX - 4} y={baseY - floorSlabH - ceilH - floorSlabH - insulH} width={sw + 8} height={insulH} fill="url(#sec-insulation)" />
      <text x={secX + sw / 2} y={baseY - floorSlabH - ceilH - floorSlabH - insulH / 2 + 3} fontSize="5" textAnchor="middle" fill="#555">
        MINERAL WOOL INSULATION 100mm
      </text>

      {/* ═══ EPDM ROOF MEMBRANE ═══ */}
      <rect x={secX - 6} y={baseY - floorSlabH - ceilH - floorSlabH - insulH - roofMembraneH} width={sw + 12} height={roofMembraneH} fill="url(#sec-epdm)" stroke="#000" strokeWidth="0.5" />

      {/* ═══ INTERIOR SPACE ═══ */}
      <rect x={secX + wallThickPx} y={baseY - floorSlabH - ceilH} width={sw - wallThickPx * 2} height={ceilH} fill={wallColor} opacity="0.06" />
      {/* Interior space label */}
      <text x={secX + sw / 2} y={baseY - floorSlabH - ceilH / 2 + 4} fontSize="9" textAnchor="middle" fill="#999" letterSpacing="3">
        INTERIOR SPACE
      </text>

      {/* ═══ GROUND LINE ═══ */}
      <line x1={secX - 40} y1={baseY + 12} x2={secX + sw + 40} y2={baseY + 12} stroke="#000" strokeWidth="0.8" />
      {/* Ground hatching */}
      {Array.from({ length: 24 }).map((_, i) => (
        <line key={`gnd-sec-${i}`} x1={secX - 40 + i * ((sw + 80) / 24)} y1={baseY + 12} x2={secX - 40 + i * ((sw + 80) / 24) - 8} y2={baseY + 22} stroke="#000" strokeWidth="0.3" />
      ))}

      {/* ═══ DIMENSION ANNOTATIONS ═══ */}

      {/* Ceiling height dimension (right side) */}
      {(() => {
        const dx = secX + sw + 30;
        const y1 = baseY - floorSlabH;
        const y2 = baseY - floorSlabH - ceilH;
        return (
          <g>
            {/* Extension lines */}
            <line x1={secX + sw + 5} y1={y1} x2={dx + 5} y2={y1} stroke="#000" strokeWidth="0.3" />
            <line x1={secX + sw + 5} y1={y2} x2={dx + 5} y2={y2} stroke="#000" strokeWidth="0.3" />
            {/* Dimension line */}
            <line x1={dx} y1={y1} x2={dx} y2={y2} stroke="#000" strokeWidth="0.5" />
            {/* Oblique ticks */}
            <line x1={dx - 3} y1={y1 - 3} x2={dx + 3} y2={y1 + 3} stroke="#000" strokeWidth="0.5" />
            <line x1={dx - 3} y1={y2 - 3} x2={dx + 3} y2={y2 + 3} stroke="#000" strokeWidth="0.5" />
            <text x={dx + 10} y={(y1 + y2) / 2 + 3} fontSize="8" fill="#000">2 700</text>
          </g>
        );
      })()}

      {/* Total height dimension (far right) */}
      {(() => {
        const dx = secX + sw + 62;
        const y1 = baseY;
        const y2 = baseY - floorSlabH - ceilH - floorSlabH - insulH - roofMembraneH;
        return (
          <g>
            <line x1={secX + sw + 5} y1={y1} x2={dx + 5} y2={y1} stroke="#000" strokeWidth="0.2" />
            <line x1={secX + sw + 5} y1={y2} x2={dx + 5} y2={y2} stroke="#000" strokeWidth="0.2" />
            <line x1={dx} y1={y1} x2={dx} y2={y2} stroke="#000" strokeWidth="0.5" />
            <line x1={dx - 3} y1={y1 - 3} x2={dx + 3} y2={y1 + 3} stroke="#000" strokeWidth="0.5" />
            <line x1={dx - 3} y1={y2 - 3} x2={dx + 3} y2={y2 + 3} stroke="#000" strokeWidth="0.5" />
            <text x={dx + 10} y={(y1 + y2) / 2 + 3} fontSize="8" fill="#000">
              {TOTAL_H + 100 + FLOOR_SLAB + Math.round(8)}
            </text>
          </g>
        );
      })()}

      {/* Floor slab thickness */}
      {(() => {
        const dx = secX - 35;
        const y1 = baseY - floorSlabH;
        const y2 = baseY;
        return (
          <g>
            <line x1={secX - 5} y1={y1} x2={dx - 5} y2={y1} stroke="#000" strokeWidth="0.2" />
            <line x1={secX - 5} y1={y2} x2={dx - 5} y2={y2} stroke="#000" strokeWidth="0.2" />
            <line x1={dx} y1={y1} x2={dx} y2={y2} stroke="#000" strokeWidth="0.4" />
            <line x1={dx - 2} y1={y1 - 2} x2={dx + 2} y2={y1 + 2} stroke="#000" strokeWidth="0.4" />
            <line x1={dx - 2} y1={y2 - 2} x2={dx + 2} y2={y2 + 2} stroke="#000" strokeWidth="0.4" />
            <text x={dx - 5} y={(y1 + y2) / 2 + 3} fontSize="7" fill="#000" textAnchor="end">{FLOOR_SLAB}</text>
          </g>
        );
      })()}

      {/* ═══ LEVEL MARKS — architectural standard ═══ */}
      <LevelMark x={secX - 45} y={baseY - floorSlabH} label="±0.000" />
      <LevelMark x={secX - 45} y={baseY - floorSlabH - ceilH} label="+2.700" />
      <LevelMark x={secX - 45} y={baseY} label="-0.200" />

      {/* ═══ WIDTH DIMENSION (bottom) ═══ */}
      {(() => {
        const dy = baseY + 35;
        return (
          <g>
            <line x1={secX} y1={baseY + 22} x2={secX} y2={dy + 5} stroke="#000" strokeWidth="0.2" />
            <line x1={secX + sw} y1={baseY + 22} x2={secX + sw} y2={dy + 5} stroke="#000" strokeWidth="0.2" />
            <line x1={secX} y1={dy} x2={secX + sw} y2={dy} stroke="#000" strokeWidth="0.5" />
            <line x1={secX - 3} y1={dy - 3} x2={secX + 3} y2={dy + 3} stroke="#000" strokeWidth="0.5" />
            <line x1={secX + sw - 3} y1={dy - 3} x2={secX + sw + 3} y2={dy + 3} stroke="#000" strokeWidth="0.5" />
            <text x={secX + sw / 2} y={dy - 5} fontSize="9" textAnchor="middle" fill="#000">3 000</text>
          </g>
        );
      })()}

      {/* ═══ MATERIAL CALLOUTS ═══ */}
      {/* Wall callout */}
      <g>
        <circle cx={secX + wallThickPx / 2} cy={baseY - floorSlabH - ceilH * 0.6} r="1.5" fill="#555" />
        <line x1={secX + wallThickPx / 2} y1={baseY - floorSlabH - ceilH * 0.6} x2={secX - 60} y2={baseY - floorSlabH - ceilH * 0.75} stroke="#555" strokeWidth="0.3" />
        <line x1={secX - 60} y1={baseY - floorSlabH - ceilH * 0.75} x2={secX - 100} y2={baseY - floorSlabH - ceilH * 0.75} stroke="#555" strokeWidth="0.3" />
        <text x={secX - 100} y={baseY - floorSlabH - ceilH * 0.75 - 3} fontSize="6" fill="#555">CLT Wall Panel</text>
        <text x={secX - 100} y={baseY - floorSlabH - ceilH * 0.75 + 6} fontSize="5" fill="#888">+ Insulation + Cladding</text>
      </g>
    </g>
  );
}

/* ── Level mark — architectural triangle marker ── */
function LevelMark({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      {/* Triangle pointing right */}
      <polygon points={`${x + 8},${y} ${x},${y - 4} ${x},${y + 4}`} fill="#000" />
      {/* Dashed extension line */}
      <line x1={x + 8} y1={y} x2={x + 20} y2={y} stroke="#000" strokeWidth="0.3" strokeDasharray="1,1" />
      {/* Label */}
      <text x={x - 2} y={y + 4} fontSize="7" fill="#000" textAnchor="end">{label}</text>
    </g>
  );
}

/* ── Section wall helper: renders left/right wall in section view ── */
function SectionWall({
  wallType,
  x, y,
  width,
  height,
  side,
}: {
  wallType: WallType;
  x: number;
  y: number;
  width: number;
  height: number;
  side: "left" | "right";
}) {
  if (wallType === "none" || wallType === "shared") {
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill="none" stroke="#888" strokeWidth="0.5" strokeDasharray="4,3" />
        <text
          x={x + width / 2}
          y={y + height / 2}
          fontSize="5"
          textAnchor="middle"
          fill="#aaa"
          letterSpacing="0.5"
          transform={`rotate(-90, ${x + width / 2}, ${y + height / 2})`}
        >
          {wallType === "shared" ? "SHARED" : "OPEN"}
        </text>
      </g>
    );
  }

  if (wallType === "window") {
    const winTop = y + height * 0.3;
    const winBottom = y + height * 0.7;
    return (
      <g>
        {/* Wall above window — CLT with hatching */}
        <rect x={x} y={y} width={width} height={winTop - y} fill="#555" stroke="#000" strokeWidth="1.5" />
        <rect x={x} y={y} width={width} height={winTop - y} fill="url(#sec-clt-hatch)" />
        {/* Wall below window (sill) */}
        <rect x={x} y={winBottom} width={width} height={y + height - winBottom} fill="#555" stroke="#000" strokeWidth="1.5" />
        <rect x={x} y={winBottom} width={width} height={y + height - winBottom} fill="url(#sec-clt-hatch)" />
        {/* Window opening — double glass line */}
        <rect x={x} y={winTop} width={width} height={winBottom - winTop} fill="#D4E6F1" opacity="0.2" stroke="#000" strokeWidth="0.8" />
        <line x1={x + width * 0.4} y1={winTop} x2={x + width * 0.4} y2={winBottom} stroke="#4DA6FF" strokeWidth="0.8" />
        <line x1={x + width * 0.6} y1={winTop} x2={x + width * 0.6} y2={winBottom} stroke="#4DA6FF" strokeWidth="0.8" />
        {/* Sill detail */}
        <line x1={x - 3} y1={winBottom} x2={x + width + 3} y2={winBottom} stroke="#000" strokeWidth="0.5" />
        {/* Window height annotation */}
        <WindowHeightAnnotation x={x} width={width} winTop={winTop} winBottom={winBottom} side={side} />
      </g>
    );
  }

  if (wallType === "door") {
    const doorTop = y + height * 0.28;
    return (
      <g>
        {/* Wall above door — lintel with CLT hatching */}
        <rect x={x} y={y} width={width} height={doorTop - y} fill="#555" stroke="#000" strokeWidth="1.5" />
        <rect x={x} y={y} width={width} height={doorTop - y} fill="url(#sec-clt-hatch)" />
        {/* Door opening */}
        <rect x={x} y={doorTop} width={width} height={y + height - doorTop} fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="3,2" />
        {/* Lintel detail — thicker bottom edge */}
        <line x1={x - 2} y1={doorTop} x2={x + width + 2} y2={doorTop} stroke="#000" strokeWidth="1" />
      </g>
    );
  }

  // Solid wall — full CLT section with proper hatching
  return (
    <g>
      {/* Outer boundary — cut line weight */}
      <rect x={x} y={y} width={width} height={height} fill="#555" stroke="#000" strokeWidth="1.5" />
      {/* CLT timber hatching — diagonal lines */}
      <rect x={x} y={y} width={width} height={height} fill="url(#sec-clt-hatch)" />
      {/* Inner subdivision showing layers */}
      {width > 15 && (
        <>
          {/* Outer cladding zone */}
          <line
            x1={side === "left" ? x + width * 0.25 : x + width * 0.75}
            y1={y}
            x2={side === "left" ? x + width * 0.25 : x + width * 0.75}
            y2={y + height}
            stroke="#000" strokeWidth="0.3" strokeDasharray="2,3"
          />
          {/* Inner plasterboard zone */}
          <line
            x1={side === "left" ? x + width * 0.8 : x + width * 0.2}
            y1={y}
            x2={side === "left" ? x + width * 0.8 : x + width * 0.2}
            y2={y + height}
            stroke="#000" strokeWidth="0.2" strokeDasharray="1,2"
          />
        </>
      )}
    </g>
  );
}

/* ── Window height annotation for section view ── */
function WindowHeightAnnotation({
  x, width, winTop, winBottom, side,
}: {
  x: number; width: number; winTop: number; winBottom: number; side: "left" | "right";
}) {
  const annotX = side === "left" ? x - 12 : x + width + 12;
  return (
    <g>
      <line x1={annotX} y1={winTop} x2={annotX} y2={winBottom} stroke="#000" strokeWidth="0.3" />
      <line x1={annotX - 2} y1={winTop - 2} x2={annotX + 2} y2={winTop + 2} stroke="#000" strokeWidth="0.3" />
      <line x1={annotX - 2} y1={winBottom - 2} x2={annotX + 2} y2={winBottom + 2} stroke="#000" strokeWidth="0.3" />
      <text
        x={annotX + (side === "left" ? -4 : 4)}
        y={(winTop + winBottom) / 2 + 3}
        fontSize="6" fill="#555"
        textAnchor={side === "left" ? "end" : "start"}
      >
        1200
      </text>
    </g>
  );
}
