import Link from "next/link";
import { useTranslations } from "next-intl";
import { AuthNav } from "@/features/auth/components/AuthNav";
import MobileNav from "./MobileNav";
import Footer from "@/features/shared/components/Footer";
import { softwareAppSchema, jsonLdScript } from "@/shared/lib/schema";

/**
 * ModulCA Landing Page — "Digital Arboretum" Theme
 * Architectural Biophilia: precision engineering + natural warmth.
 */

/* ------------------------------------------------------------------ */
/*  SVG Icons (inline for zero-dependency, tiny footprint)             */
/* ------------------------------------------------------------------ */

function IconMountain() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21l4.5-11L17 21" /><path d="M2 21h20" /><path d="M15.5 9.5L18 4l4 17" />
    </svg>
  );
}
function IconGrid() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
function IconEye() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconLayers() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
function IconBox() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
function IconPlay() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

const jsonLd = softwareAppSchema();

export default function HomePage() {
  const tHome = useTranslations("home");
  const tNav = useTranslations("nav");
  return (
    <div className="flex min-h-screen flex-col bg-brand-bone-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      {/* ---- Navigation ---- */}
      <nav className="sticky top-0 z-50 border-b border-brand-bone-300/60 bg-brand-bone-100/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="text-xl font-bold tracking-heading text-brand-charcoal">
            ModulCA
          </span>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-brand-gray hover:text-brand-charcoal transition-colors">{tNav("features")}</a>
            <a href="#how-it-works" className="text-sm font-medium text-brand-gray hover:text-brand-charcoal transition-colors">{tNav("howItWorks")}</a>
            <a href="#pricing" className="text-sm font-medium text-brand-gray hover:text-brand-charcoal transition-colors">{tNav("pricing")}</a>
            <a href="#for-builders" className="text-sm font-medium text-brand-gray hover:text-brand-charcoal transition-colors">{tNav("forBuilders")}</a>
            <Link href="/portfolio" className="text-sm font-medium text-brand-gray hover:text-brand-charcoal transition-colors">{tNav("portfolio")}</Link>
            <Link href="/blog" className="text-sm font-medium text-brand-gray hover:text-brand-charcoal transition-colors">{tNav("blog")}</Link>
          </div>
          <div className="flex items-center gap-2">
            <AuthNav />
            <MobileNav />
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* ---- Hero ---- */}
        <section className="relative overflow-hidden">
          {/* Hero background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-bone-100 via-brand-bone-100/90 to-brand-bone-100/60 sm:from-brand-bone-100/95 sm:via-brand-bone-100/70 sm:to-transparent" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
            <div className="max-w-xl">
              <div className="mb-5 inline-flex items-center rounded-full border border-brand-olive-200 bg-brand-bone-200/80 px-3 py-1 text-xs font-semibold uppercase tracking-label text-brand-olive-700">
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-brand-olive-500 animate-pulse" />
                {tHome("hero.versionBadge")}
              </div>
              <h1 className="mb-6 text-2xl font-extrabold tracking-heading text-brand-charcoal sm:text-4xl lg:text-[3.5rem] lg:leading-[1.1]">
                {tHome("hero.titlePart1")}
                <br />
                <em className="text-brand-olive-700 not-italic font-extrabold" style={{ fontStyle: "italic" }}>{tHome("hero.titleAccent")}</em>
                <br />
                {tHome("hero.titlePart2")}
              </h1>
              <p className="mb-8 max-w-md text-base text-brand-gray leading-relaxed sm:text-lg">
                {tHome("hero.subtitle")}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/project/new"
                  className="btn-primary px-7 py-3.5 text-base shadow-subtle min-h-[44px]"
                >
                  {tHome("hero.ctaPrimary")}
                </Link>
                <Link
                  href="/quiz"
                  className="inline-flex items-center gap-2 rounded-[12px] border-2 border-brand-teal-800 bg-brand-teal-50 px-6 py-3 text-sm font-semibold text-brand-teal-900 transition-colors hover:bg-brand-teal-100"
                >
                  {tHome("hero.ctaQuiz")}
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-[12px] border border-brand-bone-400 bg-white px-6 py-3.5 text-sm font-semibold text-brand-charcoal transition-colors hover:bg-brand-bone-200"
                >
                  <IconPlay /> {tHome("hero.ctaHowItWorks")}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Stats bar ---- */}
        <section className="border-y border-brand-bone-300/60 bg-brand-bone-100 py-8">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 sm:grid-cols-4 sm:gap-12">
            {[
              { value: "19", label: tHome("stats.aiEngines") },
              { value: "212", label: tHome("stats.articles") },
              { value: "100%", label: tHome("stats.gdpr") },
              { value: "<90", label: tHome("stats.days") },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold tracking-heading text-brand-charcoal sm:text-3xl md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-label text-brand-gray">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---- Trust bar: EU / GDPR / Regulation-ready ---- */}
        <section className="border-b border-brand-bone-300/60 bg-white/40 py-6">
          <div className="mx-auto max-w-5xl px-4">
            <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-widest text-brand-gray">
              {tHome("trust.heading")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-brand-gray md:text-sm">
              <span>🇷🇴 {tHome("trust.romania")}</span>
              <span className="opacity-40">•</span>
              <span>🇳🇱 {tHome("trust.netherlands")}</span>
              <span className="opacity-40">•</span>
              <span>🇪🇺 {tHome("trust.eurocode")}</span>
              <span className="opacity-40">•</span>
              <span>{tHome("trust.euHosted")}</span>
            </div>
          </div>
        </section>

        {/* ---- Features: The Architect's Toolkit ---- */}
        <section id="features" className="px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end">
              <div>
                <p className="label-caps mb-3">{tHome("features.label")}</p>
                <h2 className="text-3xl font-bold tracking-heading text-brand-charcoal sm:text-4xl">
                  {tHome("features.title")}
                </h2>
              </div>
              <p className="text-base text-brand-gray leading-relaxed lg:text-right">
                {tHome("features.subtitle")}
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <IconMountain />,
                  title: tHome("features.land.title"),
                  desc: tHome("features.land.description"),
                },
                {
                  icon: <IconGrid />,
                  title: tHome("features.modular.title"),
                  desc: tHome("features.modular.description"),
                },
                {
                  icon: <IconEye />,
                  title: tHome("features.visualization.title"),
                  desc: tHome("features.visualization.description"),
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-[12px] border border-brand-bone-300 bg-white p-6 shadow-card transition-shadow hover:shadow-subtle"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-brand-bone-200 text-brand-olive-700">
                    {f.icon}
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-brand-charcoal">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-brand-gray">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- How It Works: From Blueprint to Reality ---- */}
        <section id="how-it-works" className="bg-brand-bone-200 px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-heading text-brand-charcoal sm:text-4xl">
              {tHome("howItWorks.title")}
            </h2>
            <p className="mx-auto mb-14 max-w-xl text-base text-brand-gray">
              {tHome("howItWorks.subtitle")}
            </p>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  icon: <IconPin />,
                  step: "01",
                  title: tHome("howItWorks.step1.title"),
                  desc: tHome("howItWorks.step1.description"),
                },
                {
                  icon: <IconLayers />,
                  step: "02",
                  title: tHome("howItWorks.step2.title"),
                  desc: tHome("howItWorks.step2.description"),
                },
                {
                  icon: <IconBox />,
                  step: "03",
                  title: tHome("howItWorks.step3.title"),
                  desc: tHome("howItWorks.step3.description"),
                },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border border-brand-bone-400 bg-white text-brand-olive-700">
                    {item.icon}
                  </div>
                  <h3 className="mb-2 text-base font-bold text-brand-charcoal">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-brand-gray">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-12">
              <Link href="/project/new" className="btn-primary px-8 py-3 text-sm">
                {tHome("howItWorks.tryFlow")}
              </Link>
            </div>
          </div>
        </section>

        {/* ---- Pricing ---- */}
        <section id="pricing" className="px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="label-caps mb-3 text-center">{tHome("pricingTeaser.label")}</p>
            <h2 className="mb-3 text-center text-3xl font-bold tracking-heading text-brand-charcoal sm:text-4xl">
              {tHome("pricingTeaser.title")}
            </h2>
            <p className="mx-auto mb-4 max-w-xl text-center text-brand-gray">
              {tHome("pricingTeaser.subtitle")}
            </p>
            {/* Beta promo banner */}
            <div className="mx-auto mb-14 max-w-xl rounded-[12px] border border-brand-olive-200 bg-brand-olive-50 px-5 py-3 text-center">
              <p className="text-sm font-semibold text-brand-olive-700">
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-brand-olive-500 animate-pulse" />
                {tHome("pricingTeaser.betaPromo")} <strong>{tHome("pricingTeaser.betaPromoBold")}</strong> {tHome("pricingTeaser.betaPromoEnd")}
              </p>
            </div>
            <div className="grid gap-5 pt-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  name: "Explorer",
                  price: "Free",
                  period: "",
                  description: "Design your first modular home for free. Upgrade anytime.",
                  features: [
                    "Up to 6 modules per project",
                    "5 AI renders per month",
                    "3D walkthrough",
                    "Knowledge base access",
                    "2 saved projects",
                    "3-month Premium beta promo",
                  ],
                  cta: "Start Free",
                  href: "/project/new",
                  highlight: false,
                  badge: null,
                },
                {
                  name: "Premium",
                  price: "\u20AC19.99",
                  period: "/month",
                  description: "Full design experience with all tools and export options.",
                  features: [
                    "Up to 12 modules per project",
                    "50 AI renders per month (HD)",
                    "All 6 drawing types + PDF export",
                    "Auto-tour & building permits",
                    "Product catalog with real pricing",
                    "10 projects + sharable links",
                  ],
                  cta: "Get Premium",
                  href: "/pricing",
                  highlight: true,
                  badge: "Most Popular",
                },
                {
                  name: "Architect",
                  price: "\u20AC49.99",
                  period: "/month",
                  description: "Professional toolkit for managing clients and projects.",
                  features: [
                    "Up to 50 modules, custom sizes",
                    "200 AI renders per month (4K)",
                    "DWG/DXF export for CAD",
                    "Team collaboration & client dashboard",
                    "Unlimited projects",
                    "Priority support",
                  ],
                  cta: "Go Professional",
                  href: "/pricing",
                  highlight: false,
                  badge: null,
                },
                {
                  name: "Constructor",
                  price: "\u20AC149.90",
                  period: "/month",
                  description: "Enterprise solution. Unlimited everything, white-label, API.",
                  features: [
                    "Up to 200 modules per project",
                    "Unlimited AI renders (4K)",
                    "White-label branding",
                    "Dedicated support",
                    "Full analytics & API access",
                    "Everything in Architect",
                  ],
                  cta: "Contact Sales",
                  href: "/pricing",
                  highlight: false,
                  badge: "Enterprise",
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-[12px] border-2 p-6 text-center shadow-card transition-shadow hover:shadow-subtle ${
                    plan.highlight
                      ? "border-brand-olive-700 bg-white relative"
                      : "border-brand-bone-300 bg-white relative"
                  }`}
                >
                  {plan.badge && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-0.5 text-xs font-bold text-white ${
                      plan.highlight ? "bg-brand-olive-700" : "bg-brand-charcoal"
                    }`}>
                      {plan.badge}
                    </div>
                  )}
                  <h3 className="mb-1 text-lg font-bold text-brand-charcoal">{plan.name}</h3>
                  <div className="mb-1">
                    <span className="text-3xl font-bold text-brand-olive-700">{plan.price}</span>
                    {plan.period && <span className="text-sm text-brand-gray">{plan.period}</span>}
                  </div>
                  <p className="mb-5 text-xs text-brand-gray">{plan.description}</p>
                  <ul className="mb-6 space-y-2 text-left text-sm text-brand-gray">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="mt-0.5 text-brand-olive-500">&#10003;</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`block w-full rounded-[12px] px-4 py-2.5 text-sm font-semibold transition-colors ${
                      plan.highlight
                        ? "bg-brand-olive-700 text-white hover:bg-brand-olive-800"
                        : "border border-brand-bone-400 bg-white text-brand-charcoal hover:bg-brand-bone-200"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- CTA: Ready to evolve? ---- */}
        <section className="px-4 py-10">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[16px] relative">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80')",
              }}
            >
              <div className="absolute inset-0 bg-brand-charcoal/50 backdrop-blur-[2px]" />
            </div>
            <div className="relative px-5 sm:px-8 py-16 text-center sm:py-20">
              <h2 className="mb-6 text-2xl font-bold tracking-heading text-white sm:text-3xl md:text-4xl">
                {tHome("finalCta.heading")}
              </h2>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/project/new"
                  className="rounded-[12px] bg-white px-8 py-3.5 text-sm font-bold text-brand-charcoal transition-colors hover:bg-brand-bone-200 shadow-subtle"
                >
                  {tHome("finalCta.launch")}
                </Link>
                <Link
                  href="#for-builders"
                  className="rounded-[12px] border border-white/40 bg-brand-olive-700 px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-olive-800"
                >
                  {tHome("finalCta.schedule")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ---- For Builders ---- */}
        <section id="for-builders" className="px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="label-caps mb-3">{tHome("forBuilders.label")}</p>
            <h2 className="mb-4 text-3xl font-bold tracking-heading text-brand-charcoal sm:text-4xl">
              {tHome("forBuilders.title")}
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-brand-gray">
              {tHome("forBuilders.description")}
            </p>
            <div className="mx-auto mb-10 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
              {[
                tHome("forBuilders.features.dashboard"),
                tHome("forBuilders.features.whiteLabel"),
                tHome("forBuilders.features.export"),
                tHome("forBuilders.features.permits"),
                tHome("forBuilders.features.team"),
                tHome("forBuilders.features.support"),
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-brand-gray">
                  <span className="text-brand-olive-500">&#10003;</span> {f}
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/project/demo/choose" className="btn-primary px-8 py-3 text-sm">
                {tHome("forBuilders.seeDemo")}
              </Link>
              <Link href="/register" className="btn-secondary px-8 py-3 text-sm">
                {tHome("forBuilders.applyBuilder")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ---- Footer ---- */}
      <Footer />
    </div>
  );
}
