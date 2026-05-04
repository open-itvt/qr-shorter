import type { MetadataRoute } from "next";
import { getSeoBaseUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSeoBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/stats/", "/redirect/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
