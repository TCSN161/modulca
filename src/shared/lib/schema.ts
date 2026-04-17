/**
 * Schema.org JSON-LD helpers.
 * Centralized so every page produces valid, consistent structured data
 * that helps Google render rich results (knowledge panel, FAQ, breadcrumbs, etc.)
 */

export const SITE_URL = "https://www.modulca.eu";
export const ORG_NAME = "ModulCA";
export const ORG_LEGAL = "ModulCA";
export const ORG_DESC =
  "AI-powered modular construction platform. Design modular homes with a 3×3m grid, visualize in 3D, generate technical drawings, and connect with certified builders in Romania and the Netherlands.";
export const ORG_FOUNDING_DATE = "2026-04-01";
export const ORG_LOGO = `${SITE_URL}/og?title=ModulCA&subtitle=Modular+Construction+Platform`;

/** Public social profiles — extend as they come online */
export const ORG_SAME_AS: string[] = [
  // "https://twitter.com/modulca",
  // "https://linkedin.com/company/modulca",
  // "https://www.instagram.com/modulca",
];

/* ------------------------------------------------------------------ */
/*  Schema builders                                                    */
/* ------------------------------------------------------------------ */

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: ORG_NAME,
    legalName: ORG_LEGAL,
    url: SITE_URL,
    description: ORG_DESC,
    foundingDate: ORG_FOUNDING_DATE,
    logo: {
      "@type": "ImageObject",
      url: ORG_LOGO,
      width: 1200,
      height: 630,
    },
    sameAs: ORG_SAME_AS,
    areaServed: [
      { "@type": "Country", name: "Romania" },
      { "@type": "Country", name: "Netherlands" },
    ],
    knowsAbout: [
      "Modular construction",
      "Prefabricated housing",
      "AI-powered architecture",
      "3D building visualization",
      "Building permits Romania",
      "Bouwbesluit Netherlands",
      "Timber frame construction",
      "Sustainable housing",
    ],
  } as const;
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: ORG_NAME,
    url: SITE_URL,
    description: ORG_DESC,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: ["en", "ro", "nl"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/library?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  } as const;
}

export function softwareAppSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: ORG_NAME,
    url: SITE_URL,
    applicationCategory: "DesignApplication",
    applicationSubCategory: "Architecture",
    operatingSystem: "Web",
    description: ORG_DESC,
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "0",
      highPrice: "149.90",
      priceCurrency: "EUR",
      offerCount: 4,
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    creator: { "@id": `${SITE_URL}/#organization` },
  } as const;
}

export interface FAQEntry {
  question: string;
  answer: string;
}

export function faqPageSchema(entries: FAQEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: e.answer,
      },
    })),
  };
}

export interface BreadcrumbEntry {
  name: string;
  url: string;
}

export function breadcrumbListSchema(items: BreadcrumbEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    image: opts.imageUrl,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    author: {
      "@type": "Organization",
      name: opts.authorName || ORG_NAME,
      url: SITE_URL,
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export interface PricingTierInput {
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
}

export function productOfferSchema(tier: PricingTierInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${ORG_NAME} ${tier.name}`,
    description: tier.description,
    brand: { "@type": "Brand", name: ORG_NAME },
    offers: [
      {
        "@type": "Offer",
        name: `${tier.name} Monthly`,
        price: tier.priceMonthly.toFixed(2),
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/pricing`,
      },
      {
        "@type": "Offer",
        name: `${tier.name} Yearly`,
        price: tier.priceYearly.toFixed(2),
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/pricing`,
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  React helper                                                       */
/* ------------------------------------------------------------------ */

/**
 * Emit a JSON-LD script tag. Use with `<JsonLd schema={...} />` or
 * serialize manually if you need multiple scripts in the same block.
 */
export function jsonLdScript(schema: unknown): string {
  // Safe JSON — no user input ever reaches here; schemas are compile-time data.
  return JSON.stringify(schema);
}
