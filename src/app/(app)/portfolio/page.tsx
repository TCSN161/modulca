"use client";

import Link from "next/link";
import { AuthNav } from "@/features/auth/components/AuthNav";

interface CaseStudy {
  id: string;
  title: string;
  location: string;
  area: string;
  modules: number;
  cost: string;
  duration: string;
  image: string;
  tags: string[];
  description: string;
  highlights: string[];
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: "riverside-cabin",
    title: "Riverside Cabin",
    location: "Cluj-Napoca, Romania",
    area: "54 m²",
    modules: 6,
    cost: "€64,800",
    duration: "3 weeks assembly",
    image: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80",
    tags: ["Residential", "2 Bedrooms", "CLT"],
    description: "A compact family retreat on the banks of the Some river. Six modules arranged in an L-shape create a living area with panoramic views and two cozy bedrooms tucked into the shorter wing.",
    highlights: ["Passive house certified", "Solar panels integrated", "Built in 18 days on-site"],
  },
  {
    id: "urban-studio",
    title: "Urban Studio Loft",
    location: "Bucharest, Romania",
    area: "27 m²",
    modules: 3,
    cost: "€36,000",
    duration: "10 days assembly",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    tags: ["Studio", "Urban", "Rental"],
    description: "A minimalist urban studio designed for short-term rental. Three modules in a straight line maximize the narrow lot while delivering a full kitchen, bathroom, and sleeping area with 3.1m ceilings.",
    highlights: ["Airbnb-ready in 2 weeks", "ROI in 18 months", "Zero waste construction"],
  },
  {
    id: "family-courtyard",
    title: "Family Courtyard House",
    location: "Sibiu, Romania",
    area: "108 m²",
    modules: 12,
    cost: "€129,600",
    duration: "5 weeks assembly",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    tags: ["Family", "3 Bedrooms", "Courtyard"],
    description: "A U-shaped family home wrapping around a central courtyard garden. The layout naturally separates day and night zones while every room opens to the protected outdoor space.",
    highlights: ["U-shape creates private courtyard", "Cross-ventilation in every room", "Traditional Romanian proportions"],
  },
  {
    id: "eco-lodge",
    title: "Eco-Lodge Retreat",
    location: "Brașov County, Romania",
    area: "45 m²",
    modules: 5,
    cost: "€67,500",
    duration: "2 weeks assembly",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80",
    tags: ["Hospitality", "Eco", "Off-Grid"],
    description: "A self-sufficient mountain lodge designed for eco-tourism. Five modules with premium timber finishes, a green roof, and integrated solar make this a zero-energy retreat in the Carpathians.",
    highlights: ["Off-grid solar + battery", "Green roof with local flora", "Premium CLT interior exposed"],
  },
  {
    id: "office-pod",
    title: "Garden Office Pod",
    location: "Timișoara, Romania",
    area: "18 m²",
    modules: 2,
    cost: "€24,000",
    duration: "5 days assembly",
    image: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&q=80",
    tags: ["Office", "Compact", "WFH"],
    description: "A work-from-home pod placed in the backyard of an existing property. Two modules with floor-to-ceiling glazing on one side and acoustic insulation create a professional workspace steps from home.",
    highlights: ["Delivered fully finished", "No building permit needed (<50m²)", "Fiber-ready with cable routing"],
  },
  {
    id: "duplex-rental",
    title: "Modular Duplex",
    location: "Iași, Romania",
    area: "72 m² (2×36 m²)",
    modules: 8,
    cost: "€96,000",
    duration: "4 weeks assembly",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    tags: ["Investment", "Duplex", "Rental"],
    description: "Two mirrored 4-module apartments sharing a central wall. Designed as a buy-to-let investment with separate entrances, each unit has a bedroom, bathroom, kitchen-living, and private terrace.",
    highlights: ["Dual rental income", "Shared infrastructure saves 15%", "Each unit fully independent"],
  },
];

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-brand-bone-100 px-3 py-2">
      <div className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.05em]">{label}</div>
      <div className="text-sm font-bold text-brand-charcoal">{value}</div>
    </div>
  );
}

export default function PortfolioPage() {
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
          Real modular homes designed and built using our 3x3m precision grid system.
          From compact studios to family courtyards — explore what&apos;s possible.
        </p>
      </section>

      {/* Stats bar */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 mb-12">
        <div className="flex justify-center gap-8 md:gap-16 py-6 border-y border-brand-bone-300/60">
          {[
            { n: "6", label: "Projects Built" },
            { n: "36", label: "Modules Delivered" },
            { n: "324 m²", label: "Total Area" },
            { n: "18 days", label: "Avg. Assembly" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-brand-charcoal">{s.n}</div>
              <div className="text-[11px] text-brand-gray">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Case Studies */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 pb-20">
        <div className="space-y-12">
          {CASE_STUDIES.map((study, i) => (
            <article
              key={study.id}
              className={`flex flex-col ${i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} gap-6 md:gap-8 rounded-[16px] bg-white border border-brand-bone-300/60 shadow-card overflow-hidden`}
            >
              {/* Image */}
              <div className="md:w-1/2 relative">
                <img
                  src={study.image}
                  alt={study.title}
                  className="w-full h-64 md:h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {study.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-brand-charcoal uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                <p className="text-[10px] font-bold text-brand-olive-500 uppercase tracking-[0.08em] mb-1">
                  {study.location}
                </p>
                <h2 className="text-xl font-bold text-brand-charcoal tracking-heading mb-2">
                  {study.title}
                </h2>
                <p className="text-sm text-brand-gray leading-relaxed mb-4">
                  {study.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  <StatBadge label="Area" value={study.area} />
                  <StatBadge label="Modules" value={String(study.modules)} />
                  <StatBadge label="Cost" value={study.cost} />
                  <StatBadge label="Assembly" value={study.duration} />
                </div>

                {/* Highlights */}
                <ul className="space-y-1.5 mb-5">
                  {study.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-xs text-brand-gray">
                      <svg className="w-4 h-4 text-brand-olive-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {h}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/project/demo/choose"
                  className="self-start btn-primary text-sm px-5 py-2.5"
                >
                  Design Something Similar
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-olive-700 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3 tracking-heading">
            Ready to design your modular home?
          </h2>
          <p className="text-sm text-brand-olive-200 mb-6 max-w-lg mx-auto">
            Start with our free designer — place modules on your land, choose finishes, get instant cost estimates, and connect with certified builders.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/project/demo/choose"
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

      {/* Footer */}
      <footer className="border-t border-brand-bone-300/60 bg-brand-bone-100 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-gray">
          <span>ModulCA Alfa 0.2 — Modular Living Platform</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-brand-olive-700 transition-colors">Home</Link>
            <Link href="/portfolio" className="hover:text-brand-olive-700 transition-colors">Portfolio</Link>
            <Link href="/pricing" className="hover:text-brand-olive-700 transition-colors">Pricing</Link>
            <Link href="/project/demo/consultant" className="hover:text-brand-olive-700 transition-colors">AI Architect</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
