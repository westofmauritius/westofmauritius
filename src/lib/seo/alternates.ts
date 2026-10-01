import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { absoluteUrl, type Href } from "./urls";

/** The same internal route for every language, or a function giving each language its own (e.g. a translated slug). */
export type LocalizedHref = Href | ((locale: Locale) => Href);

/**
 * Canonical URL and hreflang tags for a page, for use in generateMetadata:
 *
 *   alternates: localeAlternates({ pathname: "/places/[slug]", params: { slug } }, locale)
 *
 * When the URL's parameters differ per language, pass a function:
 *
 *   localeAlternates((l) => ({ pathname: "/guides/[category]", params: { category: slugs[l] } }), locale)
 *
 * Search engines use these to show each visitor the version in their
 * language, and to understand that /en/guides/beaches and /fr/guides/plages
 * are translations rather than duplicates. "x-default" is the version for
 * everyone else (English).
 *
 * The language switcher also reads these tags to find the other language's
 * URL (see LanguageSwitcher.tsx).
 */
export function localeAlternates(
  href: LocalizedHref,
  locale: Locale,
): NonNullable<Metadata["alternates"]> {
  const url = (l: Locale) =>
    absoluteUrl(typeof href === "function" ? href(l) : href, l);
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = url(l);
  languages["x-default"] = url(routing.defaultLocale);

  return { canonical: url(locale), languages };
}
