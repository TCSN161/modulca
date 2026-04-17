/**
 * /g/[slug] — individual render landing page.
 *
 * Dual purpose:
 *   1. Share target from the QR watermark — public, indexable, SEO-friendly
 *   2. Conversion funnel: "Design your own like this" CTA + rating widget
 */

import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthNav } from "@/features/auth/components/AuthNav";
import Footer from "@/features/shared/components/Footer";
import {
  getRenderBySlug,
  listRelatedRenders,
  getGallerySettings,
} from "@/features/gallery/service";
import { formatCost, ratingAverage } from "@/features/gallery/types";
import RatingWidget from "@/features/gallery/components/RatingWidget";
import GalleryCard from "@/features/gallery/components/GalleryCard";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const render = await getRenderBySlug(slug);
  if (!render) return { title: "Render not found" };

  const title = render.promptExcerpt
    ? `${render.promptExcerpt.slice(0, 60)} — ModulCA`
    : `Modular home render · ${render.engineId}`;
  const description =
    `AI-generated modular home render` +
    (render.roomType ? ` of a ${render.roomType}` : "") +
    (render.styleDirection ? ` in ${render.styleDirection} style` : "") +
    `. View the design behind it and create your own on ModulCA.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: render.imageUrl
        ? [{ url: render.imageUrl, width: 1200, height: 900 }]
        : [],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RenderLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const render = await getRenderBySlug(slug);
  if (!render) notFound();

  const [related, settings] = await Promise.all([
    listRelatedRenders(render, 4),
    getGallerySettings(),
  ]);

  const showPrice =
    settings.showPricesGlobally && settings.showEstimatedCost && render.showPrice;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: render.imageUrl,
    thumbnailUrl: render.thumbUrl,
    description: render.promptExcerpt,
    creator: { "@type": "Organization", name: "ModulCA" },
    datePublished: render.createdAt,
  };

  return (
    <div className="min-h-screen bg-brand-bone-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brand-bone-300/60 bg-white/95 backdrop-blur-md px-4 md:px-8">
        <Link href="/" className="text-lg font-bold text-brand-charcoal tracking-tight">
          Modul<span className="text-brand-olive-700">CA</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-brand-gray">
          <Link href="/gallery" className="hover:text-brand-olive-700 transition-colors">Gallery</Link>
          <Link href="/portfolio" className="hover:text-brand-olive-700 transition-colors">Portfolio</Link>
          <Link href="/pricing" className="hover:text-brand-olive-700 transition-colors">Pricing</Link>
        </nav>
        <AuthNav />
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 text-xs text-brand-gray">
        <Link href="/gallery" className="hover:text-brand-olive-700">Gallery</Link>
        <span className="mx-2">/</span>
        <span className="text-brand-charcoal font-semibold">
          {render.promptExcerpt?.slice(0, 40) || render.slug}
        </span>
      </div>

      <section className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* Image */}
          <div className="md:col-span-3">
            <div className="relative aspect-[4/3] rounded-[16px] overflow-hidden bg-brand-bone-200 shadow-card">
              {render.imageUrl ? (
                <Image
                  src={render.imageUrl}
                  alt={render.promptExcerpt || "ModulCA render"}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-brand-gray">
                  This render was archived after the gallery rotation.
                </div>
              )}
            </div>

            <div className="mt-4">
              <RatingWidget
                slug={render.slug}
                initialAvg={ratingAverage(render)}
                initialCount={render.ratingCount}
                size="lg"
                showCount={settings.showRatingCounts}
              />
            </div>
          </div>

          {/* Details + CTA */}
          <aside className="md:col-span-2">
            <div className="rounded-[16px] bg-white border border-brand-bone-300/60 shadow-card p-6">
              <p className="text-[10px] font-bold text-brand-olive-500 uppercase tracking-[0.08em] mb-1">
                Modular home render
              </p>
              <h1 className="text-xl font-bold text-brand-charcoal tracking-heading mb-4">
                {render.promptExcerpt?.slice(0, 80) || `Design by ${render.engineId}`}
              </h1>

              <dl className="space-y-2 text-sm">
                {render.roomType && (
                  <MetaRow label="Room" value={render.roomType} />
                )}
                {render.styleDirection && (
                  <MetaRow label="Style" value={render.styleDirection} />
                )}
                {render.finishLevel && (
                  <MetaRow label="Finish" value={render.finishLevel} />
                )}
                {render.moduleCount && (
                  <MetaRow label="Modules" value={`${render.moduleCount} × 3×3m`} />
                )}
                {render.areaSqm && (
                  <MetaRow label="Area" value={`${render.areaSqm} m²`} />
                )}
                {showPrice && render.estimatedCostEur && (
                  <MetaRow label="Est. cost" value={formatCost(render.estimatedCostEur)} />
                )}
                <MetaRow label="Engine" value={render.engineId} />
                <MetaRow
                  label="Published"
                  value={new Date(render.createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                />
              </dl>

              <div className="mt-6 pt-6 border-t border-brand-bone-300/60">
                <p className="text-sm text-brand-gray mb-4">
                  Want your own modular home designed like this?
                </p>
                <Link
                  href="/project/new"
                  className="btn-primary w-full text-center py-3"
                >
                  Design Your Own — Free
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-8 py-16">
          <h2 className="text-lg font-bold text-brand-charcoal tracking-heading mb-4">
            Similar renders
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((r) => (
              <GalleryCard key={r.id} render={r} showPrice={showPrice} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-xs text-brand-gray">{label}</dt>
      <dd className="text-sm font-semibold text-brand-charcoal capitalize">{value}</dd>
    </div>
  );
}
