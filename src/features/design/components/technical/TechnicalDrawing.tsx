"use client";

import { MODULE_TYPES } from "@/shared/types";
import { getPreset, getPresetsForType, FLOOR_MATERIALS, WALL_MATERIALS } from "../../layouts";
import type { ModuleConfig } from "../../store";
import { DRAWING_LABELS, DRAWING_SCALES } from "./drawingConstants";
import CombinedFloorPlanDrawing from "./drawings/CombinedFloorPlanDrawing";
import FloorPlanDrawing from "./drawings/FloorPlanDrawing";
import SectionAADrawing from "./drawings/SectionDrawing";
import FrontElevationDrawing from "./drawings/ElevationDrawing";
import WallDetailDrawing from "./drawings/WallDetailDrawing";
import MEPPlanDrawing from "./drawings/MepDrawing";
import FoundationDetailDrawing from "./drawings/FoundationDrawing";

interface Props {
  module: ModuleConfig;
  allModules?: ModuleConfig[];
  drawingType: string;
  projectName?: string;
}

export default function TechnicalDrawing({
  module,
  allModules,
  drawingType,
  projectName = "ModulCA Project",
}: Props) {
  const preset = getPreset(module.moduleType, module.layoutPreset)
    || getPresetsForType(module.moduleType)[0];
  const moduleType = MODULE_TYPES.find((mt) => mt.id === module.moduleType);
  const floorMat = FLOOR_MATERIALS.find((f) => f.id === module.floorFinish);
  const wallMat = WALL_MATERIALS.find((w) => w.id === module.wallColor);
  const floorColor = floorMat?.color || "#D4A76A";
  const wallColor = wallMat?.color || "#F0EDE5";

  const today = new Date().toISOString().split("T")[0];
  const drawingLabel = DRAWING_LABELS[drawingType] || "FLOOR PLAN";
  const scaleLabel = DRAWING_SCALES[drawingType] || "1:25";

  return (
    <svg
      viewBox="0 0 800 900"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ fontFamily: "'Courier New', monospace" }}
    >
      {/* White background */}
      <rect width="800" height="900" fill="white" />

      {/* Drawing border */}
      <rect
        x="10"
        y="10"
        width="780"
        height="880"
        fill="none"
        stroke="#000"
        strokeWidth="1.5"
      />
      <rect
        x="15"
        y="15"
        width="770"
        height="870"
        fill="none"
        stroke="#000"
        strokeWidth="0.5"
      />

      {/* Drawing title & scale */}
      <text x={40} y={45} fontSize="14" fontWeight="bold" fill="#000">
        {drawingLabel}
      </text>
      <text x={40} y={60} fontSize="9" fill="#666">
        Scale {scaleLabel}
      </text>

      {/* ─── Render one drawing based on drawingType ─── */}
      {drawingType === "combined-plan" && allModules && (
        <CombinedFloorPlanDrawing modules={allModules} />
      )}
      {drawingType === "floor-plan" && (
        <FloorPlanDrawing
          floorColor={floorColor}
          wallColor={wallColor}
          floorMat={floorMat}
          wallMat={wallMat}
          preset={preset}
          wallConfigs={module.wallConfigs}
          moduleTypeLabel={moduleType?.label}
          moduleLabel={module.label}
        />
      )}
      {drawingType === "section-aa" && (
        <SectionAADrawing
          floorColor={floorColor}
          wallColor={wallColor}
          floorMat={floorMat}
          wallConfigs={module.wallConfigs}
        />
      )}
      {drawingType === "front-elevation" && (
        <FrontElevationDrawing wallColor={wallColor} wallMat={wallMat} wallConfigs={module.wallConfigs} />
      )}
      {drawingType === "wall-detail" && (
        <WallDetailDrawing wallColor={wallColor} />
      )}
      {drawingType === "mep-plan" && <MEPPlanDrawing moduleType={module.moduleType} />}
      {drawingType === "foundation-detail" && <FoundationDetailDrawing modules={allModules} />}

      {/* ═══════════ GRAPHICAL SCALE BAR ═══════════ */}
      <ScaleBar scaleLabel={scaleLabel} />

      {/* ═══════════ TITLE BLOCK (bottom) ═══════════ */}
      <g>
        <rect
          x="570"
          y="800"
          width="215"
          height="80"
          fill="none"
          stroke="#000"
          strokeWidth="1.5"
        />
        {/* Dividers */}
        <line
          x1="570"
          y1="820"
          x2="785"
          y2="820"
          stroke="#000"
          strokeWidth="0.5"
        />
        <line
          x1="570"
          y1="840"
          x2="785"
          y2="840"
          stroke="#000"
          strokeWidth="0.5"
        />
        <line
          x1="570"
          y1="860"
          x2="785"
          y2="860"
          stroke="#000"
          strokeWidth="0.5"
        />
        <line
          x1="680"
          y1="840"
          x2="680"
          y2="880"
          stroke="#000"
          strokeWidth="0.5"
        />

        {/* Project name */}
        <text x="578" y="814" fontSize="9" fontWeight="bold" fill="#1B3A4B">
          {projectName}
        </text>

        {/* Module label */}
        <text x="578" y="834" fontSize="8" fill="#000">
          {drawingType === "combined-plan"
            ? `All Modules (${allModules?.length || 0})`
            : `${module.label} — ${moduleType?.label || module.moduleType}`}
        </text>

        {/* Drawing type & scale */}
        <text x="578" y="854" fontSize="7" fill="#555">
          {drawingLabel} — Scale: {scaleLabel}
        </text>
        <text x="688" y="854" fontSize="7" fill="#555">
          Sheet: A3
        </text>

        {/* Date & drawing number */}
        <text x="578" y="874" fontSize="7" fill="#555">
          Date: {today}
        </text>
        <text x="688" y="874" fontSize="7" fill="#555">
          Dwg: MCA-{module.label}-01
        </text>
      </g>
    </svg>
  );
}

/* ─── Graphical Scale Bar ─── */
const SCALE_BAR_CONFIGS: Record<string, { segMm: number; segments: number }> = {
  "1:5": { segMm: 100, segments: 4 },
  "1:10": { segMm: 200, segments: 4 },
  "1:25": { segMm: 500, segments: 4 },
  "1:50": { segMm: 1000, segments: 4 },
};

function ScaleBar({ scaleLabel }: { scaleLabel: string }) {
  const config = SCALE_BAR_CONFIGS[scaleLabel];
  if (!config) return null;

  const scaleDenom = parseInt(scaleLabel.split(":")[1], 10);
  const pxPerPaperMm = 800 / 420; // SVG viewBox width / A3 width in mm
  const segPx = (config.segMm * pxPerPaperMm) / scaleDenom;
  const barX = 30;
  const barY = 855;
  const barH = 5;

  return (
    <g>
      {Array.from({ length: config.segments }, (_, i) => (
        <g key={`seg-${i}`}>
          <rect
            x={barX + i * segPx}
            y={barY}
            width={segPx}
            height={barH}
            fill={i % 2 === 0 ? "#000" : "#fff"}
            stroke="#000"
            strokeWidth="0.5"
          />
          {/* Tick label */}
          <text
            x={barX + i * segPx}
            y={barY + barH + 9}
            fontSize="6"
            textAnchor="middle"
            fill="#000"
          >
            {i * config.segMm}
          </text>
        </g>
      ))}
      {/* Final tick label */}
      <text
        x={barX + config.segments * segPx}
        y={barY + barH + 9}
        fontSize="6"
        textAnchor="middle"
        fill="#000"
      >
        {config.segments * config.segMm}
      </text>
      {/* Unit label */}
      <text
        x={barX + config.segments * segPx + 12}
        y={barY + barH + 9}
        fontSize="6"
        fill="#555"
      >
        mm
      </text>
      {/* Top border to close bar */}
      <line
        x1={barX}
        y1={barY}
        x2={barX + config.segments * segPx}
        y2={barY}
        stroke="#000"
        strokeWidth="0.5"
      />
    </g>
  );
}
