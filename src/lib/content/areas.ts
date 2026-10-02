import "server-only";
import { cache } from "react";
import type { Locale } from "@/i18n/routing";
import { typeset } from "@/lib/typography";
import { toOptionalPhoto, toSources } from "./photo";
import { reader } from "./reader";
import type { Area, AreaLiving, WithBody } from "./types";

type AreaEntry = NonNullable<
  Awaited<ReturnType<typeof reader.collections.areas.read>>
>;

/** Splits multi-line text into paragraphs at blank lines. */
const paragraphs = (text: string, locale: Locale) =>
  text
    .split(/\n\s*\n/)
    .map((p) => typeset(p.trim(), locale))
    .filter(Boolean);

function toLiving(raw: AreaEntry["living"], locale: Locale): AreaLiving {
  const text = raw.content[locale];
  return {
    placeholder: raw.placeholder,
    updatedAt: raw.updatedAt,
    shortAnswer: typeset(text.shortAnswer, locale),
    livingHere: paragraphs(text.livingHere, locale),
    pros: text.pros.filter(Boolean).map((p) => typeset(p, locale)),
    cons: text.cons.filter(Boolean).map((c) => typeset(c, locale)),
    schools: typeset(text.schools, locale),
    healthcare: typeset(text.healthcare, locale),
    commuting: typeset(text.commuting, locale),
    faqs: text.faqs
      .filter((f) => f.question)
      .map((f) => ({
        question: typeset(f.question, locale),
        answer: typeset(f.answer, locale),
      })),
    costs: raw.costs
      .filter((c) => c.item[locale].text)
      .map((c) => ({
        item: c.item[locale].text,
        amount: c.amount,
        checkedAt: c.checkedAt,
        sourceTitle: c.sourceTitle,
        sourceUrl: c.sourceUrl,
      })),
  };
}

function toArea(slug: string, entry: AreaEntry, locale: Locale): Area {
  const text = entry.content[locale];
  return {
    slug,
    name: text.name,
    tagline: typeset(text.tagline, locale),
    intro: typeset(text.intro, locale),
    seoDescription: text.seoDescription || text.intro,
    order: entry.order ?? 0,
    placeholder: entry.placeholder,
    updatedAt: entry.updatedAt,
    sources: toSources(entry.sources),
    living: toLiving(entry.living, locale),
    location: { lat: entry.location.lat, lng: entry.location.lng },
    mapZoom: entry.mapZoom ?? 13,
    hero: toOptionalPhoto(entry.hero, locale),
    placeholderTone: entry.placeholderTone,
  };
}

/** All areas in the chosen order (north to south). */
export const getAreas = cache(async (locale: Locale): Promise<Area[]> => {
  const entries = await reader.collections.areas.all();
  return entries
    .map(({ slug, entry }) => toArea(slug, entry, locale))
    .sort((a, b) => a.order - b.order);
});

/** One area with its main text, or null if the slug does not exist. */
export const getArea = cache(
  async (slug: string, locale: Locale): Promise<WithBody<Area> | null> => {
    const entry = await reader.collections.areas.read(slug, {
      resolveLinkedFiles: true,
    });
    if (!entry) return null;
    return {
      ...toArea(slug, entry, locale),
      body: entry.content[locale].body.node,
    };
  },
);
