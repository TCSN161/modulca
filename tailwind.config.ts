import type { Config } from "tailwindcss";

/**
 * ModulCA Tailwind Configuration
 *
 * Brand colors:
 *   - Deep teal (#1B3A4B) = primary actions, headers, nav
 *   - Warm amber (#E8913A) = CTAs, accents, highlights
 *   - Module colors are defined in the design system, not here
 *     (they're used programmatically in canvas/grid components)
 */
const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: {
            50: "#E6EEF2",
            100: "#C0D4DD",
            200: "#96B8C7",
            300: "#6C9CB1",
            400: "#4D87A0",
            500: "#2E728F",
            600: "#276580",
            700: "#1E5469",
            800: "#1B3A4B",
            900: "#0F2330",
          },
          amber: {
            50: "#FDF3E8",
            100: "#F9DFC0",
            200: "#F5CA95",
            300: "#F1B569",
            400: "#EDA54A",
            500: "#E8913A",
            600: "#D47E2E",
            700: "#B86823",
            800: "#9C5219",
            900: "#6E3A11",
          },
        },
        module: {
          bedroom: "#4A90D9",
          kitchen: "#E8913A",
          bathroom: "#2ABFBF",
          living: "#6BBF59",
          office: "#8B6DB5",
          storage: "#8E99A4",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      spacing: {
        "grid-sm": "2rem",
        "grid-md": "3rem",
        "grid-lg": "4rem",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
