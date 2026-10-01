import "server-only";
import { cache } from "react";
import type { Locale } from "@/i18n/routing";
import { toPhoto } from "./photo";
import { reader } from "./reader";
import type { Place, PlaceCategory, WithBody } from "./types";

type PlaceEntry = NonNullable<
  Awaited<ReturnType<typeof reader.collections.places.read>>
>;

/**
 * A place counts as featured only while its placement runs: "featured" ticked
 * and "featured until" empty or not yet passed. Checked at build time, so an
 * expired placement disappears with the next build (a daily rebuild can be
 * scheduled later).
 */
function isFeatured(entry: PlaceEntry, today: string): boolean {
  return (
    entry.featured && (!entry.featuredUntil || entry.featuredUntil >= today)
  );
}

function toPlace(
  slug: string,
  entry: PlaceEntry,
  locale: Locale,
  today: string,
): Place {
  const text = entry.content[locale];
  return {
    slug,
    name: entry.name,
    category: entry.category,
    areaSlug: entry.area,
    summary: text.summary,
    hoursNote: text.hoursNote,
    seoDescription: text.seoDescription || text.summary,
    placeholder: entry.placeholder,
    featured: isFeatured(entry, today),
    location: { lat: entry.location.lat, lng: entry.location.lng },
    address: entry.address,
    website: entry.website,
    affiliateUrl: entry.affiliateUrl,
    phone: entry.phone,
    openingHours: entry.openingHours.map((row) => ({
      days: [...row.days],
      opens: row.opens,
      closes: row.closes,
    })),
    lastVerified: entry.lastVerified,
    images: entry.images.map((photo) => toPhoto(photo, locale)),
    placeholderTone: entry.placeholderTone,
  };
}

const today = () => new Date().toISOString().slice(0, 10);

/** Featured places first, then alphabetical. */
function byFeaturedThenName(a: Place, b: Place) {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  return a.name.localeCompare(b.name);
}

/** Places, optionally filtered by area and/or category. */
export const getPlaces = cache(
  async (
    locale: Locale,
    filter: { area?: string; category?: PlaceCategory } = {},
  ): Promise<Place[]> => {
    const entries = await reader.collections.places.all();
    const date = today();
    return entries
      .map(({ slug, entry }) => toPlace(slug, entry, locale, date))
      .filter((p) => !filter.area || p.areaSlug === filter.area)
      .filter((p) => !filter.category || p.category === filter.category)
      .sort(byFeaturedThenName);
  },
);

/** One place with its description, or null if the slug does not exist. */
export const getPlace = cache(
  async (slug: string, locale: Locale): Promise<WithBody<Place> | null> => {
    const entry = await reader.collections.places.read(slug, {
      resolveLinkedFiles: true,
    });
    if (!entry) return null;
    return {
      ...toPlace(slug, entry, locale, today()),
      body: entry.content[locale].body.node,
    };
  },
);
