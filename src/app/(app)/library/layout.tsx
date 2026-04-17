import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Library — ModulCA",
  description:
    "Browse 82+ architecture articles: Neufert standards, EU regulations, modular construction, biophilic design, sustainability, and country-specific building codes for Romania, Netherlands, Germany, France, and Belgium.",
  openGraph: {
    title: "Knowledge Library — ModulCA",
    description:
      "Architecture knowledge library with Neufert standards, building regulations, and modular construction guides.",
    images: [
      {
        url: "/og?title=Knowledge+Library&subtitle=82%2B+articles+on+modular+construction",
        width: 1200,
        height: 630,
        alt: "ModulCA Knowledge Library",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Knowledge Library — ModulCA",
    description:
      "82+ articles on modular construction, architecture standards, and building regulations.",
    images: [
      "/og?title=Knowledge+Library&subtitle=82%2B+articles+on+modular+construction",
    ],
  },
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
