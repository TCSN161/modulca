import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — ModulCA",
  description:
    "Insights on modular construction, AI architecture, building regulations, costs, and sustainable design in Romania and Europe.",
  openGraph: {
    title: "ModulCA Blog",
    description:
      "Modular construction insights, building regulations, and AI-powered architecture.",
    type: "website",
    images: [
      {
        url: "/og?title=Blog&subtitle=Modular+construction+insights",
        width: 1200,
        height: 630,
        alt: "ModulCA Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ModulCA Blog",
    description:
      "Modular construction insights, building regulations, and AI-powered architecture.",
    images: [
      "/og?title=Blog&subtitle=Modular+construction+insights",
    ],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
