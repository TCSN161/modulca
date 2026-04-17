import type { ModuleConfig } from "../../../store";

interface Props {
  modules?: ModuleConfig[];
}

/**
 * Foundation Detail Drawing — architectural convention.
 *
 * Renders a professional foundation plan with:
 *   - Screw piles (standard symbol: circle with X) at module corners
 *   - Dimension chains for pile spacing (3000 mm grid)
 *   - Grid reference labels (A/B/C columns, 1/2/3 rows)
 *   - Pile schedule table (mark, type, depth, load)
 *   - Section-through-pile detail (inset bottom-right)
 *   - North arrow + notes
 *
 * Outer title block / border / scale bar are provided by the parent
 * TechnicalDrawing.tsx shell, so this component only returns a <g>.
 */
export default function FoundationDetailDrawing({ modules }: Props) {
  const hasMultiple = modules && modules.length > 1;

  // Grid bounds for plan layout
  const rows = hasMultiple && modules
    ? Math.max(...modules.map((m) => m.row)) - Math.min(...modules.map((m) => m.row)) + 1
    : 1;
  const cols = hasMultiple && modules
    ? Math.max(...modules.map((m) => m.col)) - Math.min(...modules.map((m) => m.col)) + 1
    : 1;
  const minRow = hasMultiple && modules ? Math.min(...modules.map((m) => m.row)) : 0;
  const minCol = hasMultiple && modules ? Math.min(...modules.map((m) => m.col)) : 0;

  // Plan block geometry — centered in upper half of sheet
  const maxPlanW = 420;
  const maxPlanH = 340;
  const totalW_mm = cols * 3000;
  const totalH_mm = rows * 3000;
  const S = Math.min(maxPlanW / totalW_mm, maxPlanH / totalH_mm);
  const planW = totalW_mm * S;
  const planH = totalH_mm * S;
  const planOx = 80 + (maxPlanW - planW) / 2;
  const planOy = 110 + (maxPlanH - planH) / 2;

  // Collect unique pile positions (shared at module corners)
  interface Pile { x: number; y: number; mark: string; }
  const pileMap = new Map<string, Pile>();
  const pushPile = (gx: number, gy: number) => {
    // gx, gy in grid units (0..cols, 0..rows)
    const key = `${gx},${gy}`;
    if (!pileMap.has(key)) {
      const mark = `P${pileMap.size + 1}`;
      pileMap.set(key, {
        x: planOx + gx * (planW / cols),
        y: planOy + gy * (planH / rows),
        mark,
      });
    }
  };

  if (hasMultiple && modules) {
    for (const mod of modules) {
      const c = mod.col - minCol;
      const r = mod.row - minRow;
      pushPile(c, r);
      pushPile(c + 1, r);
      pushPile(c, r + 1);
      pushPile(c + 1, r + 1);
      // Center-of-module pile for spans >= 1 module
      pushPile(c + 0.5, r + 0.5);
    }
  } else {
    // Single module: 4 corners + 1 center
    pushPile(0, 0);
    pushPile(1, 0);
    pushPile(0, 1);
    pushPile(1, 1);
    pushPile(0.5, 0.5);
  }

  const piles = Array.from(pileMap.values());
  const cornerPiles = piles.filter((p) => !p.mark.endsWith("C"));

  // Column letters A, B, C ...  Row numbers 1, 2, 3 ...
  const colLetter = (i: number) => String.fromCharCode(65 + i);

  // ─── Section detail block (inset bottom-right) ───
  const sectOx = 470;
  const sectOy = 470;
  const sectW = 290;
  const sectH = 260;
  const groundY = sectOy + 90;
  const pileDepth = 130;
  const pileShaftW = 14;
  const capW = 58;
  const capH = 14;
  const slabW = 180;
  const slabH = 18;
  const connH = 22;
  const connW = 40;
  const sectCx = sectOx + sectW / 2;

  return (
    <g>
      {/* ═══ SVG defs ═══ */}
      <defs>
        <pattern id="fd-steel-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="#222" strokeWidth="0.5" />
        </pattern>
        <pattern id="fd-concrete" width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.4" fill="#000" opacity="0.3" />
          <circle cx="3" cy="3" r="0.3" fill="#000" opacity="0.25" />
        </pattern>
        <pattern id="fd-earth" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
          <line x1="0" y1="4" x2="8" y2="4" stroke="#8B7355" strokeWidth="0.3" opacity="0.35" />
          <line x1="2" y1="0" x2="2" y2="8" stroke="#8B7355" strokeWidth="0.2" opacity="0.2" />
        </pattern>
        <pattern id="fd-ground-plan" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="10" stroke="#A89377" strokeWidth="0.3" opacity="0.25" />
        </pattern>
      </defs>

      {/* ═══════════════════════════════════════════════════ */}
      {/*  FOUNDATION PLAN (upper half of sheet)              */}
      {/* ═══════════════════════════════════════════════════ */}

      {/* Plan title */}
      <text x={planOx + planW / 2} y={planOy - 60} fontSize="10" fontWeight="bold" textAnchor="middle" fill="#000" letterSpacing="2">
        FOUNDATION PLAN
      </text>

      {/* Ground shading under footprint */}
      <rect x={planOx - 20} y={planOy - 20} width={planW + 40} height={planH + 40} fill="url(#fd-ground-plan)" opacity="0.5" />

      {/* Module outlines */}
      {hasMultiple && modules
        ? modules.map((mod, mi) => {
            const c = mod.col - minCol;
            const r = mod.row - minRow;
            const mx = planOx + c * (planW / cols);
            const my = planOy + r * (planH / rows);
            const mw = planW / cols;
            const mh = planH / rows;
            return (
              <g key={`mod-${mi}`}>
                <rect x={mx} y={my} width={mw} height={mh} fill="#F5F3EE" stroke="#555" strokeWidth="0.8" />
                <text x={mx + mw / 2} y={my + mh / 2 + 3} fontSize="7" textAnchor="middle" fill="#888" opacity="0.7" letterSpacing="1">
                  {mod.label}
                </text>
              </g>
            );
          })
        : (
            <g>
              <rect x={planOx} y={planOy} width={planW} height={planH} fill="#F5F3EE" stroke="#555" strokeWidth="0.8" />
              <text x={planOx + planW / 2} y={planOy + planH / 2 + 3} fontSize="7" textAnchor="middle" fill="#888" opacity="0.7" letterSpacing="1">
                MODULE
              </text>
            </g>
          )}

      {/* ─── Grid reference markers (A, B, C for columns; 1, 2, 3 for rows) ─── */}
      {Array.from({ length: cols + 1 }).map((_, i) => {
        const gx = planOx + i * (planW / cols);
        return (
          <g key={`gref-c-${i}`}>
            <line x1={gx} y1={planOy - 34} x2={gx} y2={planOy - 4} stroke="#000" strokeWidth="0.3" strokeDasharray="2,2" />
            <circle cx={gx} cy={planOy - 42} r="9" fill="#fff" stroke="#000" strokeWidth="0.7" />
            <text x={gx} y={planOy - 38} fontSize="9" fontWeight="bold" textAnchor="middle" fill="#000">
              {colLetter(i)}
            </text>
          </g>
        );
      })}
      {Array.from({ length: rows + 1 }).map((_, i) => {
        const gy = planOy + i * (planH / rows);
        return (
          <g key={`gref-r-${i}`}>
            <line x1={planOx - 34} y1={gy} x2={planOx - 4} y2={gy} stroke="#000" strokeWidth="0.3" strokeDasharray="2,2" />
            <circle cx={planOx - 42} cy={gy} r="9" fill="#fff" stroke="#000" strokeWidth="0.7" />
            <text x={planOx - 42} y={gy + 4} fontSize="9" fontWeight="bold" textAnchor="middle" fill="#000">
              {i + 1}
            </text>
          </g>
        );
      })}

      {/* ─── Dimension chain (top) — per-bay + overall ─── */}
      {Array.from({ length: cols }).map((_, i) => {
        const x1 = planOx + i * (planW / cols);
        const x2 = planOx + (i + 1) * (planW / cols);
        const y = planOy - 14;
        return (
          <g key={`dim-top-${i}`}>
            <line x1={x1} y1={y} x2={x2} y2={y} stroke="#000" strokeWidth="0.4" />
            <line x1={x1 - 3} y1={y - 3} x2={x1 + 3} y2={y + 3} stroke="#000" strokeWidth="0.4" />
            <line x1={x2 - 3} y1={y - 3} x2={x2 + 3} y2={y + 3} stroke="#000" strokeWidth="0.4" />
            <text x={(x1 + x2) / 2} y={y - 4} fontSize="7" textAnchor="middle" fill="#000">3 000</text>
          </g>
        );
      })}

      {/* ─── Dimension chain (right) — per-bay + overall ─── */}
      {Array.from({ length: rows }).map((_, i) => {
        const y1 = planOy + i * (planH / rows);
        const y2 = planOy + (i + 1) * (planH / rows);
        const x = planOx + planW + 14;
        return (
          <g key={`dim-right-${i}`}>
            <line x1={x} y1={y1} x2={x} y2={y2} stroke="#000" strokeWidth="0.4" />
            <line x1={x - 3} y1={y1 - 3} x2={x + 3} y2={y1 + 3} stroke="#000" strokeWidth="0.4" />
            <line x1={x - 3} y1={y2 - 3} x2={x + 3} y2={y2 + 3} stroke="#000" strokeWidth="0.4" />
            <text
              x={x + 5} y={(y1 + y2) / 2 + 3}
              fontSize="7" fill="#000"
              transform={`rotate(-90, ${x + 5}, ${(y1 + y2) / 2 + 3})`}
              textAnchor="middle"
            >
              3 000
            </text>
          </g>
        );
      })}

      {/* ─── Overall dimension (top, offset further) ─── */}
      {cols > 1 && (
        <g>
          <line x1={planOx} y1={planOy - 28} x2={planOx + planW} y2={planOy - 28} stroke="#000" strokeWidth="0.5" />
          <line x1={planOx - 4} y1={planOy - 32} x2={planOx + 4} y2={planOy - 24} stroke="#000" strokeWidth="0.5" />
          <line x1={planOx + planW - 4} y1={planOy - 32} x2={planOx + planW + 4} y2={planOy - 24} stroke="#000" strokeWidth="0.5" />
          <text x={planOx + planW / 2} y={planOy - 31} fontSize="8" fontWeight="bold" textAnchor="middle" fill="#000">
            {totalW_mm}
          </text>
        </g>
      )}
      {rows > 1 && (
        <g>
          <line x1={planOx + planW + 28} y1={planOy} x2={planOx + planW + 28} y2={planOy + planH} stroke="#000" strokeWidth="0.5" />
          <line x1={planOx + planW + 24} y1={planOy - 4} x2={planOx + planW + 32} y2={planOy + 4} stroke="#000" strokeWidth="0.5" />
          <line x1={planOx + planW + 24} y1={planOy + planH - 4} x2={planOx + planW + 32} y2={planOy + planH + 4} stroke="#000" strokeWidth="0.5" />
          <text
            x={planOx + planW + 36} y={planOy + planH / 2}
            fontSize="8" fontWeight="bold" fill="#000"
            transform={`rotate(-90, ${planOx + planW + 36}, ${planOy + planH / 2})`}
            textAnchor="middle"
          >
            {totalH_mm}
          </text>
        </g>
      )}

      {/* ─── Screw pile symbols (circle with X) ─── */}
      {piles.map((p, i) => (
        <g key={`pile-plan-${i}`}>
          <circle cx={p.x} cy={p.y} r="5" fill="#2d2d2d" stroke="#000" strokeWidth="0.8" />
          <line x1={p.x - 3.5} y1={p.y - 3.5} x2={p.x + 3.5} y2={p.y + 3.5} stroke="#fff" strokeWidth="0.8" />
          <line x1={p.x + 3.5} y1={p.y - 3.5} x2={p.x - 3.5} y2={p.y + 3.5} stroke="#fff" strokeWidth="0.8" />
          {/* Mark label */}
          <text x={p.x + 7} y={p.y - 5} fontSize="5.5" fill="#000" fontWeight="bold">{p.mark}</text>
        </g>
      ))}

      {/* ─── Section cut line across plan ─── */}
      <line
        x1={planOx - 10} y1={planOy + planH / 2}
        x2={planOx + planW + 10} y2={planOy + planH / 2}
        stroke="#000" strokeWidth="0.6" strokeDasharray="10,2,2,2"
      />
      <polygon
        points={`${planOx - 16},${planOy + planH / 2 - 4} ${planOx - 16},${planOy + planH / 2 + 4} ${planOx - 10},${planOy + planH / 2}`}
        fill="#000"
      />
      <text x={planOx - 22} y={planOy + planH / 2 + 4} fontSize="9" fontWeight="bold" textAnchor="middle" fill="#000">B</text>
      <polygon
        points={`${planOx + planW + 16},${planOy + planH / 2 - 4} ${planOx + planW + 16},${planOy + planH / 2 + 4} ${planOx + planW + 10},${planOy + planH / 2}`}
        fill="#000"
      />
      <text x={planOx + planW + 22} y={planOy + planH / 2 + 4} fontSize="9" fontWeight="bold" textAnchor="middle" fill="#000">B</text>

      {/* ─── North arrow (top-right corner of plan) ─── */}
      <g>
        <circle cx={planOx + planW - 18} cy={planOy + 18} r="11" fill="#fff" stroke="#000" strokeWidth="0.5" />
        <line x1={planOx + planW - 18} y1={planOy + 26} x2={planOx + planW - 18} y2={planOy + 10} stroke="#000" strokeWidth="0.8" />
        <polygon
          points={`${planOx + planW - 18},${planOy + 6} ${planOx + planW - 22},${planOy + 14} ${planOx + planW - 18},${planOy + 12}`}
          fill="#000"
        />
        <polygon
          points={`${planOx + planW - 18},${planOy + 6} ${planOx + planW - 14},${planOy + 14} ${planOx + planW - 18},${planOy + 12}`}
          fill="none" stroke="#000" strokeWidth="0.4"
        />
        <text x={planOx + planW - 18} y={planOy + 3} fontSize="7" fontWeight="bold" textAnchor="middle" fill="#000">N</text>
      </g>

      {/* ═══════════════════════════════════════════════════ */}
      {/*  PILE SCHEDULE (bottom-left)                        */}
      {/* ═══════════════════════════════════════════════════ */}
      {(() => {
        const tx = 40;
        const ty = 480;
        const colW = [40, 90, 70, 70, 70];
        const totalTableW = colW.reduce((a, b) => a + b, 0);
        const rowH = 16;
        const headers = ["MARK", "TYPE", "SHAFT Ø", "DEPTH", "DESIGN LOAD"];
        const dataRows: string[][] = [
          ["P1...", "Helical steel screw pile", "89 mm", "2 500 mm", "35 kN"],
          ["(corners)", "Galvanized, 3× helix plates", "", "(varies)", ""],
          ["PC", "Central load pile", "114 mm", "3 000 mm", "55 kN"],
          ["", "Helical steel, galvanized", "", "", ""],
        ];
        return (
          <g>
            <text x={tx} y={ty - 8} fontSize="9" fontWeight="bold" fill="#000" letterSpacing="1">
              PILE SCHEDULE
            </text>
            {/* Table border */}
            <rect x={tx} y={ty} width={totalTableW} height={rowH * (dataRows.length + 1)} fill="#fff" stroke="#000" strokeWidth="0.7" />
            {/* Header row shade */}
            <rect x={tx} y={ty} width={totalTableW} height={rowH} fill="#EFEBE3" />
            {/* Header divider line */}
            <line x1={tx} y1={ty + rowH} x2={tx + totalTableW} y2={ty + rowH} stroke="#000" strokeWidth="0.7" />
            {/* Column dividers */}
            {colW.slice(0, -1).map((_, ci) => {
              const xOffset = colW.slice(0, ci + 1).reduce((a, b) => a + b, 0);
              return (
                <line
                  key={`tcol-${ci}`}
                  x1={tx + xOffset} y1={ty} x2={tx + xOffset} y2={ty + rowH * (dataRows.length + 1)}
                  stroke="#000" strokeWidth="0.3"
                />
              );
            })}
            {/* Header text */}
            {headers.map((h, ci) => {
              const xOffset = colW.slice(0, ci).reduce((a, b) => a + b, 0);
              return (
                <text
                  key={`thead-${ci}`}
                  x={tx + xOffset + colW[ci] / 2} y={ty + rowH / 2 + 3}
                  fontSize="6.5" fontWeight="bold" textAnchor="middle" fill="#000"
                >
                  {h}
                </text>
              );
            })}
            {/* Data rows */}
            {dataRows.map((row, ri) => (
              <g key={`trow-${ri}`}>
                {ri > 0 && (
                  <line
                    x1={tx} y1={ty + rowH * (ri + 1)} x2={tx + totalTableW} y2={ty + rowH * (ri + 1)}
                    stroke="#000" strokeWidth="0.15" strokeDasharray="1,1"
                  />
                )}
                {row.map((cell, ci) => {
                  const xOffset = colW.slice(0, ci).reduce((a, b) => a + b, 0);
                  return (
                    <text
                      key={`tcell-${ri}-${ci}`}
                      x={tx + xOffset + colW[ci] / 2} y={ty + rowH * (ri + 1) + rowH / 2 + 3}
                      fontSize="6" textAnchor="middle" fill={ri % 2 === 1 ? "#777" : "#333"}
                    >
                      {cell}
                    </text>
                  );
                })}
              </g>
            ))}
            {/* Summary */}
            <text x={tx} y={ty + rowH * (dataRows.length + 1) + 14} fontSize="7" fill="#555">
              Total piles: {cornerPiles.length} corner + {piles.length - cornerPiles.length} central = {piles.length}
            </text>
          </g>
        );
      })()}

      {/* ═══════════════════════════════════════════════════ */}
      {/*  SECTION B-B — Pile detail (bottom-right inset)     */}
      {/* ═══════════════════════════════════════════════════ */}
      <g>
        {/* Inset border */}
        <rect x={sectOx} y={sectOy} width={sectW} height={sectH} fill="#FDFCF8" stroke="#000" strokeWidth="0.6" />
        <text x={sectOx + 8} y={sectOy + 14} fontSize="8" fontWeight="bold" fill="#000" letterSpacing="1">
          SECTION B-B — PILE DETAIL (1:20)
        </text>

        {/* Ground (earth) fill below grade */}
        <rect x={sectOx + 10} y={groundY} width={sectW - 20} height={sectH - (groundY - sectOy) - 10} fill="url(#fd-earth)" />

        {/* Ground level line */}
        <line x1={sectOx + 10} y1={groundY} x2={sectOx + sectW - 10} y2={groundY} stroke="#000" strokeWidth="1.2" />
        {/* Ground hatch (above ground line tick marks) */}
        {Array.from({ length: 16 }).map((_, i) => (
          <line
            key={`gnd-tick-${i}`}
            x1={sectOx + 15 + i * 17}
            y1={groundY}
            x2={sectOx + 15 + i * 17 - 6}
            y2={groundY + 6}
            stroke="#8B7355" strokeWidth="0.4"
          />
        ))}
        <text x={sectOx + sectW - 14} y={groundY - 3} fontSize="6" textAnchor="end" fill="#000">GL ±0.00</text>

        {/* Soil layer separator */}
        <line
          x1={sectOx + 10} y1={groundY + 40}
          x2={sectOx + sectW - 10} y2={groundY + 40}
          stroke="#8B7355" strokeWidth="0.3" strokeDasharray="3,2"
        />
        <text x={sectOx + 14} y={groundY + 20} fontSize="5.5" fill="#8B7355">Topsoil</text>
        <text x={sectOx + 14} y={groundY + 58} fontSize="5.5" fill="#8B7355">Bearing clay</text>

        {/* ─── Screw pile shaft ─── */}
        <rect
          x={sectCx - pileShaftW / 2} y={groundY}
          width={pileShaftW} height={pileDepth}
          fill="#888" stroke="#000" strokeWidth="0.8"
        />
        <rect
          x={sectCx - pileShaftW / 2} y={groundY}
          width={pileShaftW} height={pileDepth}
          fill="url(#fd-steel-hatch)"
        />
        {/* Helix plates */}
        {[0.35, 0.6, 0.9].map((frac, i) => {
          const py = groundY + pileDepth * frac;
          return (
            <ellipse
              key={`helix-${i}`}
              cx={sectCx} cy={py} rx={(pileShaftW + 14) / 2} ry={3}
              fill="#555" stroke="#000" strokeWidth="0.5"
            />
          );
        })}
        {/* Pile tip */}
        <polygon
          points={`${sectCx - pileShaftW / 2},${groundY + pileDepth} ${sectCx + pileShaftW / 2},${groundY + pileDepth} ${sectCx},${groundY + pileDepth + 8}`}
          fill="#555" stroke="#000" strokeWidth="0.5"
        />

        {/* Pile cap / bearing pad */}
        <rect
          x={sectCx - capW / 2} y={groundY - capH}
          width={capW} height={capH}
          fill="#bbb" stroke="#000" strokeWidth="1"
        />
        <rect
          x={sectCx - capW / 2} y={groundY - capH}
          width={capW} height={capH}
          fill="url(#fd-concrete)"
        />

        {/* Steel bracket */}
        <rect
          x={sectCx - connW / 2} y={groundY - capH - connH}
          width={connW} height={connH}
          fill="#fff" stroke="#000" strokeWidth="0.8"
        />
        {[-11, 11].map((ox, i) => (
          <circle
            key={`bolt-${i}`}
            cx={sectCx + ox} cy={groundY - capH - connH / 2} r="1.8"
            fill="none" stroke="#000" strokeWidth="0.5"
          />
        ))}

        {/* Floor slab */}
        <rect
          x={sectCx - slabW / 2} y={groundY - capH - connH - slabH}
          width={slabW} height={slabH}
          fill="#ccc" stroke="#000" strokeWidth="1"
        />
        <rect
          x={sectCx - slabW / 2} y={groundY - capH - connH - slabH}
          width={slabW} height={slabH}
          fill="url(#fd-concrete)"
        />
        <text
          x={sectCx} y={groundY - capH - connH - slabH / 2 + 3}
          fontSize="6" textAnchor="middle" fill="#000"
        >
          RC FLOOR SLAB 200
        </text>

        {/* ─── Callouts ─── */}
        {/* Pile callout */}
        <g>
          <circle cx={sectCx + pileShaftW / 2} cy={groundY + pileDepth * 0.55} r="1.2" fill="#333" />
          <line
            x1={sectCx + pileShaftW / 2} y1={groundY + pileDepth * 0.55}
            x2={sectOx + sectW - 80} y2={groundY + pileDepth * 0.65}
            stroke="#555" strokeWidth="0.3"
          />
          <line
            x1={sectOx + sectW - 80} y1={groundY + pileDepth * 0.65}
            x2={sectOx + sectW - 14} y2={groundY + pileDepth * 0.65}
            stroke="#555" strokeWidth="0.3"
          />
          <text x={sectOx + sectW - 14} y={groundY + pileDepth * 0.65 - 2} fontSize="5.5" textAnchor="end" fill="#555">Helical screw pile</text>
          <text x={sectOx + sectW - 14} y={groundY + pileDepth * 0.65 + 6} fontSize="5.5" textAnchor="end" fill="#777">Galv. steel, 3× helix</text>
        </g>
        {/* Cap callout */}
        <g>
          <circle cx={sectCx - capW / 2} cy={groundY - capH / 2} r="1.2" fill="#333" />
          <line
            x1={sectCx - capW / 2} y1={groundY - capH / 2}
            x2={sectOx + 60} y2={groundY - capH / 2}
            stroke="#555" strokeWidth="0.3"
          />
          <text x={sectOx + 56} y={groundY - capH / 2 - 2} fontSize="5.5" textAnchor="end" fill="#555">Pile cap (RC)</text>
        </g>
        {/* Bracket callout */}
        <g>
          <circle cx={sectCx + connW / 2} cy={groundY - capH - connH / 2} r="1.2" fill="#333" />
          <line
            x1={sectCx + connW / 2} y1={groundY - capH - connH / 2}
            x2={sectOx + sectW - 14} y2={groundY - capH - connH / 2}
            stroke="#555" strokeWidth="0.3"
          />
          <text x={sectOx + sectW - 14} y={groundY - capH - connH / 2 - 2} fontSize="5.5" textAnchor="end" fill="#555">Galv. steel bracket</text>
        </g>

        {/* ─── Dimension lines (section) ─── */}
        {/* Pile depth */}
        {(() => {
          const dx = sectOx + 20;
          const y1 = groundY;
          const y2 = groundY + pileDepth;
          return (
            <g>
              <line x1={dx} y1={y1} x2={dx} y2={y2} stroke="#000" strokeWidth="0.4" />
              <line x1={dx - 3} y1={y1 - 3} x2={dx + 3} y2={y1 + 3} stroke="#000" strokeWidth="0.4" />
              <line x1={dx - 3} y1={y2 - 3} x2={dx + 3} y2={y2 + 3} stroke="#000" strokeWidth="0.4" />
              <text
                x={dx - 4} y={(y1 + y2) / 2}
                fontSize="7" fill="#000" textAnchor="middle"
                transform={`rotate(-90, ${dx - 4}, ${(y1 + y2) / 2})`}
              >
                2 500
              </text>
            </g>
          );
        })()}
        {/* Floor-to-ground */}
        {(() => {
          const dx = sectOx + sectW - 20;
          const y1 = groundY;
          const y2 = groundY - capH - connH - slabH;
          return (
            <g>
              <line x1={dx} y1={y1} x2={dx} y2={y2} stroke="#000" strokeWidth="0.4" />
              <line x1={dx - 3} y1={y1 - 3} x2={dx + 3} y2={y1 + 3} stroke="#000" strokeWidth="0.4" />
              <line x1={dx - 3} y1={y2 - 3} x2={dx + 3} y2={y2 + 3} stroke="#000" strokeWidth="0.4" />
              <text
                x={dx + 4} y={(y1 + y2) / 2}
                fontSize="7" fill="#000" textAnchor="middle"
                transform={`rotate(-90, ${dx + 4}, ${(y1 + y2) / 2})`}
              >
                {capH + connH + slabH * 2}
              </text>
            </g>
          );
        })()}
      </g>

      {/* ═══════════════════════════════════════════════════ */}
      {/*  PLAN LEGEND (small, upper-left of plan)            */}
      {/* ═══════════════════════════════════════════════════ */}
      <g>
        <rect x={40} y={110} width={28} height={28} fill="#fff" stroke="#000" strokeWidth="0.4" />
        <g transform={`translate(${54},${124})`}>
          <circle r="5" fill="#2d2d2d" stroke="#000" strokeWidth="0.8" />
          <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="#fff" strokeWidth="0.8" />
          <line x1="3.5" y1="-3.5" x2="-3.5" y2="3.5" stroke="#fff" strokeWidth="0.8" />
        </g>
        <text x={40} y={150} fontSize="6.5" fill="#000">Screw pile</text>
        <text x={40} y={159} fontSize="6.5" fill="#555">location</text>
      </g>

      {/* ═══════════════════════════════════════════════════ */}
      {/*  NOTES (top-right of plan, under north arrow)       */}
      {/* ═══════════════════════════════════════════════════ */}
      <g>
        <text x={40} y={760} fontSize="7" fontWeight="bold" fill="#000" letterSpacing="1">NOTES:</text>
        <text x={40} y={772} fontSize="6.5" fill="#555">1. Screw pile size, spacing and depth subject to geotechnical report.</text>
        <text x={40} y={782} fontSize="6.5" fill="#555">2. All steel foundation components hot-dip galvanized (min. 85 μm).</text>
        <text x={40} y={792} fontSize="6.5" fill="#555">
          3. Module floor slab: reinforced concrete 200 mm, C25/30, rebar BST 500 S.
        </text>
      </g>
    </g>
  );
}
