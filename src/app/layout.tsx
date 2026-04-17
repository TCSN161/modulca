import type { Metadata, Viewport } from "next";
import { Manrope, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { AuthHydrator } from "@/features/auth/components/AuthHydrator";
import { Analytics } from "@/shared/components/Analytics";
import { organizationSchema, websiteSchema, jsonLdScript } from "@/shared/lib/schema";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#1B3A4B" },
  ],
};

const SITE_URL = "https://www.modulca.eu";

export const metadata: Metadata = {
  title: {
    default: "ModulCA — Design Your Modular Home in Minutes",
    template: "%s | ModulCA",
  },
  description:
    "AI-powered modular construction platform. Place 3×3m modules on your land, visualize in 3D, get AI renders, technical drawings, cost estimates, and connect with certified builders.",
  keywords: [
    "modular construction",
    "modular home",
    "prefabricated house",
    "AI architecture",
    "home design",
    "Romania construction",
    "modular building",
    "3D home visualization",
    "building permits Romania",
    "ModulCA",
    "prefab home design",
    "sustainable housing",
    "timber frame house",
    "casa modulara",
    "constructii modulare",
    "off-site construction",
  ],
  authors: [{ name: "ModulCA" }],
  creator: "ModulCA",
  publisher: "ModulCA",
  category: "Technology",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
    // hreflang hints — today all three map to the same EN content.
    // When RO/NL translations ship, swap these to language-specific paths
    // (e.g. /ro, /nl) without touching individual pages.
    languages: {
      "en": SITE_URL,
      "en-RO": SITE_URL,
      "en-NL": SITE_URL,
      "x-default": SITE_URL,
    },
  },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "ModulCA",
    title: "ModulCA — Design Your Modular Home in Minutes",
    description:
      "AI-powered modular construction platform. Design, visualize, and build your modular home with professional tools.",
    images: [
      {
        url: "/og?title=Design+Your+Modular+Home+in+Minutes&subtitle=AI-powered+modular+construction+platform",
        width: 1200,
        height: 630,
        alt: "ModulCA — Modular Construction Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@modulca",
    title: "ModulCA — Design Your Modular Home in Minutes",
    description:
      "AI-powered modular construction platform. Design, visualize, and build your modular home.",
    images: [
      {
        url: "/og?title=Design+Your+Modular+Home+in+Minutes&subtitle=AI-powered+modular+construction+platform",
        alt: "ModulCA — Modular Construction Platform",
      },
    ],
  },
  other: {
    "google-site-verification": process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Locale resolved by next-intl from cookie / Accept-Language / domain
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${manrope.variable} ${inter.variable}`}>
      <head>
        {/* Organization + WebSite Schema.org — emitted on every page for
            Google's knowledge panel + sitelinks searchbox */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteSchema()) }}
        />
      </head>
      <body className="min-h-screen bg-brand-bone-100 font-sans text-brand-charcoal antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthHydrator />
          {children}
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
