/**
 * MaterialsSlide — floor & wall finishes with texture previews + usage counts.
 */

import { SlideCard, SlideHeader } from "./shared";
import { FLOOR_MATERIALS, WALL_MATERIALS } from "@/features/design/layouts";
import type { SlideContext } from "./types";

export interface MaterialsSlideProps extends SlideContext {
  slideNumber: number;
  /** Modules with floor + wall material IDs referenced */
  modules: { floorFinish: string; wallColor: string }[];
  /** Optional textures map: materialId → image URL */
  textures: Record<string, string>;
}

export default function MaterialsSlide(props: MaterialsSlideProps) {
  const { template: tmpl, slideNumber, modules, textures, finishName } = props;

  const itemBg =
    tmpl.bg === "#FFFFFF" ? "#f8f8f8" : tmpl.bg === "#111111" ? "#1a1a1a" : "#f0ede8";

  const floorIds = Array.from(new Set(modules.map((m) => m.floorFinish)));
  const wallIds = Array.from(new Set(modules.map((m) => m.wallColor)));

  return (
    <SlideCard bg={tmpl.bg} text={tmpl.text}>
      <SlideHeader
        accent={tmpl.accent}
        text={tmpl.text}
        number={slideNumber}
        title="Materials & Finishes"
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <MaterialColumn
          title="Floor Materials"
          tmpl={tmpl}
          itemBg={itemBg}
          items={floorIds.map((id) => {
            const floor = FLOOR_MATERIALS.find((f) => f.id === id);
            const count = modules.filter((m) => m.floorFinish === id).length;
            return {
              id,
              label: floor?.label || id,
              color: floor?.color,
              count,
              textureUrl: textures[id],
            };
          })}
        />
        <MaterialColumn
          title="Wall Finishes"
          tmpl={tmpl}
          itemBg={itemBg}
          items={wallIds.map((id) => {
            const wall = WALL_MATERIALS.find((w) => w.id === id);
            const count = modules.filter((m) => m.wallColor === id).length;
            return {
              id,
              label: wall?.label || id,
              color: wall?.color,
              count,
              textureUrl: textures[id],
            };
          })}
        />
      </div>

      <div className="mt-6">
        <p
          className="text-[10px] font-bold uppercase tracking-wider mb-2"
          style={{ color: tmpl.text, opacity: 0.4 }}
        >
          Finish Level
        </p>
        <div
          className="inline-block rounded-lg px-4 py-2"
          style={{ backgroundColor: tmpl.accent + "20" }}
        >
          <span className="text-sm font-bold" style={{ color: tmpl.accent }}>
            {finishName}
          </span>
        </div>
      </div>
    </SlideCard>
  );
}

function MaterialColumn({
  title,
  tmpl,
  itemBg,
  items,
}: {
  title: string;
  tmpl: { accent: string; text: string };
  itemBg: string;
  items: Array<{
    id: string;
    label: string;
    color?: string;
    count: number;
    textureUrl?: string;
  }>;
}) {
  return (
    <div>
      <p
        className="text-[10px] font-bold uppercase tracking-wider mb-3"
        style={{ color: tmpl.text, opacity: 0.4 }}
      >
        {title}
      </p>
      <div className="space-y-2">
        {items.map((it) => (
          <div
            key={it.id}
            className="flex items-center gap-3 rounded-lg p-2"
            style={{ backgroundColor: itemBg }}
          >
            <div
              className="h-10 w-10 rounded-lg border overflow-hidden flex-shrink-0"
              style={{ backgroundColor: it.color }}
            >
              {it.textureUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={it.textureUrl} alt={it.label} className="h-full w-full object-cover" />
              )}
            </div>
            <div>
              <span className="text-xs font-medium" style={{ color: tmpl.text }}>
                {it.label}
              </span>
              <span className="block text-[10px]" style={{ color: tmpl.text, opacity: 0.4 }}>
                Used in {it.count} module{it.count > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
