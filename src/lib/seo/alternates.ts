import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { absoluteUrl, type Href } from "./urls";

/**
 * Canonical URL and hreflang tags for a page, for use in generateMetadata:
 *
 *   alternates: localeAlternates({ pathname: "/places/[slug]", params: { slug } }, locale)
 *
 * Search engines use these to show each visitor the version in their
 * language, and to understand that /en/places/x and /fr/lieux/x are
 * translations rather than duplicates. "x-default" is the version for
 * everyone else (English).
 */
export function localeAlternates(
  href: Href,
  locale: Locale,
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = absoluteUrl(href, l);
  languages["x-default"] = absoluteUrl(href, routing.defaultLocale);

  return { canonical: absoluteUrl(href, locale), languages };
}
