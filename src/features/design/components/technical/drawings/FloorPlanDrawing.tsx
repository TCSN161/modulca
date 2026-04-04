import {
  WALL_THICKNESS,
  EXT,
  INT,
  type FloorMat,
  type WallMat,
  type Preset,
} from "../drawingConstants";

interface FloorPlanProps {
  floorColor: string;
  wallColor: string;
  floorMat: FloorMat;
  wallMat: WallMat;
  preset: Preset;
}

export default function FloorPlanDrawing({
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
