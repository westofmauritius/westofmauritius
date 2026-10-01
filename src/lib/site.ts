import type { Locale } from "@/i18n/routing";

/** The brand name shown in each language. */
export const brandName: Record<Locale, string> = {
  en: "West Mauritius",
  fr: "Ouest Maurice",
};

/**
 * Public address of the site, without a trailing slash. Used for canonical
 * URLs, hreflang tags, the sitemap and Open Graph images.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/** The six areas covered by the site, west coast from north to south. */
export const areaNames = [
  "Flic en Flac",
  "Tamarin",
  "Black River",
  "La Gaulette",
  "Le Morne",
  "Chamarel",
] as const;
