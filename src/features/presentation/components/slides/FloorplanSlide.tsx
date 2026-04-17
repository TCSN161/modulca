/**
 * FloorplanSlide — grid-based floor plan showing placed modules + empties.
 * Includes legend of module types with counts and total area.
 */

import { SlideCard, SlideHeader } from "./shared";
import { MODULE_TYPES, MODULE_EXTERIOR_SIZE, MODULE_EXTERIOR_AREA, MODULE_INTERIOR_AREA } from "@/shared/types";
import type { SlideContext } from "./types";

export interface FloorplanGridCell {
  row: number;
  col: number;
  moduleType: string | null;
}

export interface FloorplanModule {
  row: number;
  col: number;
  moduleType: string;
  label: string;
}

export interface FloorplanSlideProps extends SlideContext {
  slideNumber: number;
  /** All grid cells (including empty ones so bounding box is shown) */
  gridCells: FloorplanGridCell[];
  /** Placed modules with user labels */
  modules: FloorplanModule[];
}

export default function FloorplanSlide(props: FloorplanSlideProps) {
  const { template: tmpl, slideNumber, gridCells, modules } = props;

  const activeCells = gridCells.filter((c) => c.moduleType !== null);
  const cellsToRender =
    activeCells.length > 0
      ? activeCells
      : modules.map((m) => ({ row: m.row, col: m.col, moduleType: m.moduleType }));

  if (cellsToRender.length === 0) {
    return (
      <SlideCard bg={tmpl.bg} text={tmpl.text}>
        <SlideHeader
          accent={tmpl.accent}
          text={tmpl.text}
          number={slideNumber}
          title="Floor Plan"
        />
        <div className="mt-12 text-center">
          <p className="text-sm" style={{ color: tmpl.text, opacity: 0.5 }}>
            No modules placed yet.
          </p>
        </div>
      </SlideCard>
    );
  }

  const allRows = cellsToRender.map((c) => c.row);
  const allCols = cellsToRender.map((c) => c.col);
  const minRow = Math.min(...allRows);
  const maxRow = Math.max(...allRows);
  const minCol = Math.min(...allCols);
  const maxCol = Math.max(...allCols);
  const numCols = maxCol - minCol + 1;
  const numRows = maxRow - minRow + 1;

  const cellLookup = new Map(cellsToRender.map((c) => [`${c.row},${c.col}`, c.moduleType]));
  const labelLookup = new Map(modules.map((m) => [`${m.row},${m.col}`, m.label]));

  const gridPositions: FloorplanGridCell[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      gridPositions.push({
        row: r,
        col: c,
        moduleType: cellLookup.get(`${r},${c}`) ?? null,
      });
    }
  }

  const moduleTypeCounts = Array.from(new Set(modules.map((m) => m.moduleType)));

  return (
    <SlideCard bg={tmpl.bg} text={tmpl.text}>
      <SlideHeader
        accent={tmpl.accent}
        text={tmpl.text}
        number={slideNumber}
        title="Floor Plan"
      />
      <div className="mt-4 text-center">
        <p className="text-xs mb-1" style={{ color: tmpl.text, opacity: 0.4 }}>
          {numCols * MODULE_EXTERIOR_SIZE}m x {numRows * MODULE_EXTERIOR_SIZE}m footprint | {modules.length * MODULE_EXTERIOR_AREA}m² total | {modules.length * MODULE_INTERIOR_AREA}m² usable
        </p>
      </div>
      <div className="mt-4 flex justify-center overflow-x-auto">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${numCols}, minmax(60px, 80px))` }}
        >
          {gridPositions.map(({ row, col, moduleType }) => {
            const mt = moduleType ? MODULE_TYPES.find((m) => m.id === moduleType) : null;
            const label = labelLookup.get(`${row},${col}`);

            if (!moduleType) {
              return (
                <div
                  key={`${row}-${col}`}
                  className="rounded-lg border border-dashed p-2 text-center"
                  style={{
                    gridColumn: col - minCol + 1,
                    gridRow: row - minRow + 1,
                    borderColor: tmpl.text + "15",
                  }}
                >
                  <div className="text-[8px]" style={{ color: tmpl.text, opacity: 0.15 }}>
                    empty
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`${row}-${col}`}
                className="rounded-lg border p-2 text-center"
                style={{
                  gridColumn: col - minCol + 1,
                  gridRow: row - minRow + 1,
                  backgroundColor: (mt?.color ?? "#ccc") + "30",
                  borderColor: mt?.color || "#ccc",
                }}
              >
                <div className="text-[9px] font-bold" style={{ color: tmpl.text }}>
                  {label || moduleType}
                </div>
                <div className="text-[8px]" style={{ color: tmpl.text, opacity: 0.5 }}>
                  {mt?.label}
                </div>
                <div className="text-[8px]" style={{ color: tmpl.text, opacity: 0.4 }}>
                  {MODULE_EXTERIOR_SIZE}m x {MODULE_EXTERIOR_SIZE}m
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {moduleTypeCounts.map((type) => {
          const mt = MODULE_TYPES.find((m) => m.id === type);
          const count = modules.filter((m) => m.moduleType === type).length;
          return (
            <div
              key={type}
              className="flex items-center gap-2 text-xs"
              style={{ color: tmpl.text }}
            >
              <div className="h-3 w-3 rounded" style={{ backgroundColor: mt?.color }} />
              <span>
                {mt?.label} x{count} ({count * MODULE_EXTERIOR_AREA}m²)
              </span>
            </div>
          );
        })}
      </div>
    </SlideCard>
  );
}
