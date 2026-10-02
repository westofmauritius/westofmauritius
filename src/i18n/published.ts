import type { Locale } from "./routing";

/**
 * Which languages are public. English is; French is built in full (routes,
 * translations, content fields) but stays hidden until its content is ready.
 *
 * The one switch: set the build variable NEXT_PUBLIC_FRENCH_PUBLISHED=true and
 * rebuild. While French is hidden: no language switcher, no French hreflang
 * tags, no French URLs in the sitemap, French pages are noindex, and "/" always
 * opens the English site.
 */
export const frenchPublished =
  process.env.NEXT_PUBLIC_FRENCH_PUBLISHED === "true";

export const publishedLocales: readonly Locale[] = frenchPublished
  ? ["en", "fr"]
  : ["en"];

export const isPublished = (locale: Locale) =>
  publishedLocales.includes(locale);
