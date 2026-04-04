export default function FoundationDetailDrawing() {
  // Center the cross-section in the drawing area
  const cx = 400; // center X
  const groundY = 400; // ground level line
  const pileDepth = 250; // px depth of pile below ground
  const pileW = 30; // pile shaft width
  const padW = 120; // bearing pad width
  const padH = 30; // bearing pad height
  const slabW = 500; // floor slab width (visible portion)
  const slabH = 35; // floor slab height
  const connH = 50; // connection bracket height
  const connW = 80; // connection bracket width

  return (
    <g>
      {/* ─── Ground fill (hatched) ─── */}
      <rect
        x={100}
        y={groundY}
        width={600}
        height={350}
        fill="#E8DCC8"
        opacity="0.3"
      />
      {/* Ground hatching */}
      {Array.from({ length: 40 }).map((_, i) => (
        <line
          key={`ground-${i}`}
          x1={100 + i * 15}
          y1={groundY}
          x2={100 + i * 15 - 10}
          y2={groundY + 8}
          stroke="#8B7355"
          strokeWidth="0.5"
        />
      ))}

      {/* Ground level line */}
      <line
        x1={80}
        y1={groundY}
        x2={720}
        y2={groundY}
        stroke="#000"
        strokeWidth="1.5"
      />
      <text x={725} y={groundY + 4} fontSize="9" fill="#000">
        GL ±0.00
      </text>

      {/* ─── Screw pile shaft ─── */}
      <rect
        x={cx - pileW / 2}
        y={groundY + 20}
        width={pileW}
        height={pileDepth}
        fill="#888"
        stroke="#000"
        strokeWidth="1.5"
      />
      {/* Steel hatching inside pile */}
      <defs>
        <pattern
          id="steel-hatch"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="6"
            stroke="#555"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect
        x={cx - pileW / 2}
        y={groundY + 20}
        width={pileW}
        height={pileDepth}
        fill="url(#steel-hatch)"
      />

      {/* Screw pile helix plates */}
      {[0.4, 0.65, 0.9].map((frac, i) => {
        const py = groundY + 20 + pileDepth * frac;
        const helixW = pileW + 40;
        return (
          <g key={`helix-${i}`}>
            <ellipse
              cx={cx}
              cy={py}
              rx={helixW / 2}
              ry={6}
              fill="#777"
              stroke="#000"
              strokeWidth="1"
            />
          </g>
        );
      })}

      {/* Pile label */}
      <text
        x={cx + pileW / 2 + 50}
        y={groundY + 20 + pileDepth / 2}
        fontSize="8"
        fill="#444"
      >
        Steel Screw Pile
      </text>
      <line
        x1={cx + pileW / 2 + 2}
        y1={groundY + 20 + pileDepth / 2 - 3}
        x2={cx + pileW / 2 + 48}
        y2={groundY + 20 + pileDepth / 2 - 3}
        stroke="#666"
        strokeWidth="0.3"
      />

      {/* ─── Bearing pad / pile cap ─── */}
      <rect
        x={cx - padW / 2}
        y={groundY - padH + 5}
        width={padW}
        height={padH}
        fill="#aaa"
        stroke="#000"
        strokeWidth="1.5"
      />
      {/* Concrete hatching */}
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
      <text
        x={cx - padW / 2 - 55}
        y={groundY - padH / 2 + 8}
        fontSize="8"
        fill="#444"
      >
        Pile Cap
      </text>
      <line
        x1={cx - padW / 2 - 3}
        y1={groundY - padH / 2 + 5}
        x2={cx - padW / 2 - 50}
        y2={groundY - padH / 2 + 5}
        stroke="#666"
        strokeWidth="0.3"
      />

      {/* ─── Connection bracket ─── */}
      <rect
        x={cx - connW / 2}
        y={groundY - padH - connH + 5}
        width={connW}
        height={connH}
        fill="none"
        stroke="#000"
        strokeWidth="1.5"
      />
      {/* Bolt holes */}
      {[-25, -10, 10, 25].map((offset, i) => (
        <circle
          key={`bolt-${i}`}
          cx={cx + offset}
          cy={groundY - padH - connH / 2 + 5}
          r="3"
          fill="none"
          stroke="#000"
          strokeWidth="1"
        />
      ))}
      <text
        x={cx + connW / 2 + 50}
        y={groundY - padH - connH / 2 + 8}
        fontSize="8"
        fill="#444"
      >
        Steel Bracket
      </text>
      <line
        x1={cx + connW / 2 + 2}
        y1={groundY - padH - connH / 2 + 5}
        x2={cx + connW / 2 + 48}
        y2={groundY - padH - connH / 2 + 5}
        stroke="#666"
        strokeWidth="0.3"
      />

      {/* ─── Module floor slab ─── */}
      <rect
        x={cx - slabW / 2}
        y={groundY - padH - connH - slabH + 5}
        width={slabW}
        height={slabH}
        fill="#ccc"
        stroke="#000"
        strokeWidth="2"
      />
      {/* Slab hatching */}
      <g opacity="0.2">
        {Array.from({ length: 35 }).map((_, i) => (
          <line
            key={`slab-h-${i}`}
            x1={cx - slabW / 2 + i * (slabW / 35)}
            y1={groundY - padH - connH - slabH + 5}
            x2={cx - slabW / 2 + i * (slabW / 35) + slabH}
            y2={groundY - padH - connH + 5}
            stroke="#000"
            strokeWidth="0.3"
          />
        ))}
      </g>
      <text
        x={cx}
        y={groundY - padH - connH - slabH / 2 + 8}
        fontSize="9"
        textAnchor="middle"
        fill="#333"
      >
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
              x={dx - 6}
              y={(y1 + y2) / 2 + 3}
              fontSize="8"
              textAnchor="end"
              fill="#000"
              transform={`rotate(-90, ${dx - 6}, ${(y1 + y2) / 2})`}
            >
              Pile Depth (varies)
            </text>
          </g>
        );
      })()}

      {/* Floor slab to ground */}
      {(() => {
        const dx = cx + slabW / 2 + 40;
        const y1 = groundY;
        const y2 = groundY - padH - connH - slabH + 5;
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
              x={dx + 8}
              y={(y1 + y2) / 2 + 3}
              fontSize="9"
              fill="#000"
            >
              {padH + connH + slabH}mm
            </text>
          </g>
        );
      })()}

      {/* ─── Soil layer labels ─── */}
      <text x={120} y={groundY + 40} fontSize="8" fill="#8B7355">
        Topsoil
      </text>
      <line
        x1={100}
        y1={groundY + 60}
        x2={700}
        y2={groundY + 60}
        stroke="#8B7355"
        strokeWidth="0.3"
        strokeDasharray="4,3"
      />
      <text x={120} y={groundY + 80} fontSize="8" fill="#8B7355">
        Bearing Soil / Clay
      </text>

      {/* ─── Notes ─── */}
      <text x={100} y={730} fontSize="7" fill="#555">
        NOTES:
      </text>
      <text x={100} y={742} fontSize="7" fill="#555">
        1. Screw pile size and depth per geotechnical report
      </text>
      <text x={100} y={754} fontSize="7" fill="#555">
        2. All steel connections hot-dip galvanized
      </text>
      <text x={100} y={766} fontSize="7" fill="#555">
        3. Module floor slab: reinforced concrete 200mm
      </text>
    </g>
  );
}
