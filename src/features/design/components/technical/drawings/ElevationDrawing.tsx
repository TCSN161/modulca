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

  // Front elevation shows the SOUTH wall
  const southWall = wallConfigs?.south ?? "solid";
  // Left/right sides show WEST/EAST connection status
  const westWall = wallConfigs?.west ?? "solid";
  const eastWall = wallConfigs?.east ?? "solid";

  const winW = 1200 * elvS;
  const winH = 1200 * hScale;
  const winY = baseElv - slabH - wallH + 900 * hScale;

  const doorW = 900 * elvS;
  const doorH = 2100 * hScale;
  const doorX = elvX + (ew - doorW) / 2;
  const doorY = baseElv - slabH - doorH;

  // Determine what openings to show based on south wall type
  const showDoor = southWall === "door";
  const showWindow = southWall === "window";
  const isOpenSouth = southWall === "none" || southWall === "shared";

  return (
    <g>
      {/* Building outline */}
      <rect
        x={elvX} y={baseElv - slabH - wallH}
        width={ew} height={wallH + slabH}
        fill="none" stroke="#000" strokeWidth="2"
      />

      {isOpenSouth ? (
        /* Open/shared south wall — show dashed outline */
        <>
          <rect
            x={elvX + 1} y={baseElv - slabH - wallH + 1}
            width={ew - 2} height={wallH - 1}
            fill="none" stroke="#999" strokeWidth="0.5" strokeDasharray="6,4"
          />
          <text
            x={elvX + ew / 2} y={baseElv - slabH - wallH / 2 + 4}
            fontSize="10" textAnchor="middle" fill="#999"
          >
            {southWall === "shared" ? "SHARED WALL (OPEN)" : "NO WALL"}
          </text>
        </>
      ) : (
        /* Solid/door/window south wall — show cladding */
        <>
          {/* Cladding indication */}
          {Array.from({ length: 18 }).map((_, i) => (
            <line
              key={`clad-${i}`}
              x1={elvX + 1}
              y1={baseElv - slabH - wallH + i * (wallH / 18)}
              x2={elvX + ew - 1}
              y2={baseElv - slabH - wallH + i * (wallH / 18)}
              stroke={wallColor} strokeWidth="0.3" opacity="0.4"
            />
          ))}

          {/* Window — only if wall type is "window" */}
          {showWindow && (
            <>
              <rect
                x={elvX + (ew - winW) / 2} y={winY}
                width={winW} height={winH}
                fill="#D4E6F1" opacity="0.3" stroke="#000" strokeWidth="1"
              />
              <line x1={elvX + (ew - winW) / 2 + winW / 2} y1={winY} x2={elvX + (ew - winW) / 2 + winW / 2} y2={winY + winH} stroke="#000" strokeWidth="0.5" />
              <line x1={elvX + (ew - winW) / 2} y1={winY + winH / 2} x2={elvX + (ew - winW) / 2 + winW} y2={winY + winH / 2} stroke="#000" strokeWidth="0.5" />
            </>
          )}

          {/* Door — only if wall type is "door" */}
          {showDoor && (
            <>
              <rect
                x={doorX} y={doorY}
                width={doorW} height={doorH}
                fill="#E8E0D0" opacity="0.3" stroke="#000" strokeWidth="1"
              />
              <circle cx={doorX + doorW - 8} cy={doorY + doorH / 2} r="3" fill="none" stroke="#000" strokeWidth="0.5" />
            </>
          )}

          {/* Solid wall — no openings label */}
          {southWall === "solid" && (
            <text
              x={elvX + ew / 2} y={baseElv - slabH - wallH / 2 + 4}
              fontSize="8" textAnchor="middle" fill="#888" opacity="0.5"
            >
              SOLID WALL
            </text>
          )}
        </>
      )}

      {/* Floor slab visible */}
      <rect x={elvX} y={baseElv - slabH} width={ew} height={slabH} fill="#bbb" stroke="#000" strokeWidth="1" />

      {/* Roof line */}
      <rect x={elvX - 8} y={baseElv - slabH - wallH - roofH} width={ew + 16} height={roofH} fill="#999" stroke="#000" strokeWidth="1" />

      {/* Ground line */}
      <line x1={elvX - 25} y1={baseElv} x2={elvX + ew + 25} y2={baseElv} stroke="#000" strokeWidth="0.8" />
      {Array.from({ length: 20 }).map((_, i) => (
        <line
          key={`gnd-elv-${i}`}
          x1={elvX - 25 + i * ((ew + 50) / 20)} y1={baseElv}
          x2={elvX - 25 + i * ((ew + 50) / 20) - 7} y2={baseElv + 7}
          stroke="#000" strokeWidth="0.3"
        />
      ))}

      {/* Height markings */}
      <text x={elvX + ew + 18} y={baseElv - slabH + 4} fontSize="8" fill="#000">±0.00</text>
      <text x={elvX + ew + 18} y={baseElv - slabH - wallH + 4} fontSize="8" fill="#000">+2.70</text>

      {/* Module connection indicators — only show if neighbor exists (shared/none) */}
      {(westWall === "shared" || westWall === "none") && (
        <g>
          <circle cx={elvX} cy={baseElv - slabH - wallH / 2} r="6" fill="none" stroke="#E8913A" strokeWidth="1" />
          <line x1={elvX - 6} y1={baseElv - slabH - wallH / 2} x2={elvX + 6} y2={baseElv - slabH - wallH / 2} stroke="#E8913A" strokeWidth="0.8" />
          <text x={elvX - 15} y={baseElv - slabH - wallH / 2 - 12} fontSize="7" fill="#E8913A" textAnchor="middle">Connection</text>
        </g>
      )}
      {(eastWall === "shared" || eastWall === "none") && (
        <g>
          <circle cx={elvX + ew} cy={baseElv - slabH - wallH / 2} r="6" fill="none" stroke="#E8913A" strokeWidth="1" />
          <line x1={elvX + ew - 6} y1={baseElv - slabH - wallH / 2} x2={elvX + ew + 6} y2={baseElv - slabH - wallH / 2} stroke="#E8913A" strokeWidth="0.8" />
          <text x={elvX + ew + 15} y={baseElv - slabH - wallH / 2 - 12} fontSize="7" fill="#E8913A" textAnchor="middle">Connection</text>
        </g>
      )}

      {/* Cladding label */}
      <text x={elvX + ew / 2} y={baseElv - slabH - wallH - roofH - 8} fontSize="8" textAnchor="middle" fill="#666">
        {wallMat?.label || "Cladding"} Finish
      </text>
    </g>
  );
}
