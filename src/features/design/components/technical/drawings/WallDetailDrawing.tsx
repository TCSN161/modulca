import { WALL_THICKNESS_SPECS } from "../../../store";
import type { WallThickness } from "../../../store";

/** Hatching patterns and colors for material types — architectural conventions */
const MATERIAL_STYLES: Record<string, {
  fill: string;
  opacity: number;
  hatchType: "diagonal" | "cross" | "zigzag" | "dots" | "horizontal" | "solid" | "dashes";
}> = {
  cladding:     { fill: "#777", opacity: 0.5, hatchType: "horizontal" },
  plasterboard: { fill: "#ddd", opacity: 0.4, hatchType: "dots" },
  air:          { fill: "#fff", opacity: 0.2, hatchType: "dashes" },
  mgo:          { fill: "#C8B89A", opacity: 0.5, hatchType: "cross" },
  sheathing:    { fill: "#C8B89A", opacity: 0.5, hatchType: "cross" },
  insulation:   { fill: "#FFE4B5", opacity: 0.4, hatchType: "zigzag" },
  wool:         { fill: "#FFE4B5", opacity: 0.4, hatchType: "zigzag" },
  steel:        { fill: "#999", opacity: 0.5, hatchType: "diagonal" },
  frame:        { fill: "#999", opacity: 0.5, hatchType: "diagonal" },
  sip:          { fill: "#aaa", opacity: 0.4, hatchType: "cross" },
  stud:         { fill: "#999", opacity: 0.5, hatchType: "diagonal" },
  vapour:       { fill: "#7EC8E3", opacity: 0.5, hatchType: "solid" },
  barrier:      { fill: "#7EC8E3", opacity: 0.5, hatchType: "solid" },
  service:      { fill: "#DDD", opacity: 0.3, hatchType: "dashes" },
  cavity:       { fill: "#EEE", opacity: 0.2, hatchType: "dashes" },
  batten:       { fill: "#DDD", opacity: 0.3, hatchType: "horizontal" },
};

function getStyle(material: string) {
  const lower = material.toLowerCase();
  for (const [key, val] of Object.entries(MATERIAL_STYLES)) {
    if (lower.includes(key)) return val;
  }
  return { fill: "#ccc", opacity: 0.4, hatchType: "dots" as const };
}

interface WallDetailProps {
  wallColor: string;
  wallType?: WallThickness;
}

export default function WallDetailDrawing({ wallColor: _wallColor, wallType = 25 }: WallDetailProps) {
  void _wallColor; // Kept for API compatibility
  const dtlX = 100;
  const dtlY = 90;

  const spec = WALL_THICKNESS_SPECS[wallType];
  const totalMm = spec.layers.reduce((s, l) => s + l.mm, 0);
  const layerScale = Math.min(2.5, 480 / totalMm);

  const layers = spec.layers.map((l) => {
    const style = getStyle(l.material);
    return { label: l.material, thickness: l.mm, ...style };
  });

  let runX = dtlX + 50;
  const sectionH = 420;
  const labelStartY = dtlY + sectionH + 30;

  return (
    <g>
      {/* ═══ SVG Defs for hatching patterns ═══ */}
      <defs>
        {/* Diagonal hatching (steel/timber structural) */}
        <pattern id="wd-diag" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="#000" strokeWidth="0.4" opacity="0.3" />
        </pattern>
        {/* Cross hatching (masonry/board materials) */}
        <pattern id="wd-cross" width="5" height="5" patternUnits="userSpaceOnUse">
          <line x1="0" y1="5" x2="5" y2="0" stroke="#000" strokeWidth="0.3" opacity="0.2" />
          <line x1="0" y1="0" x2="5" y2="5" stroke="#000" strokeWidth="0.3" opacity="0.2" />
        </pattern>
        {/* Zigzag (insulation — standard architectural) */}
        <pattern id="wd-zigzag" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0,4 L2,0 L4,4 L6,0 L8,4" fill="none" stroke="#000" strokeWidth="0.4" opacity="0.3" />
          <path d="M0,8 L2,4 L4,8 L6,4 L8,8" fill="none" stroke="#000" strokeWidth="0.4" opacity="0.3" />
        </pattern>
        {/* Dots (plaster/concrete) */}
        <pattern id="wd-dots" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.5" fill="#000" opacity="0.2" />
        </pattern>
        {/* Horizontal lines (cladding/boards) */}
        <pattern id="wd-horiz" width="10" height="4" patternUnits="userSpaceOnUse">
          <line x1="0" y1="2" x2="10" y2="2" stroke="#000" strokeWidth="0.3" opacity="0.2" />
        </pattern>
        {/* Dashes (air gaps/cavities) */}
        <pattern id="wd-dashes" width="6" height="6" patternUnits="userSpaceOnUse">
          <line x1="1" y1="3" x2="5" y2="3" stroke="#000" strokeWidth="0.3" opacity="0.15" strokeDasharray="2,2" />
        </pattern>
      </defs>

      {/* ═══ DETAIL BORDER ═══ */}
      <rect
        x={dtlX - 10} y={dtlY - 10}
        width={660} height={700}
        fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="6,3"
      />

      {/* ═══ EXTERIOR / INTERIOR LABELS ═══ */}
      <text
        x={dtlX + 20} y={dtlY + sectionH / 2}
        fontSize="10" fill="#000" fontWeight="bold" letterSpacing="2"
        writingMode="tb"
      >
        EXTERIOR
      </text>

      {/* ═══ CORNER REFERENCE LINES — thick cut lines ═══ */}
      <line x1={dtlX + 50} y1={dtlY + 20} x2={dtlX + 50} y2={dtlY + sectionH + 10} stroke="#000" strokeWidth="2.5" />
      <line x1={dtlX + 50} y1={dtlY + 20} x2={dtlX + 550} y2={dtlY + 20} stroke="#000" strokeWidth="2.5" />

      {/* ═══ LAYER BUILDUP — vertical section through wall ═══ */}
      {layers.map((layer, i) => {
        const lw = layer.thickness * layerScale;
        const x = runX;
        runX += lw;

        const hatchId = layer.hatchType === "diagonal" ? "wd-diag"
          : layer.hatchType === "cross" ? "wd-cross"
          : layer.hatchType === "zigzag" ? "wd-zigzag"
          : layer.hatchType === "dots" ? "wd-dots"
          : layer.hatchType === "horizontal" ? "wd-horiz"
          : layer.hatchType === "dashes" ? "wd-dashes"
          : null;

        return (
          <g key={`layer-${i}`}>
            {/* Layer fill */}
            <rect
              x={x} y={dtlY + 20}
              width={lw} height={sectionH}
              fill={layer.fill} opacity={layer.opacity}
              stroke="#000" strokeWidth="0.5"
            />
            {/* Hatching overlay */}
            {hatchId && layer.hatchType !== "solid" && (
              <rect
                x={x} y={dtlY + 20}
                width={lw} height={sectionH}
                fill={`url(#${hatchId})`}
              />
            )}
            {/* Solid type — thin fill line for membranes */}
            {layer.hatchType === "solid" && (
              <line
                x1={x + lw / 2} y1={dtlY + 20}
                x2={x + lw / 2} y2={dtlY + 20 + sectionH}
                stroke={layer.fill} strokeWidth={lw * 0.6} opacity={0.6}
              />
            )}

            {/* Layer boundary tick at top */}
            <line x1={x} y1={dtlY + 15} x2={x} y2={dtlY + 25} stroke="#000" strokeWidth="0.3" />

            {/* Leader line to label */}
            <line
              x1={x + lw / 2} y1={dtlY + sectionH + 20}
              x2={x + lw / 2} y2={labelStartY + i * 20}
              stroke="#555" strokeWidth="0.3"
            />
            <circle cx={x + lw / 2} cy={dtlY + sectionH + 20} r="1" fill="#555" />

            {/* Label with thickness */}
            <text
              x={x + lw / 2} y={labelStartY + i * 20 + 4}
              fontSize="7" textAnchor="middle" fill="#333"
            >
              {layer.label}
            </text>
            <text
              x={x + lw / 2} y={labelStartY + i * 20 + 14}
              fontSize="6" textAnchor="middle" fill="#888"
            >
              {layer.thickness}mm
            </text>
          </g>
        );
      })}

      {/* Final boundary tick */}
      <line x1={runX} y1={dtlY + 15} x2={runX} y2={dtlY + 25} stroke="#000" strokeWidth="0.3" />

      {/* Interior label */}
      <text
        x={runX + 20} y={dtlY + sectionH / 2}
        fontSize="10" fill="#000" fontWeight="bold" letterSpacing="2"
        writingMode="tb"
      >
        INTERIOR
      </text>

      {/* ═══ DIMENSION ANNOTATION — total wall thickness ═══ */}
      {(() => {
        const dimY = dtlY + 8;
        const startX = dtlX + 50;
        return (
          <g>
            <line x1={startX} y1={dimY} x2={runX} y2={dimY} stroke="#000" strokeWidth="0.5" />
            <line x1={startX - 3} y1={dimY - 3} x2={startX + 3} y2={dimY + 3} stroke="#000" strokeWidth="0.5" />
            <line x1={runX - 3} y1={dimY - 3} x2={runX + 3} y2={dimY + 3} stroke="#000" strokeWidth="0.5" />
            <text x={(startX + runX) / 2} y={dimY - 5} fontSize="9" textAnchor="middle" fill="#000" fontWeight="bold">
              {totalMm}mm
            </text>
          </g>
        );
      })()}

      {/* ═══ WALL TYPE INFO BOX ═══ */}
      <rect
        x={dtlX + 380} y={dtlY + sectionH + 60}
        width={220} height={60}
        fill="none" stroke="#000" strokeWidth="0.5" rx="2"
      />
      <text x={dtlX + 390} y={dtlY + sectionH + 78} fontSize="8" fontWeight="bold" fill="#333">
        {spec.label}
      </text>
      <text x={dtlX + 390} y={dtlY + sectionH + 92} fontSize="7" fill="#555">
        Total thickness: {totalMm}mm ({wallType}cm)
      </text>
      <text x={dtlX + 390} y={dtlY + sectionH + 106} fontSize="7" fill="#555">
        U-value: {spec.uValue} W/(m&sup2;&middot;K)
      </text>

      {/* ═══ HATCHING LEGEND ═══ */}
      <g>
        <text x={dtlX} y={dtlY + sectionH + 80} fontSize="7" fontWeight="bold" fill="#333" letterSpacing="0.5">
          MATERIAL LEGEND
        </text>
        <line x1={dtlX} y1={dtlY + sectionH + 84} x2={dtlX + 130} y2={dtlY + sectionH + 84} stroke="#000" strokeWidth="0.3" />

        {/* Insulation */}
        <rect x={dtlX} y={dtlY + sectionH + 90} width={16} height={10} fill="#FFE4B5" opacity="0.5" stroke="#000" strokeWidth="0.3" />
        <rect x={dtlX} y={dtlY + sectionH + 90} width={16} height={10} fill="url(#wd-zigzag)" />
        <text x={dtlX + 20} y={dtlY + sectionH + 98} fontSize="6" fill="#555">Insulation</text>

        {/* Structural */}
        <rect x={dtlX} y={dtlY + sectionH + 106} width={16} height={10} fill="#999" opacity="0.5" stroke="#000" strokeWidth="0.3" />
        <rect x={dtlX} y={dtlY + sectionH + 106} width={16} height={10} fill="url(#wd-diag)" />
        <text x={dtlX + 20} y={dtlY + sectionH + 114} fontSize="6" fill="#555">Structural Steel</text>

        {/* Board */}
        <rect x={dtlX} y={dtlY + sectionH + 122} width={16} height={10} fill="#C8B89A" opacity="0.5" stroke="#000" strokeWidth="0.3" />
        <rect x={dtlX} y={dtlY + sectionH + 122} width={16} height={10} fill="url(#wd-cross)" />
        <text x={dtlX + 20} y={dtlY + sectionH + 130} fontSize="6" fill="#555">Board (MgO/OSB)</text>

        {/* Vapour barrier */}
        <rect x={dtlX + 100} y={dtlY + sectionH + 90} width={16} height={10} fill="#7EC8E3" opacity="0.5" stroke="#000" strokeWidth="0.3" />
        <text x={dtlX + 120} y={dtlY + sectionH + 98} fontSize="6" fill="#555">Vapour Barrier</text>

        {/* Cladding */}
        <rect x={dtlX + 100} y={dtlY + sectionH + 106} width={16} height={10} fill="#777" opacity="0.5" stroke="#000" strokeWidth="0.3" />
        <rect x={dtlX + 100} y={dtlY + sectionH + 106} width={16} height={10} fill="url(#wd-horiz)" />
        <text x={dtlX + 120} y={dtlY + sectionH + 114} fontSize="6" fill="#555">Cladding</text>

        {/* Air gap */}
        <rect x={dtlX + 100} y={dtlY + sectionH + 122} width={16} height={10} fill="#EEE" opacity="0.3" stroke="#000" strokeWidth="0.3" />
        <rect x={dtlX + 100} y={dtlY + sectionH + 122} width={16} height={10} fill="url(#wd-dashes)" />
        <text x={dtlX + 120} y={dtlY + sectionH + 130} fontSize="6" fill="#555">Air Gap / Cavity</text>
      </g>

      {/* ═══ ADJACENT MODULE INDICATOR ═══ */}
      <line
        x1={runX + 5} y1={dtlY + 150}
        x2={runX + 40} y2={dtlY + 150}
        stroke="#E8913A" strokeWidth="1" strokeDasharray="3,2"
      />
      <line
        x1={runX + 5} y1={dtlY + 150 - 15}
        x2={runX + 5} y2={dtlY + 150 + 15}
        stroke="#E8913A" strokeWidth="1.5"
      />
      <text x={runX + 44} y={dtlY + 147} fontSize="7" fill="#E8913A">Adjacent</text>
      <text x={runX + 44} y={dtlY + 158} fontSize="7" fill="#E8913A">module</text>
    </g>
  );
}
