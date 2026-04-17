/**
 * CoverSlide — title page with optional hero render background.
 *
 * First slide of the presentation. Shows project name, client, date,
 * and high-level stats (modules, area, style, finish). If renders exist,
 * one is picked as a dimmed background via `coverRenderIndex`.
 */

import { SlideCard } from "./shared";
import type { SlideContext } from "./types";

export default function CoverSlide(props: SlideContext) {
  const {
    template: tmpl,
    projectName,
    clientName,
    moduleCount,
    totalAreaSqm,
    styleName,
    finishName,
    savedRenders,
    coverRenderIndex,
    setCoverRenderIndex,
  } = props;

  return (
    <SlideCard bg={tmpl.bg} text={tmpl.text}>
      <div className="relative flex flex-col items-center justify-center min-h-[500px] text-center">
        {/* Hero render background */}
        {savedRenders.length > 0 && (
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={savedRenders[coverRenderIndex]?.imageUrl || savedRenders[0].imageUrl}
              alt="Hero render"
              className="h-full w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, ${tmpl.bg}CC 0%, ${tmpl.bg}99 40%, ${tmpl.bg}DD 100%)`,
              }}
            />
          </div>
        )}

        <div className="relative z-10">
          <div
            className="mb-8 text-[10px] font-bold uppercase tracking-[0.3em]"
            style={{ color: tmpl.accent }}
          >
            ModulCA Project Presentation
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: tmpl.text }}>
            {projectName}
          </h1>
          {clientName && (
            <p className="text-lg mb-2" style={{ color: tmpl.text, opacity: 0.6 }}>
              Prepared for {clientName}
            </p>
          )}
          <p className="text-sm mb-8" style={{ color: tmpl.text, opacity: 0.4 }}>
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div
            className="flex items-center gap-6 text-xs"
            style={{ color: tmpl.text, opacity: 0.5 }}
          >
            <span>{moduleCount} Modules</span>
            <span>
              {totalAreaSqm}m<sup>2</sup> Total Area
            </span>
            <span>{styleName} Style</span>
            <span>{finishName} Finish</span>
          </div>
          <div
            className="mt-12 h-1 w-24 rounded mx-auto"
            style={{ backgroundColor: tmpl.accent }}
          />
        </div>

        {/* Cover image picker — shown only if multiple renders */}
        {savedRenders.length > 1 && (
          <div className="relative z-10 mt-6 flex items-center gap-2">
            <span
              className="text-[9px] uppercase tracking-wider mr-2"
              style={{ color: tmpl.text, opacity: 0.4 }}
            >
              Cover image:
            </span>
            {savedRenders.map((render, i) => (
              <button
                key={render.id}
                onClick={() => setCoverRenderIndex(i)}
                className="h-10 w-14 rounded-md overflow-hidden border-2 transition-all"
                style={{
                  borderColor: i === coverRenderIndex ? tmpl.accent : "transparent",
                  opacity: i === coverRenderIndex ? 1 : 0.5,
                  transform: i === coverRenderIndex ? "scale(1.05)" : "scale(1)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={render.imageUrl}
                  alt={render.label}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </SlideCard>
  );
}
