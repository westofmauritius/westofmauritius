import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { site } from "./site";

type Href = Parameters<typeof getPathname>[0]["href"];

/** Absolute URL of an internal route in a language. */
export function absoluteUrl(href: Href, locale: Locale) {
  return `${site.url}${getPathname({ href, locale })}`;
}

/**
 * Metadata for a page: title, description, canonical URL, hreflang links for
 * every language (plus x-default), Open Graph and Twitter cards.
 *
 * `hrefs` gives the page's route per language. Usually it is the same
 * internal route for both languages (translated by routing.ts); guides pass
 * a different slug per language.
 */
export async function pageMetadata({
  locale,
  href,
  hrefs,
  title,
  description,
  noindex = false,
  ogImage,
}: {
  locale: Locale;
  href?: Href;
  hrefs?: Partial<Record<Locale, Href>>;
  title?: string;
  description?: string;
  noindex?: boolean;
  ogImage?: string;
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  const perLocale: Partial<Record<Locale, Href>> =
    hrefs ?? Object.fromEntries(routing.locales.map((l) => [l, href]));
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    const target = perLocale[l];
    if (target) languages[l] = absoluteUrl(target, l);
  }
  const defaultHref = perLocale[routing.defaultLocale];
  if (defaultHref) {
    languages["x-default"] = absoluteUrl(defaultHref, routing.defaultLocale);
  }
  const canonical = languages[locale];
  const fullTitle = title ?? t("defaultTitle");
  const desc = description ?? t("defaultDescription");
  const image = ogImage ?? `${site.url}/${locale}/opengraph-image`;

  return {
    title: { absolute: title ? `${title} | ${site.name}` : t("defaultTitle") },
    description: desc,
    alternates: { canonical, languages },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      siteName: site.name,
      title: fullTitle,
      description: desc,
      url: canonical,
      locale: locale === "fr" ? "fr_MU" : "en_MU",
      images: [{ url: image, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [image],
    },
  };
}
