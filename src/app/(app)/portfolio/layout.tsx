import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio — Built with ModulCA",
  description:
    "Explore real modular homes designed and built with ModulCA. From compact studios to family courtyards — see what's possible with 3×3m precision modules.",
  openGraph: {
    title: "Portfolio — Built with ModulCA",
    description:
      "Real modular homes built with our 3×3m grid system. Studios, cabins, family homes, and more.",
    images: [
      {
        url: "/og?title=Portfolio&subtitle=See+what+others+built+with+ModulCA",
        width: 1200,
        height: 630,
        alt: "ModulCA Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio — Built with ModulCA",
    description:
      "Real modular homes built with our 3×3m grid system.",
    images: [
      "/og?title=Portfolio&subtitle=See+what+others+built+with+ModulCA",
    ],
  },
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
