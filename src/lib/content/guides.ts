import "server-only";
import { cache } from "react";
import { routing, type Locale } from "@/i18n/routing";
import type { GuideCategory } from "@/lib/guide-categories";
import { typeset } from "@/lib/typography";
import { toOptionalPhoto } from "./photo";
import { reader } from "./reader";
import type { Guide, WithBody } from "./types";

type GuideEntry = NonNullable<Awaited<ReturnType<typeof reader.collections.guides.read>>>;

function toGuide(key: string, entry: GuideEntry, locale: Locale): Guide {
  const text = entry.content[locale];
  // Each language's URL: its own "URL in this language", or the internal name.
  const slugs = Object.fromEntries(
    routing.locales.map((l) => [l, entry.content[l].slug || key]),
  ) as Record<Locale, string>;
  return {
    key,
    slug: slugs[locale],
    slugs,
    category: entry.category,
    title: typeset(text.title, locale),
    excerpt: typeset(text.excerpt, locale),
    seoDescription: text.seoDescription || text.excerpt,
    placeholder: entry.placeholder,
    featured: entry.featured,
    publishedAt: entry.publishedAt,
    updatedAt: entry.updatedAt,
    areaSlugs: [...entry.areas],
    placeSlugs: [...entry.places],
    hero: toOptionalPhoto(entry.hero, locale),
    placeholderTone: entry.placeholderTone,
  };
}

/** Real guides before placeholder examples, then newest first. */
function byDateDesc(a: Guide, b: Guide) {
  if (a.placeholder !== b.placeholder) return a.placeholder ? 1 : -1;
  return (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
}

/** All guides, optionally only one category. */
export const getGuides = cache(
  async (locale: Locale, filter: { category?: GuideCategory } = {}): Promise<Guide[]> => {
    const entries = await reader.collections.guides.all();
    return entries
      .map(({ slug, entry }) => toGuide(slug, entry, locale))
      .filter((g) => !filter.category || g.category === filter.category)
      .sort(byDateDesc);
  },
);

/** One guide by its URL in this language, with the article text. */
export const getGuide = cache(
  async (
    locale: Locale,
    category: GuideCategory,
    slug: string,
  ): Promise<WithBody<Guide> | null> => {
    const match = (await getGuides(locale, { category })).find((g) => g.slug === slug);
    if (!match) return null;
    const entry = await reader.collections.guides.read(match.key, { resolveLinkedFiles: true });
    if (!entry) return null;
    return { ...match, body: entry.content[locale].body.node };
  },
);
