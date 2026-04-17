/**
 * ModulesSlide — per-module spec cards (floor, walls, furniture, area).
 *
 * Paginated 4 modules per slide when there are many. Returns an array of
 * slide cards when paginated; the caller is responsible for rendering each.
 */

import { SlideCard, SlideHeader } from "./shared";
import { MODULE_TYPES } from "@/shared/types";
import { getPreset, getPresetsForType, FLOOR_MATERIALS, WALL_MATERIALS } from "@/features/design/layouts";
import type { SlideContext } from "./types";

export interface ModulesSlideModule {
  row: number;
  col: number;
  moduleType: string;
  label: string;
  layoutPreset: string;
  floorFinish: string;
  wallColor: string;
}

export interface ModulesSlideProps extends SlideContext {
  slideNumber: number;
  modules: ModulesSlideModule[];
}

const MODS_PER_PAGE = 4;

export default function ModulesSlide(props: ModulesSlideProps) {
  const { template: tmpl, slideNumber, modules } = props;

  const pages: ModulesSlideModule[][] = [];
  for (let i = 0; i < modules.length; i += MODS_PER_PAGE) {
    pages.push(modules.slice(i, i + MODS_PER_PAGE));
  }

  if (pages.length === 0) return null;

  // Alt bg shade per template bg color
  const itemBg =
    tmpl.bg === "#FFFFFF" ? "#f8f8f8" : tmpl.bg === "#111111" ? "#1a1a1a" : "#f0ede8";

  return (
    <>
      {pages.map((pageMods, pageIdx) => (
        <SlideCard key={`modules-${pageIdx}`} bg={tmpl.bg} text={tmpl.text}>
          <SlideHeader
            accent={tmpl.accent}
            text={tmpl.text}
            number={slideNumber + pageIdx}
            title={
              pages.length > 1
                ? `Module Details (${pageIdx + 1}/${pages.length})`
                : "Module Details"
            }
          />
          <div className="mt-6 space-y-4">
            {pageMods.map((mod) => {
              const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
              const preset =
                getPreset(mod.moduleType, mod.layoutPreset) ||
                getPresetsForType(mod.moduleType)[0];
              const floor = FLOOR_MATERIALS.find((f) => f.id === mod.floorFinish);
              const wall = WALL_MATERIALS.find((w) => w.id === mod.wallColor);

              return (
                <div
                  key={`${mod.row}-${mod.col}`}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: itemBg }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-5 w-5 rounded" style={{ backgroundColor: mt?.color }} />
                    <h4 className="text-sm font-bold" style={{ color: tmpl.text }}>
                      {mod.label}
                    </h4>
                    <span className="text-xs" style={{ color: tmpl.text, opacity: 0.4 }}>
                      {mt?.label} | {preset?.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-xs">
                    <SpecCell label="Floor" text={tmpl.text}>
                      <div className="flex items-center gap-1 mt-1">
                        <div
                          className="h-3 w-3 rounded border"
                          style={{ backgroundColor: floor?.color }}
                        />
                        <span style={{ color: tmpl.text }}>{floor?.label}</span>
                      </div>
                    </SpecCell>
                    <SpecCell label="Walls" text={tmpl.text}>
                      <div className="flex items-center gap-1 mt-1">
                        <div
                          className="h-3 w-3 rounded border"
                          style={{ backgroundColor: wall?.color }}
                        />
                        <span style={{ color: tmpl.text }}>{wall?.label}</span>
                      </div>
                    </SpecCell>
                    <SpecCell label="Furniture" text={tmpl.text}>
                      <span className="block mt-1" style={{ color: tmpl.text }}>
                        {preset?.furniture.length || 0} pieces
                      </span>
                    </SpecCell>
                    <SpecCell label="Area" text={tmpl.text}>
                      <span className="block mt-1" style={{ color: tmpl.text }}>
                        9m² (7m² usable)
                      </span>
                    </SpecCell>
                  </div>
                </div>
              );
            })}
          </div>
        </SlideCard>
      ))}
    </>
  );
}

function SpecCell({
  label,
  text,
  children,
}: {
  label: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span style={{ color: text, opacity: 0.4 }}>{label}</span>
      {children}
    </div>
  );
}
