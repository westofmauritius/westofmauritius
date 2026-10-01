import type { PlaceCategory } from "@/lib/content/types";

/** The filters on the places page; empty strings mean "any". */
export type PlaceFilters = {
  q: string;
  area: string;
  category: string;
  featured: boolean;
};

export const emptyFilters: PlaceFilters = {
  q: "",
  area: "",
  category: "",
  featured: false,
};

/** The searchable facts about a place (the card itself is rendered separately). */
export type FilterablePlace = {
  slug: string;
  name: string;
  summary: string;
  areaSlug: string;
  areaName: string;
  category: PlaceCategory;
  categoryLabel: string;
  featured: boolean;
};

/** Lower-case and strip accents, so "riviere" finds "Rivière". */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Places matching every active filter. The text search matches all words,
 * in any order, against name, summary, area and category.
 */
export function filterPlaces<T extends FilterablePlace>(
  places: T[],
  filters: PlaceFilters,
): T[] {
  const words = normalize(filters.q).split(/\s+/).filter(Boolean);
  return places.filter((place) => {
    if (filters.area && place.areaSlug !== filters.area) return false;
    if (filters.category && place.category !== filters.category) return false;
    if (filters.featured && !place.featured) return false;
    if (words.length === 0) return true;
    const haystack = normalize(
      [place.name, place.summary, place.areaName, place.categoryLabel].join(
        " ",
      ),
    );
    return words.every((word) => haystack.includes(word));
  });
}

/** Filters from the URL query (?q=…&area=…&category=…&featured=1). */
export function parseFilters(search: string): PlaceFilters {
  const params = new URLSearchParams(search);
  return {
    q: params.get("q") ?? "",
    area: params.get("area") ?? "",
    category: params.get("category") ?? "",
    featured: params.get("featured") === "1",
  };
}

/** The URL query for a set of filters, leaving out empty ones. */
export function toQueryString(filters: PlaceFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.area) params.set("area", filters.area);
  if (filters.category) params.set("category", filters.category);
  if (filters.featured) params.set("featured", "1");
  const query = params.toString();
  return query ? `?${query}` : "";
}
