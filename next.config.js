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

module.exports = nextConfig;
