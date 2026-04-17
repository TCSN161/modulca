import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/features/shared/components/Footer";
import { AuthNav } from "@/features/auth/components/AuthNav";
import MobileNav from "@/app/MobileNav";
import {
  breadcrumbListSchema,
  jsonLdScript,
  SITE_URL,
} from "@/shared/lib/schema";

export const metadata: Metadata = {
  title: "Press & Investors",
  description:
    "ModulCA press kit, company facts, media resources, and investor relations. AI-powered modular construction platform for Romania and the Netherlands.",
  alternates: { canonical: `${SITE_URL}/press` },
  openGraph: {
    title: "ModulCA — Press & Investor Relations",
    description:
      "Company facts, founder story, media assets, and investor resources for the ModulCA modular construction platform.",
    url: `${SITE_URL}/press`,
    images: [
      {
        url: "/og?title=Press+%26+Investors&subtitle=Modular+Construction+Platform",
        width: 1200,
        height: 630,
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Company facts — single source of truth for metrics                 */
/* ------------------------------------------------------------------ */

const COMPANY_FACTS = [
  { label: "Launched", value: "Beta: May 1, 2026" },
  { label: "Markets", value: "Romania, Netherlands" },
  { label: "Module system", value: "3×3m grid, CLT / timber frame / SIP" },
  { label: "Knowledge base", value: "212 articles, 17 categories" },
  { label: "AI engines", value: "19 render providers, 4 consultants" },
  { label: "Tiers", value: "Explorer (free) → Constructor (€149.90/mo)" },
];

const MARKET_FACTS = [
  {
    title: "Romania modular market",
    points: [
      "~60,000 new single-family permits/year",
      "Average turnkey build cost: €1,000–2,000/m²",
      "Demand shifting from concrete to timber (EU Green Deal incentives)",
      "Modular share: <3% today, projected 8–12% by 2030",
    ],
  },
  {
    title: "Netherlands modular market",
    points: [
      "Government target: 100,000 new homes/year through 2030",
      "Shortage of ~390,000 homes (2024 SCP data)",
      "Kwaliteitsborger (2024) + BENG rules favor factory-built quality",
      "Modular a priority in Woningbouw Impuls funding",
    ],
  },
  {
    title: "Technology moat",
    points: [
      "Only platform combining: 3D configurator + AI renders + structural engineering + regional permit guidance + builder marketplace",
      "212-article knowledge base grounds every AI consultant response in real regulations",
      "Multi-provider AI strategy keeps gross margins above 80% at all tiers",
      "EU-hosted (Supabase EU, Resend EU, Sentry EU, Fireworks EU) — GDPR-native",
    ],
  },
];

const MEDIA_KIT = [
  {
    label: "Press release (EN)",
    url: null,
    status: "Coming May 1, 2026",
  },
  {
    label: "Press release (RO)",
    url: null,
    status: "Coming May 1, 2026",
  },
  {
    label: "Logo pack (SVG, PNG)",
    url: null,
    status: "Available on request",
  },
  {
    label: "Product screenshots",
    url: null,
    status: "Available on request",
  },
  {
    label: "Founder photo + bio",
    url: null,
    status: "Available on request",
  },
  {
    label: "Pitch deck (PDF)",
    url: null,
    status: "For accredited investors — request via email",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function PressPage() {
  const breadcrumbs = breadcrumbListSchema([
    { name: "Home", url: SITE_URL },
    { name: "Press", url: `${SITE_URL}/press` },
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-brand-bone-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbs) }}
      />

      {/* ---- Navigation ---- */}
      <nav className="sticky top-0 z-50 border-b border-brand-bone-300/60 bg-brand-bone-100/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold tracking-heading text-brand-charcoal">
            ModulCA
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/#features" className="text-sm font-medium text-brand-gray hover:text-brand-charcoal">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-brand-gray hover:text-brand-charcoal">Pricing</Link>
            <Link href="/portfolio" className="text-sm font-medium text-brand-gray hover:text-brand-charcoal">Portfolio</Link>
            <Link href="/blog" className="text-sm font-medium text-brand-gray hover:text-brand-charcoal">Blog</Link>
            <Link href="/faq" className="text-sm font-medium text-brand-gray hover:text-brand-charcoal">FAQ</Link>
          </div>
          <div className="flex items-center gap-2">
            <AuthNav />
            <MobileNav />
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* ---- Hero ---- */}
        <section className="border-b border-brand-bone-300/60 bg-gradient-to-b from-brand-bone-100 to-brand-bone-200/40 py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <nav className="mb-6 text-xs text-brand-gray" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-brand-charcoal">Home</Link>
              <span className="mx-2">/</span>
              <span>Press</span>
            </nav>
            <h1 className="mb-4 text-4xl font-bold tracking-heading text-brand-charcoal md:text-5xl">
              Press & Investor Relations
            </h1>
            <p className="max-w-3xl text-lg text-brand-gray">
              ModulCA is the first end-to-end digital platform for designing,
              visualizing, and sourcing modular wooden homes — engineered for the
              Romanian and Dutch markets, ready for the EU energy transition.
            </p>
          </div>
        </section>

        {/* ---- Quick facts ---- */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold tracking-heading text-brand-charcoal">
            At a glance
          </h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMPANY_FACTS.map((fact) => (
              <div
                key={fact.label}
                className="rounded-xl border border-brand-bone-300/60 bg-white p-5"
              >
                <dt className="text-[11px] font-bold uppercase tracking-wider text-brand-gray">
                  {fact.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-brand-charcoal">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---- The thesis ---- */}
        <section className="border-t border-brand-bone-300/60 bg-brand-bone-200/30 py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold tracking-heading text-brand-charcoal">
              The market thesis
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {MARKET_FACTS.map((block) => (
                <div
                  key={block.title}
                  className="rounded-xl border border-brand-bone-300/60 bg-white p-6"
                >
                  <h3 className="mb-4 text-base font-bold tracking-heading text-brand-charcoal">
                    {block.title}
                  </h3>
                  <ul className="space-y-2 text-sm leading-relaxed text-brand-gray">
                    {block.points.map((pt, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-brand-amber-600" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- Founder note ---- */}
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <h2 className="mb-4 text-2xl font-bold tracking-heading text-brand-charcoal">
            From the founder
          </h2>
          <div className="prose prose-lg max-w-none text-brand-gray">
            <p>
              Housing in Central Europe has been priced out of reach for an entire
              generation. The fix is not more concrete — it's better-engineered,
              faster-built, more sustainable homes, designed with tools that today's
              buyers actually use.
            </p>
            <p>
              ModulCA is the platform I wished existed when I spent years designing
              modular homes by hand. We combine the grid-based rigor of professional
              modular architecture with the accessibility of consumer software and
              the power of modern AI — so the next 100,000 Romanian and Dutch homes
              can be designed in an afternoon, permitted in weeks, and built in
              months instead of years.
            </p>
            <p className="text-sm text-brand-gray">
              — Costin, Founder
            </p>
          </div>
        </section>

        {/* ---- Media kit ---- */}
        <section className="border-t border-brand-bone-300/60 bg-brand-bone-200/30 py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-2 text-2xl font-bold tracking-heading text-brand-charcoal">
              Media kit
            </h2>
            <p className="mb-8 text-sm text-brand-gray">
              Journalists, partners, and investors — reach out for high-resolution
              assets, interviews, or pitch decks.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {MEDIA_KIT.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border border-brand-bone-300/60 bg-white px-5 py-4"
                >
                  <span className="text-sm font-medium text-brand-charcoal">{item.label}</span>
                  <span className="text-xs text-brand-gray">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- Contact ---- */}
        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 md:py-20 lg:px-8">
          <h2 className="mb-3 text-2xl font-bold tracking-heading text-brand-charcoal">
            Press & investor contact
          </h2>
          <p className="mb-6 text-brand-gray">
            For interviews, media assets, partnership inquiries, or investor
            materials, reach us directly:
          </p>
          <a
            href="mailto:press@modulca.eu"
            className="inline-block rounded-lg bg-brand-charcoal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-charcoal/90"
          >
            press@modulca.eu
          </a>
          <p className="mt-8 text-xs text-brand-gray">
            Typical response time: under 24 hours on business days.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
