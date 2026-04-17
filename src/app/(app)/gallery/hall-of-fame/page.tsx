/**
 * /gallery/hall-of-fame — top-rated renders that survived eviction from the
 * FIFO queue. Ordered by score_weighted desc.
 */

import Link from "next/link";
import type { Metadata } from "next";
import { AuthNav } from "@/features/auth/components/AuthNav";
import Footer from "@/features/shared/components/Footer";
import { listHallOfFame, getGallerySettings } from "@/features/gallery/service";
import GalleryCard from "@/features/gallery/components/GalleryCard";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Hall of Fame — Best ModulCA Renders",
  description: "The highest-rated modular home renders on ModulCA — voted by the community.",
  openGraph: {
    title: "Hall of Fame — Best ModulCA Renders",
    description: "The highest-rated modular home renders on ModulCA.",
    images: [
      {
        url: "/og?title=Hall+of+Fame&subtitle=The+best-rated+modular+home+renders",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default async function HallOfFamePage() {
  const [renders, settings] = await Promise.all([
    listHallOfFame(50),
    getGallerySettings(),
  ]);
  const showPrice = settings.showPricesGlobally && settings.showEstimatedCost;

  return (
    <div className="min-h-screen bg-brand-bone-100">
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
        <span className="text-brand-charcoal font-semibold">Hall of Fame</span>
      </div>

      <section className="max-w-6xl mx-auto px-4 md:px-8 py-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-4">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.39 7.36H22l-6.19 4.5L18.2 21 12 16.5 5.8 21l2.39-7.14L2 9.36h7.61z" />
          </svg>
          Hall of Fame
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-charcoal tracking-heading mb-4">
          The Best Renders, as Voted by You
        </h1>
        <p className="text-base text-brand-gray max-w-2xl mx-auto">
          These renders earned their spot through community votes. They survive the weekly
          gallery rotation — the rest make room for fresh entries.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-8 pb-20">
        {renders.length === 0 ? (
          <div className="rounded-[12px] bg-white border border-brand-bone-300/60 p-12 text-center">
            <p className="text-sm text-brand-gray mb-4">
              No renders have qualified for the Hall of Fame yet. Be the first to rate some!
            </p>
            <Link href="/gallery" className="text-sm font-semibold text-brand-olive-700 hover:text-brand-olive-500">
              Browse gallery →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {renders.map((r, i) => (
              <GalleryCard key={r.id} render={r} showPrice={showPrice} hallOfFame priority={i < 4} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
