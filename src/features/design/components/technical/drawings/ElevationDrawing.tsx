import {
  EXT,
  CEIL_H,
  FLOOR_SLAB,
  TOTAL_H,
  type WallMat,
} from "../drawingConstants";
import type { WallConfigs } from "../../../store";

interface FrontElevationProps {
  wallColor: string;
  wallMat: WallMat;
  wallConfigs?: WallConfigs;
}

export default function FrontElevationDrawing({ wallColor, wallMat, wallConfigs }: FrontElevationProps) {
  const elvS = 550 / 3000;
  const elvX = (800 - EXT * elvS) / 2;
  const ew = EXT * elvS;
  const hScale = 350 / TOTAL_H;
  const baseElv = 720;
  const wallH = CEIL_H * hScale;
  const slabH = FLOOR_SLAB * hScale;
  const roofH = 22;
  const parapetH = 8;

  // Front elevation shows the SOUTH wall
  const southWall = wallConfigs?.south ?? "solid";
  const westWall = wallConfigs?.west ?? "solid";
  const eastWall = wallConfigs?.east ?? "solid";

  const winW = 1200 * elvS;
  const winH = 1200 * hScale;
  const winY = baseElv - slabH - wallH + 900 * hScale;

  const doorW = 900 * elvS;
  const doorH = 2100 * hScale;
  const doorX = elvX + (ew - doorW) / 2;
  const doorY = baseElv - slabH - doorH;

  const showDoor = southWall === "door";
  const showWindow = southWall === "window";
  const isOpenSouth = southWall === "none" || southWall === "shared";

  return (
    <g>
      {/* ═══ SVG Defs ═══ */}
      <defs>
        {/* Cladding horizontal lines */}
        <pattern id="elv-cladding" width="100" height="8" patternUnits="userSpaceOnUse">
          <line x1="0" y1="8" x2="100" y2="8" stroke={wallColor} strokeWidth="0.3" opacity="0.3" />
        </pattern>
        {/* Ground hatching */}
        <pattern id="elv-ground" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1="0" y1="5" x2="10" y2="5" stroke="#000" strokeWidth="0.3" opacity="0.15" />
        </pattern>
      </defs>

      {/* ═══ BUILDING OUTLINE ═══ */}
      <rect
        x={elvX} y={baseElv - slabH - wallH}
        width={ew} height={wallH + slabH}
        fill="none" stroke="#000" strokeWidth="2"
      />

      {isOpenSouth ? (
        /* Open/shared south wall */
        <>
          <rect
            x={elvX + 2} y={baseElv - slabH - wallH + 2}
            width={ew - 4} height={wallH - 2}
            fill="none" stroke="#999" strokeWidth="0.5" strokeDasharray="6,4"
          />
          <text
            x={elvX + ew / 2} y={baseElv - slabH - wallH / 2 + 4}
            fontSize="9" textAnchor="middle" fill="#999" letterSpacing="2"
          >
            {southWall === "shared" ? "SHARED WALL" : "NO WALL"}
          </text>
        </>
      ) : (
        <>
          {/* Cladding fill */}
          <rect
            x={elvX + 1} y={baseElv - slabH - wallH + 1}
            width={ew - 2} height={wallH - 1}
            fill="url(#elv-cladding)"
          />

          {/* Window */}
          {showWindow && (
            <g>
              {/* Window frame */}
              <rect
                x={elvX + (ew - winW) / 2} y={winY}
                width={winW} height={winH}
                fill="#D4E6F1" opacity="0.25" stroke="#000" strokeWidth="1.2"
              />
              {/* Mullion cross — architectural convention */}
              <line x1={elvX + (ew - winW) / 2 + winW / 2} y1={winY} x2={elvX + (ew - winW) / 2 + winW / 2} y2={winY + winH} stroke="#000" strokeWidth="0.6" />
              <line x1={elvX + (ew - winW) / 2} y1={winY + winH / 2} x2={elvX + (ew - winW) / 2 + winW} y2={winY + winH / 2} stroke="#000" strokeWidth="0.6" />
              {/* Window sill — projecting line */}
              <line x1={elvX + (ew - winW) / 2 - 4} y1={winY + winH} x2={elvX + (ew - winW) / 2 + winW + 4} y2={winY + winH} stroke="#000" strokeWidth="1" />
              <line x1={elvX + (ew - winW) / 2 - 4} y1={winY + winH + 2} x2={elvX + (ew - winW) / 2 + winW + 4} y2={winY + winH + 2} stroke="#000" strokeWidth="0.3" />
              {/* Glass reflection hint */}
              <line x1={elvX + (ew - winW) / 2 + 6} y1={winY + 4} x2={elvX + (ew - winW) / 2 + winW / 3} y2={winY + winH - 4} stroke="#fff" strokeWidth="0.5" opacity="0.4" />
              {/* Window dimension */}
              <text x={elvX + ew / 2} y={winY - 5} fontSize="6" textAnchor="middle" fill="#555">1200 x 1200</text>
            </g>
          )}

          {/* Door */}
          {showDoor && (
            <g>
              {/* Door frame */}
              <rect
                x={doorX} y={doorY}
                width={doorW} height={doorH}
                fill="#E8E0D0" opacity="0.2" stroke="#000" strokeWidth="1.2"
              />
              {/* Door panel lines */}
              <rect
                x={doorX + 4} y={doorY + 4}
                width={doorW - 8} height={doorH * 0.4}
                fill="none" stroke="#000" strokeWidth="0.3"
              />
              <rect
                x={doorX + 4} y={doorY + doorH * 0.45}
                width={doorW - 8} height={doorH * 0.5}
                fill="none" stroke="#000" strokeWidth="0.3"
              />
              {/* Door handle */}
              <circle cx={doorX + doorW - 10} cy={doorY + doorH / 2} r="3" fill="none" stroke="#000" strokeWidth="0.6" />
              {/* Threshold */}
              <line x1={doorX - 3} y1={doorY + doorH} x2={doorX + doorW + 3} y2={doorY + doorH} stroke="#000" strokeWidth="1" />
              {/* Door dimension */}
              <text x={doorX + doorW / 2} y={doorY - 5} fontSize="6" textAnchor="middle" fill="#555">900 x 2100</text>
            </g>
          )}

          {/* Solid wall label */}
          {southWall === "solid" && (
            <text
              x={elvX + ew / 2} y={baseElv - slabH - wallH / 2 + 4}
              fontSize="8" textAnchor="middle" fill="#888" opacity="0.4" letterSpacing="2"
            >
              SOLID WALL
            </text>
          )}
        </>
      )}

      {/* ═══ FLOOR SLAB ═══ */}
      <rect x={elvX} y={baseElv - slabH} width={ew} height={slabH} fill="#bbb" stroke="#000" strokeWidth="1" />
      {/* Concrete dots in slab */}
      <defs>
        <pattern id="elv-slab-concrete" width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="0.4" fill="#000" opacity="0.15" />
        </pattern>
      </defs>
      <rect x={elvX} y={baseElv - slabH} width={ew} height={slabH} fill="url(#elv-slab-concrete)" />

      {/* ═══ ROOF — flat with parapet ═══ */}
      <rect x={elvX - 6} y={baseElv - slabH - wallH - roofH} width={ew + 12} height={roofH} fill="#888" stroke="#000" strokeWidth="1" />
      {/* Parapet cap */}
      <rect x={elvX - 8} y={baseElv - slabH - wallH - roofH - parapetH} width={ew + 16} height={parapetH} fill="#999" stroke="#000" strokeWidth="0.8" />
      {/* Drip edge line */}
      <line x1={elvX - 8} y1={baseElv - slabH - wallH - roofH} x2={elvX + ew + 8} y2={baseElv - slabH - wallH - roofH} stroke="#000" strokeWidth="0.5" />

      {/* ═══ GROUND ═══ */}
      <line x1={elvX - 30} y1={baseElv} x2={elvX + ew + 30} y2={baseElv} stroke="#000" strokeWidth="0.8" />
      <rect x={elvX - 30} y={baseElv} width={ew + 60} height={12} fill="url(#elv-ground)" />
      {/* Ground hatching marks */}
      {Array.from({ length: 22 }).map((_, i) => (
        <line
          key={`gnd-elv-${i}`}
          x1={elvX - 30 + i * ((ew + 60) / 22)} y1={baseElv}
          x2={elvX - 30 + i * ((ew + 60) / 22) - 7} y2={baseElv + 8}
          stroke="#000" strokeWidth="0.3"
        />
      ))}

      {/* ═══ LEVEL MARKS — proper architectural triangles ═══ */}
      <ElevationLevel x={elvX + ew + 20} y={baseElv - slabH} label="&plusmn;0.000" />
      <ElevationLevel x={elvX + ew + 20} y={baseElv - slabH - wallH} label="+2.700" />
      <ElevationLevel x={elvX + ew + 20} y={baseElv - slabH - wallH - roofH - parapetH} label={`+${((CEIL_H + FLOOR_SLAB + roofH / hScale + parapetH / hScale) / 1000).toFixed(3)}`} />
      <ElevationLevel x={elvX + ew + 20} y={baseElv} label="-0.200" />

      {/* ═══ HEIGHT DIMENSIONS ═══ */}
      {/* Floor to ceiling */}
      {(() => {
        const dx = elvX - 20;
        const y1 = baseElv - slabH;
        const y2 = baseElv - slabH - wallH;
        return (
          <g>
            <line x1={elvX - 5} y1={y1} x2={dx - 5} y2={y1} stroke="#000" strokeWidth="0.2" />
            <line x1={elvX - 5} y1={y2} x2={dx - 5} y2={y2} stroke="#000" strokeWidth="0.2" />
            <line x1={dx} y1={y1} x2={dx} y2={y2} stroke="#000" strokeWidth="0.5" />
            <line x1={dx - 3} y1={y1 - 3} x2={dx + 3} y2={y1 + 3} stroke="#000" strokeWidth="0.5" />
            <line x1={dx - 3} y1={y2 - 3} x2={dx + 3} y2={y2 + 3} stroke="#000" strokeWidth="0.5" />
            <text x={dx - 5} y={(y1 + y2) / 2 + 3} fontSize="8" fill="#000" textAnchor="end">2 700</text>
          </g>
        );
      })()}

      {/* Width dimension (bottom) */}
      {(() => {
        const dy = baseElv + 20;
        return (
          <g>
            <line x1={elvX} y1={baseElv + 12} x2={elvX} y2={dy + 5} stroke="#000" strokeWidth="0.2" />
            <line x1={elvX + ew} y1={baseElv + 12} x2={elvX + ew} y2={dy + 5} stroke="#000" strokeWidth="0.2" />
            <line x1={elvX} y1={dy} x2={elvX + ew} y2={dy} stroke="#000" strokeWidth="0.5" />
            <line x1={elvX - 3} y1={dy - 3} x2={elvX + 3} y2={dy + 3} stroke="#000" strokeWidth="0.5" />
            <line x1={elvX + ew - 3} y1={dy - 3} x2={elvX + ew + 3} y2={dy + 3} stroke="#000" strokeWidth="0.5" />
            <text x={elvX + ew / 2} y={dy - 4} fontSize="9" textAnchor="middle" fill="#000">3 000</text>
          </g>
        );
      })()}

      {/* ═══ MODULE CONNECTION INDICATORS ═══ */}
      {(westWall === "shared" || westWall === "none") && (
        <g>
          <line x1={elvX} y1={baseElv - slabH - wallH / 2 - 8} x2={elvX} y2={baseElv - slabH - wallH / 2 + 8} stroke="#E8913A" strokeWidth="1.5" />
          <line x1={elvX - 6} y1={baseElv - slabH - wallH / 2} x2={elvX + 6} y2={baseElv - slabH - wallH / 2} stroke="#E8913A" strokeWidth="1.5" />
          <text x={elvX - 10} y={baseElv - slabH - wallH / 2 - 12} fontSize="6" fill="#E8913A" textAnchor="end">
            MODULE
          </text>
          <text x={elvX - 10} y={baseElv - slabH - wallH / 2 - 4} fontSize="6" fill="#E8913A" textAnchor="end">
            CONNECTION
          </text>
        </g>
      )}
      {(eastWall === "shared" || eastWall === "none") && (
        <g>
          <line x1={elvX + ew} y1={baseElv - slabH - wallH / 2 - 8} x2={elvX + ew} y2={baseElv - slabH - wallH / 2 + 8} stroke="#E8913A" strokeWidth="1.5" />
          <line x1={elvX + ew - 6} y1={baseElv - slabH - wallH / 2} x2={elvX + ew + 6} y2={baseElv - slabH - wallH / 2} stroke="#E8913A" strokeWidth="1.5" />
        </g>
      )}

      {/* ═══ CLADDING MATERIAL LABEL ═══ */}
      <g>
        <circle cx={elvX + ew * 0.8} cy={baseElv - slabH - wallH * 0.4} r="1.5" fill="#555" />
        <line x1={elvX + ew * 0.8} y1={baseElv - slabH - wallH * 0.4} x2={elvX + ew + 15} y2={baseElv - slabH - wallH * 0.25} stroke="#555" strokeWidth="0.3" />
        <line x1={elvX + ew + 15} y1={baseElv - slabH - wallH * 0.25} x2={elvX + ew + 65} y2={baseElv - slabH - wallH * 0.25} stroke="#555" strokeWidth="0.3" />
        <text x={elvX + ew + 18} y={baseElv - slabH - wallH * 0.25 - 3} fontSize="6" fill="#555">
          {wallMat?.label || "Cladding"} Finish
        </text>
      </g>
    </g>
  );
}

/* ── Elevation level mark — triangle + level text ── */
function ElevationLevel({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      {/* Triangle marker */}
      <polygon points={`${x},${y} ${x + 5},${y - 4} ${x + 5},${y + 4}`} fill="#000" />
      {/* Extension line */}
      <line x1={x + 5} y1={y} x2={x + 12} y2={y} stroke="#000" strokeWidth="0.3" />
      {/* Level text */}
      <text x={x + 14} y={y + 3} fontSize="7" fill="#000">{label}</text>
    </g>
  );
}
