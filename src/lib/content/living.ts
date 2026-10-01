import "server-only";
import { cache } from "react";
import { routing, type Locale } from "@/i18n/routing";
import { typeset } from "@/lib/typography";
import { reader } from "./reader";
import type { LivingArticle, LivingKind, WithBody } from "./types";

type LivingEntry = NonNullable<Awaited<ReturnType<typeof reader.collections.living.read>>>;

function toArticle(key: string, entry: LivingEntry, locale: Locale): LivingArticle {
  const text = entry.content[locale];
  const slugs = Object.fromEntries(
    routing.locales.map((l) => [l, entry.content[l].slug || key]),
  ) as Record<Locale, string>;
  return {
    key,
    slug: slugs[locale],
    slugs,
    kind: entry.kind,
    areaSlug: entry.area,
    order: entry.order ?? 0,
    title: typeset(text.title, locale),
    excerpt: typeset(text.excerpt, locale),
    seoDescription: text.seoDescription || text.excerpt,
    placeholder: entry.placeholder,
    updatedAt: entry.updatedAt,
  };
}

/** Live in the West articles in their chosen order, optionally one kind. */
export const getLivingArticles = cache(
  async (locale: Locale, filter: { kind?: LivingKind } = {}): Promise<LivingArticle[]> => {
    const entries = await reader.collections.living.all();
    return entries
      .map(({ slug, entry }) => toArticle(slug, entry, locale))
      .filter((a) => !filter.kind || a.kind === filter.kind)
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  },
);

/** One article by its URL in this language, with its text. */
export const getLivingArticle = cache(
  async (locale: Locale, slug: string): Promise<WithBody<LivingArticle> | null> => {
    const match = (await getLivingArticles(locale)).find((a) => a.slug === slug);
    if (!match) return null;
    const entry = await reader.collections.living.read(match.key, { resolveLinkedFiles: true });
    if (!entry) return null;
    return { ...match, body: entry.content[locale].body.node };
  },
);
