/**
 * /gallery — public showcase of the last 100 published renders.
 * ISR revalidate every 5 min so new opt-in renders appear quickly.
 */

import Link from "next/link";
import type { Metadata } from "next";
import { AuthNav } from "@/features/auth/components/AuthNav";
import Footer from "@/features/shared/components/Footer";
import {
  listRecentRenders,
  listHallOfFame,
  getGallerySettings,
} from "@/features/gallery/service";
import GalleryCard from "@/features/gallery/components/GalleryCard";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Gallery — Latest ModulCA Renders",
  description:
    "Browse the latest AI-generated modular home renders on ModulCA. Filter by engine, room, and style to see what's possible.",
  openGraph: {
    title: "ModulCA Gallery — Latest Modular Home Renders",
    description: "Fresh AI-powered modular home designs from our community.",
    images: [
      {
        url: "/og?title=ModulCA+Gallery&subtitle=Latest+AI-powered+modular+home+renders",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default async function GalleryPage() {
  const [recent, hallOfFame, settings] = await Promise.all([
    listRecentRenders(100),
    listHallOfFame(6),
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
          <Link href="/#features" className="hover:text-brand-olive-700 transition-colors">Features</Link>
          <Link href="/portfolio" className="hover:text-brand-olive-700 transition-colors">Portfolio</Link>
          <Link href="/gallery" className="font-semibold text-brand-olive-700">Gallery</Link>
          <Link href="/pricing" className="hover:text-brand-olive-700 transition-colors">Pricing</Link>
        </nav>
        <AuthNav />
      </header>

      <section className="max-w-6xl mx-auto px-4 md:px-8 py-12 text-center">
        <p className="label-caps mb-3">Gallery</p>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-charcoal tracking-heading mb-4">
          Latest Renders from Our Community
        </h1>
        <p className="text-base text-brand-gray max-w-2xl mx-auto">
          Every room here was designed and rendered by someone on ModulCA. Click any image to see
          the configuration behind it — and start your own design from the same specs.
        </p>
      </section>

      {/* Hall of Fame strip */}
      {hallOfFame.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-8 mb-12">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-bold text-brand-charcoal tracking-heading">
              Hall of Fame
            </h2>
            <Link
              href="/gallery/hall-of-fame"
              className="text-sm font-semibold text-brand-olive-700 hover:text-brand-olive-500"
            >
              View all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 md:grid-cols-6 gap-3">
            {hallOfFame.map((r, i) => (
              <GalleryCard
                key={r.id}
                render={r}
                showPrice={showPrice}
                hallOfFame
                priority={i < 3}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent grid */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 pb-20">
        <h2 className="text-lg font-bold text-brand-charcoal tracking-heading mb-4">
          Fresh Renders
        </h2>
        {recent.length === 0 ? (
          <div className="rounded-[12px] bg-white border border-brand-bone-300/60 p-12 text-center">
            <p className="text-sm text-brand-gray mb-4">
              No published renders yet. Be the first to share yours!
            </p>
            <Link href="/project/new" className="btn-primary text-sm px-5 py-2.5 inline-block">
              Start Designing
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recent.map((r, i) => (
              <GalleryCard key={r.id} render={r} showPrice={showPrice} priority={i < 4} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
