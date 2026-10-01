import type { Locale } from "@/i18n/routing";
import type { PlaceCategory } from "@/lib/content/types";
import type { PlaceholderTone } from "@/components/ui/PlaceholderImage";

/**
 * The guide categories. Fixed in code (not editable in Keystatic)
 * because each one is a page with its own translated URL:
 * /en/guides/beaches ↔ /fr/guides/plages.
 *
 * `placeCategory` links a guide category to the place category whose places
 * are listed on the category page (null: guides only, no places). Labels and intros are in messages/*.json
 * under "GuideCategories".
 */
export const guideCategories = {
  restaurants: {
    slug: { en: "restaurants", fr: "restaurants" },
    placeCategory: "restaurant",
    tone: "sunset",
  },
  activities: {
    slug: { en: "activities", fr: "activites" },
    placeCategory: "activity",
    tone: "lagoon",
  },
  beaches: {
    slug: { en: "beaches", fr: "plages" },
    placeCategory: "beach",
    tone: "sand",
  },
  sunsets: {
    slug: { en: "sunsets", fr: "couchers-de-soleil" },
    placeCategory: "sunset",
    tone: "sunset",
  },
  shopping: {
    slug: { en: "shopping", fr: "shopping" },
    placeCategory: "shopping",
    tone: "ocean",
  },
  // Practical information for the trip: climate, getting there, money …
  practical: {
    slug: { en: "plan-your-trip", fr: "preparer-son-voyage" },
    placeCategory: null,
    tone: "sand",
  },
} as const satisfies Record<
  string,
  {
    slug: Record<Locale, string>;
    placeCategory: PlaceCategory | null;
    tone: PlaceholderTone;
  }
>;

export type GuideCategory = keyof typeof guideCategories;

export const guideCategoryKeys = Object.keys(
  guideCategories,
) as GuideCategory[];

/** "plages" (in French) → "beaches". Undefined for unknown slugs. */
export function categoryFromSlug(
  slug: string,
  locale: Locale,
): GuideCategory | undefined {
  return guideCategoryKeys.find(
    (key) => guideCategories[key].slug[locale] === slug,
  );
}

/** Translates a category slug between languages: ("plages", fr → en) → "beaches". */
export function translateCategorySlug(
  slug: string,
  from: Locale,
  to: Locale,
): string {
  const key = categoryFromSlug(slug, from);
  return key ? guideCategories[key].slug[to] : slug;
}
