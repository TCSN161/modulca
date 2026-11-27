/**
 * DescriptionSlide — auto-generated project overview.
 *
 * Synthesises a prose description from the room breakdown, then shows
 * four stat tiles (Configuration, Area, Style, Investment).
 */

import { SlideCard, SlideHeader } from "./shared";
import type { SlideContext } from "./types";

export interface DescriptionSlideProps extends SlideContext {
  slideNumber: number;
  /** Module types, one per module ("bedroom", "bedroom", "kitchen") */
  moduleTypes: string[];
  totalEstimateEur: number;
  styleTagline?: string;
}

export default function DescriptionSlide(props: DescriptionSlideProps) {
  const {
    template: tmpl,
    slideNumber,
    moduleCount,
    totalAreaSqm,
    usableAreaSqm,
    styleName,
    finishName,
    moduleTypes,
    totalEstimateEur,
    styleTagline,
    t,
  } = props;
  const rooms = t.rooms(moduleTypes);

  return (
    <SlideCard bg={tmpl.bg} text={tmpl.text}>
      <SlideHeader
        accent={tmpl.accent}
        text={tmpl.text}
        number={slideNumber}
        title={t("description.title")}
      />
      <div className="mt-8 max-w-2xl mx-auto">
        <p
          className="text-base leading-relaxed mb-6"
          style={{ color: tmpl.text, opacity: 0.8 }}
        >
          {t("description.paragraph", {
            style: styleName.toLowerCase(), count: moduleCount, area: totalAreaSqm,
            usable: usableAreaSqm, rooms, finish: finishName.toLowerCase(),
          })}
        </p>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <StatTile
            tmpl={tmpl}
            label={t("description.configuration")}
            value={t("common.modules", { count: moduleCount })}
            subtext={t.rooms(moduleTypes, " + ")}
          />
          <StatTile
            tmpl={tmpl}
            label={t("description.totalArea")}
            value={`${totalAreaSqm} m²`}
            subtext={t("description.usableInterior", { usable: usableAreaSqm })}
          />
          <StatTile
            tmpl={tmpl}
            label={t("description.designStyle")}
            value={styleName}
            subtext={styleTagline || t("description.styleFallback")}
          />
          <StatTile
            tmpl={tmpl}
            label={t("description.investment")}
            value={t.eur(totalEstimateEur)}
            subtext={t("description.investmentSub", { finish: finishName, perM2: t.eur(totalEstimateEur / (totalAreaSqm || 1)) })}
          />
        </div>
      </div>
    </SlideCard>
  );
}

function StatTile({
  tmpl,
  label,
  value,
  subtext,
}: {
  tmpl: { accent: string; text: string };
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: tmpl.accent + "15" }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-wider mb-1"
        style={{ color: tmpl.accent }}
      >
        {label}
      </p>
      <p className="text-2xl font-bold" style={{ color: tmpl.text }}>
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: tmpl.text, opacity: 0.5 }}>
        {subtext}
      </p>
    </div>
  );
}
