import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/_next/", "/dashboard/", "/project/"],
      },
    ],
    sitemap: "https://www.modulca.eu/sitemap.xml",
  };
}
