import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { siteUrl } from "@/lib/site";

type Href = Parameters<typeof getPathname>[0]["href"];

/**
 * Canonical URL and hreflang tags for a page, for use in generateMetadata:
 *
 *   alternates: localeAlternates("/places/[slug]", locale, { slug })
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
  const url = (l: Locale) => siteUrl + getPathname({ href, locale: l });
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = url(l);
  languages["x-default"] = url(routing.defaultLocale);

  return { canonical: url(locale), languages };
}
