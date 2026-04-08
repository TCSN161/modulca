import type { Config } from "tailwindcss";

/**
 * ModulCA Tailwind Configuration — "Digital Arboretum" Theme (Alfa 0.1)
 *
 * Design direction: Architectural Biophilia
 *   - Deep Olive Green (#56642B) = primary CTAs, active states, brand highlights
 *   - Soft Sage (#8A9A5B) = secondary accent, subtle backgrounds
 *   - Off-white Bone (#FCF9F4) = main background
 *   - Light Stone (#F2EEE6) = section backgrounds, card containers
 *   - Charcoal Black (#1C1C19) = headings and body text
 *   - Deep Gray (#5A5F62) = labels, metadata, secondary text
 *
 * ROLLBACK: To revert to the original teal/amber theme, replace the
 * `brand` color block with the one in THEME_ROLLBACK.md (or git revert).
 *
 * --- OLD THEME (for rollback) ---
 * brand-teal-800: #1B3A4B, brand-amber-500: #E8913A
 * See git commit eda9038 for full old config.
 */
const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          /* ---------- NEW: Digital Arboretum palette ---------- */
          olive: {
            50: "#F4F5EF",
            100: "#E5E8D8",
            200: "#CDD3B5",
            300: "#B1BB8D",
            400: "#9AAA6E",
            500: "#8A9A5B",  /* Soft Sage — secondary */
            600: "#6E7E42",
            700: "#56642B",  /* Deep Olive — primary accent */
            800: "#434D21",
            900: "#303818",
          },
          bone: {
            50: "#FEFDFB",
            100: "#FCF9F4",  /* Surface (Base) — main bg */
            200: "#F2EEE6",  /* Surface (Alt) — sections, cards */
            300: "#E8E2D6",
            400: "#D9D1C2",
            500: "#C5BAA8",
          },
          charcoal: "#1C1C19",
          gray: "#5A5F62",

          /* ---------- LEGACY: kept for backward compat ---------- */
          /* Inner pages still reference brand-teal-* and brand-amber-*
             until they are migrated to the new palette. These aliases
             map old tokens to new equivalents so nothing breaks. */
          teal: {
            50: "#F4F5EF",
            100: "#E5E8D8",
            200: "#CDD3B5",
            300: "#B1BB8D",
            400: "#9AAA6E",
            500: "#8A9A5B",
            600: "#6E7E42",
            700: "#56642B",
            800: "#56642B",
            900: "#303818",
          },
          amber: {
            50: "#F4F5EF",
            100: "#E5E8D8",
            200: "#CDD3B5",
            300: "#B1BB8D",
            400: "#9AAA6E",
            500: "#56642B",
            600: "#434D21",
            700: "#303818",
            800: "#303818",
            900: "#1C1C19",
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
        sans: ["Manrope", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "12px",
        lg: "12px",
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        subtle: "0 4px 24px rgba(0,0,0,0.04)",
        card: "0 2px 12px rgba(0,0,0,0.04)",
      },
      spacing: {
        "grid-sm": "2rem",
        "grid-md": "3rem",
        "grid-lg": "4rem",
      },
      letterSpacing: {
        "heading": "-0.02em",
        "label": "0.05em",
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
