/**
 * VisionSlide — design direction, color palette, and moodboard.
 *
 * Left column: style name + description + 4-5 swatch palette.
 * Right column: 4 moodboard images (user-pinned or style defaults).
 */

import { SlideCard, SlideHeader } from "./shared";
import type { SlideContext } from "./types";

export interface PaletteSwatch {
  color: string;
  label: string;
}

export interface MoodImage {
  imageUrl: string;
  label?: string;
}

export interface VisionSlideProps extends SlideContext {
  slideNumber: number;
  styleDescription?: string;
  palette?: PaletteSwatch[];
  moodImages?: MoodImage[];
}

export default function VisionSlide(props: VisionSlideProps) {
  const { template: tmpl, slideNumber, styleName, styleDescription, palette, moodImages } = props;

  return (
    <SlideCard bg={tmpl.bg} text={tmpl.text}>
      <SlideHeader
        accent={tmpl.accent}
        text={tmpl.text}
        number={slideNumber}
        title="Design Vision"
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Style + palette */}
        <div className="md:col-span-2">
          <h3 className="text-xl font-bold mb-2" style={{ color: tmpl.text }}>
            {styleName}
          </h3>
          <p
            className="text-sm leading-relaxed mb-6"
            style={{ color: tmpl.text, opacity: 0.6 }}
          >
            {styleDescription ||
              "A carefully curated design direction that balances aesthetics with functionality."}
          </p>

          {palette && palette.length > 0 && (
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-2"
                style={{ color: tmpl.text, opacity: 0.4 }}
              >
                Color Palette
              </p>
              <div className="flex gap-2">
                {palette.map((swatch, i) => (
                  <div key={i} className="text-center">
                    <div
                      className="h-12 w-12 rounded-lg border border-gray-200 shadow-sm"
                      style={{ backgroundColor: swatch.color }}
                    />
                    <span
                      className="text-[8px] mt-1 block"
                      style={{ color: tmpl.text, opacity: 0.4 }}
                    >
                      {swatch.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Moodboard */}
        <div className="space-y-2">
          <p
            className="text-[10px] font-bold uppercase tracking-wider mb-2"
            style={{ color: tmpl.text, opacity: 0.4 }}
          >
            Mood Board
          </p>
          {moodImages && moodImages.length > 0 ? (
            moodImages.slice(0, 4).map((img, i) => (
              <div
                key={`mood-${i}`}
                className="rounded-lg overflow-hidden bg-gray-200 aspect-video"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.imageUrl}
                  alt={img.label || `Mood ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))
          ) : (
            <div className="rounded-lg bg-gray-100 aspect-video flex items-center justify-center">
              <p className="text-xs text-gray-400">Moodboard images from Step 4</p>
            </div>
          )}
        </div>
      </div>
    </SlideCard>
  );
}
