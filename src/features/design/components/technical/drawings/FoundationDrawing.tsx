import type { ReactNode } from "react";
import type { ModuleConfig } from "../../../store";

interface Props {
  modules?: ModuleConfig[];
}

export default function FoundationDetailDrawing({ modules }: Props) {
  const hasMultiple = modules && modules.length > 1;

  // ── LEFT HALF: Cross-section detail (always shown) ──
  const cx = hasMultiple ? 250 : 400;
  const groundY = 400;
  const pileDepth = 250;
  const pileW = 30;
  const padW = 120;
  const padH = 30;
  const slabW = hasMultiple ? 340 : 500;
  const slabH = 35;
  const connH = 50;
  const connW = 80;

  // ── RIGHT HALF: Pile layout plan (when multiple modules) ──
  let planElements: ReactNode[] = [];
  if (hasMultiple && modules) {
    const rows = Math.max(...modules.map((m) => m.row)) - Math.min(...modules.map((m) => m.row)) + 1;
    const cols = Math.max(...modules.map((m) => m.col)) - Math.min(...modules.map((m) => m.col)) + 1;
    const minRow = Math.min(...modules.map((m) => m.row));
    const minCol = Math.min(...modules.map((m) => m.col));

    const planOx = 510;
    const planOy = 120;
    const cellSize = Math.min(240 / Math.max(rows, cols), 80);
    const planW = cols * cellSize;
    const planH = rows * cellSize;

    // Plan title
    planElements.push(
      <text key="plan-title" x={planOx + planW / 2} y={planOy - 15} fontSize="9" fontWeight="bold" textAnchor="middle" fill="#333">
        PILE LAYOUT PLAN (1:{Math.round(3000 * cols / planW)})
      </text>
    );

    // Grid outline
    planElements.push(
      <rect key="plan-bg" x={planOx} y={planOy} width={planW} height={planH} fill="#F5F3EE" stroke="#ccc" strokeWidth="0.5" />
    );

    // Module cells
    modules.forEach((mod, mi) => {
      const r = mod.row - minRow;
      const c = mod.col - minCol;
      const mx = planOx + c * cellSize;
      const my = planOy + r * cellSize;

      planElements.push(
        <rect key={`cell-${mi}`} x={mx} y={my} width={cellSize} height={cellSize} fill="none" stroke="#555" strokeWidth="0.8" />
      );

      // Module label
      planElements.push(
        <text key={`label-${mi}`} x={mx + cellSize / 2} y={my + cellSize / 2 + 3} fontSize="7" textAnchor="middle" fill="#444">
          {mod.label}
        </text>
      );

      // Pile positions: 4 corners per module, shared with neighbors
      const pileR = 4;
      const inset = cellSize * 0.12;
      const corners = [
        [mx + inset, my + inset],
        [mx + cellSize - inset, my + inset],
        [mx + inset, my + cellSize - inset],
        [mx + cellSize - inset, my + cellSize - inset],
      ];

      corners.forEach(([px, py], ci) => {
        // Check if this corner is shared (neighbor already drew it)
        const isShared = modules.some((other, oi) => {
          if (oi >= mi) return false;
          const or = other.row - minRow;
          const oc = other.col - minCol;
          const otherCorners = [
            [planOx + oc * cellSize + inset, planOy + or * cellSize + inset],
            [planOx + (oc + 1) * cellSize - inset, planOy + or * cellSize + inset],
            [planOx + oc * cellSize + inset, planOy + (or + 1) * cellSize - inset],
            [planOx + (oc + 1) * cellSize - inset, planOy + (or + 1) * cellSize - inset],
          ];
          return otherCorners.some(([ox2, oy2]) => Math.abs(ox2 - px) < 2 && Math.abs(oy2 - py) < 2);
        });

        if (!isShared) {
          planElements.push(
            <g key={`pile-${mi}-${ci}`}>
              <circle cx={px} cy={py} r={pileR} fill="#888" stroke="#000" strokeWidth="0.8" />
              <line x1={px - 3} y1={py - 3} x2={px + 3} y2={py + 3} stroke="#000" strokeWidth="0.4" />
              <line x1={px + 3} y1={py - 3} x2={px - 3} y2={py + 3} stroke="#000" strokeWidth="0.4" />
            </g>
          );
        }
      });
    });

    // Count unique piles
    const allPiles: string[] = [];
    const inset = cellSize * 0.12;
    modules.forEach((mod) => {
      const r = mod.row - minRow;
      const c = mod.col - minCol;
      const mx = planOx + c * cellSize;
      const my = planOy + r * cellSize;
      [
        [mx + inset, my + inset],
        [mx + cellSize - inset, my + inset],
        [mx + inset, my + cellSize - inset],
        [mx + cellSize - inset, my + cellSize - inset],
      ].forEach(([px, py]) => {
        const key = `${Math.round(px)},${Math.round(py)}`;
        if (!allPiles.includes(key)) allPiles.push(key);
      });
    });

    // Pile count note
    planElements.push(
      <text key="pile-count" x={planOx + planW / 2} y={planOy + planH + 18} fontSize="8" textAnchor="middle" fill="#555">
        Total: {allPiles.length} screw piles
      </text>
    );

    // Plan legend
    planElements.push(
      <g key="plan-legend">
        <circle cx={planOx + 8} cy={planOy + planH + 35} r={4} fill="#888" stroke="#000" strokeWidth="0.8" />
        <line x1={planOx + 5} y1={planOy + planH + 32} x2={planOx + 11} y2={planOy + planH + 38} stroke="#000" strokeWidth="0.4" />
        <line x1={planOx + 11} y1={planOy + planH + 32} x2={planOx + 5} y2={planOy + planH + 38} stroke="#000" strokeWidth="0.4" />
        <text x={planOx + 18} y={planOy + planH + 38} fontSize="7" fill="#555">Screw pile location</text>
      </g>
    );

    // Dimension lines on plan
    planElements.push(
      <g key="dim-x">
        <line x1={planOx} y1={planOy - 8} x2={planOx + planW} y2={planOy - 8} stroke="#000" strokeWidth="0.5" />
        <line x1={planOx} y1={planOy - 12} x2={planOx} y2={planOy - 4} stroke="#000" strokeWidth="0.5" />
        <line x1={planOx + planW} y1={planOy - 12} x2={planOx + planW} y2={planOy - 4} stroke="#000" strokeWidth="0.5" />
        <text x={planOx + planW / 2} y={planOy - 12} fontSize="8" textAnchor="middle" fill="#000">{cols * 3000}mm</text>
      </g>
    );
    planElements.push(
      <g key="dim-y">
        <line x1={planOx + planW + 8} y1={planOy} x2={planOx + planW + 8} y2={planOy + planH} stroke="#000" strokeWidth="0.5" />
        <line x1={planOx + planW + 4} y1={planOy} x2={planOx + planW + 12} y2={planOy} stroke="#000" strokeWidth="0.5" />
        <line x1={planOx + planW + 4} y1={planOy + planH} x2={planOx + planW + 12} y2={planOy + planH} stroke="#000" strokeWidth="0.5" />
        <text x={planOx + planW + 16} y={planOy + planH / 2 + 3} fontSize="8" fill="#000">{rows * 3000}mm</text>
      </g>
    );
  }

  return (
    <g>
      {/* Right side: pile layout plan */}
      {planElements}

      {/* ─── Cross-section (left or centered) ─── */}

      {/* Section label */}
      {hasMultiple && (
        <text x={cx} y={120} fontSize="9" fontWeight="bold" textAnchor="middle" fill="#333">
          SECTION DETAIL (1:10)
        </text>
      )}

      {/* Ground fill (hatched) */}
      <rect x={cx - 200} y={groundY} width={400} height={350} fill="#E8DCC8" opacity="0.3" />
      {Array.from({ length: 28 }).map((_, i) => (
        <line
          key={`ground-${i}`}
          x1={cx - 200 + i * 15}
          y1={groundY}
          x2={cx - 200 + i * 15 - 10}
          y2={groundY + 8}
          stroke="#8B7355"
          strokeWidth="0.5"
        />
      ))}

      {/* Ground level line */}
      <line x1={cx - 220} y1={groundY} x2={cx + 220} y2={groundY} stroke="#000" strokeWidth="1.5" />
      <text x={cx + 225} y={groundY + 4} fontSize="9" fill="#000">GL ±0.00</text>

      {/* ─── Screw pile shaft ─── */}
      <rect x={cx - pileW / 2} y={groundY + 20} width={pileW} height={pileDepth} fill="#888" stroke="#000" strokeWidth="1.5" />
      <defs>
        <pattern id="steel-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#555" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect x={cx - pileW / 2} y={groundY + 20} width={pileW} height={pileDepth} fill="url(#steel-hatch)" />

      {/* Helix plates */}
      {[0.4, 0.65, 0.9].map((frac, i) => {
        const py = groundY + 20 + pileDepth * frac;
        const helixW = pileW + 40;
        return (
          <ellipse key={`helix-${i}`} cx={cx} cy={py} rx={helixW / 2} ry={6} fill="#777" stroke="#000" strokeWidth="1" />
        );
      })}

      {/* Pile label */}
      <text x={cx + pileW / 2 + 50} y={groundY + 20 + pileDepth / 2} fontSize="8" fill="#444">Steel Screw Pile</text>
      <line x1={cx + pileW / 2 + 2} y1={groundY + 20 + pileDepth / 2 - 3} x2={cx + pileW / 2 + 48} y2={groundY + 20 + pileDepth / 2 - 3} stroke="#666" strokeWidth="0.3" />

      {/* ─── Bearing pad / pile cap ─── */}
      <rect x={cx - padW / 2} y={groundY - padH + 5} width={padW} height={padH} fill="#aaa" stroke="#000" strokeWidth="1.5" />
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
      <text x={cx - padW / 2 - 55} y={groundY - padH / 2 + 8} fontSize="8" fill="#444">Pile Cap</text>
      <line x1={cx - padW / 2 - 3} y1={groundY - padH / 2 + 5} x2={cx - padW / 2 - 50} y2={groundY - padH / 2 + 5} stroke="#666" strokeWidth="0.3" />

      {/* ─── Connection bracket ─── */}
      <rect x={cx - connW / 2} y={groundY - padH - connH + 5} width={connW} height={connH} fill="none" stroke="#000" strokeWidth="1.5" />
      {[-25, -10, 10, 25].map((offset, i) => (
        <circle key={`bolt-${i}`} cx={cx + offset} cy={groundY - padH - connH / 2 + 5} r="3" fill="none" stroke="#000" strokeWidth="1" />
      ))}
      <text x={cx + connW / 2 + 50} y={groundY - padH - connH / 2 + 8} fontSize="8" fill="#444">Steel Bracket</text>
      <line x1={cx + connW / 2 + 2} y1={groundY - padH - connH / 2 + 5} x2={cx + connW / 2 + 48} y2={groundY - padH - connH / 2 + 5} stroke="#666" strokeWidth="0.3" />

      {/* ─── Module floor slab ─── */}
      <rect x={cx - slabW / 2} y={groundY - padH - connH - slabH + 5} width={slabW} height={slabH} fill="#ccc" stroke="#000" strokeWidth="2" />
      <g opacity="0.2">
        {Array.from({ length: Math.round(slabW / 15) }).map((_, i) => (
          <line
            key={`slab-h-${i}`}
            x1={cx - slabW / 2 + i * 15}
            y1={groundY - padH - connH - slabH + 5}
            x2={cx - slabW / 2 + i * 15 + slabH}
            y2={groundY - padH - connH + 5}
            stroke="#000"
            strokeWidth="0.3"
          />
        ))}
      </g>
      <text x={cx} y={groundY - padH - connH - slabH / 2 + 8} fontSize="9" textAnchor="middle" fill="#333">
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
            <line x1={dx} y1={y1} x2={dx} y2={y2} stroke="#000" strokeWidth="0.5" />
            <line x1={dx - 4} y1={y1} x2={dx + 4} y2={y1} stroke="#000" strokeWidth="0.5" />
            <line x1={dx - 4} y1={y2} x2={dx + 4} y2={y2} stroke="#000" strokeWidth="0.5" />
            <text x={dx - 6} y={(y1 + y2) / 2 + 3} fontSize="8" textAnchor="end" fill="#000" transform={`rotate(-90, ${dx - 6}, ${(y1 + y2) / 2})`}>
              Pile Depth (varies)
            </text>
          </g>
        );
      })()}

      {/* Floor slab to ground */}
      {(() => {
        const dx = cx + slabW / 2 + 30;
        const y1 = groundY;
        const y2 = groundY - padH - connH - slabH + 5;
        return (
          <g>
            <line x1={dx} y1={y1} x2={dx} y2={y2} stroke="#000" strokeWidth="0.5" />
            <line x1={dx - 4} y1={y1} x2={dx + 4} y2={y1} stroke="#000" strokeWidth="0.5" />
            <line x1={dx - 4} y1={y2} x2={dx + 4} y2={y2} stroke="#000" strokeWidth="0.5" />
            <text x={dx + 8} y={(y1 + y2) / 2 + 3} fontSize="9" fill="#000">{padH + connH + slabH}mm</text>
          </g>
        );
      })()}

      {/* ─── Soil layers ─── */}
      <text x={cx - 180} y={groundY + 40} fontSize="8" fill="#8B7355">Topsoil</text>
      <line x1={cx - 200} y1={groundY + 60} x2={cx + 200} y2={groundY + 60} stroke="#8B7355" strokeWidth="0.3" strokeDasharray="4,3" />
      <text x={cx - 180} y={groundY + 80} fontSize="8" fill="#8B7355">Bearing Soil / Clay</text>

      {/* ─── Notes ─── */}
      <text x={100} y={730} fontSize="7" fill="#555">NOTES:</text>
      <text x={100} y={742} fontSize="7" fill="#555">1. Screw pile size and depth per geotechnical report</text>
      <text x={100} y={754} fontSize="7" fill="#555">2. All steel connections hot-dip galvanized</text>
      <text x={100} y={766} fontSize="7" fill="#555">3. Module floor slab: reinforced concrete 200mm</text>
      {hasMultiple && modules && (
        <text x={100} y={778} fontSize="7" fill="#555">4. {modules.length} modules — pile spacing 3000mm grid</text>
      )}
    </g>
  );
}
