import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans — ModulCA",
  description:
    "Choose your ModulCA plan: Explorer (free), Premium (€29/mo), Architect (€79/mo), or Constructor (€149/mo). Design modular homes with AI renders, technical drawings, and collaboration tools.",
  openGraph: {
    title: "Pricing Plans — ModulCA",
    description:
      "Flexible pricing for modular home design. Start free, upgrade when you need more.",
    images: [
      {
        url: "/og?title=Choose+Your+Plan&subtitle=Start+free.+Upgrade+when+you+need+more+power.",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
