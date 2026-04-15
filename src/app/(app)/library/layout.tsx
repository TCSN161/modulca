import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Library — ModulCA",
  description:
    "Browse 180+ architecture articles: Neufert standards, EU regulations, modular construction, biophilic design, sustainability, and country-specific building codes for Romania, Netherlands, Germany, France, and Belgium.",
  openGraph: {
    title: "Knowledge Library — ModulCA",
    description:
      "Architecture knowledge library with Neufert standards, building regulations, and modular construction guides.",
  },
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
