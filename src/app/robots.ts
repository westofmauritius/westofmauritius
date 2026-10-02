import type { MetadataRoute } from "next";
import { searchIndexing, siteUrl } from "@/lib/site";

/**
 * robots.txt for the production domain: everything public is open, except
 * admin, APIs and the editor. Other hosts get a block-all file from
 * worker.mjs instead; SEARCH_INDEXING=off blocks everything here too.
 */
export default function robots(): MetadataRoute.Robots {
  if (searchIndexing === "off") {
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
