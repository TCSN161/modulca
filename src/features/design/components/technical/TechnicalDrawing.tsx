"use client";

import { MODULE_TYPES } from "@/shared/types";
import { getPreset, FLOOR_MATERIALS, WALL_MATERIALS } from "../../layouts";
import type { ModuleConfig } from "../../store";

const WALL_THICKNESS = 0.3; // meters
const EXT = 3000; // exterior in mm
const INT = EXT - WALL_THICKNESS * 2 * 1000; // interior in mm = 2400
const CEIL_H = 2700; // mm
const FLOOR_SLAB = 200; // mm
const TOTAL_H = CEIL_H + FLOOR_SLAB; // 2900mm

interface Props {
  module: ModuleConfig;
  drawingType: string;
  projectName?: string;
}

/* ─── Drawing type label map ─── */
const DRAWING_LABELS: Record<string, string> = {
  "floor-plan": "FLOOR PLAN",
  "section-aa": "SECTION A-A",
  "front-elevation": "FRONT ELEVATION",
  "wall-detail": "WALL CORNER DETAIL",
  "mep-plan": "MEP PLAN",
  "foundation-detail": "FOUNDATION DETAIL",
};

const DRAWING_SCALES: Record<string, string> = {
  "floor-plan": "1:25",
  "section-aa": "1:25",
  "front-elevation": "1:25",
  "wall-detail": "1:5",
  "mep-plan": "1:25",
  "foundation-detail": "1:10",
};

export default function TechnicalDrawing({
  module,
  drawingType,
  projectName = "ModulCA Project",
}: Props) {
  const preset = getPreset(module.moduleType, module.layoutPreset);
  const moduleType = MODULE_TYPES.find((mt) => mt.id === module.moduleType);
  const floorMat = FLOOR_MATERIALS.find((f) => f.id === module.floorFinish);
  const wallMat = WALL_MATERIALS.find((w) => w.id === module.wallColor);
  const floorColor = floorMat?.color || "#D4A76A";
  const wallColor = wallMat?.color || "#F0EDE5";

  const today = new Date().toISOString().split("T")[0];
  const drawingLabel = DRAWING_LABELS[drawingType] || "FLOOR PLAN";
  const scaleLabel = DRAWING_SCALES[drawingType] || "1:25";

  return (
    <svg
      viewBox="0 0 800 900"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ fontFamily: "'Courier New', monospace" }}
    >
      {/* White background */}
      <rect width="800" height="900" fill="white" />

      {/* Drawing border */}
      <rect
        x="10"
        y="10"
        width="780"
        height="880"
        fill="none"
        stroke="#000"
        strokeWidth="1.5"
      />
      <rect
        x="15"
        y="15"
        width="770"
        height="870"
        fill="none"
        stroke="#000"
        strokeWidth="0.5"
      />

      {/* Drawing title & scale */}
      <text x={40} y={45} fontSize="14" fontWeight="bold" fill="#000">
        {drawingLabel}
      </text>
      <text x={40} y={60} fontSize="9" fill="#666">
        Scale {scaleLabel}
      </text>

      {/* ─── Render one drawing based on drawingType ─── */}
      {drawingType === "floor-plan" && (
        <FloorPlanDrawing
          floorColor={floorColor}
          wallColor={wallColor}
          floorMat={floorMat}
          wallMat={wallMat}
          preset={preset}
        />
      )}
      {drawingType === "section-aa" && (
        <SectionAADrawing
          floorColor={floorColor}
          wallColor={wallColor}
          floorMat={floorMat}
        />
      )}
      {drawingType === "front-elevation" && (
        <FrontElevationDrawing wallColor={wallColor} wallMat={wallMat} />
      )}
      {drawingType === "wall-detail" && (
        <WallDetailDrawing wallColor={wallColor} />
      )}
      {drawingType === "mep-plan" && <MEPPlanDrawing />}
      {drawingType === "foundation-detail" && <FoundationDetailDrawing />}

      {/* ═══════════ TITLE BLOCK (bottom) ═══════════ */}
      <g>
        <rect
          x="570"
          y="800"
          width="215"
          height="80"
          fill="none"
          stroke="#000"
          strokeWidth="1.5"
        />
        {/* Dividers */}
        <line
          x1="570"
          y1="820"
          x2="785"
          y2="820"
          stroke="#000"
          strokeWidth="0.5"
        />
        <line
          x1="570"
          y1="840"
          x2="785"
          y2="840"
          stroke="#000"
          strokeWidth="0.5"
        />
        <line
          x1="570"
          y1="860"
          x2="785"
          y2="860"
          stroke="#000"
          strokeWidth="0.5"
        />
        <line
          x1="680"
          y1="840"
          x2="680"
          y2="880"
          stroke="#000"
          strokeWidth="0.5"
        />

        {/* Project name */}
        <text x="578" y="814" fontSize="9" fontWeight="bold" fill="#1B3A4B">
          {projectName}
        </text>

        {/* Module label */}
        <text x="578" y="834" fontSize="8" fill="#000">
          {module.label} — {moduleType?.label || module.moduleType}
        </text>

        {/* Drawing type & scale */}
        <text x="578" y="854" fontSize="7" fill="#555">
          {drawingLabel} — Scale: {scaleLabel}
        </text>
        <text x="688" y="854" fontSize="7" fill="#555">
          Sheet: A3
        </text>

        {/* Date & drawing number */}
        <text x="578" y="874" fontSize="7" fill="#555">
          Date: {today}
        </text>
        <text x="688" y="874" fontSize="7" fill="#555">
          Dwg: MCA-{module.label}-01
        </text>
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FLOOR PLAN — full SVG area
   ═══════════════════════════════════════════════════════════════════════════ */

interface FloorPlanProps {
  floorColor: string;
  wallColor: string;
  floorMat: ReturnType<typeof FLOOR_MATERIALS.find>;
  wallMat: ReturnType<typeof WALL_MATERIALS.find>;
  preset: ReturnType<typeof getPreset>;
}

function FloorPlanDrawing({
  floorColor,
  wallColor,
  floorMat,
  wallMat,
  preset,
}: FloorPlanProps) {
  // Centered in the drawing area (800 wide, 700 tall usable area from y=70..770)
  const S = 550 / 3000; // scale: map 3000mm to ~550px
  const fpX = (800 - EXT * S) / 2; // center horizontally
  const fpY = 100; // top with space for title

  return (
    <g>
      {/* Grid reference markers */}
      <text
        x={fpX - 22}
        y={fpY + (EXT * S) / 2 + 3}
        fontSize="12"
        fontWeight="bold"
        fill="#000"
        textAnchor="middle"
      >
        A
      </text>
      <text
        x={fpX + EXT * S + 22}
        y={fpY + (EXT * S) / 2 + 3}
        fontSize="12"
        fontWeight="bold"
        fill="#000"
        textAnchor="middle"
      >
        B
      </text>
      <text
        x={fpX + (EXT * S) / 2}
        y={fpY - 25}
        fontSize="12"
        fontWeight="bold"
        fill="#000"
        textAnchor="middle"
      >
        1
      </text>
      <text
        x={fpX + (EXT * S) / 2}
        y={fpY + EXT * S + 35}
        fontSize="12"
        fontWeight="bold"
        fill="#000"
        textAnchor="middle"
      >
        2
      </text>

      {/* Grid circles */}
      <circle
        cx={fpX - 22}
        cy={fpY + (EXT * S) / 2}
        r="9"
        fill="none"
        stroke="#000"
        strokeWidth="0.5"
      />
      <circle
        cx={fpX + EXT * S + 22}
        cy={fpY + (EXT * S) / 2}
        r="9"
        fill="none"
        stroke="#000"
        strokeWidth="0.5"
      />
      <circle
        cx={fpX + (EXT * S) / 2}
        cy={fpY - 28}
        r="9"
        fill="none"
        stroke="#000"
        strokeWidth="0.5"
      />
      <circle
        cx={fpX + (EXT * S) / 2}
        cy={fpY + EXT * S + 32}
        r="9"
        fill="none"
        stroke="#000"
        strokeWidth="0.5"
      />

      {/* Floor fill (interior) */}
      <rect
        x={fpX + WALL_THICKNESS * 1000 * S}
        y={fpY + WALL_THICKNESS * 1000 * S}
        width={INT * S}
        height={INT * S}
        fill={floorColor}
        opacity="0.25"
      />

      {/* Walls - thick filled rectangles */}
      {/* Top wall */}
      <rect
        x={fpX}
        y={fpY}
        width={EXT * S}
        height={WALL_THICKNESS * 1000 * S}
        fill="#333"
        stroke="#000"
        strokeWidth="0.5"
      />
      {/* Bottom wall (with door opening) */}
      <rect
        x={fpX}
        y={fpY + EXT * S - WALL_THICKNESS * 1000 * S}
        width={(EXT * S - 900 * S) / 2}
        height={WALL_THICKNESS * 1000 * S}
        fill="#333"
        stroke="#000"
        strokeWidth="0.5"
      />
      <rect
        x={fpX + (EXT * S - 900 * S) / 2 + 900 * S}
        y={fpY + EXT * S - WALL_THICKNESS * 1000 * S}
        width={(EXT * S - 900 * S) / 2}
        height={WALL_THICKNESS * 1000 * S}
        fill="#333"
        stroke="#000"
        strokeWidth="0.5"
      />
      {/* Left wall */}
      <rect
        x={fpX}
        y={fpY}
        width={WALL_THICKNESS * 1000 * S}
        height={EXT * S}
        fill="#333"
        stroke="#000"
        strokeWidth="0.5"
      />
      {/* Right wall */}
      <rect
        x={fpX + EXT * S - WALL_THICKNESS * 1000 * S}
        y={fpY}
        width={WALL_THICKNESS * 1000 * S}
        height={EXT * S}
        fill="#333"
        stroke="#000"
        strokeWidth="0.5"
      />

      {/* Door swing arc */}
      {(() => {
        const doorX = fpX + (EXT * S - 900 * S) / 2;
        const doorY = fpY + EXT * S - WALL_THICKNESS * 1000 * S;
        const doorW = 900 * S;
        return (
          <g>
            <line
              x1={doorX}
              y1={doorY}
              x2={doorX}
              y2={doorY - doorW}
              stroke="#000"
              strokeWidth="1"
            />
            <path
              d={`M ${doorX} ${doorY - doorW} A ${doorW} ${doorW} 0 0 1 ${doorX + doorW} ${doorY}`}
              fill="none"
              stroke="#000"
              strokeWidth="0.5"
              strokeDasharray="3,2"
            />
          </g>
        );
      })()}

      {/* Furniture from layout preset */}
      {preset?.furniture.map((item) => {
        const fx = fpX + WALL_THICKNESS * 1000 * S + item.x * 1000 * S;
        const fy = fpY + WALL_THICKNESS * 1000 * S + item.z * 1000 * S;
        const fw = item.width * 1000 * S;
        const fd = item.depth * 1000 * S;
        const patternId = `hatch-${item.id}`;
        return (
          <g key={item.id}>
            <defs>
              <pattern
                id={patternId}
                width="4"
                height="4"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="4"
                  stroke={item.color}
                  strokeWidth="0.5"
                  opacity="0.5"
                />
              </pattern>
            </defs>
            <rect
              x={fx}
              y={fy}
              width={fw}
              height={fd}
              fill={`url(#${patternId})`}
              stroke="#555"
              strokeWidth="0.5"
            />
            <text
              x={fx + fw / 2}
              y={fy + fd / 2 + 2}
              fontSize="7"
              textAnchor="middle"
              fill="#444"
            >
              {item.label}
            </text>
          </g>
        );
      })}

      {/* Dimension lines - exterior horizontal (top) */}
      {(() => {
        const dy = fpY - 12;
        const x1 = fpX;
        const x2 = fpX + EXT * S;
        return (
          <g>
            <line
              x1={x1}
              y1={dy}
              x2={x2}
              y2={dy}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={x1}
              y1={dy - 4}
              x2={x1}
              y2={dy + 4}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={x2}
              y1={dy - 4}
              x2={x2}
              y2={dy + 4}
              stroke="#000"
              strokeWidth="0.5"
            />
            <text
              x={(x1 + x2) / 2}
              y={dy - 4}
              fontSize="9"
              textAnchor="middle"
              fill="#000"
            >
              3000
            </text>
          </g>
        );
      })()}

      {/* Dimension lines - interior horizontal */}
      {(() => {
        const dy = fpY + WALL_THICKNESS * 1000 * S + 12;
        const x1 = fpX + WALL_THICKNESS * 1000 * S;
        const x2 = fpX + EXT * S - WALL_THICKNESS * 1000 * S;
        return (
          <g>
            <line
              x1={x1}
              y1={dy}
              x2={x2}
              y2={dy}
              stroke="#000"
              strokeWidth="0.3"
            />
            <line
              x1={x1}
              y1={dy - 3}
              x2={x1}
              y2={dy + 3}
              stroke="#000"
              strokeWidth="0.3"
            />
            <line
              x1={x2}
              y1={dy - 3}
              x2={x2}
              y2={dy + 3}
              stroke="#000"
              strokeWidth="0.3"
            />
            <text
              x={(x1 + x2) / 2}
              y={dy + 12}
              fontSize="8"
              textAnchor="middle"
              fill="#555"
            >
              {INT}
            </text>
          </g>
        );
      })()}

      {/* Dimension lines - exterior vertical (left) */}
      {(() => {
        const dx = fpX - 12;
        const y1 = fpY;
        const y2 = fpY + EXT * S;
        return (
          <g>
            <line
              x1={dx}
              y1={y1}
              x2={dx}
              y2={y2}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={dx - 4}
              y1={y1}
              x2={dx + 4}
              y2={y1}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={dx - 4}
              y1={y2}
              x2={dx + 4}
              y2={y2}
              stroke="#000"
              strokeWidth="0.5"
            />
            <text
              x={dx - 4}
              y={(y1 + y2) / 2}
              fontSize="9"
              textAnchor="middle"
              fill="#000"
              transform={`rotate(-90, ${dx - 4}, ${(y1 + y2) / 2})`}
            >
              3000
            </text>
          </g>
        );
      })()}

      {/* North arrow */}
      {(() => {
        const nx = fpX + EXT * S - 20;
        const ny = fpY + 30;
        return (
          <g>
            <line
              x1={nx}
              y1={ny + 20}
              x2={nx}
              y2={ny - 8}
              stroke="#000"
              strokeWidth="1"
            />
            <polygon
              points={`${nx},${ny - 12} ${nx - 5},${ny - 2} ${nx + 5},${ny - 2}`}
              fill="#000"
            />
            <text
              x={nx}
              y={ny - 16}
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              fill="#000"
            >
              N
            </text>
          </g>
        );
      })()}

      {/* Material callout with leader line */}
      <line
        x1={fpX + EXT * S / 2}
        y1={fpY + EXT * S - WALL_THICKNESS * 1000 * S - 8}
        x2={fpX + EXT * S + 50}
        y2={fpY + EXT * S - 60}
        stroke="#666"
        strokeWidth="0.3"
      />
      <circle
        cx={fpX + EXT * S / 2}
        cy={fpY + EXT * S - WALL_THICKNESS * 1000 * S - 8}
        r="2"
        fill="#666"
      />
      <text
        x={fpX + EXT * S + 54}
        y={fpY + EXT * S - 58}
        fontSize="8"
        fill="#666"
      >
        {floorMat?.label || "Oak"} floor
      </text>

      {/* Wall material callout */}
      <line
        x1={fpX + 8}
        y1={fpY + EXT * S / 2}
        x2={fpX + EXT * S + 50}
        y2={fpY + EXT * S - 38}
        stroke="#666"
        strokeWidth="0.3"
      />
      <circle cx={fpX + 8} cy={fpY + EXT * S / 2} r="2" fill="#666" />
      <text
        x={fpX + EXT * S + 54}
        y={fpY + EXT * S - 36}
        fontSize="8"
        fill="#666"
      >
        {wallMat?.label || "Alabaster"} wall
      </text>

      {/* Section cut line A-A across floor plan */}
      <line
        x1={fpX - 8}
        y1={fpY + EXT * S / 2}
        x2={fpX + EXT * S + 8}
        y2={fpY + EXT * S / 2}
        stroke="#000"
        strokeWidth="0.8"
        strokeDasharray="8,3,2,3"
      />
      <text
        x={fpX - 16}
        y={fpY + EXT * S / 2 + 4}
        fontSize="10"
        fontWeight="bold"
        fill="#000"
      >
        A
      </text>
      <text
        x={fpX + EXT * S + 12}
        y={fpY + EXT * S / 2 + 4}
        fontSize="10"
        fontWeight="bold"
        fill="#000"
      >
        A
      </text>

      {/* Wall color swatch */}
      <rect
        x={fpX + 10}
        y={fpY + 10}
        width={20}
        height={20}
        fill={wallColor}
        stroke="#000"
        strokeWidth="0.3"
        opacity="0.6"
      />
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION A-A — full SVG area
   ═══════════════════════════════════════════════════════════════════════════ */

interface SectionAAProps {
  floorColor: string;
  wallColor: string;
  floorMat: ReturnType<typeof FLOOR_MATERIALS.find>;
}

function SectionAADrawing({ floorColor, wallColor, floorMat }: SectionAAProps) {
  const secS = 500 / 3000; // wider scale
  const secX = (800 - EXT * secS) / 2; // centered
  const sw = EXT * secS;
  const hScale = 450 / TOTAL_H;
  const baseY = 720; // ground line

  const floorSlabH = FLOOR_SLAB * hScale;
  const ceilH = CEIL_H * hScale;
  const wallThickPx = WALL_THICKNESS * 1000 * secS;
  const insulH = 100 * hScale;
  const floorFinishH = 20 * hScale;

  return (
    <g>
      {/* Foundation/base */}
      <rect
        x={secX - 15}
        y={baseY}
        width={sw + 30}
        height={12}
        fill="#999"
        stroke="#000"
        strokeWidth="0.5"
      />
      {/* Foundation hatching */}
      <g opacity="0.3">
        {Array.from({ length: 18 }).map((_, i) => (
          <line
            key={`fnd-${i}`}
            x1={secX - 15 + i * ((sw + 30) / 18)}
            y1={baseY}
            x2={secX - 15 + i * ((sw + 30) / 18) - 7}
            y2={baseY + 12}
            stroke="#000"
            strokeWidth="0.3"
          />
        ))}
      </g>

      {/* Floor slab */}
      <rect
        x={secX}
        y={baseY - floorSlabH}
        width={sw}
        height={floorSlabH}
        fill="#ccc"
        stroke="#000"
        strokeWidth="1.5"
      />
      {/* Section hatching for floor slab */}
      <g opacity="0.2">
        {Array.from({ length: 30 }).map((_, i) => (
          <line
            key={`fs-${i}`}
            x1={secX + i * (sw / 30)}
            y1={baseY - floorSlabH}
            x2={secX + i * (sw / 30) + floorSlabH}
            y2={baseY}
            stroke="#000"
            strokeWidth="0.3"
          />
        ))}
      </g>

      {/* Floor finish layer */}
      <rect
        x={secX + wallThickPx}
        y={baseY - floorSlabH - floorFinishH}
        width={sw - wallThickPx * 2}
        height={floorFinishH}
        fill={floorColor}
        opacity="0.5"
        stroke="#000"
        strokeWidth="0.3"
      />
      <text
        x={secX + sw / 2}
        y={baseY - floorSlabH - floorFinishH / 2 + 3}
        fontSize="6"
        textAnchor="middle"
        fill="#333"
      >
        {floorMat?.label || "Floor Finish"}
      </text>

      {/* Left wall (section cut - hatched) */}
      <rect
        x={secX}
        y={baseY - floorSlabH - ceilH}
        width={wallThickPx}
        height={ceilH + floorSlabH}
        fill="#555"
        stroke="#000"
        strokeWidth="2"
      />
      <defs>
        <pattern
          id="wall-hatch-sec"
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="5"
            stroke="#fff"
            strokeWidth="0.5"
            opacity="0.4"
          />
        </pattern>
      </defs>
      <rect
        x={secX}
        y={baseY - floorSlabH - ceilH}
        width={wallThickPx}
        height={ceilH + floorSlabH}
        fill="url(#wall-hatch-sec)"
      />

      {/* Right wall (section cut - hatched) */}
      <rect
        x={secX + sw - wallThickPx}
        y={baseY - floorSlabH - ceilH}
        width={wallThickPx}
        height={ceilH + floorSlabH}
        fill="#555"
        stroke="#000"
        strokeWidth="2"
      />
      <rect
        x={secX + sw - wallThickPx}
        y={baseY - floorSlabH - ceilH}
        width={wallThickPx}
        height={ceilH + floorSlabH}
        fill="url(#wall-hatch-sec)"
      />

      {/* Ceiling slab */}
      <rect
        x={secX}
        y={baseY - floorSlabH - ceilH - floorSlabH}
        width={sw}
        height={floorSlabH}
        fill="#ccc"
        stroke="#000"
        strokeWidth="1.5"
      />

      {/* Roof insulation layer */}
      <rect
        x={secX}
        y={baseY - floorSlabH - ceilH - floorSlabH - insulH}
        width={sw}
        height={insulH}
        fill="#FFE4B5"
        opacity="0.5"
        stroke="#000"
        strokeWidth="0.5"
      />
      <text
        x={secX + sw / 2}
        y={baseY - floorSlabH - ceilH - floorSlabH - insulH / 2 + 3}
        fontSize="6"
        textAnchor="middle"
        fill="#666"
      >
        Insulation 100mm
      </text>

      {/* Interior space */}
      <rect
        x={secX + wallThickPx}
        y={baseY - floorSlabH - ceilH}
        width={sw - wallThickPx * 2}
        height={ceilH}
        fill={wallColor}
        opacity="0.1"
      />

      {/* Ground line */}
      <line
        x1={secX - 30}
        y1={baseY + 12}
        x2={secX + sw + 30}
        y2={baseY + 12}
        stroke="#000"
        strokeWidth="0.5"
      />
      {Array.from({ length: 22 }).map((_, i) => (
        <line
          key={`gnd-sec-${i}`}
          x1={secX - 30 + i * ((sw + 60) / 22)}
          y1={baseY + 12}
          x2={secX - 30 + i * ((sw + 60) / 22) - 8}
          y2={baseY + 20}
          stroke="#000"
          strokeWidth="0.3"
        />
      ))}

      {/* Height dimension - floor to ceiling */}
      {(() => {
        const dx = secX + sw + 25;
        const y1 = baseY - floorSlabH;
        const y2 = baseY - floorSlabH - ceilH;
        return (
          <g>
            <line
              x1={dx}
              y1={y1}
              x2={dx}
              y2={y2}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={dx - 4}
              y1={y1}
              x2={dx + 4}
              y2={y1}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={dx - 4}
              y1={y2}
              x2={dx + 4}
              y2={y2}
              stroke="#000"
              strokeWidth="0.5"
            />
            <text
              x={dx + 8}
              y={(y1 + y2) / 2 + 3}
              fontSize="9"
              fill="#000"
            >
              2700
            </text>
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
            <line
              x1={dx}
              y1={y1}
              x2={dx}
              y2={y2}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={dx - 4}
              y1={y1}
              x2={dx + 4}
              y2={y1}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={dx - 4}
              y1={y2}
              x2={dx + 4}
              y2={y2}
              stroke="#000"
              strokeWidth="0.5"
            />
            <text
              x={dx + 8}
              y={(y1 + y2) / 2 + 3}
              fontSize="9"
              fill="#000"
            >
              {TOTAL_H + 100 + FLOOR_SLAB}
            </text>
          </g>
        );
      })()}

      {/* Floor level mark */}
      <text
        x={secX - 28}
        y={baseY - floorSlabH + 4}
        fontSize="8"
        fill="#000"
        textAnchor="end"
      >
        ±0.00
      </text>
      <line
        x1={secX - 22}
        y1={baseY - floorSlabH}
        x2={secX}
        y2={baseY - floorSlabH}
        stroke="#000"
        strokeWidth="0.3"
        strokeDasharray="2,1"
      />
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FRONT ELEVATION — full SVG area
   ═══════════════════════════════════════════════════════════════════════════ */

interface FrontElevationProps {
  wallColor: string;
  wallMat: ReturnType<typeof WALL_MATERIALS.find>;
}

function FrontElevationDrawing({ wallColor, wallMat }: FrontElevationProps) {
  const elvS = 550 / 3000;
  const elvX = (800 - EXT * elvS) / 2;
  const ew = EXT * elvS;
  const hScale = 350 / TOTAL_H;
  const baseElv = 720;
  const wallH = CEIL_H * hScale;
  const slabH = FLOOR_SLAB * hScale;
  const roofH = 22;

  const winW = 1200 * elvS;
  const winH = 1200 * hScale;
  const winY = baseElv - slabH - wallH + 900 * hScale;

  const doorW = 900 * elvS;
  const doorH = 2100 * hScale;
  const doorX = elvX + (ew - doorW) / 2;
  const doorY = baseElv - slabH - doorH;

  return (
    <g>
      {/* Building outline */}
      <rect
        x={elvX}
        y={baseElv - slabH - wallH}
        width={ew}
        height={wallH + slabH}
        fill="none"
        stroke="#000"
        strokeWidth="2"
      />

      {/* Cladding indication */}
      {Array.from({ length: 18 }).map((_, i) => (
        <line
          key={`clad-${i}`}
          x1={elvX + 1}
          y1={baseElv - slabH - wallH + i * (wallH / 18)}
          x2={elvX + ew - 1}
          y2={baseElv - slabH - wallH + i * (wallH / 18)}
          stroke={wallColor}
          strokeWidth="0.3"
          opacity="0.4"
        />
      ))}

      {/* Window opening (left side) */}
      <rect
        x={elvX + 25}
        y={winY}
        width={winW}
        height={winH}
        fill="#D4E6F1"
        opacity="0.3"
        stroke="#000"
        strokeWidth="1"
      />
      <line
        x1={elvX + 25 + winW / 2}
        y1={winY}
        x2={elvX + 25 + winW / 2}
        y2={winY + winH}
        stroke="#000"
        strokeWidth="0.5"
      />
      <line
        x1={elvX + 25}
        y1={winY + winH / 2}
        x2={elvX + 25 + winW}
        y2={winY + winH / 2}
        stroke="#000"
        strokeWidth="0.5"
      />

      {/* Door opening */}
      <rect
        x={doorX}
        y={doorY}
        width={doorW}
        height={doorH}
        fill="#E8E0D0"
        opacity="0.3"
        stroke="#000"
        strokeWidth="1"
      />
      <circle
        cx={doorX + doorW - 8}
        cy={doorY + doorH / 2}
        r="3"
        fill="none"
        stroke="#000"
        strokeWidth="0.5"
      />

      {/* Floor slab visible */}
      <rect
        x={elvX}
        y={baseElv - slabH}
        width={ew}
        height={slabH}
        fill="#bbb"
        stroke="#000"
        strokeWidth="1"
      />

      {/* Roof line */}
      <rect
        x={elvX - 8}
        y={baseElv - slabH - wallH - roofH}
        width={ew + 16}
        height={roofH}
        fill="#999"
        stroke="#000"
        strokeWidth="1"
      />

      {/* Ground line */}
      <line
        x1={elvX - 25}
        y1={baseElv}
        x2={elvX + ew + 25}
        y2={baseElv}
        stroke="#000"
        strokeWidth="0.8"
      />
      {Array.from({ length: 20 }).map((_, i) => (
        <line
          key={`gnd-elv-${i}`}
          x1={elvX - 25 + i * ((ew + 50) / 20)}
          y1={baseElv}
          x2={elvX - 25 + i * ((ew + 50) / 20) - 7}
          y2={baseElv + 7}
          stroke="#000"
          strokeWidth="0.3"
        />
      ))}

      {/* Height markings */}
      <text
        x={elvX + ew + 18}
        y={baseElv - slabH + 4}
        fontSize="8"
        fill="#000"
      >
        ±0.00
      </text>
      <text
        x={elvX + ew + 18}
        y={baseElv - slabH - wallH + 4}
        fontSize="8"
        fill="#000"
      >
        +2.70
      </text>

      {/* Module connection point indicators */}
      <g>
        <circle
          cx={elvX}
          cy={baseElv - slabH - wallH / 2}
          r="6"
          fill="none"
          stroke="#E8913A"
          strokeWidth="1"
        />
        <line
          x1={elvX - 6}
          y1={baseElv - slabH - wallH / 2}
          x2={elvX + 6}
          y2={baseElv - slabH - wallH / 2}
          stroke="#E8913A"
          strokeWidth="0.8"
        />
        <circle
          cx={elvX + ew}
          cy={baseElv - slabH - wallH / 2}
          r="6"
          fill="none"
          stroke="#E8913A"
          strokeWidth="1"
        />
        <line
          x1={elvX + ew - 6}
          y1={baseElv - slabH - wallH / 2}
          x2={elvX + ew + 6}
          y2={baseElv - slabH - wallH / 2}
          stroke="#E8913A"
          strokeWidth="0.8"
        />
      </g>

      {/* Connection labels */}
      <text
        x={elvX - 15}
        y={baseElv - slabH - wallH / 2 - 12}
        fontSize="7"
        fill="#E8913A"
        textAnchor="middle"
      >
        Connection
      </text>
      <text
        x={elvX + ew + 15}
        y={baseElv - slabH - wallH / 2 - 12}
        fontSize="7"
        fill="#E8913A"
        textAnchor="middle"
      >
        Connection
      </text>

      {/* Cladding label */}
      <text
        x={elvX + ew / 2}
        y={baseElv - slabH - wallH - roofH - 8}
        fontSize="8"
        textAnchor="middle"
        fill="#666"
      >
        {wallMat?.label || "Cladding"} Finish
      </text>
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   WALL CORNER DETAIL — full SVG area
   ═══════════════════════════════════════════════════════════════════════════ */

interface WallDetailProps {
  wallColor: string;
}

function WallDetailDrawing({ wallColor }: WallDetailProps) {
  const dtlX = 80;
  const dtlY = 90;
  const layerScale = 2.2; // px per mm at larger scale

  const layers = [
    {
      label: "Ext. Cladding",
      thickness: 20,
      color: wallColor,
      opacity: 0.6,
    },
    {
      label: "Air Gap",
      thickness: 25,
      color: "#fff",
      opacity: 0.3,
    },
    {
      label: "Insulation",
      thickness: 120,
      color: "#FFE4B5",
      opacity: 0.5,
    },
    {
      label: "Steel Frame",
      thickness: 80,
      color: "#999",
      opacity: 0.5,
    },
    {
      label: "Int. Finish",
      thickness: 15,
      color: wallColor,
      opacity: 0.4,
    },
  ];

  let runX = dtlX + 60;

  return (
    <g>
      {/* Detail border */}
      <rect
        x={dtlX}
        y={dtlY}
        width={660}
        height={680}
        fill="none"
        stroke="#000"
        strokeWidth="0.5"
        strokeDasharray="4,2"
      />

      {/* Corner lines - exterior */}
      <line
        x1={dtlX + 60}
        y1={dtlY + 30}
        x2={dtlX + 60}
        y2={dtlY + 520}
        stroke="#000"
        strokeWidth="2"
      />
      <line
        x1={dtlX + 60}
        y1={dtlY + 30}
        x2={dtlX + 520}
        y2={dtlY + 30}
        stroke="#000"
        strokeWidth="2"
      />

      {/* Layer buildup - vertical section */}
      {layers.map((layer, i) => {
        const lw = layer.thickness * layerScale;
        const x = runX;
        runX += lw;
        return (
          <g key={`layer-${i}`}>
            <rect
              x={x}
              y={dtlY + 30}
              width={lw}
              height={450}
              fill={layer.color}
              opacity={layer.opacity}
              stroke="#000"
              strokeWidth="0.3"
            />
            {/* Label line */}
            <line
              x1={x + lw / 2}
              y1={dtlY + 480}
              x2={x + lw / 2}
              y2={dtlY + 510 + i * 22}
              stroke="#666"
              strokeWidth="0.3"
            />
            <text
              x={x + lw / 2}
              y={dtlY + 520 + i * 22}
              fontSize="8"
              textAnchor="middle"
              fill="#444"
            >
              {layer.label} ({layer.thickness}mm)
            </text>
          </g>
        );
      })}

      {/* Interior label */}
      <text
        x={runX + 15}
        y={dtlY + 250}
        fontSize="10"
        fill="#666"
        writingMode="tb"
      >
        INTERIOR
      </text>

      {/* Exterior label */}
      <text
        x={dtlX + 45}
        y={dtlY + 250}
        fontSize="10"
        fill="#666"
        writingMode="tb"
      >
        EXTERIOR
      </text>

      {/* Total wall thickness */}
      <text
        x={dtlX + 330}
        y={dtlY + 660}
        fontSize="9"
        textAnchor="middle"
        fill="#666"
      >
        Total wall: {WALL_THICKNESS * 1000}mm
      </text>

      {/* Connection indicator to adjacent module */}
      <line
        x1={runX}
        y1={dtlY + 150}
        x2={runX + 35}
        y2={dtlY + 150}
        stroke="#E8913A"
        strokeWidth="1"
        strokeDasharray="3,2"
      />
      <text x={runX + 40} y={dtlY + 153} fontSize="8" fill="#E8913A">
        Adjacent
      </text>
      <text x={runX + 40} y={dtlY + 165} fontSize="8" fill="#E8913A">
        module
      </text>
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MEP PLAN — electrical, plumbing, HVAC
   ═══════════════════════════════════════════════════════════════════════════ */

function MEPPlanDrawing() {
  const S = 550 / 3000;
  const ox = (800 - EXT * S) / 2; // origin X centered
  const oy = 100; // origin Y
  const w = EXT * S;
  const h = EXT * S;
  const wt = WALL_THICKNESS * 1000 * S;

  return (
    <g>
      {/* Module outline - thin walls */}
      <rect
        x={ox}
        y={oy}
        width={w}
        height={h}
        fill="none"
        stroke="#aaa"
        strokeWidth="1"
      />
      {/* Interior area */}
      <rect
        x={ox + wt}
        y={oy + wt}
        width={w - wt * 2}
        height={h - wt * 2}
        fill="#FAFAFA"
        stroke="#ccc"
        strokeWidth="0.5"
      />

      {/* ─── Legend ─── */}
      <g>
        <rect
          x={ox + w + 30}
          y={oy}
          width={120}
          height={140}
          fill="none"
          stroke="#999"
          strokeWidth="0.5"
        />
        <text
          x={ox + w + 40}
          y={oy + 15}
          fontSize="8"
          fontWeight="bold"
          fill="#000"
        >
          LEGEND
        </text>
        {/* Electrical */}
        <circle
          cx={ox + w + 45}
          cy={oy + 32}
          r="5"
          fill="none"
          stroke="#2196F3"
          strokeWidth="1"
        />
        <line
          x1={ox + w + 42}
          y1={oy + 32}
          x2={ox + w + 48}
          y2={oy + 32}
          stroke="#2196F3"
          strokeWidth="1"
        />
        <line
          x1={ox + w + 45}
          y1={oy + 29}
          x2={ox + w + 45}
          y2={oy + 35}
          stroke="#2196F3"
          strokeWidth="1"
        />
        <text x={ox + w + 55} y={oy + 35} fontSize="7" fill="#2196F3">
          Elec. Outlet
        </text>
        {/* Light */}
        <circle
          cx={ox + w + 45}
          cy={oy + 52}
          r="5"
          fill="none"
          stroke="#FFC107"
          strokeWidth="1"
        />
        <line
          x1={ox + w + 40}
          y1={oy + 47}
          x2={ox + w + 50}
          y2={oy + 57}
          stroke="#FFC107"
          strokeWidth="0.5"
        />
        <line
          x1={ox + w + 50}
          y1={oy + 47}
          x2={ox + w + 40}
          y2={oy + 57}
          stroke="#FFC107"
          strokeWidth="0.5"
        />
        <text x={ox + w + 55} y={oy + 55} fontSize="7" fill="#FFC107">
          Light Fixture
        </text>
        {/* Plumbing */}
        <line
          x1={ox + w + 38}
          y1={oy + 72}
          x2={ox + w + 52}
          y2={oy + 72}
          stroke="#4CAF50"
          strokeWidth="1.5"
          strokeDasharray="4,2"
        />
        <text x={ox + w + 55} y={oy + 75} fontSize="7" fill="#4CAF50">
          Plumbing
        </text>
        {/* HVAC */}
        <rect
          x={ox + w + 39}
          y={oy + 86}
          width={12}
          height={8}
          fill="none"
          stroke="#9C27B0"
          strokeWidth="1"
          strokeDasharray="2,1"
        />
        <text x={ox + w + 55} y={oy + 95} fontSize="7" fill="#9C27B0">
          HVAC Duct
        </text>
        {/* Switch */}
        <text
          x={ox + w + 45}
          y={oy + 115}
          fontSize="10"
          textAnchor="middle"
          fill="#2196F3"
        >
          S
        </text>
        <text x={ox + w + 55} y={oy + 115} fontSize="7" fill="#2196F3">
          Switch
        </text>
      </g>

      {/* ─── Electrical outlets (along walls) ─── */}
      {/* Bottom-left outlet */}
      {[
        { cx: ox + 60, cy: oy + h - wt - 8 },
        { cx: ox + w - 60, cy: oy + h - wt - 8 },
        { cx: ox + wt + 8, cy: oy + h / 2 },
        { cx: ox + w - wt - 8, cy: oy + h / 2 },
        { cx: ox + w - wt - 8, cy: oy + 80 },
      ].map((pos, i) => (
        <g key={`outlet-${i}`}>
          <circle
            cx={pos.cx}
            cy={pos.cy}
            r="7"
            fill="none"
            stroke="#2196F3"
            strokeWidth="0.8"
          />
          <line
            x1={pos.cx - 4}
            y1={pos.cy}
            x2={pos.cx + 4}
            y2={pos.cy}
            stroke="#2196F3"
            strokeWidth="0.8"
          />
          <line
            x1={pos.cx}
            y1={pos.cy - 4}
            x2={pos.cx}
            y2={pos.cy + 4}
            stroke="#2196F3"
            strokeWidth="0.8"
          />
        </g>
      ))}

      {/* ─── Light switch near door ─── */}
      <text
        x={ox + (w + 900 * S) / 2 + 20}
        y={oy + h - wt - 5}
        fontSize="12"
        fill="#2196F3"
        textAnchor="middle"
      >
        S
      </text>

      {/* ─── Light fixtures (ceiling positions) ─── */}
      {[
        { cx: ox + w / 2, cy: oy + h / 2 },
        { cx: ox + w / 4, cy: oy + h / 4 },
        { cx: ox + (3 * w) / 4, cy: oy + (3 * h) / 4 },
      ].map((pos, i) => (
        <g key={`light-${i}`}>
          <circle
            cx={pos.cx}
            cy={pos.cy}
            r="10"
            fill="none"
            stroke="#FFC107"
            strokeWidth="0.8"
          />
          <line
            x1={pos.cx - 7}
            y1={pos.cy - 7}
            x2={pos.cx + 7}
            y2={pos.cy + 7}
            stroke="#FFC107"
            strokeWidth="0.5"
          />
          <line
            x1={pos.cx + 7}
            y1={pos.cy - 7}
            x2={pos.cx - 7}
            y2={pos.cy + 7}
            stroke="#FFC107"
            strokeWidth="0.5"
          />
        </g>
      ))}

      {/* ─── Plumbing pipes (dashed green lines) ─── */}
      {/* Cold water supply along left wall */}
      <line
        x1={ox + wt + 15}
        y1={oy + wt}
        x2={ox + wt + 15}
        y2={oy + h - wt}
        stroke="#4CAF50"
        strokeWidth="1.5"
        strokeDasharray="6,3"
      />
      {/* Branch to wet area */}
      <line
        x1={ox + wt + 15}
        y1={oy + h * 0.3}
        x2={ox + w * 0.4}
        y2={oy + h * 0.3}
        stroke="#4CAF50"
        strokeWidth="1.5"
        strokeDasharray="6,3"
      />
      {/* Hot water (red dashed) */}
      <line
        x1={ox + wt + 25}
        y1={oy + wt}
        x2={ox + wt + 25}
        y2={oy + h * 0.35}
        stroke="#F44336"
        strokeWidth="1"
        strokeDasharray="4,3"
      />
      <line
        x1={ox + wt + 25}
        y1={oy + h * 0.35}
        x2={ox + w * 0.4}
        y2={oy + h * 0.35}
        stroke="#F44336"
        strokeWidth="1"
        strokeDasharray="4,3"
      />
      {/* Drain pipe */}
      <line
        x1={ox + w * 0.4}
        y1={oy + h * 0.25}
        x2={ox + w * 0.4}
        y2={oy + h - wt}
        stroke="#4CAF50"
        strokeWidth="2"
        strokeDasharray="8,4"
      />

      {/* Plumbing labels */}
      <text
        x={ox + wt + 6}
        y={oy + h * 0.6}
        fontSize="6"
        fill="#4CAF50"
        writingMode="tb"
      >
        CW
      </text>
      <text
        x={ox + wt + 30}
        y={oy + h * 0.15}
        fontSize="6"
        fill="#F44336"
      >
        HW
      </text>

      {/* ─── HVAC duct (along top wall) ─── */}
      <rect
        x={ox + w * 0.15}
        y={oy + wt + 5}
        width={w * 0.7}
        height={20}
        fill="none"
        stroke="#9C27B0"
        strokeWidth="1"
        strokeDasharray="4,2"
      />
      <text
        x={ox + w / 2}
        y={oy + wt + 18}
        fontSize="7"
        textAnchor="middle"
        fill="#9C27B0"
      >
        HVAC Supply Duct
      </text>
      {/* HVAC connection point */}
      <rect
        x={ox + wt - 3}
        y={oy + wt + 5}
        width={w * 0.15 - wt + 3}
        height={20}
        fill="none"
        stroke="#9C27B0"
        strokeWidth="1.5"
      />
      <text
        x={ox + wt + (w * 0.15 - wt) / 2}
        y={oy + wt + 30}
        fontSize="6"
        textAnchor="middle"
        fill="#9C27B0"
      >
        HVAC Conn.
      </text>

      {/* ─── Electrical conduit runs (thin blue lines) ─── */}
      {/* Main conduit from entry along bottom wall */}
      <line
        x1={ox + w / 2}
        y1={oy + h - wt}
        x2={ox + w / 2}
        y2={oy + h - wt - 20}
        stroke="#2196F3"
        strokeWidth="0.5"
      />
      <line
        x1={ox + w / 2}
        y1={oy + h - wt - 20}
        x2={ox + 60}
        y2={oy + h - wt - 20}
        stroke="#2196F3"
        strokeWidth="0.5"
      />
      <line
        x1={ox + w / 2}
        y1={oy + h - wt - 20}
        x2={ox + w - 60}
        y2={oy + h - wt - 20}
        stroke="#2196F3"
        strokeWidth="0.5"
      />

      {/* Dimension - overall */}
      {(() => {
        const dy = oy - 15;
        return (
          <g>
            <line
              x1={ox}
              y1={dy}
              x2={ox + w}
              y2={dy}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={ox}
              y1={dy - 4}
              x2={ox}
              y2={dy + 4}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={ox + w}
              y1={dy - 4}
              x2={ox + w}
              y2={dy + 4}
              stroke="#000"
              strokeWidth="0.5"
            />
            <text
              x={ox + w / 2}
              y={dy - 4}
              fontSize="9"
              textAnchor="middle"
              fill="#000"
            >
              3000
            </text>
          </g>
        );
      })()}
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FOUNDATION DETAIL — screw pile / pad foundation cross-section
   ═══════════════════════════════════════════════════════════════════════════ */

function FoundationDetailDrawing() {
  // Center the cross-section in the drawing area
  const cx = 400; // center X
  const groundY = 400; // ground level line
  const pileDepth = 250; // px depth of pile below ground
  const pileW = 30; // pile shaft width
  const padW = 120; // bearing pad width
  const padH = 30; // bearing pad height
  const slabW = 500; // floor slab width (visible portion)
  const slabH = 35; // floor slab height
  const connH = 50; // connection bracket height
  const connW = 80; // connection bracket width

  return (
    <g>
      {/* ─── Ground fill (hatched) ─── */}
      <rect
        x={100}
        y={groundY}
        width={600}
        height={350}
        fill="#E8DCC8"
        opacity="0.3"
      />
      {/* Ground hatching */}
      {Array.from({ length: 40 }).map((_, i) => (
        <line
          key={`ground-${i}`}
          x1={100 + i * 15}
          y1={groundY}
          x2={100 + i * 15 - 10}
          y2={groundY + 8}
          stroke="#8B7355"
          strokeWidth="0.5"
        />
      ))}

      {/* Ground level line */}
      <line
        x1={80}
        y1={groundY}
        x2={720}
        y2={groundY}
        stroke="#000"
        strokeWidth="1.5"
      />
      <text x={725} y={groundY + 4} fontSize="9" fill="#000">
        GL ±0.00
      </text>

      {/* ─── Screw pile shaft ─── */}
      <rect
        x={cx - pileW / 2}
        y={groundY + 20}
        width={pileW}
        height={pileDepth}
        fill="#888"
        stroke="#000"
        strokeWidth="1.5"
      />
      {/* Steel hatching inside pile */}
      <defs>
        <pattern
          id="steel-hatch"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="6"
            stroke="#555"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect
        x={cx - pileW / 2}
        y={groundY + 20}
        width={pileW}
        height={pileDepth}
        fill="url(#steel-hatch)"
      />

      {/* Screw pile helix plates */}
      {[0.4, 0.65, 0.9].map((frac, i) => {
        const py = groundY + 20 + pileDepth * frac;
        const helixW = pileW + 40;
        return (
          <g key={`helix-${i}`}>
            <ellipse
              cx={cx}
              cy={py}
              rx={helixW / 2}
              ry={6}
              fill="#777"
              stroke="#000"
              strokeWidth="1"
            />
          </g>
        );
      })}

      {/* Pile label */}
      <text
        x={cx + pileW / 2 + 50}
        y={groundY + 20 + pileDepth / 2}
        fontSize="8"
        fill="#444"
      >
        Steel Screw Pile
      </text>
      <line
        x1={cx + pileW / 2 + 2}
        y1={groundY + 20 + pileDepth / 2 - 3}
        x2={cx + pileW / 2 + 48}
        y2={groundY + 20 + pileDepth / 2 - 3}
        stroke="#666"
        strokeWidth="0.3"
      />

      {/* ─── Bearing pad / pile cap ─── */}
      <rect
        x={cx - padW / 2}
        y={groundY - padH + 5}
        width={padW}
        height={padH}
        fill="#aaa"
        stroke="#000"
        strokeWidth="1.5"
      />
      {/* Concrete hatching */}
      <g opacity="0.3">
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={`pad-h-${i}`}
            x1={cx - padW / 2 + i * (padW / 10)}
            y1={groundY - padH + 5}
            x2={cx - padW / 2 + i * (padW / 10) + padH}
            y2={groundY + 5}
            stroke="#000"
            strokeWidth="0.3"
          />
        ))}
      </g>
      <text
        x={cx - padW / 2 - 55}
        y={groundY - padH / 2 + 8}
        fontSize="8"
        fill="#444"
      >
        Pile Cap
      </text>
      <line
        x1={cx - padW / 2 - 3}
        y1={groundY - padH / 2 + 5}
        x2={cx - padW / 2 - 50}
        y2={groundY - padH / 2 + 5}
        stroke="#666"
        strokeWidth="0.3"
      />

      {/* ─── Connection bracket ─── */}
      <rect
        x={cx - connW / 2}
        y={groundY - padH - connH + 5}
        width={connW}
        height={connH}
        fill="none"
        stroke="#000"
        strokeWidth="1.5"
      />
      {/* Bolt holes */}
      {[-25, -10, 10, 25].map((offset, i) => (
        <circle
          key={`bolt-${i}`}
          cx={cx + offset}
          cy={groundY - padH - connH / 2 + 5}
          r="3"
          fill="none"
          stroke="#000"
          strokeWidth="1"
        />
      ))}
      <text
        x={cx + connW / 2 + 50}
        y={groundY - padH - connH / 2 + 8}
        fontSize="8"
        fill="#444"
      >
        Steel Bracket
      </text>
      <line
        x1={cx + connW / 2 + 2}
        y1={groundY - padH - connH / 2 + 5}
        x2={cx + connW / 2 + 48}
        y2={groundY - padH - connH / 2 + 5}
        stroke="#666"
        strokeWidth="0.3"
      />

      {/* ─── Module floor slab ─── */}
      <rect
        x={cx - slabW / 2}
        y={groundY - padH - connH - slabH + 5}
        width={slabW}
        height={slabH}
        fill="#ccc"
        stroke="#000"
        strokeWidth="2"
      />
      {/* Slab hatching */}
      <g opacity="0.2">
        {Array.from({ length: 35 }).map((_, i) => (
          <line
            key={`slab-h-${i}`}
            x1={cx - slabW / 2 + i * (slabW / 35)}
            y1={groundY - padH - connH - slabH + 5}
            x2={cx - slabW / 2 + i * (slabW / 35) + slabH}
            y2={groundY - padH - connH + 5}
            stroke="#000"
            strokeWidth="0.3"
          />
        ))}
      </g>
      <text
        x={cx}
        y={groundY - padH - connH - slabH / 2 + 8}
        fontSize="9"
        textAnchor="middle"
        fill="#333"
      >
        Module Floor Slab (200mm)
      </text>

      {/* ─── Dimension lines ─── */}
      {/* Pile depth */}
      {(() => {
        const dx = cx - pileW / 2 - 40;
        const y1 = groundY;
        const y2 = groundY + 20 + pileDepth;
        return (
          <g>
            <line
              x1={dx}
              y1={y1}
              x2={dx}
              y2={y2}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={dx - 4}
              y1={y1}
              x2={dx + 4}
              y2={y1}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={dx - 4}
              y1={y2}
              x2={dx + 4}
              y2={y2}
              stroke="#000"
              strokeWidth="0.5"
            />
            <text
              x={dx - 6}
              y={(y1 + y2) / 2 + 3}
              fontSize="8"
              textAnchor="end"
              fill="#000"
              transform={`rotate(-90, ${dx - 6}, ${(y1 + y2) / 2})`}
            >
              Pile Depth (varies)
            </text>
          </g>
        );
      })()}

      {/* Floor slab to ground */}
      {(() => {
        const dx = cx + slabW / 2 + 40;
        const y1 = groundY;
        const y2 = groundY - padH - connH - slabH + 5;
        return (
          <g>
            <line
              x1={dx}
              y1={y1}
              x2={dx}
              y2={y2}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={dx - 4}
              y1={y1}
              x2={dx + 4}
              y2={y1}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={dx - 4}
              y1={y2}
              x2={dx + 4}
              y2={y2}
              stroke="#000"
              strokeWidth="0.5"
            />
            <text
              x={dx + 8}
              y={(y1 + y2) / 2 + 3}
              fontSize="9"
              fill="#000"
            >
              {padH + connH + slabH}mm
            </text>
          </g>
        );
      })()}

      {/* ─── Soil layer labels ─── */}
      <text x={120} y={groundY + 40} fontSize="8" fill="#8B7355">
        Topsoil
      </text>
      <line
        x1={100}
        y1={groundY + 60}
        x2={700}
        y2={groundY + 60}
        stroke="#8B7355"
        strokeWidth="0.3"
        strokeDasharray="4,3"
      />
      <text x={120} y={groundY + 80} fontSize="8" fill="#8B7355">
        Bearing Soil / Clay
      </text>

      {/* ─── Notes ─── */}
      <text x={100} y={730} fontSize="7" fill="#555">
        NOTES:
      </text>
      <text x={100} y={742} fontSize="7" fill="#555">
        1. Screw pile size and depth per geotechnical report
      </text>
      <text x={100} y={754} fontSize="7" fill="#555">
        2. All steel connections hot-dip galvanized
      </text>
      <text x={100} y={766} fontSize="7" fill="#555">
        3. Module floor slab: reinforced concrete 200mm
      </text>
    </g>
  );
}
