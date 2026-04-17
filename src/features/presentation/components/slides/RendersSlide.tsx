/**
 * RendersSlide — grid of AI-generated renders with engine metadata.
 */

import { SlideCard, SlideHeader } from "./shared";
import type { SlideContext } from "./types";

export interface RenderEntry {
  id: string;
  imageUrl: string;
  label: string;
  description?: string;
  engine?: string;
  resolution?: string;
  mode?: "img2img" | "text2img";
}

export interface RendersSlideProps extends SlideContext {
  slideNumber: number;
  renders: RenderEntry[];
}

export default function RendersSlide(props: RendersSlideProps) {
  const { template: tmpl, slideNumber, renders } = props;

  return (
    <SlideCard bg={tmpl.bg} text={tmpl.text}>
      <SlideHeader
        accent={tmpl.accent}
        text={tmpl.text}
        number={slideNumber}
        title="AI Renders"
      />

      {renders.length > 0 ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {renders.slice(0, 6).map((render) => (
              <div
                key={render.id}
                className="rounded-xl overflow-hidden border"
                style={{ borderColor: tmpl.text + "20" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={render.imageUrl}
                  alt={render.label}
                  className="w-full aspect-video object-cover"
                />
                <div className="p-3">
                  <p className="text-xs font-medium" style={{ color: tmpl.text }}>
                    {render.label}
                  </p>
                  {render.description && (
                    <p
                      className="text-[10px] leading-relaxed mt-1"
                      style={{ color: tmpl.text, opacity: 0.6 }}
                    >
                      {render.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {render.engine && (
                      <p className="text-[10px]" style={{ color: tmpl.text, opacity: 0.4 }}>
                        Engine: {render.engine}
                      </p>
                    )}
                    {render.resolution && (
                      <p className="text-[10px]" style={{ color: tmpl.text, opacity: 0.4 }}>
                        {render.resolution}
                      </p>
                    )}
                    {render.mode && (
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: tmpl.accent + "20",
                          color: tmpl.accent,
                        }}
                      >
                        {render.mode === "img2img" ? "3D+AI" : "AI"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {renders.length > 6 && (
            <p
              className="text-[10px] mt-2 text-center"
              style={{ color: tmpl.text, opacity: 0.3 }}
            >
              {renders.length} renders saved (first 6 shown)
            </p>
          )}
        </>
      ) : (
        <div className="mt-6 text-center">
          <div className="rounded-xl overflow-hidden bg-gray-200 aspect-video flex items-center justify-center mb-4">
            <p className="text-sm text-gray-500">Save renders from Step 7 to see them here</p>
          </div>
          <p className="text-xs" style={{ color: tmpl.text, opacity: 0.4 }}>
            Use the &quot;Save to Presentation&quot; button in the Render step
          </p>
        </div>
      )}
    </SlideCard>
  );
}
