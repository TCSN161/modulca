/**
 * Portfolio — list of featured showcase projects.
 *
 * Server Component with ISR (revalidates every hour). Data comes from
 * Supabase via the portfolio service, which falls back to hardcoded data
 * if the database is unreachable.
 */

import Link from "next/link";
import { AuthNav } from "@/features/auth/components/AuthNav";
import Footer from "@/features/shared/components/Footer";
import { listPortfolioProjects } from "@/features/portfolio/service";
import PortfolioGrid from "@/features/portfolio/components/PortfolioGrid";

// Revalidate every hour; updates propagate without a full deploy
export const revalidate = 3600;

export default async function PortfolioPage() {
  const projects = await listPortfolioProjects();

  // Aggregate stats across all projects for the hero metrics
  const totalProjects = projects.length;
  const totalModules = projects.reduce((acc, p) => acc + p.moduleCount, 0);
  const totalArea = projects.reduce((acc, p) => acc + p.areaSqm, 0);
  const avgAssemblyDays = projects.length
    ? Math.round(
        projects.reduce((acc, p) => acc + p.assemblyDurationDays, 0) /
          projects.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-brand-bone-100">
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

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-16 text-center">
        <p className="label-caps mb-3">Portfolio</p>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-charcoal tracking-heading mb-4">
          Built with ModulCA
        </h1>
        <p className="text-base text-brand-gray max-w-2xl mx-auto">
          Real modular homes designed using our 3×3m precision grid. From compact studios to family
          courtyards — filter by country, size, or cost to find inspiration for your own project.
        </p>
      </section>

      {/* Stats bar — derived live from data */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 mb-12">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 py-6 border-y border-brand-bone-300/60">
          <StatTile n={String(totalProjects)} label="Featured Projects" />
          <StatTile n={String(totalModules)} label="Modules Designed" />
          <StatTile n={`${totalArea} m²`} label="Total Area" />
          <StatTile n={`${avgAssemblyDays} days`} label="Avg. Assembly" />
        </div>
      </section>

      {/* Filter + grid (client component) */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 pb-20">
        <PortfolioGrid projects={projects} />
      </section>

      {/* CTA */}
      <section className="bg-brand-olive-700 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3 tracking-heading">
            Ready to design your modular home?
          </h2>
          <p className="text-sm text-brand-olive-200 mb-6 max-w-lg mx-auto">
            Start with our free designer — place modules on your land, choose finishes, get instant
            cost estimates, and connect with certified builders.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/project/new"
              className="inline-flex items-center justify-center rounded-[12px] bg-white px-6 py-3 text-sm font-semibold text-brand-olive-700 hover:bg-brand-bone-100 transition-colors"
            >
              Start Designing — Free
            </Link>
            <Link
              href="/project/demo/consultant"
              className="inline-flex items-center justify-center rounded-[12px] border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Ask AI Architect
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function StatTile({ n, label }: { n: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-brand-charcoal">{n}</div>
      <div className="text-[11px] text-brand-gray">{label}</div>
    </div>
  );
}
