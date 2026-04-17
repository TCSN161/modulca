/**
 * GalleryCard — one tile in the public gallery grid.
 * Server Component — pure presentation, no interactivity (handled at parent).
 */

import Link from "next/link";
import Image from "next/image";
import { ratingAverage, type PublicRender } from "../types";

interface Props {
  render: PublicRender;
  showPrice: boolean;
  hallOfFame?: boolean;
  priority?: boolean;
}

export default function GalleryCard({
  render,
  showPrice,
  hallOfFame,
  priority,
}: Props) {
  const avg = ratingAverage(render);

  return (
    <Link
      href={`/g/${render.slug}`}
      className="group relative rounded-[12px] overflow-hidden bg-white border border-brand-bone-300/60 shadow-card transition-shadow hover:shadow-card-hover"
    >
      {/* Badge: hall-of-fame crown */}
      {hallOfFame && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100/95 backdrop-blur-sm text-amber-900 text-[10px] font-bold uppercase tracking-wider shadow-sm">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l2.39 7.36H22l-6.19 4.5L18.2 21 12 16.5 5.8 21l2.39-7.14L2 9.36h7.61z" />
          </svg>
          Hall of Fame
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-[4/3] bg-brand-bone-200 overflow-hidden">
        {render.thumbUrl ? (
          <Image
            src={render.thumbUrl}
            alt={render.promptExcerpt || `Render ${render.engineId}`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading={priority ? "eager" : "lazy"}
            priority={priority}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-brand-gray/60">
            Image archived
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-bold text-brand-olive-500 uppercase tracking-[0.08em]">
            {render.engineId}
          </span>
          {render.ratingCount > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-brand-charcoal font-semibold">
              <svg
                className="w-3 h-3 text-amber-500"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {avg.toFixed(1)}
            </span>
          )}
        </div>

        {render.roomType && (
          <p className="text-[11px] text-brand-gray capitalize mb-1">
            {render.roomType}
            {render.styleDirection && (
              <>
                {" · "}
                <span className="text-brand-olive-700">{render.styleDirection}</span>
              </>
            )}
          </p>
        )}

        {showPrice && render.estimatedCostEur ? (
          <p className="text-xs font-semibold text-brand-charcoal">
            €{Math.round(render.estimatedCostEur).toLocaleString()}
            {render.areaSqm && (
              <span className="text-[10px] text-brand-gray ml-1">· {render.areaSqm}m²</span>
            )}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
