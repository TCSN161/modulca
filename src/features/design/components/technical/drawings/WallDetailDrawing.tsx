import { WALL_THICKNESS_SPECS } from "../../../store";
import type { WallThickness } from "../../../store";

/** Colour map for drawing layers — maps material keywords to fill colours */
const LAYER_COLORS: Record<string, { color: string; opacity: number }> = {
  cladding:     { color: "#888", opacity: 0.6 },
  plasterboard: { color: "#ccc", opacity: 0.4 },
  air:          { color: "#fff", opacity: 0.3 },
  mgo:          { color: "#C8B89A", opacity: 0.5 },
  sheathing:    { color: "#C8B89A", opacity: 0.5 },
  insulation:   { color: "#FFE4B5", opacity: 0.5 },
  wool:         { color: "#FFE4B5", opacity: 0.5 },
  steel:        { color: "#999", opacity: 0.5 },
  frame:        { color: "#999", opacity: 0.5 },
  sip:          { color: "#999", opacity: 0.5 },
  stud:         { color: "#999", opacity: 0.5 },
  vapour:       { color: "#7EC8E3", opacity: 0.6 },
  barrier:      { color: "#7EC8E3", opacity: 0.6 },
  service:      { color: "#DDD", opacity: 0.3 },
  cavity:       { color: "#DDD", opacity: 0.3 },
  batten:       { color: "#DDD", opacity: 0.3 },
};

function colorFor(material: string, wallColor: string): { color: string; opacity: number } {
  const lower = material.toLowerCase();
  // Check for keyword matches
  for (const [key, val] of Object.entries(LAYER_COLORS)) {
    if (lower.includes(key)) return val;
  }
  // Fallback: use wall colour (interior/exterior finish)
  return { color: wallColor, opacity: 0.5 };
}

interface WallDetailProps {
  wallColor: string;
  wallType?: WallThickness;
}

export default function WallDetailDrawing({ wallColor, wallType = 25 }: WallDetailProps) {
  const dtlX = 80;
  const dtlY = 90;

  const spec = WALL_THICKNESS_SPECS[wallType];
  const totalMm = spec.layers.reduce((s, l) => s + l.mm, 0);
  const layerScale = Math.min(2.2, 440 / totalMm); // auto-scale to fit

  const layers = spec.layers.map((l) => {
    const { color, opacity } = colorFor(l.material, wallColor);
    return { label: l.material, thickness: l.mm, color, opacity };
  });

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
        Total wall: {totalMm}mm ({spec.label}) — U={spec.uValue} W/(m²·K)
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
