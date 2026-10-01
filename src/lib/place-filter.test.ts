import { describe, expect, it } from "vitest";
import {
  emptyFilters,
  filterPlaces,
  normalize,
  parseFilters,
  toQueryString,
  type FilterablePlace,
} from "./place-filter";

const place = (over: Partial<FilterablePlace>): FilterablePlace => ({
  slug: "x",
  name: "Example",
  summary: "",
  areaSlug: "tamarin",
  areaName: "Tamarin",
  category: "beach",
  categoryLabel: "Beach",
  featured: false,
  ...over,
});

const places = [
  place({
    slug: "a",
    name: "Lagoon Café",
    category: "restaurant",
    categoryLabel: "Restaurant",
  }),
  place({
    slug: "b",
    name: "Quiet beach",
    areaSlug: "black-river",
    areaName: "Rivière Noire",
  }),
  place({ slug: "c", name: "Sunset deck", category: "sunset", featured: true }),
];

const slugs = (list: FilterablePlace[]) => list.map((p) => p.slug);

describe("filterPlaces", () => {
  it("returns everything without filters", () => {
    expect(slugs(filterPlaces(places, emptyFilters))).toEqual(["a", "b", "c"]);
  });

  it("filters by area, category and featured", () => {
    expect(
      slugs(filterPlaces(places, { ...emptyFilters, area: "black-river" })),
    ).toEqual(["b"]);
    expect(
      slugs(filterPlaces(places, { ...emptyFilters, category: "restaurant" })),
    ).toEqual(["a"]);
    expect(
      slugs(filterPlaces(places, { ...emptyFilters, featured: true })),
    ).toEqual(["c"]);
  });

  it("searches all words, ignoring case and accents", () => {
    expect(
      slugs(filterPlaces(places, { ...emptyFilters, q: "riviere" })),
    ).toEqual(["b"]);
    expect(
      slugs(filterPlaces(places, { ...emptyFilters, q: "CAFE lagoon" })),
    ).toEqual(["a"]);
    expect(
      slugs(filterPlaces(places, { ...emptyFilters, q: "cafe beach" })),
    ).toEqual([]);
  });

  it("combines filters", () => {
    expect(
      slugs(
        filterPlaces(places, {
          ...emptyFilters,
          q: "deck",
          category: "restaurant",
        }),
      ),
    ).toEqual([]);
  });
});

describe("query string", () => {
  it("round-trips filters", () => {
    const filters = {
      q: "plage",
      area: "le-morne",
      category: "beach",
      featured: true,
    };
    expect(parseFilters(toQueryString(filters))).toEqual(filters);
  });

  it("leaves out empty filters", () => {
    expect(toQueryString(emptyFilters)).toBe("");
    expect(toQueryString({ ...emptyFilters, area: "tamarin" })).toBe(
      "?area=tamarin",
    );
  });

  it("normalizes text", () => {
    expect(normalize("  Côte Ouest ")).toBe("cote ouest");
  });
});
