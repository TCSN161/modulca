/**
 * Portfolio detail page — /portfolio/[slug]
 *
 * Server Component with static params generation (pre-rendered for all
 * published slugs at build time, revalidated hourly).
 */

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AuthNav } from "@/features/auth/components/AuthNav";
import Footer from "@/features/shared/components/Footer";
import {
  getPortfolioProjectBySlug,
  getAllPortfolioSlugs,
  listPortfolioProjects,
} from "@/features/portfolio/service";
import ProjectHero from "@/features/portfolio/components/ProjectHero";
import ProjectStats from "@/features/portfolio/components/ProjectStats";
import ProjectHighlights from "@/features/portfolio/components/ProjectHighlights";
import CloneProjectButton from "@/features/portfolio/components/CloneProjectButton";
import { formatEur } from "@/features/portfolio/types";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllPortfolioSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPortfolioProjectBySlug(slug);

  if (!project) {
    return { title: "Project not found" };
  }

  const title = `${project.title} — ${project.location}`;
  const description =
    project.subtitle ||
    `${project.areaSqm} m² modular home with ${project.moduleCount} modules. ${project.description.slice(0, 140)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: `/og?title=${encodeURIComponent(project.title)}&subtitle=${encodeURIComponent(project.subtitle || project.location)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPortfolioProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  // Fetch related projects (exclude self, take 3 closest in area)
  const all = await listPortfolioProjects();
  const related = all
    .filter((p) => p.slug !== slug)
    .sort(
      (a, b) =>
        Math.abs(a.areaSqm - project.areaSqm) - Math.abs(b.areaSqm - project.areaSqm)
    )
    .slice(0, 3);

  // JSON-LD structured data for rich search results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    image: project.heroImageUrl,
    locationCreated: { "@type": "Place", name: project.location },
    offers: {
      "@type": "Offer",
      price: project.estimatedCostEur,
      priceCurrency: "EUR",
    },
  };

  return (
    <div className="min-h-screen bg-brand-bone-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brand-bone-300/60 bg-white/95 backdrop-blur-md px-4 md:px-8">
        <Link href="/" className="text-lg font-bold text-brand-charcoal tracking-tight">
          Modul<span className="text-brand-olive-700">CA</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-brand-gray">
          <Link href="/#features" className="hover:text-brand-olive-700 transition-colors">Features</Link>
          <Link href="/portfolio" className="font-semibold text-brand-olive-700">Portfolio</Link>
          <Link href="/pricing" className="hover:text-brand-olive-700 transition-colors">Pricing</Link>
        </nav>
        <AuthNav />
      </header>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 text-xs text-brand-gray">
        <Link href="/portfolio" className="hover:text-brand-olive-700">Portfolio</Link>
        <span className="mx-2">/</span>
        <span className="text-brand-charcoal font-semibold">{project.title}</span>
      </div>

      {/* Hero */}
      <ProjectHero project={project} />

      {/* Stats strip */}
      <section className="bg-white border-b border-brand-bone-300/60">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <ProjectStats project={project} />
        </div>
      </section>

      {/* Main content — highlights + clone CTA */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Highlights */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold text-brand-charcoal tracking-heading mb-4">
              Key features
            </h2>
            <ProjectHighlights highlights={project.highlights} />

            {/* Extra narrative section */}
            <div className="mt-8 pt-8 border-t border-brand-bone-300/60">
              <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider mb-3">
                About this design
              </h3>
              <p className="text-sm text-brand-gray leading-relaxed">
                {project.description}
              </p>
            </div>
          </div>

          {/* Clone CTA + metadata sidebar */}
          <aside className="md:col-span-1">
            <div className="rounded-[16px] bg-white border border-brand-bone-300/60 shadow-card p-6 sticky top-24">
              <p className="text-[10px] font-bold text-brand-olive-500 uppercase tracking-[0.08em] mb-1">
                Start your own
              </p>
              <h3 className="text-lg font-bold text-brand-charcoal tracking-heading mb-3">
                Love this design?
              </h3>
              <p className="text-xs text-brand-gray mb-4">
                Clone it as a starting point for your own project. You&apos;ll be taken to the
                designer where you can edit modules, materials, and layout.
              </p>

              <CloneProjectButton slug={project.slug} title={project.title} />

              <dl className="mt-6 pt-6 border-t border-brand-bone-300/60 space-y-2 text-xs">
                <InfoRow label="Total cost" value={formatEur(project.estimatedCostEur)} />
                <InfoRow label="Cost per m²" value={formatEur(Math.round(project.estimatedCostEur / project.areaSqm))} />
                <InfoRow label="Modules" value={`${project.moduleCount} × 3×3m`} />
                <InfoRow label="Assembly" value={`${project.assemblyDurationDays} days`} />
                {project.styleDirection && (
                  <InfoRow label="Style" value={formatStyleName(project.styleDirection)} />
                )}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {/* Gallery — if present */}
      {project.galleryImageUrls && project.galleryImageUrls.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-8 pb-12">
          <h2 className="text-xl font-bold text-brand-charcoal tracking-heading mb-6">
            Gallery
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {project.galleryImageUrls.map((url, i) => (
              <div key={url} className="relative aspect-[4/3] rounded-[12px] overflow-hidden bg-brand-bone-200">
                <Image
                  src={url}
                  alt={`${project.title} view ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related projects */}
      {related.length > 0 && (
        <section className="bg-white border-t border-brand-bone-300/60 py-16">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h2 className="text-xl font-bold text-brand-charcoal tracking-heading mb-6">
              Similar projects
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/portfolio/${r.slug}`}
                  className="group rounded-[12px] overflow-hidden bg-brand-bone-100 border border-brand-bone-300/60 transition-shadow hover:shadow-card"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={r.heroImageUrl}
                      alt={r.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold text-brand-olive-500 uppercase tracking-wider mb-1">
                      {r.location}
                    </p>
                    <h3 className="text-sm font-bold text-brand-charcoal">{r.title}</h3>
                    <p className="text-xs text-brand-gray mt-1">
                      {r.areaSqm} m² · {r.moduleCount} modules · {formatEur(r.estimatedCostEur)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-brand-gray">{label}</dt>
      <dd className="font-semibold text-brand-charcoal">{value}</dd>
    </div>
  );
}

function formatStyleName(id: string): string {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
