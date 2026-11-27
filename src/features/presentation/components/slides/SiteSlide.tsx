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
    t,
  } = props;

  const location =
    mapCenter.lat !== 44.4268
      ? `${mapCenter.lat.toFixed(4)}, ${mapCenter.lng.toFixed(4)}`
      : t("site.locationDefault");

  const terrainArea =
    polygonCount > 2
      ? t("site.terrainEstimated", { area: Math.round(polygonCount * 50) })
      : t("site.terrainAuto", { area: totalAreaSqm * 4 });

  const footprint = t("site.footprintValue", { side: Math.ceil(Math.sqrt(totalAreaSqm)) });

  return (
    <SlideCard bg={tmpl.bg} text={tmpl.text}>
      <SlideHeader
        accent={tmpl.accent}
        text={tmpl.text}
        number={slideNumber}
        title={t("site.title")}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="rounded-xl overflow-hidden bg-emerald-50 border border-emerald-200 aspect-video flex items-center justify-center p-4">
          {modules.length > 0 ? (
            <SitePlanSvg
              modules={modules}
              accent={tmpl.accent}
              boundaryLabel={t("site.boundary").toUpperCase()}
              ariaLabel={t("site.planAria")}
            />
          ) : (
            <p className="text-sm text-gray-400">{t("site.noModules")}</p>
          )}
        </div>
        <div className="space-y-4">
          <DetailRow label={t("site.location")} value={location} text={tmpl.text} />
          <DetailRow label={t("site.terrainArea")} value={terrainArea} text={tmpl.text} />
          <DetailRow
            label={t("site.gridConfig")}
            value={t("site.modulesPlaced", { count: modules.length })}
            text={tmpl.text}
          />
          <DetailRow label={t("site.gridRotation")} value={`${gridRotation}°`} text={tmpl.text} />
          <DetailRow label={t("site.totalBuilt")} value={`${totalAreaSqm} m²`} text={tmpl.text} />
          <DetailRow label={t("site.usable")} value={`${usableAreaSqm} m²`} text={tmpl.text} />
          <DetailRow label={t("site.footprint")} value={footprint} text={tmpl.text} />
        </div>
      </div>
    </SlideCard>
  );
}
