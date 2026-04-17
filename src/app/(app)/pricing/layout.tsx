import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans — ModulCA",
  description:
    "Choose your ModulCA plan: Explorer (free), Premium (€19.99/mo), Architect (€49.99/mo), or Constructor (€149.90/mo). Design modular homes with AI renders, technical drawings, and collaboration tools.",
  openGraph: {
    title: "Pricing Plans — ModulCA",
    description:
      "Flexible pricing for modular home design. Start free, upgrade when you need more.",
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

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
