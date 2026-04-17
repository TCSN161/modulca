import type { Metadata } from "next";
import {
  faqPageSchema,
  productOfferSchema,
  breadcrumbListSchema,
  jsonLdScript,
  SITE_URL,
} from "@/shared/lib/schema";

export const metadata: Metadata = {
  title: "Pricing Plans — ModulCA",
  description:
    "Choose your ModulCA plan: Explorer (free), Premium (€19.99/mo), Architect (€49.99/mo), or Constructor (€149.90/mo). Design modular homes with AI renders, technical drawings, and collaboration tools.",
  alternates: { canonical: `${SITE_URL}/pricing` },
  openGraph: {
    title: "Pricing Plans — ModulCA",
    description:
      "Flexible pricing for modular home design. Start free, upgrade when you need more.",
    url: `${SITE_URL}/pricing`,
    images: [
      {
        url: "/og?title=Pricing+Plans&subtitle=Choose+your+modular+design+tier",
        width: 1200,
        height: 630,
        alt: "ModulCA Pricing Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing Plans — ModulCA",
    description:
      "Flexible pricing for modular home design. Start free, upgrade when you need more.",
    images: [
      "/og?title=Pricing+Plans&subtitle=Choose+your+modular+design+tier",
    ],
  },
};

/* ── Structured data — Product offers + page FAQ ────────────── */

const PRICING_FAQ = [
  {
    question: "Can I switch plans anytime?",
    answer:
      "Yes. Upgrade or downgrade at any time. Changes take effect immediately, and billing is prorated.",
  },
  {
    question: "What is the Beta bonus?",
    answer:
      "New free accounts get 3 months of Premium features during our Beta phase (launching May 1, 2026). No credit card needed. After 3 months you can upgrade or continue with the Explorer free tier.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Credit and debit cards via Stripe. Invoicing and SEPA direct debit are available on the Architect and Constructor tiers on request.",
  },
  {
    question: "What is the Constructor plan?",
    answer:
      "Enterprise solution for construction companies. Unlimited projects, white-label branding, team accounts, lead marketplace access, and dedicated support. Custom pricing available for larger teams.",
  },
  {
    question: "Do yearly plans offer a discount?",
    answer:
      "Yes. Yearly pricing is effectively ~2 months free — Premium €199/year (vs €239.88 monthly), Architect €499/year, Constructor €1499/year.",
  },
];

const PRODUCT_SCHEMAS = [
  productOfferSchema({
    name: "Premium",
    description: "Unlimited projects, 50 AI renders/month, premium consultant, PDF export, and the full 212-article knowledge library.",
    priceMonthly: 19.99,
    priceYearly: 199,
  }),
  productOfferSchema({
    name: "Architect",
    description: "Professional tools for architects: unlimited AI renders, DWG export, white-label presentations, vector knowledge search.",
    priceMonthly: 49.99,
    priceYearly: 499,
  }),
  productOfferSchema({
    name: "Constructor",
    description: "Enterprise tier for construction companies: team accounts, lead marketplace, white-label portfolio, priority support.",
    priceMonthly: 149.90,
    priceYearly: 1499,
  }),
];

const BREADCRUMBS = breadcrumbListSchema([
  { name: "Home", url: SITE_URL },
  { name: "Pricing", url: `${SITE_URL}/pricing` },
]);

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faqPageSchema(PRICING_FAQ)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(BREADCRUMBS) }}
      />
      {PRODUCT_SCHEMAS.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(schema) }}
        />
      ))}
      {children}
    </>
  );
}
