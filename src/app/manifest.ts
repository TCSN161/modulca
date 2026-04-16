import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ModulCA — Modular Home Design",
    short_name: "ModulCA",
    description:
      "AI-powered modular construction platform. Design, visualize, and build your modular home.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F1E8",
    theme_color: "#0f5e5c",
    categories: ["architecture", "business", "productivity"],
    lang: "en",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon.svg",
        sizes: "180x180",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
