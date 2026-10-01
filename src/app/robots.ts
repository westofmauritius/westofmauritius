import type { MetadataRoute } from "next";
import { allowIndexing, siteUrl } from "@/lib/site";

/** robots.txt: everything public is open, except admin, APIs and the editor. */
export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/keystatic"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
