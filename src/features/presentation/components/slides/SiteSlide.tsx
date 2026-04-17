/**
 * SiteSlide — terrain plan with module layout + location details.
 */

import { SlideCard, SlideHeader, DetailRow } from "./shared";
import SitePlanSvg, { type SitePlanModule } from "./SitePlanSvg";
import type { SlideContext } from "./types";

export interface SiteSlideProps extends SlideContext {
  slideNumber: number;
  modules: SitePlanModule[];
  mapCenter: { lat: number; lng: number };
  polygonCount: number;
  gridRotation: number;
}

export default function SiteSlide(props: SiteSlideProps) {
  const {
    template: tmpl,
    slideNumber,
    modules,
    totalAreaSqm,
    usableAreaSqm,
    mapCenter,
    polygonCount,
    gridRotation,
  } = props;

  const location =
    mapCenter.lat !== 44.4268
      ? `${mapCenter.lat.toFixed(4)}, ${mapCenter.lng.toFixed(4)}`
      : "Romania (default)";

  const terrainArea =
    polygonCount > 2
      ? `~${Math.round(polygonCount * 50)} m² (estimated)`
      : `~${totalAreaSqm * 4} m² (auto-sized)`;

  const footprint = `${Math.ceil(Math.sqrt(totalAreaSqm))} × ${Math.ceil(Math.sqrt(totalAreaSqm))} m approx.`;

  return (
    <SlideCard bg={tmpl.bg} text={tmpl.text}>
      <SlideHeader
        accent={tmpl.accent}
        text={tmpl.text}
        number={slideNumber}
        title="Site Plan"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="rounded-xl overflow-hidden bg-emerald-50 border border-emerald-200 aspect-video flex items-center justify-center p-4">
          {modules.length > 0 ? (
            <SitePlanSvg modules={modules} accent={tmpl.accent} />
          ) : (
            <p className="text-sm text-gray-400">No modules placed yet</p>
          )}
        </div>
        <div className="space-y-4">
          <DetailRow label="Location" value={location} text={tmpl.text} />
          <DetailRow label="Terrain Area" value={terrainArea} text={tmpl.text} />
          <DetailRow
            label="Grid Configuration"
            value={`${modules.length} module${modules.length !== 1 ? "s" : ""} placed`}
            text={tmpl.text}
          />
          <DetailRow label="Grid Rotation" value={`${gridRotation}°`} text={tmpl.text} />
          <DetailRow label="Total Built Area" value={`${totalAreaSqm} m²`} text={tmpl.text} />
          <DetailRow label="Usable Area" value={`${usableAreaSqm} m²`} text={tmpl.text} />
          <DetailRow label="Building Footprint" value={footprint} text={tmpl.text} />
        </div>
      </div>
    </SlideCard>
  );
}
