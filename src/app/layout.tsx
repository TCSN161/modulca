import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { AuthHydrator } from "@/features/auth/components/AuthHydrator";
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

const SITE_URL = "https://modulca.com";

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
  ],
  authors: [{ name: "ModulCA" }],
  creator: "ModulCA",
  metadataBase: new URL(SITE_URL),
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
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "ModulCA — Modular Construction Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ModulCA — Design Your Modular Home in Minutes",
    description:
      "AI-powered modular construction platform. Design, visualize, and build your modular home.",
    images: ["/og-image.svg"],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-brand-bone-100 font-sans text-brand-charcoal antialiased">
        <AuthHydrator />
        {children}
      </body>
    </html>
  );
}
