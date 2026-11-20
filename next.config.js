const { withSentryConfig } = require("@sentry/nextjs/config");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const createNextIntlPlugin = require("next-intl/plugin");

// Point to our request config; uses cookie + Accept-Language + domain for locale detection
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
// GITHUB_ACTIONS is set automatically for EVERY CI run — using it to trigger
// static export broke CI because force-dynamic routes conflict with output:export.
// Use an explicit opt-in flag so only the dedicated GH Pages workflow turns it on.
const isGitHubPagesBuild = process.env.DEPLOY_TARGET === "github-pages";

const nextConfig = {
  ...(isGitHubPagesBuild ? { output: "export", basePath: "/modulca", assetPrefix: "/modulca/" } : {}),
  reactStrictMode: true,
  turbopack: {},
  // Modular imports — only pulls in the icons/components actually used,
  // drastically reducing bundle size for these libraries.
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@react-three/drei",
      "@react-three/fiber",
      "@react-three/postprocessing",
      "@react-pdf/renderer",
      "date-fns",
      "recharts",
    ],
  },
  images: {
    unoptimized: isGitHubPagesBuild, // only disable optimization for static export
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "tile.openstreetmap.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "image.pollinations.ai" },
      { protocol: "https", hostname: "gen.pollinations.ai" },
      { protocol: "https", hostname: "covers.openlibrary.org" },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("three");
    }
    return config;
  },
};

// Only wrap with Sentry if DSN is configured
const sentryEnabled = !!process.env.NEXT_PUBLIC_SENTRY_DSN;

const finalConfig = withNextIntl(withBundleAnalyzer(nextConfig));

module.exports = sentryEnabled
  ? withSentryConfig(finalConfig, {
      // Sentry webpack plugin options
      org: process.env.SENTRY_ORG || "modulca",
      project: process.env.SENTRY_PROJECT || "modulca-web",

      // Suppress source map upload logs in CI
      silent: !process.env.CI,

      // Upload source maps for better stack traces
      widenClientFileUpload: true,

      // Tree-shake Sentry debug logger in production (renamed from `disableLogger` in Sentry SDK v10+)
      webpack: {
        treeshake: {
          removeDebugLogging: true,
        },
      },

      // Hide source maps from users
      hideSourceMaps: true,
    })
  : finalConfig;
