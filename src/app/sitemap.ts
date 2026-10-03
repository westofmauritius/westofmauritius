import type { MetadataRoute } from "next";
import { publishedLocales } from "@/i18n/published";
import { routing, type Locale } from "@/i18n/routing";
import { getAreas } from "@/lib/content/areas";
import { getAuthor } from "@/lib/content/author";
import { getGuides } from "@/lib/content/guides";
import { getLivingArticles } from "@/lib/content/living";
import { getTextPage } from "@/lib/content/pages";
import { getPlaces } from "@/lib/content/places";
import { guideCategories, guideCategoryKeys } from "@/lib/guide-categories";
import { absoluteUrl, type Href } from "@/lib/seo/urls";

/**
 * sitemap.xml: every indexable page in every published language, each listing its
 * translations (hreflang). Placeholder content and utility pages (thank-you,
 * newsletter status, style guide) are left out on purpose.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  /** One entry per language, all pointing at each other. */
  const add = (
    href: (l: Locale) => Href,
    lastModified?: string | null,
    priority = 0.6,
  ) => {
    const languages = Object.fromEntries(
      publishedLocales.map((l) => [l, absoluteUrl(href(l), l)]),
    );
    // Hidden languages (French, for now) stay out of the sitemap.
    for (const locale of publishedLocales) {
      entries.push({
        url: absoluteUrl(href(locale), locale),
        ...(lastModified && { lastModified }),
        priority,
        alternates: { languages },
      });
    }
  };

  const locale = routing.defaultLocale;
  const [areas, places, guides, living, author, textPages] = await Promise.all([
    getAreas(locale),
    getPlaces(locale),
    getGuides(locale),
    getLivingArticles(locale),
    getAuthor(locale),
    Promise.all(
      (["about", "privacy", "cookies", "terms"] as const).map(
        async (key) => [key, await getTextPage(key, locale)] as const,
      ),
    ),
  ]);

  // The newest date anywhere in the content: when the overview pages last
  // changed in substance.
  const latest =
    [
      ...guides
        .filter((g) => !g.placeholder)
        .map((g) => g.updatedAt ?? g.publishedAt),
      ...areas.map((a) => a.updatedAt),
      ...places.map((p) => p.lastVerified),
    ]
      .filter((d): d is string => Boolean(d))
      .sort()
      .at(-1) ?? null;

  const staticPages: [Href, number, string | null][] = [
    ["/", 1, latest],
    ["/areas", 0.8, latest],
    ["/guides", 0.8, latest],
    ["/places", 0.8, latest],
    ["/living-in-the-west", 0.9, latest],
    ["/living-in-the-west/enquire", 0.7, null],
    ["/contact", 0.4, null],
    ["/community", 0.5, null],
    ["/living-in-the-west/find-your-area", 0.6, null],
    ["/credits", 0.1, null],
  ];
  for (const [href, priority, lastModified] of staticPages)
    add(() => href, lastModified, priority);

  // Text pages only once they are no longer drafts (legal pages wait for
  // Olivier's details and a lawyer's review).
  const textHref = {
    about: "/about",
    privacy: "/privacy",
    cookies: "/cookies",
    terms: "/terms",
  } as const;
  for (const [key, page] of textPages) {
    if (!page.placeholder)
      add(() => textHref[key], page.updatedAt, key === "about" ? 0.4 : 0.2);
  }

  // Themes with real guides or places; placeholder only themes are noindex.
  for (const key of guideCategoryKeys) {
    const category = guideCategories[key];
    const real =
      guides.some((g) => g.category === key && !g.placeholder) ||
      places.some(
        (p) => p.category === category.placeCategory && !p.placeholder,
      );
    if (!real) continue;
    add(
      (l) => ({
        pathname: "/guides/[category]",
        params: { category: category.slug[l] },
      }),
      null,
      0.7,
    );
  }

  // The author page joins once the bio is written.
  if (!author.placeholder) add(() => "/about/olivier", null, 0.5);

  for (const area of areas.filter((a) => !a.placeholder)) {
    add(
      () => ({ pathname: "/areas/[slug]", params: { slug: area.slug } }),
      area.updatedAt,
      0.8,
    );
  }
  for (const place of places.filter((p) => !p.placeholder)) {
    add(
      () => ({ pathname: "/places/[slug]", params: { slug: place.slug } }),
      place.lastVerified,
      0.6,
    );
  }
  for (const guide of guides.filter((g) => !g.placeholder)) {
    add(
      (l) => ({
        pathname: "/guides/[category]/[slug]",
        params: {
          category: guideCategories[guide.category].slug[l],
          slug: guide.slugs[l],
        },
      }),
      guide.updatedAt ?? guide.publishedAt,
      0.7,
    );
  }
  for (const article of living.filter((a) => !a.placeholder)) {
    add(
      (l) => ({
        pathname: "/living-in-the-west/[slug]",
        params: { slug: article.slugs[l] },
      }),
      article.updatedAt ?? article.publishedAt,
      0.7,
    );
  }

  return entries;
}
