import type { Locale } from "@/i18n/routing";
import type { SearchIndexing } from "./hosts";

/** The brand name shown in each language. */
export const brandName: Record<Locale, string> = {
  en: "West of Mauritius",
  fr: "Ouest Maurice",
};

/** The production address, used when SITE_URL is not set. */
export const productionUrl = "https://westofmauritius.mu";

/**
 * Public address of the site, without a trailing slash: the single source for
 * canonical URLs, hreflang, the sitemap, Open Graph, structured data and
 * links in e-mails. Set SITE_URL as a build variable. Previews keep the
 * production value, so their canonical tags point at the real domain.
 */
export const siteUrl = (process.env.SITE_URL || productionUrl).replace(
  /\/$/,
  "",
);

/**
 * Search engine indexing. "auto" (default): only the host in SITE_URL may be
 * indexed; every other host (workers.dev previews) is blocked per request by
 * worker.mjs. "off": nothing is indexed anywhere (SEARCH_INDEXING=off).
 */
export const searchIndexing: SearchIndexing =
  process.env.SEARCH_INDEXING === "off" ? "off" : "auto";

/** The six areas covered by the site, west coast from north to south. */
export const areaNames = [
  "Flic en Flac",
  "Tamarin",
  "Black River",
  "La Gaulette",
  "Le Morne",
  "Chamarel",
] as const;
