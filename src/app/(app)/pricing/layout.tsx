import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans — ModulCA",
  description:
    "Choose your ModulCA plan: Explorer (free), Premium (€29/mo), Architect (€79/mo), or Constructor (€149/mo). Design modular homes with AI renders, technical drawings, and collaboration tools.",
  openGraph: {
    title: "Pricing Plans — ModulCA",
    description:
      "Flexible pricing for modular home design. Start free, upgrade when you need more.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
