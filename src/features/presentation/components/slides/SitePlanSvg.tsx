/**
 * SitePlanSvg — miniature site-plan used on the Site slide.
 *
 * Rendered purely with SVG, no dependency on Three.js — works in SSR,
 * prints crisply, and scales responsively.
 */

import { MODULE_TYPES } from "@/shared/types";

export interface SitePlanModule {
  row: number;
  col: number;
  moduleType: string;
  label: string;
}

interface Props {
  modules: SitePlanModule[];
  accent: string;
}

export default function SitePlanSvg({ modules, accent }: Props) {
  if (modules.length === 0) return null;

  const minR = Math.min(...modules.map((m) => m.row));
  const maxR = Math.max(...modules.map((m) => m.row));
  const minC = Math.min(...modules.map((m) => m.col));
  const maxC = Math.max(...modules.map((m) => m.col));
  const cols = maxC - minC + 1;
  const rows = maxR - minR + 1;
  const cellPx = 40;
  const pad = 60;
  const svgW = cols * cellPx + pad * 2;
  const svgH = rows * cellPx + pad * 2;

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      className="w-full h-full"
      style={{ maxHeight: 200 }}
      role="img"
      aria-label="Site plan showing module layout"
    >
      {/* Terrain outline */}
      <rect
        x={12}
        y={12}
        width={svgW - 24}
        height={svgH - 24}
        rx={6}
        fill="#d1fae5"
        stroke="#6ee7b7"
        strokeWidth={1.5}
        strokeDasharray="6,3"
      />
      <text
        x={svgW / 2}
        y={24}
        textAnchor="middle"
        fontSize={8}
        fill="#065f46"
        fontFamily="sans-serif"
      >
        TERRAIN BOUNDARY
      </text>
      {/* North arrow */}
      <text
        x={svgW - 20}
        y={28}
        fontSize={10}
        fill="#065f46"
        fontFamily="sans-serif"
        fontWeight="bold"
      >
        N
      </text>
      <line x1={svgW - 17} y1={30} x2={svgW - 17} y2={40} stroke="#065f46" strokeWidth={1} />

      {/* Module cells */}
      {modules.map((mod) => {
        const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
        const x = pad + (mod.col - minC) * cellPx;
        const y = pad + (mod.row - minR) * cellPx;
        return (
          <g key={`${mod.row}-${mod.col}`}>
            <rect
              x={x + 1}
              y={y + 1}
              width={cellPx - 2}
              height={cellPx - 2}
              rx={3}
              fill={mt?.color || "#ccc"}
              fillOpacity={0.7}
              stroke={accent}
              strokeWidth={1.5}
            />
            <text
              x={x + cellPx / 2}
              y={y + cellPx / 2 - 3}
              textAnchor="middle"
              fontSize={7}
              fill="#1a1a1a"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {mod.label}
            </text>
            <text
              x={x + cellPx / 2}
              y={y + cellPx / 2 + 7}
              textAnchor="middle"
              fontSize={5}
              fill="#555"
              fontFamily="sans-serif"
            >
              3x3m
            </text>
          </g>
        );
      })}
    </svg>
  );
}
