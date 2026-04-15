const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig = {
  ...(isGitHubPages ? { output: "export", basePath: "/modulca", assetPrefix: "/modulca/" } : {}),
  reactStrictMode: true,
  turbopack: {},
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "tile.openstreetmap.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "image.pollinations.ai" },
      { protocol: "https", hostname: "gen.pollinations.ai" },
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

module.exports = sentryEnabled
  ? withSentryConfig(nextConfig, {
      // Sentry webpack plugin options
      org: process.env.SENTRY_ORG || "modulca",
      project: process.env.SENTRY_PROJECT || "modulca-web",

      // Suppress source map upload logs in CI
      silent: !process.env.CI,

      // Upload source maps for better stack traces
      widenClientFileUpload: true,

      // Tree-shake Sentry logger in production
      disableLogger: true,

      // Hide source maps from users
      hideSourceMaps: true,
    })
  : nextConfig;
