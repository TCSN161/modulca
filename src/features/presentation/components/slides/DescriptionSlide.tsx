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
  roomBreakdown: string[]; // e.g., ["2 Bedrooms", "1 Kitchen"]
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
    roomBreakdown,
    totalEstimateEur,
    styleTagline,
  } = props;

  return (
    <SlideCard bg={tmpl.bg} text={tmpl.text}>
      <SlideHeader
        accent={tmpl.accent}
        text={tmpl.text}
        number={slideNumber}
        title="Project Description"
      />
      <div className="mt-8 max-w-2xl mx-auto">
        <p
          className="text-base leading-relaxed mb-6"
          style={{ color: tmpl.text, opacity: 0.8 }}
        >
          This {styleName.toLowerCase()} modular residence comprises {moduleCount} modules
          totaling {totalAreaSqm}m<sup>2</sup> of built area ({usableAreaSqm}m<sup>2</sup> usable),
          featuring {roomBreakdown.join(", ")}. Designed with a {finishName.toLowerCase()} finish
          level, the project prioritizes efficient space utilization through modular construction
          techniques.
        </p>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <StatTile
            tmpl={tmpl}
            label="Configuration"
            value={`${moduleCount} Modules`}
            subtext={roomBreakdown.join(" + ")}
          />
          <StatTile
            tmpl={tmpl}
            label="Total Area"
            value={`${totalAreaSqm}m²`}
            subtext={`${usableAreaSqm}m² usable interior space`}
          />
          <StatTile
            tmpl={tmpl}
            label="Design Style"
            value={styleName}
            subtext={styleTagline || "Contemporary modular design"}
          />
          <StatTile
            tmpl={tmpl}
            label="Investment"
            value={`EUR ${Math.round(totalEstimateEur).toLocaleString()}`}
            subtext={`${finishName} finish · EUR ${Math.round(totalEstimateEur / (totalAreaSqm || 1))}/m²`}
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
