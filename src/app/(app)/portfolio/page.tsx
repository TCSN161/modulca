"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { AuthNav } from "@/features/auth/components/AuthNav";
import Footer from "@/features/shared/components/Footer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ProjectStyle = "Minimalist" | "Scandinavian" | "Industrial" | "Eco" | "Mediterranean" | "Traditional";
type SizeRange = "small" | "medium" | "large";

interface PortfolioProject {
  id: string;
  title: string;
  location: string;
  country: string;
  area: number; // m²
  modules: number;
  style: ProjectStyle;
  estimatedCost: string;
  duration: string;
  image: string;
  tags: string[];
  description: string;
  highlights: string[];
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const PROJECTS: PortfolioProject[] = [
  {
    id: "riverside-cabin",
    title: "Riverside Cabin",
    location: "Cluj-Napoca, Romania",
    country: "Romania",
    area: 54,
    modules: 6,
    style: "Scandinavian",
    estimatedCost: "€64,800",
    duration: "3 weeks",
    image: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&h=600&fit=crop",
    tags: ["Residential", "2 Bedrooms", "CLT"],
    description:
      "A compact family retreat on the banks of the Someș river. Six modules arranged in an L-shape create a living area with panoramic views and two cozy bedrooms tucked into the shorter wing.",
    highlights: ["Passive house certified", "Solar panels integrated", "Built in 18 days on-site"],
  },
  {
    id: "urban-studio",
    title: "Urban Studio Loft",
    location: "Bucharest, Romania",
    country: "Romania",
    area: 27,
    modules: 3,
    style: "Industrial",
    estimatedCost: "€36,000",
    duration: "10 days",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    tags: ["Studio", "Urban", "Rental"],
    description:
      "A minimalist urban studio designed for short-term rental. Three modules in a straight line maximize the narrow lot while delivering a full kitchen, bathroom, and sleeping area with 3.1m ceilings.",
    highlights: ["Airbnb-ready in 2 weeks", "ROI in 18 months", "Zero waste construction"],
  },
  {
    id: "family-courtyard",
    title: "Family Courtyard House",
    location: "Sibiu, Romania",
    country: "Romania",
    area: 108,
    modules: 12,
    style: "Traditional",
    estimatedCost: "€129,600",
    duration: "5 weeks",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    tags: ["Family", "3 Bedrooms", "Courtyard"],
    description:
      "A U-shaped family home wrapping around a central courtyard garden. The layout naturally separates day and night zones while every room opens to the protected outdoor space.",
    highlights: ["U-shape creates private courtyard", "Cross-ventilation in every room", "Traditional Romanian proportions"],
  },
  {
    id: "eco-lodge",
    title: "Eco-Lodge Retreat",
    location: "Brașov County, Romania",
    country: "Romania",
    area: 45,
    modules: 5,
    style: "Eco",
    estimatedCost: "€67,500",
    duration: "2 weeks",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop",
    tags: ["Hospitality", "Eco", "Off-Grid"],
    description:
      "A self-sufficient mountain lodge designed for eco-tourism. Five modules with premium timber finishes, a green roof, and integrated solar make this a zero-energy retreat in the Carpathians.",
    highlights: ["Off-grid solar + battery", "Green roof with local flora", "Premium CLT interior exposed"],
  },
  {
    id: "office-pod",
    title: "Garden Office Pod",
    location: "Timișoara, Romania",
    country: "Romania",
    area: 18,
    modules: 2,
    style: "Minimalist",
    estimatedCost: "€24,000",
    duration: "5 days",
    image: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&h=600&fit=crop",
    tags: ["Office", "Compact", "WFH"],
    description:
      "A work-from-home pod placed in the backyard of an existing property. Two modules with floor-to-ceiling glazing on one side and acoustic insulation create a professional workspace steps from home.",
    highlights: ["Delivered fully finished", "No building permit needed", "Fiber-ready with cable routing"],
  },
  {
    id: "duplex-rental",
    title: "Modular Duplex",
    location: "Iași, Romania",
    country: "Romania",
    area: 72,
    modules: 8,
    style: "Industrial",
    estimatedCost: "€96,000",
    duration: "4 weeks",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    tags: ["Investment", "Duplex", "Rental"],
    description:
      "Two mirrored 4-module apartments sharing a central wall. Designed as a buy-to-let investment with separate entrances, each unit has a bedroom, bathroom, kitchen-living, and private terrace.",
    highlights: ["Dual rental income", "Shared infrastructure saves 15%", "Each unit fully independent"],
  },
  {
    id: "fjord-retreat",
    title: "Fjord View Retreat",
    location: "Bergen, Norway",
    country: "Norway",
    area: 63,
    modules: 7,
    style: "Scandinavian",
    estimatedCost: "€94,500",
    duration: "3 weeks",
    image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&h=600&fit=crop",
    tags: ["Residential", "2 Bedrooms", "Waterfront"],
    description:
      "A timber-clad Nordic home perched above the fjord. Seven modules with triple glazing and a standing-seam metal roof withstand harsh winters while framing breathtaking water views from every room.",
    highlights: ["Triple-glazed for Arctic climate", "Timber cladding from local spruce", "Heated floors throughout"],
  },
  {
    id: "vienna-townhouse",
    title: "Vienna Modular Townhouse",
    location: "Vienna, Austria",
    country: "Austria",
    area: 90,
    modules: 10,
    style: "Minimalist",
    estimatedCost: "€135,000",
    duration: "4 weeks",
    image: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800&h=600&fit=crop",
    tags: ["Urban", "3 Bedrooms", "Multi-Story"],
    description:
      "A two-story urban townhouse squeezed into a narrow Viennese lot. Ten modules stacked over two floors with a green-wall facade blend modern modular construction with the historic streetscape.",
    highlights: ["Two-story stacked design", "Green wall facade", "City-centre infill project"],
  },
  {
    id: "algarve-villa",
    title: "Algarve Coastal Villa",
    location: "Faro, Portugal",
    country: "Portugal",
    area: 81,
    modules: 9,
    style: "Mediterranean",
    estimatedCost: "€105,300",
    duration: "4 weeks",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
    tags: ["Villa", "3 Bedrooms", "Pool"],
    description:
      "A sun-drenched coastal villa with white-rendered modules and terracotta accents. Nine modules form an open-plan living space with a covered terrace overlooking the pool and Atlantic beyond.",
    highlights: ["Designed for passive cooling", "Integrated pool terrace", "White lime-render finish"],
  },
  {
    id: "berlin-micro",
    title: "Berlin Micro-Apartment",
    location: "Berlin, Germany",
    country: "Germany",
    area: 27,
    modules: 3,
    style: "Industrial",
    estimatedCost: "€40,500",
    duration: "8 days",
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=600&fit=crop",
    tags: ["Studio", "Urban", "Student"],
    description:
      "A micro-apartment for Berlin's dense urban core. Three modules with exposed CLT walls, polished concrete floors, and space-saving built-ins prove that compact living can be beautiful.",
    highlights: ["Exposed CLT walls as finish", "Built-in furniture included", "Complies with Berlin urban code"],
  },
  {
    id: "tuscany-agriturismo",
    title: "Tuscany Agriturismo Pod",
    location: "Siena, Italy",
    country: "Italy",
    area: 36,
    modules: 4,
    style: "Mediterranean",
    estimatedCost: "€52,000",
    duration: "12 days",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
    tags: ["Hospitality", "Eco", "Rural"],
    description:
      "A guest accommodation pod set amid olive groves. Four modules with terracotta-toned exteriors and timber interiors create an intimate agriturismo suite that blends into the rolling Tuscan landscape.",
    highlights: ["Terracotta cladding panels", "Integrated with farm systems", "Zero visual impact on landscape"],
  },
  {
    id: "helsinki-sauna",
    title: "Helsinki Sauna House",
    location: "Helsinki, Finland",
    country: "Finland",
    area: 36,
    modules: 4,
    style: "Scandinavian",
    estimatedCost: "€54,000",
    duration: "10 days",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    tags: ["Residential", "Sauna", "Waterfront"],
    description:
      "A lakeside sauna house combining living quarters with a traditional Finnish sauna. Four modules with dark timber cladding include a change room, sauna, shower, and a relaxation lounge facing the water.",
    highlights: ["Integrated Finnish sauna", "Dark charred timber exterior", "Lakeside foundation system"],
  },
];

const ALL_STYLES: ProjectStyle[] = ["Minimalist", "Scandinavian", "Industrial", "Eco", "Mediterranean", "Traditional"];
const ALL_COUNTRIES = [...new Set(PROJECTS.map((p) => p.country))].sort();
const SIZE_RANGES: { key: SizeRange; label: string; min: number; max: number }[] = [
  { key: "small", label: "< 40 m²", min: 0, max: 39 },
  { key: "medium", label: "40 – 80 m²", min: 40, max: 80 },
  { key: "large", label: "> 80 m²", min: 81, max: 9999 },
];

type SortOption = "newest" | "area-asc" | "area-desc" | "cost-asc" | "cost-desc" | "modules";
const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "newest", label: "Newest First" },
  { key: "area-asc", label: "Area: Small to Large" },
  { key: "area-desc", label: "Area: Large to Small" },
  { key: "modules", label: "Most Modules" },
];

function parseCost(cost: string): number {
  return parseInt(cost.replace(/[^0-9]/g, ""), 10) || 0;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-brand-bone-100 px-3 py-2">
      <div className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.05em]">{label}</div>
      <div className="text-sm font-bold text-brand-charcoal">{value}</div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 border ${
        active
          ? "bg-brand-olive-700 text-white border-brand-olive-700"
          : "bg-white text-brand-gray border-brand-bone-300/80 hover:border-brand-olive-400 hover:text-brand-charcoal"
      }`}
    >
      {label}
    </button>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-brand-olive-700">{value}</div>
      <div className="text-xs text-brand-gray mt-1">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function PortfolioPage() {
  /* Filter state */
  const [selectedStyles, setSelectedStyles] = useState<Set<ProjectStyle>>(new Set());
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set());
  const [selectedSizes, setSelectedSizes] = useState<Set<SizeRange>>(new Set());
  const [sort, setSort] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  /* Toggle helpers */
  const toggleStyle = (s: ProjectStyle) =>
    setSelectedStyles((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  const toggleCountry = (c: string) =>
    setSelectedCountries((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  const toggleSize = (s: SizeRange) =>
    setSelectedSizes((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });

  const hasFilters = selectedStyles.size > 0 || selectedCountries.size > 0 || selectedSizes.size > 0;
  const clearFilters = () => {
    setSelectedStyles(new Set());
    setSelectedCountries(new Set());
    setSelectedSizes(new Set());
  };

  /* Filtered + sorted projects */
  const filtered = useMemo(() => {
    let list = PROJECTS.filter((p) => {
      if (selectedStyles.size > 0 && !selectedStyles.has(p.style)) return false;
      if (selectedCountries.size > 0 && !selectedCountries.has(p.country)) return false;
      if (selectedSizes.size > 0) {
        const matchesSize = [...selectedSizes].some((s) => {
          const range = SIZE_RANGES.find((r) => r.key === s)!;
          return p.area >= range.min && p.area <= range.max;
        });
        if (!matchesSize) return false;
      }
      return true;
    });

    switch (sort) {
      case "area-asc":
        list = [...list].sort((a, b) => a.area - b.area);
        break;
      case "area-desc":
        list = [...list].sort((a, b) => b.area - a.area);
        break;
      case "cost-asc":
        list = [...list].sort((a, b) => parseCost(a.estimatedCost) - parseCost(b.estimatedCost));
        break;
      case "cost-desc":
        list = [...list].sort((a, b) => parseCost(b.estimatedCost) - parseCost(a.estimatedCost));
        break;
      case "modules":
        list = [...list].sort((a, b) => b.modules - a.modules);
        break;
      default:
        break; // newest = insertion order
    }

    return list;
  }, [selectedStyles, selectedCountries, selectedSizes, sort]);

  const totalModules = PROJECTS.reduce((sum, p) => sum + p.modules, 0);
  const totalArea = PROJECTS.reduce((sum, p) => sum + p.area, 0);

  return (
    <div className="min-h-screen bg-brand-bone-100">
      {/* ---- Header ---- */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brand-bone-300/60 bg-white/95 backdrop-blur-md px-4 md:px-8">
        <Link href="/" className="text-lg font-bold text-brand-charcoal tracking-tight">
          Modul<span className="text-brand-olive-700">CA</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-brand-gray">
          <Link href="/#features" className="hover:text-brand-olive-700 transition-colors">
            Features
          </Link>
          <Link href="/portfolio" className="font-semibold text-brand-olive-700">
            Portfolio
          </Link>
          <Link href="/pricing" className="hover:text-brand-olive-700 transition-colors">
            Pricing
          </Link>
          <Link href="/library" className="hover:text-brand-olive-700 transition-colors">
            Library
          </Link>
        </nav>
        <AuthNav />
      </header>

      {/* ---- Hero Section ---- */}
      <section className="relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=800&fit=crop"
            alt="Modern modular home"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-charcoal/70 via-brand-charcoal/50 to-brand-bone-100" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-20 md:py-28">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-olive-300 mb-3">
            Portfolio
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-heading mb-4 max-w-3xl">
            Modular homes. Built faster, built better.
          </h1>
          <p className="text-base md:text-lg text-white/80 max-w-2xl mb-8 leading-relaxed">
            Explore real designs created with our 3x3m precision grid system. From compact studios to
            family courtyards across Europe — each project proves that modular construction delivers
            quality, speed, and sustainability.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/wizard" className="btn-primary text-sm px-6 py-3">
              Design Your Own
            </Link>
            <a
              href="#gallery"
              className="inline-flex items-center justify-center rounded-[12px] border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Browse Projects
            </a>
          </div>
        </div>
      </section>

      {/* ---- Stats Bar ---- */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 -mt-6 relative z-10 mb-12">
        <div className="bg-white rounded-[16px] border border-brand-bone-300/60 shadow-card px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
            <HeroStat value={`${PROJECTS.length}+`} label="Homes Designed" />
            <HeroStat value={`${ALL_COUNTRIES.length}`} label="Countries" />
            <HeroStat value={`${totalModules}`} label="Modules Delivered" />
            <HeroStat value={`${totalArea} m²`} label="Total Living Area" />
          </div>
        </div>
      </section>

      {/* ---- Filters & Sort ---- */}
      <section id="gallery" className="max-w-5xl mx-auto px-4 md:px-8 mb-8 scroll-mt-20">
        <div className="space-y-4">
          {/* Style filters */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.08em] text-brand-gray mb-2">
              Style
            </h3>
            <div className="flex flex-wrap gap-2">
              {ALL_STYLES.map((s) => (
                <FilterPill key={s} label={s} active={selectedStyles.has(s)} onClick={() => toggleStyle(s)} />
              ))}
            </div>
          </div>

          {/* Country filters */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.08em] text-brand-gray mb-2">
              Country
            </h3>
            <div className="flex flex-wrap gap-2">
              {ALL_COUNTRIES.map((c) => (
                <FilterPill key={c} label={c} active={selectedCountries.has(c)} onClick={() => toggleCountry(c)} />
              ))}
            </div>
          </div>

          {/* Size filters */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.08em] text-brand-gray mb-2">
              Size
            </h3>
            <div className="flex flex-wrap gap-2">
              {SIZE_RANGES.map((r) => (
                <FilterPill key={r.key} label={r.label} active={selectedSizes.has(r.key)} onClick={() => toggleSize(r.key)} />
              ))}
            </div>
          </div>

          {/* Sort + controls row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-brand-bone-300/40">
            <div className="flex items-center gap-3">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="rounded-[8px] border border-brand-bone-300/80 bg-white px-3 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-olive-400"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>

              {/* View toggle */}
              <div className="hidden md:flex items-center gap-1 rounded-[8px] border border-brand-bone-300/80 p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-[6px] p-1.5 transition-colors ${viewMode === "grid" ? "bg-brand-olive-700 text-white" : "text-brand-gray hover:text-brand-charcoal"}`}
                  aria-label="Grid view"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-[6px] p-1.5 transition-colors ${viewMode === "list" ? "bg-brand-olive-700 text-white" : "text-brand-gray hover:text-brand-charcoal"}`}
                  aria-label="List view"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-brand-olive-600 hover:text-brand-olive-800 font-medium transition-colors"
                >
                  Clear all filters
                </button>
              )}
              <span className="text-xs text-brand-gray">
                {filtered.length} project{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Gallery ---- */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3 text-brand-bone-300">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-sm text-brand-gray mb-2">No projects match your filters.</p>
            <button onClick={clearFilters} className="text-sm text-brand-olive-600 font-medium hover:underline">
              Clear filters to see all projects
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* ---- Grid View ---- */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => (
              <article
                key={project.id}
                className="group rounded-[16px] bg-white border border-brand-bone-300/60 shadow-card overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  {/* Style badge */}
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-brand-charcoal uppercase tracking-wider">
                    {project.style}
                  </span>
                  {/* Country flag-style badge */}
                  <span className="absolute top-3 right-3 rounded-full bg-brand-olive-700/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                    {project.country}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-[10px] font-bold text-brand-olive-500 uppercase tracking-[0.08em] mb-0.5">
                    {project.location}
                  </p>
                  <h2 className="text-lg font-bold text-brand-charcoal tracking-heading mb-2">
                    {project.title}
                  </h2>

                  {/* Key stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="rounded-[8px] bg-brand-bone-100 px-2 py-1.5 text-center">
                      <div className="text-[10px] text-brand-gray">Area</div>
                      <div className="text-xs font-bold text-brand-charcoal">{project.area} m²</div>
                    </div>
                    <div className="rounded-[8px] bg-brand-bone-100 px-2 py-1.5 text-center">
                      <div className="text-[10px] text-brand-gray">Modules</div>
                      <div className="text-xs font-bold text-brand-charcoal">{project.modules}</div>
                    </div>
                    <div className="rounded-[8px] bg-brand-bone-100 px-2 py-1.5 text-center">
                      <div className="text-[10px] text-brand-gray">Cost</div>
                      <div className="text-xs font-bold text-brand-charcoal">{project.estimatedCost}</div>
                    </div>
                  </div>

                  <p className="text-xs text-brand-gray leading-relaxed mb-4 line-clamp-3 flex-1">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-brand-bone-100 px-2 py-0.5 text-[10px] font-medium text-brand-gray"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link href="/wizard" className="btn-primary text-xs px-4 py-2 text-center mt-auto">
                    Design Something Similar
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* ---- List View ---- */
          <div className="space-y-6">
            {filtered.map((project, i) => (
              <article
                key={project.id}
                className={`flex flex-col ${i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} gap-6 md:gap-8 rounded-[16px] bg-white border border-brand-bone-300/60 shadow-card overflow-hidden`}
              >
                {/* Image */}
                <div className="md:w-1/2 relative min-h-[256px]">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {project.tags.map((tag) => (
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
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-bold text-brand-olive-500 uppercase tracking-[0.08em]">
                      {project.location}
                    </p>
                    <span className="text-[10px] text-brand-gray">|</span>
                    <span className="text-[10px] font-semibold text-brand-gray uppercase">{project.style}</span>
                  </div>
                  <h2 className="text-xl font-bold text-brand-charcoal tracking-heading mb-2">
                    {project.title}
                  </h2>
                  <p className="text-sm text-brand-gray leading-relaxed mb-4">{project.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    <StatBadge label="Area" value={`${project.area} m²`} />
                    <StatBadge label="Modules" value={String(project.modules)} />
                    <StatBadge label="Cost" value={project.estimatedCost} />
                    <StatBadge label="Assembly" value={project.duration} />
                  </div>

                  {/* Highlights */}
                  <ul className="space-y-1.5 mb-5">
                    {project.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-xs text-brand-gray">
                        <svg
                          className="w-4 h-4 text-brand-olive-500 flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {h}
                      </li>
                    ))}
                  </ul>

                  <Link href="/wizard" className="self-start btn-primary text-sm px-5 py-2.5">
                    Design Something Similar
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ---- Social Proof / Trust Section ---- */}
      <section className="bg-white border-y border-brand-bone-300/60 py-14">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <p className="label-caps mb-2">Why Modular?</p>
            <h2 className="text-2xl md:text-3xl font-bold text-brand-charcoal tracking-heading">
              The future of home construction
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "clock", title: "70% Faster", desc: "Factory-built modules reduce on-site time from months to weeks." },
              { icon: "leaf", title: "90% Less Waste", desc: "Precision CNC cutting and factory conditions eliminate construction waste." },
              { icon: "shield", title: "Certified Quality", desc: "Every module passes factory QC — consistent quality regardless of weather." },
              { icon: "euro", title: "Predictable Cost", desc: "Fixed module pricing means no budget surprises or contractor overruns." },
            ].map((item) => (
              <div key={item.title} className="text-center px-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-olive-50 text-brand-olive-600 mb-3">
                  {item.icon === "clock" && (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  )}
                  {item.icon === "leaf" && (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75" />
                    </svg>
                  )}
                  {item.icon === "shield" && (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  )}
                  {item.icon === "euro" && (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M4 10h12M4 14h12M17.5 7.5a5.5 5.5 0 010 9" />
                    </svg>
                  )}
                </div>
                <h3 className="text-sm font-bold text-brand-charcoal mb-1">{item.title}</h3>
                <p className="text-xs text-brand-gray leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA Section ---- */}
      <section className="bg-brand-olive-700 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-heading">
            Ready to design your modular home?
          </h2>
          <p className="text-sm text-brand-olive-200 mb-8 max-w-lg mx-auto leading-relaxed">
            Start with our free designer — place modules on your land, choose finishes, get instant
            cost estimates, and connect with certified builders across Europe.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/wizard"
              className="inline-flex items-center justify-center rounded-[12px] bg-white px-6 py-3 text-sm font-semibold text-brand-olive-700 hover:bg-brand-bone-100 transition-colors"
            >
              Design Your Own Home
            </Link>
            <Link
              href="/project/demo/consultant"
              className="inline-flex items-center justify-center rounded-[12px] border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Ask AI Architect
            </Link>
          </div>
          <p className="text-xs text-brand-olive-300 mt-4">
            Free to start. No credit card required.
          </p>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <Footer />
    </div>
  );
}
