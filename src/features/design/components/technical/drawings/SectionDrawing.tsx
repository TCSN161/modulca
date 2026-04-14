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

  // Section A-A cuts through the module laterally, showing west (left) and east (right) walls
  const westWall = wallConfigs?.west ?? "solid";
  const eastWall = wallConfigs?.east ?? "solid";

  return (
    <g>
      {/* Foundation/base */}
      <rect x={secX - 15} y={baseY} width={sw + 30} height={12} fill="#999" stroke="#000" strokeWidth="0.5" />
      <g opacity="0.3">
        {Array.from({ length: 18 }).map((_, i) => (
          <line key={`fnd-${i}`} x1={secX - 15 + i * ((sw + 30) / 18)} y1={baseY} x2={secX - 15 + i * ((sw + 30) / 18) - 7} y2={baseY + 12} stroke="#000" strokeWidth="0.3" />
        ))}
      </g>

      {/* Floor slab */}
      <rect x={secX} y={baseY - floorSlabH} width={sw} height={floorSlabH} fill="#ccc" stroke="#000" strokeWidth="1.5" />
      <g opacity="0.2">
        {Array.from({ length: 30 }).map((_, i) => (
          <line key={`fs-${i}`} x1={secX + i * (sw / 30)} y1={baseY - floorSlabH} x2={secX + i * (sw / 30) + floorSlabH} y2={baseY} stroke="#000" strokeWidth="0.3" />
        ))}
      </g>

      {/* Floor finish layer */}
      <rect x={secX + wallThickPx} y={baseY - floorSlabH - floorFinishH} width={sw - wallThickPx * 2} height={floorFinishH} fill={floorColor} opacity="0.5" stroke="#000" strokeWidth="0.3" />
      <text x={secX + sw / 2} y={baseY - floorSlabH - floorFinishH / 2 + 3} fontSize="6" textAnchor="middle" fill="#333">
        {floorMat?.label || "Floor Finish"}
      </text>

      {/* LEFT wall (West) */}
      <SectionWall
        wallType={westWall}
        x={secX}
        y={baseY - floorSlabH - ceilH}
        width={wallThickPx}
        height={ceilH + floorSlabH}
      />

      {/* RIGHT wall (East) */}
      <SectionWall
        wallType={eastWall}
        x={secX + sw - wallThickPx}
        y={baseY - floorSlabH - ceilH}
        width={wallThickPx}
        height={ceilH + floorSlabH}
      />

      {/* Ceiling slab */}
      <rect x={secX} y={baseY - floorSlabH - ceilH - floorSlabH} width={sw} height={floorSlabH} fill="#ccc" stroke="#000" strokeWidth="1.5" />

      {/* Roof insulation */}
      <rect x={secX} y={baseY - floorSlabH - ceilH - floorSlabH - insulH} width={sw} height={insulH} fill="#FFE4B5" opacity="0.5" stroke="#000" strokeWidth="0.5" />
      <text x={secX + sw / 2} y={baseY - floorSlabH - ceilH - floorSlabH - insulH / 2 + 3} fontSize="6" textAnchor="middle" fill="#666">Insulation 100mm</text>

      {/* Interior space */}
      <rect x={secX + wallThickPx} y={baseY - floorSlabH - ceilH} width={sw - wallThickPx * 2} height={ceilH} fill={wallColor} opacity="0.1" />

      {/* Ground line */}
      <line x1={secX - 30} y1={baseY + 12} x2={secX + sw + 30} y2={baseY + 12} stroke="#000" strokeWidth="0.5" />
      {Array.from({ length: 22 }).map((_, i) => (
        <line key={`gnd-sec-${i}`} x1={secX - 30 + i * ((sw + 60) / 22)} y1={baseY + 12} x2={secX - 30 + i * ((sw + 60) / 22) - 8} y2={baseY + 20} stroke="#000" strokeWidth="0.3" />
      ))}

      {/* Height dimension - floor to ceiling */}
      {(() => {
        const dx = secX + sw + 25;
        const y1 = baseY - floorSlabH;
        const y2 = baseY - floorSlabH - ceilH;
        return (
          <g>
            <line x1={dx} y1={y1} x2={dx} y2={y2} stroke="#000" strokeWidth="0.5" />
            <line x1={dx - 4} y1={y1} x2={dx + 4} y2={y1} stroke="#000" strokeWidth="0.5" />
            <line x1={dx - 4} y1={y2} x2={dx + 4} y2={y2} stroke="#000" strokeWidth="0.5" />
            <text x={dx + 8} y={(y1 + y2) / 2 + 3} fontSize="9" fill="#000">2700</text>
          </g>
        );
      })()}

      {/* Total height dimension */}
      {(() => {
        const dx = secX + sw + 55;
        const y1 = baseY;
        const y2 = baseY - floorSlabH - ceilH - floorSlabH - insulH;
        return (
          <g>
            <line x1={dx} y1={y1} x2={dx} y2={y2} stroke="#000" strokeWidth="0.5" />
            <line x1={dx - 4} y1={y1} x2={dx + 4} y2={y1} stroke="#000" strokeWidth="0.5" />
            <line x1={dx - 4} y1={y2} x2={dx + 4} y2={y2} stroke="#000" strokeWidth="0.5" />
            <text x={dx + 8} y={(y1 + y2) / 2 + 3} fontSize="9" fill="#000">{TOTAL_H + 100 + FLOOR_SLAB}</text>
          </g>
        );
      })()}

      {/* Floor level mark */}
      <text x={secX - 28} y={baseY - floorSlabH + 4} fontSize="8" fill="#000" textAnchor="end">±0.00</text>
      <line x1={secX - 22} y1={baseY - floorSlabH} x2={secX} y2={baseY - floorSlabH} stroke="#000" strokeWidth="0.3" strokeDasharray="2,1" />
    </g>
  );
}

/* ── Section wall helper: renders left/right wall based on type ── */
function SectionWall({
  wallType,
  x, y,
  width,
  height,
}: {
  wallType: WallType;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  if (wallType === "none" || wallType === "shared") {
    // No wall or shared — dashed outline only
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill="none" stroke="#999" strokeWidth="0.5" strokeDasharray="4,3" />
        <text
          x={x + width / 2}
          y={y + height / 2}
          fontSize="6"
          textAnchor="middle"
          fill="#aaa"
          transform={`rotate(-90, ${x + width / 2}, ${y + height / 2})`}
        >
          {wallType === "shared" ? "shared" : "open"}
        </text>
      </g>
    );
  }

  if (wallType === "window") {
    // Wall with window opening in section
    const winTop = y + height * 0.3;
    const winBottom = y + height * 0.7;
    return (
      <g>
        {/* Wall above window */}
        <rect x={x} y={y} width={width} height={winTop - y} fill="#555" stroke="#000" strokeWidth="2" />
        {/* Wall below window */}
        <rect x={x} y={winBottom} width={width} height={y + height - winBottom} fill="#555" stroke="#000" strokeWidth="2" />
        {/* Window glass */}
        <rect x={x} y={winTop} width={width} height={winBottom - winTop} fill="#D4E6F1" opacity="0.3" stroke="#000" strokeWidth="1" />
        {/* Section hatching on solid parts */}
        <SectionHatch x={x} y={y} width={width} height={winTop - y} />
        <SectionHatch x={x} y={winBottom} width={width} height={y + height - winBottom} />
      </g>
    );
  }

  if (wallType === "door") {
    // Wall with door opening in section
    const doorTop = y + height * 0.28; // door takes ~72% of wall height
    return (
      <g>
        {/* Wall above door */}
        <rect x={x} y={y} width={width} height={doorTop - y} fill="#555" stroke="#000" strokeWidth="2" />
        {/* Door opening */}
        <rect x={x} y={doorTop} width={width} height={y + height - doorTop} fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="3,2" />
        <SectionHatch x={x} y={y} width={width} height={doorTop - y} />
      </g>
    );
  }

  // Solid wall
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill="#555" stroke="#000" strokeWidth="2" />
      <SectionHatch x={x} y={y} width={width} height={height} />
    </g>
  );
}

/* ── Section hatching pattern ── */
function SectionHatch({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
  return (
    <>
      <defs>
        <pattern id="wall-hatch-sec" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="#fff" strokeWidth="0.5" opacity="0.4" />
        </pattern>
      </defs>
      <rect x={x} y={y} width={width} height={height} fill="url(#wall-hatch-sec)" />
    </>
  );
}
