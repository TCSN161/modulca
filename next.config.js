/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig = {
  output: "export",
  basePath: isGitHubPages ? "/modulca" : "",
  assetPrefix: isGitHubPages ? "/modulca/" : "",
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "api.mapbox.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "image.pollinations.ai" },
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
