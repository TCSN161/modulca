import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/features/shared/components/Footer";
import { AuthNav } from "@/features/auth/components/AuthNav";
import MobileNav from "@/app/MobileNav";
import {
  faqPageSchema,
  breadcrumbListSchema,
  jsonLdScript,
  SITE_URL,
  type FAQEntry,
} from "@/shared/lib/schema";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Everything about designing modular homes with ModulCA — 3×3m module system, pricing, building permits for Romania & Netherlands, timeline, and more.",
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title: "ModulCA — Frequently Asked Questions",
    description:
      "Answers about the 3×3m module system, pricing, permits in Romania and the Netherlands, timelines, and construction.",
    url: `${SITE_URL}/faq`,
    images: [
      {
        url: "/og?title=Frequently+Asked+Questions&subtitle=Everything+about+ModulCA",
        width: 1200,
        height: 630,
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  FAQ content — grouped by category                                  */
/* ------------------------------------------------------------------ */

const FAQ_GROUPS: { title: string; faqs: FAQEntry[] }[] = [
  {
    title: "Platform & How it works",
    faqs: [
      {
        question: "What is ModulCA?",
        answer:
          "ModulCA is an AI-powered platform for designing modular wooden homes. You place 3×3m modules on your land, configure rooms and finishes, and receive 3D visualizations, AI renders, technical drawings, cost estimates, and connections to certified builders.",
      },
      {
        question: "Who is ModulCA for?",
        answer:
          "Anyone considering a modular or prefabricated home — primarily homeowners in Romania and the Netherlands, architects evaluating modular for client projects, and builders looking for a pipeline of pre-designed projects.",
      },
      {
        question: "Do I need architectural training?",
        answer:
          "No. The 13-step guided flow walks you from site selection to final construction drawings. The AI consultant explains regulations, dimensions, and trade-offs in plain language. Professional architects get advanced tools in the Architect tier.",
      },
      {
        question: "What browsers are supported?",
        answer:
          "Modern evergreen browsers — Chrome, Edge, Safari, Firefox, Brave. The 3D walkthrough needs WebGL 2 (standard since 2017). VR mode requires a WebXR-compatible headset (Meta Quest, Vision Pro).",
      },
    ],
  },
  {
    title: "The 3×3m module system",
    faqs: [
      {
        question: "Why 3×3m modules?",
        answer:
          "3×3m is the sweet spot for prefabrication: fits on standard trucks without wide-load permits, produces 9m² gross / ~7m² usable floor area (a typical single-room footprint), and plans cleanly into houses of 2–12 modules. Wall thickness is 15cm (interior) to 30cm (exterior insulated).",
      },
      {
        question: "Can I combine modules into open-plan spaces?",
        answer:
          "Yes. Interior walls between modules are optional and load-bearing columns are in the corners, so two adjacent modules give you 6×3m open space, three give you 9×3m, and so on. The configurator handles this automatically.",
      },
      {
        question: "What's the structural system?",
        answer:
          "CLT (cross-laminated timber), timber frame, or SIP panels depending on the builder. Foundations use screw piles (76–114mm shaft, 1.5–3m depth) so the house is removable and leaves minimal ground disturbance.",
      },
      {
        question: "Can I have multiple floors?",
        answer:
          "Yes — up to 2 floors are fully supported in the current release. Stair modules and structural reinforcement are handled by the configurator. Three-story designs are on the roadmap.",
      },
    ],
  },
  {
    title: "Pricing & subscriptions",
    faqs: [
      {
        question: "How much does ModulCA cost?",
        answer:
          "Free tier (Explorer) is always free — design 1 project, 2 modules, basic visualization. Premium is €19.99/month (€199/year) for unlimited projects + AI renders. Architect is €49.99/month for pro tools (DWG/PDF export, white-label, vector knowledge base). Constructor is €149.90/month for builders (lead marketplace, team accounts).",
      },
      {
        question: "What does the modular house itself cost?",
        answer:
          "Typical turnkey cost in Romania is €1,000–2,000/m² depending on finish level. A 4-module house (~28m² usable) lands around €35–60k turnkey, foundation + transport included. Your ModulCA estimate is itemized — modules, foundation, transport, MEP, finishes, permits.",
      },
      {
        question: "Is there a free trial or beta discount?",
        answer:
          "During the Beta period (launching May 1, 2026), all registered users get 3 months of Premium features free. Beyond that, Explorer tier stays free forever with 1 project + 2 modules.",
      },
      {
        question: "Can I cancel anytime?",
        answer:
          "Yes. Subscriptions are monthly or yearly and cancelable from your account settings. You keep access until the end of the paid period, then downgrade to Explorer.",
      },
    ],
  },
  {
    title: "Building permits & regulations",
    faqs: [
      {
        question: "Can I actually build a house I design in ModulCA?",
        answer:
          "Yes. ModulCA generates the drawings your architect needs for a building permit application (DTAC in Romania, Omgevingsvergunning in Netherlands). A certified architect signs the project, and you submit to the local municipality. Our certified partner architects can handle the submission for you.",
      },
      {
        question: "How does the Romanian building permit process work?",
        answer:
          "Six steps: (1) Certificat de Urbanism (CU) from primărie — 30 days, (2) Technical project (DTAC) signed by an architect, (3) Utility approvals (avize), (4) Autorizație de Construire — valid 12 months, (5) Construction with on-site supervision (diriginte de șantier), (6) Final inspection + cadastral registration (intabulare).",
      },
      {
        question: "How does the Dutch building permit process work?",
        answer:
          "Apply via the Omgevingsloket online portal. Since 2024, a Kwaliteitsborger (independent quality inspector) is required for new builds. Regular procedure is 8 weeks; extended procedure (for deviations from the local zoning plan) is 26 weeks. Bouwbesluit / BBL compliance is mandatory.",
      },
      {
        question: "Does ModulCA handle the permit paperwork?",
        answer:
          "Not directly — permit submission must be signed by a licensed architect or engineer in the country of construction. We connect you with certified partner architects in Romania and the Netherlands (in Architect and Constructor tiers), and we generate the drawings they need.",
      },
    ],
  },
  {
    title: "Timeline & construction",
    faqs: [
      {
        question: "How long does the whole process take?",
        answer:
          "Design in ModulCA: a few hours to a few days (depending on revisions). Permit process: 4–12 weeks in Romania, 8–26 weeks in Netherlands. Factory build: 6–10 weeks. On-site assembly: 2–5 days. Total: 3–8 months from signup to moving in.",
      },
      {
        question: "Can the house be moved later?",
        answer:
          "Yes — screw-pile foundations can be unscrewed and modules are bolted together (not glued or welded). Disassembly and relocation takes 2–4 days with a qualified team. This is a key reason for using ModulCA if you're on leased land or plan to move.",
      },
      {
        question: "How well-insulated are the modules?",
        answer:
          "ModulCA modules meet near-passive-house thermal performance — exterior wall U-value around 0.18 W/m²K (passive house is ≤0.15). Heating demand typically 15–25 kWh/m²·year. Builders can spec full passive standard on request.",
      },
    ],
  },
  {
    title: "AI & technology",
    faqs: [
      {
        question: "What AI does ModulCA use?",
        answer:
          "Multiple engines. For renders: FLUX, Stable Diffusion, DALL-E 3, Leonardo, Imagen 3, Runway — auto-selected by tier and subject. For the architectural consultant: Groq Llama 3.3 (free tier), OpenAI GPT-4o-mini (Premium), Anthropic Claude (Architect). All text generation is grounded in our 212-article knowledge base.",
      },
      {
        question: "Is my design data private?",
        answer:
          "Yes. Projects are stored in your account (Supabase EU region) and are never shared with third parties or used to train AI models. You can export or delete your data at any time.",
      },
      {
        question: "Can I export to CAD?",
        answer:
          "PDF export is available on all paid tiers. DWG export (for AutoCAD/Revit) is included in the Architect tier and above. SketchUp and IFC exports are on the roadmap.",
      },
    ],
  },
];

export default function FAQPage() {
  const allFaqs = FAQ_GROUPS.flatMap((g) => g.faqs);
  const faqLd = faqPageSchema(allFaqs);
  const breadcrumbs = breadcrumbListSchema([
    { name: "Home", url: SITE_URL },
    { name: "FAQ", url: `${SITE_URL}/faq` },
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-brand-bone-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faqLd) }}
      />
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
            <Link href="/faq" className="text-sm font-medium text-brand-charcoal">FAQ</Link>
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
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <nav className="mb-6 text-xs text-brand-gray" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-brand-charcoal">Home</Link>
              <span className="mx-2">/</span>
              <span>FAQ</span>
            </nav>
            <h1 className="mb-4 text-4xl font-bold tracking-heading text-brand-charcoal md:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="max-w-2xl text-lg text-brand-gray">
              Everything you want to know about designing modular homes, the ModulCA platform,
              building permits in Romania and the Netherlands, and the construction process itself.
            </p>
          </div>
        </section>

        {/* ---- FAQ Groups ---- */}
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          {FAQ_GROUPS.map((group) => (
            <div key={group.title} className="mb-14 last:mb-0">
              <h2 className="mb-6 border-b border-brand-bone-300/60 pb-3 text-2xl font-bold tracking-heading text-brand-charcoal">
                {group.title}
              </h2>
              <div className="divide-y divide-brand-bone-300/40">
                {group.faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="group py-5 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left">
                      <h3 className="text-base font-semibold text-brand-charcoal md:text-lg">
                        {faq.question}
                      </h3>
                      <span
                        className="mt-1 flex-shrink-0 text-brand-amber-600 transition-transform group-open:rotate-45"
                        aria-hidden
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                    </summary>
                    <p className="mt-3 text-base leading-relaxed text-brand-gray">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* ---- CTA ---- */}
        <section className="border-t border-brand-bone-300/60 bg-brand-bone-200/40">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h2 className="mb-3 text-2xl font-bold tracking-heading text-brand-charcoal md:text-3xl">
              Still have questions?
            </h2>
            <p className="mb-8 text-brand-gray">
              Our AI consultant can help you design, explain regulations, and estimate costs for free.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-lg bg-brand-charcoal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-charcoal/90"
              >
                Start designing free
              </Link>
              <Link
                href="/pricing"
                className="rounded-lg border border-brand-bone-300 bg-white px-6 py-3 text-sm font-semibold text-brand-charcoal transition-colors hover:bg-brand-bone-100"
              >
                Compare plans
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
