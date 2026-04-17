import type { ReactElement } from "react";
import { WALL_THICKNESS, EXT, INT } from "../drawingConstants";

/* ═══════════════════════════════════════════════════════════════════ */
/*  MEP config per module type                                         */
/* ═══════════════════════════════════════════════════════════════════ */

type MepType =
  | "outlet" | "light" | "switch"
  | "plumbing-cold" | "plumbing-hot" | "drain"
  | "hvac-supply" | "hvac-return" | "thermostat"
  | "fixture-wc" | "fixture-sink" | "fixture-bath" | "fixture-shower";

interface MepElement {
  type: MepType;
  x: number; y: number;
  x2?: number; y2?: number;
  label?: string;
}

const MEP_CONFIGS: Record<string, MepElement[]> = {
  kitchen: [
    { type: "outlet", x: 0.2, y: 0.08 },
    { type: "outlet", x: 0.45, y: 0.08 },
    { type: "outlet", x: 0.7, y: 0.08 },
    { type: "outlet", x: 0.92, y: 0.15 },
    { type: "outlet", x: 0.35, y: 0.18 },
    { type: "light", x: 0.5, y: 0.5 },
    { type: "light", x: 0.45, y: 0.15 },
    { type: "switch", x: 0.95, y: 0.9 },
    { type: "fixture-sink", x: 0.3, y: 0.15 },
    { type: "plumbing-cold", x: 0.05, y: 0, x2: 0.05, y2: 0.6 },
    { type: "plumbing-cold", x: 0.05, y: 0.35, x2: 0.3, y2: 0.35 },
    { type: "plumbing-hot", x: 0.1, y: 0, x2: 0.1, y2: 0.4 },
    { type: "plumbing-hot", x: 0.1, y: 0.4, x2: 0.3, y2: 0.4 },
    { type: "drain", x: 0.3, y: 0.3, x2: 0.3, y2: 1 },
    { type: "hvac-supply", x: 0.2, y: 0.03 },
    { type: "hvac-return", x: 0.8, y: 0.03 },
    { type: "thermostat", x: 0.95, y: 0.75 },
  ],
  bathroom: [
    { type: "outlet", x: 0.35, y: 0.08 },
    { type: "outlet", x: 0.92, y: 0.5 },
    { type: "light", x: 0.5, y: 0.5 },
    { type: "light", x: 0.35, y: 0.12 },
    { type: "switch", x: 0.95, y: 0.9 },
    { type: "fixture-wc", x: 0.25, y: 0.8 },
    { type: "fixture-sink", x: 0.35, y: 0.15 },
    { type: "fixture-shower", x: 0.75, y: 0.55 },
    { type: "fixture-bath", x: 0.75, y: 0.8 },
    { type: "plumbing-cold", x: 0.05, y: 0, x2: 0.05, y2: 1 },
    { type: "plumbing-cold", x: 0.05, y: 0.2, x2: 0.35, y2: 0.2 },
    { type: "plumbing-cold", x: 0.05, y: 0.7, x2: 0.25, y2: 0.7 },
    { type: "plumbing-cold", x: 0.05, y: 0.5, x2: 0.7, y2: 0.5 },
    { type: "plumbing-hot", x: 0.1, y: 0, x2: 0.1, y2: 0.55 },
    { type: "plumbing-hot", x: 0.1, y: 0.25, x2: 0.35, y2: 0.25 },
    { type: "plumbing-hot", x: 0.1, y: 0.55, x2: 0.7, y2: 0.55 },
    { type: "drain", x: 0.25, y: 0.75, x2: 0.25, y2: 1 },
    { type: "drain", x: 0.35, y: 0.2, x2: 0.35, y2: 0.75 },
    { type: "drain", x: 0.75, y: 0.6, x2: 0.75, y2: 0.75 },
    { type: "drain", x: 0.25, y: 0.75, x2: 0.75, y2: 0.75 },
    { type: "hvac-return", x: 0.5, y: 0.03 },
    { type: "thermostat", x: 0.95, y: 0.75 },
  ],
  bedroom: [
    { type: "outlet", x: 0.15, y: 0.08 },
    { type: "outlet", x: 0.85, y: 0.08 },
    { type: "outlet", x: 0.5, y: 0.92 },
    { type: "outlet", x: 0.08, y: 0.5 },
    { type: "light", x: 0.5, y: 0.45 },
    { type: "switch", x: 0.95, y: 0.9 },
    { type: "switch", x: 0.15, y: 0.18 },
    { type: "hvac-supply", x: 0.2, y: 0.03 },
    { type: "hvac-return", x: 0.8, y: 0.03 },
    { type: "thermostat", x: 0.95, y: 0.75 },
  ],
  living: [
    { type: "outlet", x: 0.5, y: 0.08 },
    { type: "outlet", x: 0.7, y: 0.08 },
    { type: "outlet", x: 0.08, y: 0.5 },
    { type: "outlet", x: 0.92, y: 0.5 },
    { type: "outlet", x: 0.5, y: 0.7 },
    { type: "light", x: 0.5, y: 0.4 },
    { type: "light", x: 0.2, y: 0.2 },
    { type: "light", x: 0.8, y: 0.2 },
    { type: "switch", x: 0.95, y: 0.9 },
    { type: "hvac-supply", x: 0.2, y: 0.03 },
    { type: "hvac-supply", x: 0.8, y: 0.03 },
    { type: "hvac-return", x: 0.5, y: 0.03 },
    { type: "thermostat", x: 0.95, y: 0.75 },
  ],
  office: [
    { type: "outlet", x: 0.3, y: 0.08 },
    { type: "outlet", x: 0.5, y: 0.08 },
    { type: "outlet", x: 0.7, y: 0.08 },
    { type: "outlet", x: 0.92, y: 0.3 },
    { type: "outlet", x: 0.08, y: 0.5 },
    { type: "light", x: 0.5, y: 0.4 },
    { type: "light", x: 0.5, y: 0.15 },
    { type: "switch", x: 0.95, y: 0.9 },
    { type: "hvac-supply", x: 0.2, y: 0.03 },
    { type: "hvac-return", x: 0.8, y: 0.03 },
    { type: "thermostat", x: 0.95, y: 0.75 },
  ],
  hallway: [
    { type: "outlet", x: 0.5, y: 0.08 },
    { type: "outlet", x: 0.5, y: 0.92 },
    { type: "light", x: 0.5, y: 0.3 },
    { type: "light", x: 0.5, y: 0.7 },
    { type: "switch", x: 0.95, y: 0.9 },
    { type: "switch", x: 0.05, y: 0.1 },
    { type: "hvac-supply", x: 0.5, y: 0.03 },
  ],
  storage: [
    { type: "outlet", x: 0.5, y: 0.92 },
    { type: "light", x: 0.5, y: 0.5 },
    { type: "switch", x: 0.95, y: 0.9 },
  ],
  terrace: [
    { type: "outlet", x: 0.08, y: 0.5 },
    { type: "light", x: 0.5, y: 0.5 },
    { type: "switch", x: 0.95, y: 0.9 },
  ],
};

const DEFAULT_CONFIG = MEP_CONFIGS.living;

/* ── Colour palette for MEP overlay ── */
const COL = {
  electrical: "#2196F3",   // blue
  light: "#F5A623",        // amber
  cold: "#1F78C0",         // blue (cold water)
  hot: "#D8342B",          // red (hot water)
  drain: "#3A5F3A",        // olive/green (waste)
  hvac: "#8E44AD",         // purple
  wall: "#000000",
};

/* ═══════════════════════════════════════════════════════════════════ */
/*  Main drawing                                                       */
/* ═══════════════════════════════════════════════════════════════════ */

interface Props {
  moduleType: string;
}

export default function MEPPlanDrawing({ moduleType }: Props) {
  // Scale: keep room area compact on left so legend + load table fit on the right
  const S = 420 / 3000;
  const ox = 80;
  const oy = 120;
  const w = EXT * S;
  const h = EXT * S;
  const wt = WALL_THICKNESS * 1000 * S;

  const elements = MEP_CONFIGS[moduleType] || DEFAULT_CONFIG;

  // Interior origin
  const ix = ox + wt;
  const iy = oy + wt;
  const iw = w - wt * 2;
  const ih = h - wt * 2;

  // Counts for legend/load table
  const outletCount = elements.filter((e) => e.type === "outlet").length;
  const lightCount = elements.filter((e) => e.type === "light").length;
  const switchCount = elements.filter((e) => e.type === "switch").length;
  const hasPlumbing = elements.some(
    (e) => e.type === "plumbing-cold" || e.type === "plumbing-hot" || e.type === "drain"
  );
  const hasHvac = elements.some(
    (e) => e.type === "hvac-supply" || e.type === "hvac-return" || e.type === "thermostat"
  );
  const fixtureCount = elements.filter((e) => e.type.startsWith("fixture-")).length;

  // Load estimates
  const estimatedAmps = outletCount * 2 + lightCount * 0.5; // very rough
  const hvacCFM =
    moduleType === "bathroom" ? 80 : moduleType === "kitchen" ? 120 : 60;
  const waterLpm = hasPlumbing
    ? moduleType === "bathroom"
      ? 25
      : moduleType === "kitchen"
        ? 18
        : 10
    : 0;

  return (
    <g>
      {/* ═══ SVG defs ═══ */}
      <defs>
        <pattern id="mep-floor" width="18" height="18" patternUnits="userSpaceOnUse">
          <rect width="18" height="18" fill="#FAFAFA" />
          <line x1="0" y1="18" x2="18" y2="18" stroke="#000" strokeWidth="0.15" opacity="0.12" />
          <line x1="18" y1="0" x2="18" y2="18" stroke="#000" strokeWidth="0.15" opacity="0.12" />
        </pattern>
        <pattern id="mep-insulation" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0,4 L2,0 L4,4 L6,0 L8,4" fill="none" stroke="#666" strokeWidth="0.35" />
          <path d="M0,8 L2,4 L4,8 L6,4 L8,8" fill="none" stroke="#666" strokeWidth="0.35" />
        </pattern>
      </defs>

      {/* ═══ Overlay title ═══ */}
      <text x={ox + w / 2} y={oy - 60} fontSize="10" fontWeight="bold" textAnchor="middle" fill="#000" letterSpacing="2">
        MEP PLAN — {moduleType.toUpperCase()}
      </text>

      {/* ═══ Grid references ═══ */}
      <GridRef x={ox - 24} y={oy + w / 2} label="A" />
      <GridRef x={ox + w + 24} y={oy + w / 2} label="B" />
      <GridRef x={ox + w / 2} y={oy - 28} label="1" />
      <GridRef x={ox + w / 2} y={oy + w + 32} label="2" />

      {/* Grid guide lines */}
      <line x1={ox - 14} y1={oy + w / 2} x2={ox} y2={oy + w / 2} stroke="#000" strokeWidth="0.3" strokeDasharray="1,2" />
      <line x1={ox + w} y1={oy + w / 2} x2={ox + w + 14} y2={oy + w / 2} stroke="#000" strokeWidth="0.3" strokeDasharray="1,2" />
      <line x1={ox + w / 2} y1={oy - 18} x2={ox + w / 2} y2={oy} stroke="#000" strokeWidth="0.3" strokeDasharray="1,2" />
      <line x1={ox + w / 2} y1={oy + w} x2={ox + w / 2} y2={oy + w + 22} stroke="#000" strokeWidth="0.3" strokeDasharray="1,2" />

      {/* ═══ Floor plan base (walls + floor) ═══ */}
      {/* Floor */}
      <rect x={ix} y={iy} width={iw} height={ih} fill="url(#mep-floor)" />
      {/* North wall */}
      <rect x={ox} y={oy} width={w} height={wt} fill={COL.wall} />
      <rect x={ox + 1} y={oy + 1} width={w - 2} height={wt - 2} fill="url(#mep-insulation)" />
      {/* South wall */}
      <rect x={ox} y={oy + w - wt} width={w} height={wt} fill={COL.wall} />
      <rect x={ox + 1} y={oy + w - wt + 1} width={w - 2} height={wt - 2} fill="url(#mep-insulation)" />
      {/* West wall */}
      <rect x={ox} y={oy} width={wt} height={w} fill={COL.wall} />
      <rect x={ox + 1} y={oy + 1} width={wt - 2} height={w - 2} fill="url(#mep-insulation)" />
      {/* East wall */}
      <rect x={ox + w - wt} y={oy} width={wt} height={w} fill={COL.wall} />
      <rect x={ox + w - wt + 1} y={oy + 1} width={wt - 2} height={w - 2} fill="url(#mep-insulation)" />

      {/* ═══ Dimension line (top) ═══ */}
      <DimensionLine
        x1={ox} y1={oy - 14} x2={ox + w} y2={oy - 14}
        label="3 000" offset={-5} fontSize={8}
      />
      <DimensionLine
        x1={ox - 14} y1={oy} x2={ox - 14} y2={oy + w}
        label="3 000" offset={-5} fontSize={8} vertical
      />

      {/* ═══ Plumbing lines (behind everything) ═══ */}
      {elements
        .filter((e) => e.type === "plumbing-cold" && e.x2 != null && e.y2 != null)
        .map((e, i) => (
          <line
            key={`cw-${i}`}
            x1={ix + e.x * iw} y1={iy + e.y * ih}
            x2={ix + e.x2! * iw} y2={iy + e.y2! * ih}
            stroke={COL.cold} strokeWidth="1.3"
          />
        ))}
      {elements
        .filter((e) => e.type === "plumbing-hot" && e.x2 != null && e.y2 != null)
        .map((e, i) => (
          <line
            key={`hw-${i}`}
            x1={ix + e.x * iw} y1={iy + e.y * ih}
            x2={ix + e.x2! * iw} y2={iy + e.y2! * ih}
            stroke={COL.hot} strokeWidth="1.3"
          />
        ))}
      {elements
        .filter((e) => e.type === "drain" && e.x2 != null && e.y2 != null)
        .map((e, i) => (
          <line
            key={`drain-${i}`}
            x1={ix + e.x * iw} y1={iy + e.y * ih}
            x2={ix + e.x2! * iw} y2={iy + e.y2! * ih}
            stroke={COL.drain} strokeWidth="1.6" strokeDasharray="6,3"
          />
        ))}

      {/* ═══ Plumbing fixtures ═══ */}
      {elements
        .filter((e) => e.type === "fixture-wc")
        .map((e, i) => (
          <FixtureWC key={`wc-${i}`} cx={ix + e.x * iw} cy={iy + e.y * ih} />
        ))}
      {elements
        .filter((e) => e.type === "fixture-sink")
        .map((e, i) => (
          <FixtureSink key={`sink-${i}`} cx={ix + e.x * iw} cy={iy + e.y * ih} />
        ))}
      {elements
        .filter((e) => e.type === "fixture-bath")
        .map((e, i) => (
          <FixtureBath key={`bath-${i}`} cx={ix + e.x * iw} cy={iy + e.y * ih} />
        ))}
      {elements
        .filter((e) => e.type === "fixture-shower")
        .map((e, i) => (
          <FixtureShower key={`shower-${i}`} cx={ix + e.x * iw} cy={iy + e.y * ih} />
        ))}

      {/* ═══ HVAC supply/return registers ═══ */}
      {elements
        .filter((e) => e.type === "hvac-supply")
        .map((e, i) => (
          <HvacRegister key={`sup-${i}`} cx={ix + e.x * iw} cy={iy + e.y * ih} kind="supply" />
        ))}
      {elements
        .filter((e) => e.type === "hvac-return")
        .map((e, i) => (
          <HvacRegister key={`ret-${i}`} cx={ix + e.x * iw} cy={iy + e.y * ih} kind="return" />
        ))}

      {/* Thermostat */}
      {elements
        .filter((e) => e.type === "thermostat")
        .map((e, i) => (
          <g key={`ts-${i}`}>
            <rect
              x={ix + e.x * iw - 5} y={iy + e.y * ih - 5}
              width={10} height={10}
              fill="#fff" stroke={COL.hvac} strokeWidth="0.7"
            />
            <text x={ix + e.x * iw} y={iy + e.y * ih + 3} fontSize="6" fontWeight="bold" textAnchor="middle" fill={COL.hvac}>T</text>
          </g>
        ))}

      {/* ═══ Electrical circuit bus ═══ */}
      {(() => {
        const outlets = elements.filter((e) => e.type === "outlet");
        if (outlets.length < 2) return null;
        const conduitY = iy + ih - 8;
        return (
          <g>
            <line
              x1={ix + Math.min(...outlets.map((o) => o.x)) * iw}
              y1={conduitY}
              x2={ix + Math.max(...outlets.map((o) => o.x)) * iw}
              y2={conduitY}
              stroke={COL.electrical} strokeWidth="0.4" strokeDasharray="3,2"
            />
            {outlets.map((o, i) => (
              <line
                key={`cond-${i}`}
                x1={ix + o.x * iw} y1={conduitY}
                x2={ix + o.x * iw} y2={iy + o.y * ih}
                stroke={COL.electrical} strokeWidth="0.4" strokeDasharray="3,2"
              />
            ))}
          </g>
        );
      })()}

      {/* ═══ Outlets (circle + vertical line) ═══ */}
      {elements
        .filter((e) => e.type === "outlet")
        .map((e, i) => {
          const cx = ix + e.x * iw;
          const cy = iy + e.y * ih;
          return (
            <g key={`outlet-${i}`}>
              <circle cx={cx} cy={cy} r="5" fill="#fff" stroke={COL.electrical} strokeWidth="0.8" />
              <line x1={cx} y1={cy - 4} x2={cx} y2={cy + 4} stroke={COL.electrical} strokeWidth="0.8" />
            </g>
          );
        })}

      {/* ═══ Switches ═══ */}
      {elements
        .filter((e) => e.type === "switch")
        .map((e, i) => {
          const cx = ix + e.x * iw;
          const cy = iy + e.y * ih;
          return (
            <g key={`sw-${i}`}>
              <circle cx={cx} cy={cy} r="5" fill="#fff" stroke={COL.electrical} strokeWidth="0.6" />
              <text x={cx} y={cy + 3} fontSize="7" fontWeight="bold" textAnchor="middle" fill={COL.electrical}>
                S
              </text>
            </g>
          );
        })}

      {/* ═══ Light fixtures (crossed circle) ═══ */}
      {elements
        .filter((e) => e.type === "light")
        .map((e, i) => {
          const cx = ix + e.x * iw;
          const cy = iy + e.y * ih;
          return (
            <g key={`light-${i}`}>
              <circle cx={cx} cy={cy} r="7" fill="#FFF8E1" stroke={COL.light} strokeWidth="0.8" />
              <line x1={cx - 5} y1={cy - 5} x2={cx + 5} y2={cy + 5} stroke={COL.light} strokeWidth="0.6" />
              <line x1={cx + 5} y1={cy - 5} x2={cx - 5} y2={cy + 5} stroke={COL.light} strokeWidth="0.6" />
            </g>
          );
        })}

      {/* ═══════════════════════════════════════════════════ */}
      {/*  LEGEND (right side)                                */}
      {/* ═══════════════════════════════════════════════════ */}
      <Legend x={540} y={110} w={220} fixtureCount={fixtureCount} />

      {/* ═══════════════════════════════════════════════════ */}
      {/*  LOAD SUMMARY TABLE (below legend, right side)      */}
      {/* ═══════════════════════════════════════════════════ */}
      {(() => {
        const tx = 540;
        const ty = 430;
        const colW = [110, 60, 50];
        const tableW = colW.reduce((a, b) => a + b, 0);
        const rowH = 16;
        const rows: string[][] = [
          ["Lighting", `${lightCount}`, "fixtures"],
          ["Power outlets", `${outletCount}`, "× 240 V"],
          ["Switches", `${switchCount}`, "points"],
          ["Est. electrical load", `${estimatedAmps.toFixed(1)}`, "A"],
          ["HVAC airflow", `${hvacCFM}`, "m³/h"],
          hasPlumbing ? ["Water demand (peak)", `${waterLpm}`, "L/min"] : ["Water demand", "—", "n/a"],
          ["Fixtures (sanitary)", `${fixtureCount}`, "nos."],
        ];
        return (
          <g>
            <text x={tx} y={ty - 6} fontSize="9" fontWeight="bold" fill="#000" letterSpacing="1">
              LOAD SUMMARY
            </text>
            <rect x={tx} y={ty} width={tableW} height={rowH * (rows.length + 1)} fill="#fff" stroke="#000" strokeWidth="0.6" />
            {/* Header */}
            <rect x={tx} y={ty} width={tableW} height={rowH} fill="#EFEBE3" />
            <line x1={tx} y1={ty + rowH} x2={tx + tableW} y2={ty + rowH} stroke="#000" strokeWidth="0.6" />
            {["ITEM", "QTY", "UNIT"].map((h, ci) => {
              const xOff = colW.slice(0, ci).reduce((a, b) => a + b, 0);
              return (
                <text key={`lh-${ci}`} x={tx + xOff + 8} y={ty + rowH / 2 + 3} fontSize="6.5" fontWeight="bold" fill="#000">
                  {h}
                </text>
              );
            })}
            {/* Column dividers */}
            {colW.slice(0, -1).map((_, ci) => {
              const xOff = colW.slice(0, ci + 1).reduce((a, b) => a + b, 0);
              return (
                <line
                  key={`lcol-${ci}`}
                  x1={tx + xOff} y1={ty} x2={tx + xOff} y2={ty + rowH * (rows.length + 1)}
                  stroke="#000" strokeWidth="0.3"
                />
              );
            })}
            {/* Data rows */}
            {rows.map((row, ri) => (
              <g key={`lrow-${ri}`}>
                {ri > 0 && (
                  <line
                    x1={tx} y1={ty + rowH * (ri + 1)}
                    x2={tx + tableW} y2={ty + rowH * (ri + 1)}
                    stroke="#000" strokeWidth="0.15" strokeDasharray="1,1"
                  />
                )}
                {row.map((cell, ci) => {
                  const xOff = colW.slice(0, ci).reduce((a, b) => a + b, 0);
                  return (
                    <text
                      key={`lcell-${ri}-${ci}`}
                      x={tx + xOff + (ci === 0 ? 8 : colW[ci] / 2)}
                      y={ty + rowH * (ri + 1) + rowH / 2 + 3}
                      fontSize="6.5"
                      textAnchor={ci === 0 ? "start" : "middle"}
                      fill="#333"
                    >
                      {cell}
                    </text>
                  );
                })}
              </g>
            ))}
          </g>
        );
      })()}

      {/* ═══ Interior area label ═══ */}
      <text
        x={ox + w / 2} y={oy + w / 2 - 4}
        fontSize="8" textAnchor="middle" fill="#999"
        letterSpacing="2" opacity="0.55"
      >
        {moduleType.toUpperCase()}
      </text>
      <text
        x={ox + w / 2} y={oy + w / 2 + 6}
        fontSize="6" textAnchor="middle" fill="#aaa" opacity="0.55"
      >
        Interior {INT} × {INT} mm
      </text>

      {/* ═══ Notes (below floor plan) ═══ */}
      <g>
        <text x={ox} y={oy + w + 60} fontSize="7" fontWeight="bold" fill="#000" letterSpacing="1">NOTES:</text>
        <text x={ox} y={oy + w + 72} fontSize="6.5" fill="#555">
          1. All electrical work to national code; RCBO-protected circuits.
        </text>
        <text x={ox} y={oy + w + 82} fontSize="6.5" fill="#555">
          2. Water lines PEX-AL-PEX Ø16, insulated in cold zones.
        </text>
        {hasHvac && (
          <text x={ox} y={oy + w + 92} fontSize="6.5" fill="#555">
            3. HVAC: ducted supply/return, heat-recovery ventilation.
          </text>
        )}
      </g>
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Helper components                                                  */
/* ═══════════════════════════════════════════════════════════════════ */

function GridRef({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="9" fill="#fff" stroke="#000" strokeWidth="0.7" />
      <text x={x} y={y + 4} fontSize="9" fontWeight="bold" fill="#000" textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

function DimensionLine({
  x1, y1, x2, y2, label, offset, fontSize = 8, vertical = false,
}: {
  x1: number; y1: number; x2: number; y2: number;
  label: string; offset: number; fontSize?: number;
  vertical?: boolean;
}) {
  const sw = 0.5;
  const tickLen = 3;
  if (vertical) {
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000" strokeWidth={sw} />
        <line x1={x1 - tickLen} y1={y1 - tickLen} x2={x1 + tickLen} y2={y1 + tickLen} stroke="#000" strokeWidth={sw} />
        <line x1={x2 - tickLen} y1={y2 - tickLen} x2={x2 + tickLen} y2={y2 + tickLen} stroke="#000" strokeWidth={sw} />
        <text
          x={x1 + offset} y={(y1 + y2) / 2}
          fontSize={fontSize} textAnchor="middle" fill="#000"
          transform={`rotate(-90, ${x1 + offset}, ${(y1 + y2) / 2})`}
        >
          {label}
        </text>
      </g>
    );
  }
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y1} stroke="#000" strokeWidth={sw} />
      <line x1={x1 - tickLen} y1={y1 - tickLen} x2={x1 + tickLen} y2={y1 + tickLen} stroke="#000" strokeWidth={sw} />
      <line x1={x2 - tickLen} y1={y1 - tickLen} x2={x2 + tickLen} y2={y1 + tickLen} stroke="#000" strokeWidth={sw} />
      <text x={(x1 + x2) / 2} y={y1 + offset} fontSize={fontSize} textAnchor="middle" fill="#000">
        {label}
      </text>
    </g>
  );
}

/* ── Plumbing fixture symbols ── */

function FixtureWC({ cx, cy }: { cx: number; cy: number }) {
  // WC: oval bowl + rectangular tank
  return (
    <g>
      <rect x={cx - 8} y={cy - 10} width={16} height={6} fill="#fff" stroke={COL.cold} strokeWidth="0.6" />
      <ellipse cx={cx} cy={cy + 2} rx={7} ry={8} fill="#fff" stroke={COL.cold} strokeWidth="0.6" />
      <text x={cx} y={cy + 18} fontSize="5" textAnchor="middle" fill={COL.cold}>WC</text>
    </g>
  );
}

function FixtureSink({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <rect x={cx - 10} y={cy - 7} width={20} height={14} rx="2" fill="#fff" stroke={COL.cold} strokeWidth="0.6" />
      <circle cx={cx} cy={cy} r="3" fill="none" stroke={COL.cold} strokeWidth="0.5" />
      <circle cx={cx} cy={cy} r="0.6" fill={COL.cold} />
    </g>
  );
}

function FixtureBath({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <rect x={cx - 14} y={cy - 8} width={28} height={16} rx="3" fill="#fff" stroke={COL.cold} strokeWidth="0.7" />
      <rect x={cx - 11} y={cy - 5} width={22} height={10} rx="2" fill="none" stroke={COL.cold} strokeWidth="0.4" />
      <circle cx={cx + 10} cy={cy} r="1" fill={COL.cold} />
      <text x={cx} y={cy + 14} fontSize="5" textAnchor="middle" fill={COL.cold}>BATH</text>
    </g>
  );
}

function FixtureShower({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <rect x={cx - 10} y={cy - 10} width={20} height={20} fill="#fff" stroke={COL.cold} strokeWidth="0.6" />
      <line x1={cx - 10} y1={cy - 10} x2={cx + 10} y2={cy + 10} stroke={COL.cold} strokeWidth="0.3" />
      <line x1={cx + 10} y1={cy - 10} x2={cx - 10} y2={cy + 10} stroke={COL.cold} strokeWidth="0.3" />
      <circle cx={cx} cy={cy} r="1.2" fill={COL.cold} />
      <text x={cx} y={cy + 16} fontSize="5" textAnchor="middle" fill={COL.cold}>SHR</text>
    </g>
  );
}

/* ── HVAC register symbols ── */

function HvacRegister({ cx, cy, kind }: { cx: number; cy: number; kind: "supply" | "return" }) {
  if (kind === "supply") {
    return (
      <g>
        <rect x={cx - 7} y={cy - 7} width={14} height={14} fill="#fff" stroke={COL.hvac} strokeWidth="0.8" />
        <polygon points={`${cx - 4},${cy} ${cx + 2},${cy - 3} ${cx + 2},${cy + 3}`} fill={COL.hvac} />
        <polygon points={`${cx + 4},${cy} ${cx - 2},${cy - 3} ${cx - 2},${cy + 3}`} fill={COL.hvac} />
      </g>
    );
  }
  return (
    <g>
      <rect x={cx - 7} y={cy - 7} width={14} height={14} fill="#fff" stroke={COL.hvac} strokeWidth="0.8" />
      <line x1={cx - 5} y1={cy - 4} x2={cx + 5} y2={cy - 4} stroke={COL.hvac} strokeWidth="0.6" />
      <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} stroke={COL.hvac} strokeWidth="0.6" />
      <line x1={cx - 5} y1={cy + 4} x2={cx + 5} y2={cy + 4} stroke={COL.hvac} strokeWidth="0.6" />
    </g>
  );
}

/* ── Legend: compact data-driven MEP legend block ── */

function Legend({ x, y, w, fixtureCount }: { x: number; y: number; w: number; fixtureCount: number }) {
  const rowH = 15;
  const sections: { title: string; color: string; rows: { label: string; render: ReactElement }[] }[] = [
    {
      title: "ELECTRICAL", color: COL.electrical,
      rows: [
        { label: "Duplex outlet (240 V)", render: (<g><circle r="4.5" fill="#fff" stroke={COL.electrical} strokeWidth="0.8" /><line x1="0" y1="-3.5" x2="0" y2="3.5" stroke={COL.electrical} strokeWidth="0.8" /></g>) },
        { label: "Wall switch", render: (<g><circle r="4.5" fill="#fff" stroke={COL.electrical} strokeWidth="0.6" /><text y="3" fontSize="7" fontWeight="bold" textAnchor="middle" fill={COL.electrical}>S</text></g>) },
        { label: "Ceiling light fixture", render: (<g><circle r="5.5" fill="#FFF8E1" stroke={COL.light} strokeWidth="0.8" /><line x1="-4" y1="-4" x2="4" y2="4" stroke={COL.light} strokeWidth="0.6" /><line x1="4" y1="-4" x2="-4" y2="4" stroke={COL.light} strokeWidth="0.6" /></g>) },
        { label: "Circuit conduit", render: (<line x1="-7" y1="0" x2="7" y2="0" stroke={COL.electrical} strokeWidth="0.5" strokeDasharray="3,2" />) },
      ],
    },
    {
      title: "PLUMBING", color: COL.cold,
      rows: [
        { label: "Cold water line", render: (<line x1="-7" y1="0" x2="7" y2="0" stroke={COL.cold} strokeWidth="1.3" />) },
        { label: "Hot water line", render: (<line x1="-7" y1="0" x2="7" y2="0" stroke={COL.hot} strokeWidth="1.3" />) },
        { label: "Waste / drain line", render: (<line x1="-7" y1="0" x2="7" y2="0" stroke={COL.drain} strokeWidth="1.6" strokeDasharray="6,3" />) },
        ...(fixtureCount > 0 ? [{ label: "Sanitary fixtures", render: (<rect x="-5" y="-3" width="10" height="6" fill="#fff" stroke={COL.cold} strokeWidth="0.6" />) }] : []),
      ],
    },
    {
      title: "HVAC", color: COL.hvac,
      rows: [
        { label: "Supply register", render: (<g><rect x="-5" y="-5" width="10" height="10" fill="#fff" stroke={COL.hvac} strokeWidth="0.7" /><polygon points="-3,0 3,-3 3,3" fill={COL.hvac} /></g>) },
        { label: "Return grille", render: (<g><rect x="-5" y="-5" width="10" height="10" fill="#fff" stroke={COL.hvac} strokeWidth="0.7" /><line x1="-4" y1="-3" x2="4" y2="-3" stroke={COL.hvac} strokeWidth="0.5" /><line x1="-4" y1="0" x2="4" y2="0" stroke={COL.hvac} strokeWidth="0.5" /><line x1="-4" y1="3" x2="4" y2="3" stroke={COL.hvac} strokeWidth="0.5" /></g>) },
        { label: "Thermostat", render: (<g><rect x="-5" y="-5" width="10" height="10" fill="#fff" stroke={COL.hvac} strokeWidth="0.7" /><text y="3" fontSize="6" fontWeight="bold" textAnchor="middle" fill={COL.hvac}>T</text></g>) },
      ],
    },
  ];

  let cursor = 36;
  const entries: { yy: number; kind: "title" | "row"; title?: string; color?: string; label?: string; render?: ReactElement }[] = [];
  for (const sec of sections) {
    entries.push({ yy: cursor, kind: "title", title: sec.title, color: sec.color });
    cursor += rowH + 2;
    for (const r of sec.rows) {
      entries.push({ yy: cursor, kind: "row", label: r.label, render: r.render });
      cursor += rowH;
    }
    cursor += 4;
  }
  const h = cursor + 6;

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#fff" stroke="#000" strokeWidth="0.6" />
      <rect x={x} y={y} width={w} height={18} fill="#EFEBE3" />
      <line x1={x} y1={y + 18} x2={x + w} y2={y + 18} stroke="#000" strokeWidth="0.6" />
      <text x={x + 10} y={y + 13} fontSize="9" fontWeight="bold" fill="#000" letterSpacing="1">LEGEND</text>
      {entries.map((e, i) =>
        e.kind === "title" ? (
          <text key={`leg-${i}`} x={x + 10} y={y + e.yy} fontSize="7" fontWeight="bold" fill={e.color} letterSpacing="1">
            {e.title}
          </text>
        ) : (
          <g key={`leg-${i}`}>
            <g transform={`translate(${x + 22}, ${y + e.yy - 3})`}>{e.render}</g>
            <text x={x + 40} y={y + e.yy} fontSize="6.5" fill="#000">{e.label}</text>
          </g>
        )
      )}
    </g>
  );
}
