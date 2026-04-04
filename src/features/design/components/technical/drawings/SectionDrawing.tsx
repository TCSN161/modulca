import {
  WALL_THICKNESS,
  EXT,
  CEIL_H,
  FLOOR_SLAB,
  TOTAL_H,
  type FloorMat,
} from "../drawingConstants";

interface SectionAAProps {
  floorColor: string;
  wallColor: string;
  floorMat: FloorMat;
}

export default function SectionAADrawing({ floorColor, wallColor, floorMat }: SectionAAProps) {
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
