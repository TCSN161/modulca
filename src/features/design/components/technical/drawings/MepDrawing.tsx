import { WALL_THICKNESS, EXT } from "../drawingConstants";

export default function MEPPlanDrawing() {
  const S = 550 / 3000;
  const ox = (800 - EXT * S) / 2; // origin X centered
  const oy = 100; // origin Y
  const w = EXT * S;
  const h = EXT * S;
  const wt = WALL_THICKNESS * 1000 * S;

  return (
    <g>
      {/* Module outline - thin walls */}
      <rect
        x={ox}
        y={oy}
        width={w}
        height={h}
        fill="none"
        stroke="#aaa"
        strokeWidth="1"
      />
      {/* Interior area */}
      <rect
        x={ox + wt}
        y={oy + wt}
        width={w - wt * 2}
        height={h - wt * 2}
        fill="#FAFAFA"
        stroke="#ccc"
        strokeWidth="0.5"
      />

      {/* ─── Legend ─── */}
      <g>
        <rect
          x={ox + w + 30}
          y={oy}
          width={120}
          height={140}
          fill="none"
          stroke="#999"
          strokeWidth="0.5"
        />
        <text
          x={ox + w + 40}
          y={oy + 15}
          fontSize="8"
          fontWeight="bold"
          fill="#000"
        >
          LEGEND
        </text>
        {/* Electrical */}
        <circle
          cx={ox + w + 45}
          cy={oy + 32}
          r="5"
          fill="none"
          stroke="#2196F3"
          strokeWidth="1"
        />
        <line
          x1={ox + w + 42}
          y1={oy + 32}
          x2={ox + w + 48}
          y2={oy + 32}
          stroke="#2196F3"
          strokeWidth="1"
        />
        <line
          x1={ox + w + 45}
          y1={oy + 29}
          x2={ox + w + 45}
          y2={oy + 35}
          stroke="#2196F3"
          strokeWidth="1"
        />
        <text x={ox + w + 55} y={oy + 35} fontSize="7" fill="#2196F3">
          Elec. Outlet
        </text>
        {/* Light */}
        <circle
          cx={ox + w + 45}
          cy={oy + 52}
          r="5"
          fill="none"
          stroke="#FFC107"
          strokeWidth="1"
        />
        <line
          x1={ox + w + 40}
          y1={oy + 47}
          x2={ox + w + 50}
          y2={oy + 57}
          stroke="#FFC107"
          strokeWidth="0.5"
        />
        <line
          x1={ox + w + 50}
          y1={oy + 47}
          x2={ox + w + 40}
          y2={oy + 57}
          stroke="#FFC107"
          strokeWidth="0.5"
        />
        <text x={ox + w + 55} y={oy + 55} fontSize="7" fill="#FFC107">
          Light Fixture
        </text>
        {/* Plumbing */}
        <line
          x1={ox + w + 38}
          y1={oy + 72}
          x2={ox + w + 52}
          y2={oy + 72}
          stroke="#4CAF50"
          strokeWidth="1.5"
          strokeDasharray="4,2"
        />
        <text x={ox + w + 55} y={oy + 75} fontSize="7" fill="#4CAF50">
          Plumbing
        </text>
        {/* HVAC */}
        <rect
          x={ox + w + 39}
          y={oy + 86}
          width={12}
          height={8}
          fill="none"
          stroke="#9C27B0"
          strokeWidth="1"
          strokeDasharray="2,1"
        />
        <text x={ox + w + 55} y={oy + 95} fontSize="7" fill="#9C27B0">
          HVAC Duct
        </text>
        {/* Switch */}
        <text
          x={ox + w + 45}
          y={oy + 115}
          fontSize="10"
          textAnchor="middle"
          fill="#2196F3"
        >
          S
        </text>
        <text x={ox + w + 55} y={oy + 115} fontSize="7" fill="#2196F3">
          Switch
        </text>
      </g>

      {/* ─── Electrical outlets (along walls) ─── */}
      {/* Bottom-left outlet */}
      {[
        { cx: ox + 60, cy: oy + h - wt - 8 },
        { cx: ox + w - 60, cy: oy + h - wt - 8 },
        { cx: ox + wt + 8, cy: oy + h / 2 },
        { cx: ox + w - wt - 8, cy: oy + h / 2 },
        { cx: ox + w - wt - 8, cy: oy + 80 },
      ].map((pos, i) => (
        <g key={`outlet-${i}`}>
          <circle
            cx={pos.cx}
            cy={pos.cy}
            r="7"
            fill="none"
            stroke="#2196F3"
            strokeWidth="0.8"
          />
          <line
            x1={pos.cx - 4}
            y1={pos.cy}
            x2={pos.cx + 4}
            y2={pos.cy}
            stroke="#2196F3"
            strokeWidth="0.8"
          />
          <line
            x1={pos.cx}
            y1={pos.cy - 4}
            x2={pos.cx}
            y2={pos.cy + 4}
            stroke="#2196F3"
            strokeWidth="0.8"
          />
        </g>
      ))}

      {/* ─── Light switch near door ─── */}
      <text
        x={ox + (w + 900 * S) / 2 + 20}
        y={oy + h - wt - 5}
        fontSize="12"
        fill="#2196F3"
        textAnchor="middle"
      >
        S
      </text>

      {/* ─── Light fixtures (ceiling positions) ─── */}
      {[
        { cx: ox + w / 2, cy: oy + h / 2 },
        { cx: ox + w / 4, cy: oy + h / 4 },
        { cx: ox + (3 * w) / 4, cy: oy + (3 * h) / 4 },
      ].map((pos, i) => (
        <g key={`light-${i}`}>
          <circle
            cx={pos.cx}
            cy={pos.cy}
            r="10"
            fill="none"
            stroke="#FFC107"
            strokeWidth="0.8"
          />
          <line
            x1={pos.cx - 7}
            y1={pos.cy - 7}
            x2={pos.cx + 7}
            y2={pos.cy + 7}
            stroke="#FFC107"
            strokeWidth="0.5"
          />
          <line
            x1={pos.cx + 7}
            y1={pos.cy - 7}
            x2={pos.cx - 7}
            y2={pos.cy + 7}
            stroke="#FFC107"
            strokeWidth="0.5"
          />
        </g>
      ))}

      {/* ─── Plumbing pipes (dashed green lines) ─── */}
      {/* Cold water supply along left wall */}
      <line
        x1={ox + wt + 15}
        y1={oy + wt}
        x2={ox + wt + 15}
        y2={oy + h - wt}
        stroke="#4CAF50"
        strokeWidth="1.5"
        strokeDasharray="6,3"
      />
      {/* Branch to wet area */}
      <line
        x1={ox + wt + 15}
        y1={oy + h * 0.3}
        x2={ox + w * 0.4}
        y2={oy + h * 0.3}
        stroke="#4CAF50"
        strokeWidth="1.5"
        strokeDasharray="6,3"
      />
      {/* Hot water (red dashed) */}
      <line
        x1={ox + wt + 25}
        y1={oy + wt}
        x2={ox + wt + 25}
        y2={oy + h * 0.35}
        stroke="#F44336"
        strokeWidth="1"
        strokeDasharray="4,3"
      />
      <line
        x1={ox + wt + 25}
        y1={oy + h * 0.35}
        x2={ox + w * 0.4}
        y2={oy + h * 0.35}
        stroke="#F44336"
        strokeWidth="1"
        strokeDasharray="4,3"
      />
      {/* Drain pipe */}
      <line
        x1={ox + w * 0.4}
        y1={oy + h * 0.25}
        x2={ox + w * 0.4}
        y2={oy + h - wt}
        stroke="#4CAF50"
        strokeWidth="2"
        strokeDasharray="8,4"
      />

      {/* Plumbing labels */}
      <text
        x={ox + wt + 6}
        y={oy + h * 0.6}
        fontSize="6"
        fill="#4CAF50"
        writingMode="tb"
      >
        CW
      </text>
      <text
        x={ox + wt + 30}
        y={oy + h * 0.15}
        fontSize="6"
        fill="#F44336"
      >
        HW
      </text>

      {/* ─── HVAC duct (along top wall) ─── */}
      <rect
        x={ox + w * 0.15}
        y={oy + wt + 5}
        width={w * 0.7}
        height={20}
        fill="none"
        stroke="#9C27B0"
        strokeWidth="1"
        strokeDasharray="4,2"
      />
      <text
        x={ox + w / 2}
        y={oy + wt + 18}
        fontSize="7"
        textAnchor="middle"
        fill="#9C27B0"
      >
        HVAC Supply Duct
      </text>
      {/* HVAC connection point */}
      <rect
        x={ox + wt - 3}
        y={oy + wt + 5}
        width={w * 0.15 - wt + 3}
        height={20}
        fill="none"
        stroke="#9C27B0"
        strokeWidth="1.5"
      />
      <text
        x={ox + wt + (w * 0.15 - wt) / 2}
        y={oy + wt + 30}
        fontSize="6"
        textAnchor="middle"
        fill="#9C27B0"
      >
        HVAC Conn.
      </text>

      {/* ─── Electrical conduit runs (thin blue lines) ─── */}
      {/* Main conduit from entry along bottom wall */}
      <line
        x1={ox + w / 2}
        y1={oy + h - wt}
        x2={ox + w / 2}
        y2={oy + h - wt - 20}
        stroke="#2196F3"
        strokeWidth="0.5"
      />
      <line
        x1={ox + w / 2}
        y1={oy + h - wt - 20}
        x2={ox + 60}
        y2={oy + h - wt - 20}
        stroke="#2196F3"
        strokeWidth="0.5"
      />
      <line
        x1={ox + w / 2}
        y1={oy + h - wt - 20}
        x2={ox + w - 60}
        y2={oy + h - wt - 20}
        stroke="#2196F3"
        strokeWidth="0.5"
      />

      {/* Dimension - overall */}
      {(() => {
        const dy = oy - 15;
        return (
          <g>
            <line
              x1={ox}
              y1={dy}
              x2={ox + w}
              y2={dy}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={ox}
              y1={dy - 4}
              x2={ox}
              y2={dy + 4}
              stroke="#000"
              strokeWidth="0.5"
            />
            <line
              x1={ox + w}
              y1={dy - 4}
              x2={ox + w}
              y2={dy + 4}
              stroke="#000"
              strokeWidth="0.5"
            />
            <text
              x={ox + w / 2}
              y={dy - 4}
              fontSize="9"
              textAnchor="middle"
              fill="#000"
            >
              3000
            </text>
          </g>
        );
      })()}
    </g>
  );
}
