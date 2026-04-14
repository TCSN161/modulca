import { WALL_THICKNESS, EXT } from "../drawingConstants";

/* ── MEP config per module type ── */
interface MepElement {
  type: "outlet" | "light" | "switch" | "plumbing-cold" | "plumbing-hot" | "drain" | "hvac";
  x: number; // fraction 0–1 of interior
  y: number; // fraction 0–1 of interior
  x2?: number;
  y2?: number;
  label?: string;
}

const MEP_CONFIGS: Record<string, MepElement[]> = {
  kitchen: [
    // Outlets along countertop wall (north)
    { type: "outlet", x: 0.2, y: 0.08 },
    { type: "outlet", x: 0.45, y: 0.08 },
    { type: "outlet", x: 0.7, y: 0.08 },
    // Outlet for fridge (east wall)
    { type: "outlet", x: 0.92, y: 0.15 },
    // Outlet for dishwasher (under counter)
    { type: "outlet", x: 0.35, y: 0.18 },
    // Light - main ceiling
    { type: "light", x: 0.5, y: 0.5 },
    // Light - counter task light
    { type: "light", x: 0.45, y: 0.15 },
    { type: "switch", x: 0.95, y: 0.9 },
    // Cold water to sink
    { type: "plumbing-cold", x: 0.05, y: 0, x2: 0.05, y2: 0.6 },
    { type: "plumbing-cold", x: 0.05, y: 0.35, x2: 0.3, y2: 0.35 },
    // Hot water to sink
    { type: "plumbing-hot", x: 0.1, y: 0, x2: 0.1, y2: 0.4 },
    { type: "plumbing-hot", x: 0.1, y: 0.4, x2: 0.3, y2: 0.4 },
    // Drain from sink
    { type: "drain", x: 0.3, y: 0.3, x2: 0.3, y2: 1 },
    // HVAC
    { type: "hvac", x: 0.15, y: 0.03 },
  ],
  bathroom: [
    // Outlets - mirror/shaver
    { type: "outlet", x: 0.35, y: 0.08 },
    // Outlet for heated towel rail
    { type: "outlet", x: 0.92, y: 0.5 },
    // Light - main
    { type: "light", x: 0.5, y: 0.5 },
    // Light - mirror
    { type: "light", x: 0.35, y: 0.12 },
    { type: "switch", x: 0.95, y: 0.9 },
    // Cold water - main riser to WC, basin, shower
    { type: "plumbing-cold", x: 0.05, y: 0, x2: 0.05, y2: 1 },
    { type: "plumbing-cold", x: 0.05, y: 0.2, x2: 0.35, y2: 0.2 },
    { type: "plumbing-cold", x: 0.05, y: 0.7, x2: 0.25, y2: 0.7 },
    { type: "plumbing-cold", x: 0.05, y: 0.5, x2: 0.7, y2: 0.5 },
    // Hot water
    { type: "plumbing-hot", x: 0.1, y: 0, x2: 0.1, y2: 0.55 },
    { type: "plumbing-hot", x: 0.1, y: 0.25, x2: 0.35, y2: 0.25 },
    { type: "plumbing-hot", x: 0.1, y: 0.55, x2: 0.7, y2: 0.55 },
    // Drain - WC, basin, shower
    { type: "drain", x: 0.25, y: 0.65, x2: 0.25, y2: 1 },
    { type: "drain", x: 0.35, y: 0.15, x2: 0.35, y2: 0.65 },
    { type: "drain", x: 0.7, y: 0.45, x2: 0.7, y2: 0.65 },
    { type: "drain", x: 0.25, y: 0.65, x2: 0.7, y2: 0.65 },
    // Ventilation extract
    { type: "hvac", x: 0.15, y: 0.03 },
  ],
  bedroom: [
    // Outlets - bedside x2
    { type: "outlet", x: 0.15, y: 0.08 },
    { type: "outlet", x: 0.85, y: 0.08 },
    // Outlet - desk/TV wall
    { type: "outlet", x: 0.5, y: 0.92 },
    { type: "outlet", x: 0.08, y: 0.5 },
    // Light - main ceiling
    { type: "light", x: 0.5, y: 0.45 },
    { type: "switch", x: 0.95, y: 0.9 },
    { type: "switch", x: 0.15, y: 0.18 },
    // HVAC supply
    { type: "hvac", x: 0.15, y: 0.03 },
  ],
  living: [
    // Outlets - TV wall
    { type: "outlet", x: 0.5, y: 0.08 },
    { type: "outlet", x: 0.7, y: 0.08 },
    // Outlets - sofa sides
    { type: "outlet", x: 0.08, y: 0.5 },
    { type: "outlet", x: 0.92, y: 0.5 },
    // Floor outlet
    { type: "outlet", x: 0.5, y: 0.7 },
    // Lights - main + accent
    { type: "light", x: 0.5, y: 0.4 },
    { type: "light", x: 0.2, y: 0.2 },
    { type: "light", x: 0.8, y: 0.2 },
    { type: "switch", x: 0.95, y: 0.9 },
    // HVAC
    { type: "hvac", x: 0.15, y: 0.03 },
  ],
  office: [
    // Outlets - desk area (multiple)
    { type: "outlet", x: 0.3, y: 0.08 },
    { type: "outlet", x: 0.5, y: 0.08 },
    { type: "outlet", x: 0.7, y: 0.08 },
    // Outlet - printer
    { type: "outlet", x: 0.92, y: 0.3 },
    // Outlet - general
    { type: "outlet", x: 0.08, y: 0.5 },
    // Light - main + task
    { type: "light", x: 0.5, y: 0.4 },
    { type: "light", x: 0.5, y: 0.15 },
    { type: "switch", x: 0.95, y: 0.9 },
    { type: "hvac", x: 0.15, y: 0.03 },
  ],
  hallway: [
    { type: "outlet", x: 0.5, y: 0.08 },
    { type: "outlet", x: 0.5, y: 0.92 },
    { type: "light", x: 0.5, y: 0.3 },
    { type: "light", x: 0.5, y: 0.7 },
    { type: "switch", x: 0.95, y: 0.9 },
    { type: "switch", x: 0.05, y: 0.1 },
    { type: "hvac", x: 0.15, y: 0.03 },
  ],
  storage: [
    { type: "outlet", x: 0.5, y: 0.92 },
    { type: "light", x: 0.5, y: 0.5 },
    { type: "switch", x: 0.95, y: 0.9 },
  ],
  terrace: [
    // Weatherproof outlet
    { type: "outlet", x: 0.08, y: 0.5 },
    // Exterior light
    { type: "light", x: 0.5, y: 0.5 },
    { type: "switch", x: 0.95, y: 0.9 },
  ],
};

const DEFAULT_CONFIG = MEP_CONFIGS.living;

interface Props {
  moduleType: string;
}

export default function MEPPlanDrawing({ moduleType }: Props) {
  const S = 550 / 3000;
  const ox = (800 - EXT * S) / 2;
  const oy = 100;
  const w = EXT * S;
  const h = EXT * S;
  const wt = WALL_THICKNESS * 1000 * S;

  const elements = MEP_CONFIGS[moduleType] || DEFAULT_CONFIG;

  // Interior origin and size
  const ix = ox + wt;
  const iy = oy + wt;
  const iw = w - wt * 2;
  const ih = h - wt * 2;

  // Count elements for info
  const outletCount = elements.filter((e) => e.type === "outlet").length;
  const lightCount = elements.filter((e) => e.type === "light").length;
  const hasPlumbing = elements.some((e) => e.type.startsWith("plumbing") || e.type === "drain");
  const hasHvac = elements.some((e) => e.type === "hvac");

  return (
    <g>
      {/* Module outline */}
      <rect x={ox} y={oy} width={w} height={h} fill="none" stroke="#aaa" strokeWidth="1" />
      {/* Interior area */}
      <rect x={ix} y={iy} width={iw} height={ih} fill="#FAFAFA" stroke="#ccc" strokeWidth="0.5" />

      {/* Module type label */}
      <text x={ox + w / 2} y={oy - 25} fontSize="10" textAnchor="middle" fontWeight="bold" fill="#333">
        MEP PLAN — {moduleType.toUpperCase()}
      </text>

      {/* ─── Render MEP elements ─── */}

      {/* Plumbing lines first (behind everything) */}
      {elements
        .filter((e) => e.type === "plumbing-cold" && e.x2 != null && e.y2 != null)
        .map((e, i) => (
          <line
            key={`cw-${i}`}
            x1={ix + e.x * iw}
            y1={iy + e.y * ih}
            x2={ix + e.x2! * iw}
            y2={iy + e.y2! * ih}
            stroke="#4CAF50"
            strokeWidth="1.5"
            strokeDasharray="6,3"
          />
        ))}

      {elements
        .filter((e) => e.type === "plumbing-hot" && e.x2 != null && e.y2 != null)
        .map((e, i) => (
          <line
            key={`hw-${i}`}
            x1={ix + e.x * iw}
            y1={iy + e.y * ih}
            x2={ix + e.x2! * iw}
            y2={iy + e.y2! * ih}
            stroke="#F44336"
            strokeWidth="1"
            strokeDasharray="4,3"
          />
        ))}

      {elements
        .filter((e) => e.type === "drain" && e.x2 != null && e.y2 != null)
        .map((e, i) => (
          <line
            key={`drain-${i}`}
            x1={ix + e.x * iw}
            y1={iy + e.y * ih}
            x2={ix + e.x2! * iw}
            y2={iy + e.y2! * ih}
            stroke="#4CAF50"
            strokeWidth="2"
            strokeDasharray="8,4"
          />
        ))}

      {/* HVAC ducts */}
      {elements
        .filter((e) => e.type === "hvac")
        .map((e, i) => {
          const dx = ix + e.x * iw;
          const dy = iy + e.y * ih;
          return (
            <g key={`hvac-${i}`}>
              <rect
                x={dx}
                y={dy}
                width={iw * 0.7}
                height={20}
                fill="none"
                stroke="#9C27B0"
                strokeWidth="1"
                strokeDasharray="4,2"
              />
              <text
                x={dx + iw * 0.35}
                y={dy + 13}
                fontSize="7"
                textAnchor="middle"
                fill="#9C27B0"
              >
                {moduleType === "bathroom" ? "Extract Vent" : "HVAC Supply"}
              </text>
              {/* Connection box */}
              <rect
                x={dx - (ix - ox) + 2}
                y={dy}
                width={ix - ox + e.x * iw - 4}
                height={20}
                fill="none"
                stroke="#9C27B0"
                strokeWidth="1.5"
              />
              <text
                x={dx - (ix - ox) / 2 + 2}
                y={dy + 30}
                fontSize="6"
                textAnchor="middle"
                fill="#9C27B0"
              >
                HVAC Conn.
              </text>
            </g>
          );
        })}

      {/* Electrical conduit runs */}
      {(() => {
        const outlets = elements.filter((e) => e.type === "outlet");
        if (outlets.length < 2) return null;
        // Main conduit path from entry (bottom center) branching to outlets
        const entryX = ix + iw / 2;
        const entryY = iy + ih;
        const conduitY = iy + ih - 15;
        return (
          <g>
            {/* Vertical from entry */}
            <line x1={entryX} y1={entryY} x2={entryX} y2={conduitY} stroke="#2196F3" strokeWidth="0.5" />
            {/* Horizontal conduit bus */}
            <line
              x1={ix + Math.min(...outlets.map((o) => o.x)) * iw}
              y1={conduitY}
              x2={ix + Math.max(...outlets.map((o) => o.x)) * iw}
              y2={conduitY}
              stroke="#2196F3"
              strokeWidth="0.5"
            />
            {/* Branches to each outlet */}
            {outlets.map((o, i) => (
              <line
                key={`cond-${i}`}
                x1={ix + o.x * iw}
                y1={conduitY}
                x2={ix + o.x * iw}
                y2={iy + o.y * ih}
                stroke="#2196F3"
                strokeWidth="0.5"
              />
            ))}
          </g>
        );
      })()}

      {/* Outlets */}
      {elements
        .filter((e) => e.type === "outlet")
        .map((e, i) => {
          const cx = ix + e.x * iw;
          const cy = iy + e.y * ih;
          return (
            <g key={`outlet-${i}`}>
              <circle cx={cx} cy={cy} r="7" fill="none" stroke="#2196F3" strokeWidth="0.8" />
              <line x1={cx - 4} y1={cy} x2={cx + 4} y2={cy} stroke="#2196F3" strokeWidth="0.8" />
              <line x1={cx} y1={cy - 4} x2={cx} y2={cy + 4} stroke="#2196F3" strokeWidth="0.8" />
            </g>
          );
        })}

      {/* Switches */}
      {elements
        .filter((e) => e.type === "switch")
        .map((e, i) => (
          <text
            key={`sw-${i}`}
            x={ix + e.x * iw}
            y={iy + e.y * ih + 4}
            fontSize="12"
            fill="#2196F3"
            textAnchor="middle"
          >
            S
          </text>
        ))}

      {/* Light fixtures */}
      {elements
        .filter((e) => e.type === "light")
        .map((e, i) => {
          const cx = ix + e.x * iw;
          const cy = iy + e.y * ih;
          return (
            <g key={`light-${i}`}>
              <circle cx={cx} cy={cy} r="10" fill="none" stroke="#FFC107" strokeWidth="0.8" />
              <line x1={cx - 7} y1={cy - 7} x2={cx + 7} y2={cy + 7} stroke="#FFC107" strokeWidth="0.5" />
              <line x1={cx + 7} y1={cy - 7} x2={cx - 7} y2={cy + 7} stroke="#FFC107" strokeWidth="0.5" />
            </g>
          );
        })}

      {/* Plumbing labels */}
      {hasPlumbing && (
        <g>
          <text x={ix + 2} y={iy + ih * 0.6} fontSize="6" fill="#4CAF50" writingMode="tb">CW</text>
          {elements.some((e) => e.type === "plumbing-hot") && (
            <text x={ix + 12} y={iy + ih * 0.15} fontSize="6" fill="#F44336">HW</text>
          )}
        </g>
      )}

      {/* ─── Legend ─── */}
      <g>
        <rect x={ox + w + 30} y={oy} width={120} height={hasPlumbing ? 155 : 100} fill="none" stroke="#999" strokeWidth="0.5" />
        <text x={ox + w + 40} y={oy + 15} fontSize="8" fontWeight="bold" fill="#000">LEGEND</text>

        {/* Electrical outlet */}
        <circle cx={ox + w + 45} cy={oy + 32} r="5" fill="none" stroke="#2196F3" strokeWidth="1" />
        <line x1={ox + w + 42} y1={oy + 32} x2={ox + w + 48} y2={oy + 32} stroke="#2196F3" strokeWidth="1" />
        <line x1={ox + w + 45} y1={oy + 29} x2={ox + w + 45} y2={oy + 35} stroke="#2196F3" strokeWidth="1" />
        <text x={ox + w + 55} y={oy + 35} fontSize="7" fill="#2196F3">Outlet ({outletCount})</text>

        {/* Light */}
        <circle cx={ox + w + 45} cy={oy + 52} r="5" fill="none" stroke="#FFC107" strokeWidth="1" />
        <line x1={ox + w + 40} y1={oy + 47} x2={ox + w + 50} y2={oy + 57} stroke="#FFC107" strokeWidth="0.5" />
        <line x1={ox + w + 50} y1={oy + 47} x2={ox + w + 40} y2={oy + 57} stroke="#FFC107" strokeWidth="0.5" />
        <text x={ox + w + 55} y={oy + 55} fontSize="7" fill="#FFC107">Light ({lightCount})</text>

        {/* Switch */}
        <text x={ox + w + 45} y={oy + 75} fontSize="10" textAnchor="middle" fill="#2196F3">S</text>
        <text x={ox + w + 55} y={oy + 75} fontSize="7" fill="#2196F3">Switch</text>

        {hasPlumbing && (
          <>
            <line x1={ox + w + 38} y1={oy + 92} x2={ox + w + 52} y2={oy + 92} stroke="#4CAF50" strokeWidth="1.5" strokeDasharray="4,2" />
            <text x={ox + w + 55} y={oy + 95} fontSize="7" fill="#4CAF50">Cold Water</text>

            <line x1={ox + w + 38} y1={oy + 110} x2={ox + w + 52} y2={oy + 110} stroke="#F44336" strokeWidth="1" strokeDasharray="4,2" />
            <text x={ox + w + 55} y={oy + 113} fontSize="7" fill="#F44336">Hot Water</text>

            <line x1={ox + w + 38} y1={oy + 128} x2={ox + w + 52} y2={oy + 128} stroke="#4CAF50" strokeWidth="2" strokeDasharray="6,3" />
            <text x={ox + w + 55} y={oy + 131} fontSize="7" fill="#4CAF50">Drain</text>
          </>
        )}

        {hasHvac && (
          <>
            <rect x={ox + w + 39} y={oy + (hasPlumbing ? 140 : 86)} width={12} height={8} fill="none" stroke="#9C27B0" strokeWidth="1" strokeDasharray="2,1" />
            <text x={ox + w + 55} y={oy + (hasPlumbing ? 149 : 95)} fontSize="7" fill="#9C27B0">HVAC</text>
          </>
        )}
      </g>

      {/* Dimension - overall */}
      {(() => {
        const dy = oy - 15;
        return (
          <g>
            <line x1={ox} y1={dy} x2={ox + w} y2={dy} stroke="#000" strokeWidth="0.5" />
            <line x1={ox} y1={dy - 4} x2={ox} y2={dy + 4} stroke="#000" strokeWidth="0.5" />
            <line x1={ox + w} y1={dy - 4} x2={ox + w} y2={dy + 4} stroke="#000" strokeWidth="0.5" />
            <text x={ox + w / 2} y={dy - 4} fontSize="9" textAnchor="middle" fill="#000">3000</text>
          </g>
        );
      })()}
    </g>
  );
}
