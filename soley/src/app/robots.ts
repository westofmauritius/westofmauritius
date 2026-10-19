import type { MetadataRoute } from "next";
import { isDemoMode } from "@/lib/data";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // A demo or preview deployment must never be indexed.
  if (isDemoMode() || process.env.VERCEL_ENV === "preview") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/*/admin",
        "/*/account",
        "/*/mon-compte",
        "/*/portal",
        "/*/portail",
        "/*/sign-in",
        "/*/connexion",
      ],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
