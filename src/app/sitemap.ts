import type { MetadataRoute } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { getAreas } from "@/lib/content/areas";
import { getGuides } from "@/lib/content/guides";
import { getLivingArticles } from "@/lib/content/living";
import { getPlaces } from "@/lib/content/places";
import { guideCategories, guideCategoryKeys } from "@/lib/guide-categories";
import { absoluteUrl, type Href } from "@/lib/seo/urls";

/**
 * sitemap.xml: every indexable page in every language, each listing its
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
      routing.locales.map((l) => [l, absoluteUrl(href(l), l)]),
    );
    for (const locale of routing.locales) {
      entries.push({
        url: absoluteUrl(href(locale), locale),
        ...(lastModified && { lastModified }),
        priority,
        alternates: { languages },
      });
    }
  };

  const staticPages: [Href, number][] = [
    ["/", 1],
    ["/areas", 0.8],
    ["/guides", 0.8],
    ["/places", 0.8],
    ["/live-in-the-west", 0.9],
    ["/live-in-the-west/enquire", 0.7],
    ["/about", 0.4],
    ["/contact", 0.4],
    ["/privacy", 0.2],
    ["/cookies", 0.2],
    ["/terms", 0.2],
  ];
  for (const [href, priority] of staticPages) add(() => href, null, priority);

  for (const key of guideCategoryKeys) {
    add(
      (l) => ({
        pathname: "/guides/[category]",
        params: { category: guideCategories[key].slug[l] },
      }),
      null,
      0.7,
    );
  }

  const locale = routing.defaultLocale;
  const [areas, places, guides, living] = await Promise.all([
    getAreas(locale),
    getPlaces(locale),
    getGuides(locale),
    getLivingArticles(locale),
  ]);

  for (const area of areas.filter((a) => !a.placeholder)) {
    add(
      () => ({ pathname: "/areas/[slug]", params: { slug: area.slug } }),
      null,
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
        pathname: "/live-in-the-west/[slug]",
        params: { slug: article.slugs[l] },
      }),
      article.updatedAt,
      0.7,
    );
  }

  return entries;
}
