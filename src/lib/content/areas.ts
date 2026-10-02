import "server-only";
import { cache } from "react";
import type { Locale } from "@/i18n/routing";
import { typeset } from "@/lib/typography";
import { toOptionalPhoto, toSources } from "./photo";
import { reader } from "./reader";
import type { Area, WithBody } from "./types";

type AreaEntry = NonNullable<
  Awaited<ReturnType<typeof reader.collections.areas.read>>
>;

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
