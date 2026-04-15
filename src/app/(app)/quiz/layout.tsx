import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Architectural Profile Quiz — ModulCA",
  description:
    "Discover your architectural style, optimal home layout, and material preferences. Take the 5-section quiz to get a personalized modular home recommendation.",
  openGraph: {
    title: "Architectural Profile Quiz — ModulCA",
    description:
      "Find your ideal modular home style with our professional architectural profiling quiz.",
    images: [
      {
        url: "/og?title=Architectural+Profile+Quiz&subtitle=Discover+your+style+and+get+personalized+recommendations",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
