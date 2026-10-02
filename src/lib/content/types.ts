import type { Node as MarkdocNode } from "@markdoc/markdoc";
import type { PlaceholderTone } from "@/components/ui/PlaceholderImage";
import type { GuideCategory } from "@/lib/guide-categories";

/**
 * The shapes pages work with. The loaders in this folder turn Keystatic's
 * per-language entries into these flat, single-language objects, so pages
 * never deal with { en: …, fr: … } themselves.
 */

export type LatLng = { lat: number; lng: number };

export type Photo = {
  src: string;
  alt: string;
  credit: string;
  creditUrl: string | null;
};

/** A source the facts in an entry were checked against. */
export type Source = {
  title: string;
  publisher: string;
  url: string;
  checkedAt: string | null;
};

export type PlaceCategory =
  "restaurant" | "activity" | "beach" | "sunset" | "shopping";

export type Weekday = "mo" | "tu" | "we" | "th" | "fr" | "sa" | "su";

export type OpeningHours = { days: Weekday[]; opens: string; closes: string };

export type Area = {
  slug: string;
  name: string;
  tagline: string;
  intro: string;
  seoDescription: string;
  order: number;
  placeholder: boolean;
  updatedAt: string | null;
  sources: Source[];
  location: LatLng;
  mapZoom: number;
  hero: Photo | null;
  placeholderTone: PlaceholderTone;
};

export type Place = {
  slug: string;
  name: string;
  category: PlaceCategory;
  /** schema.org type when it should differ from the category's ("Mountain"). */
  kind: string | null;
  areaSlug: string;
  summary: string;
  hoursNote: string;
  seoDescription: string;
  placeholder: boolean;
  /** True only while the placement is active (see featuredUntil). */
  featured: boolean;
  location: LatLng;
  address: string;
  website: string | null;
  affiliateUrl: string | null;
  phone: string;
  openingHours: OpeningHours[];
  lastVerified: string | null;
  images: Photo[];
  placeholderTone: PlaceholderTone;
};

export type Guide = {
  /** Internal name; the same in every language. */
  key: string;
  /** URL part in the current language, e.g. "meilleures-plages". */
  slug: string;
  /** URL part per language, for links to the other language. */
  slugs: Record<string, string>;
  category: GuideCategory;
  title: string;
  excerpt: string;
  seoDescription: string;
  placeholder: boolean;
  featured: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
  sources: Source[];
  areaSlugs: string[];
  placeSlugs: string[];
  hero: Photo | null;
  placeholderTone: PlaceholderTone;
};

export type LivingKind = "scheme" | "area" | "general";

export type LivingArticle = {
  key: string;
  slug: string;
  slugs: Record<string, string>;
  kind: LivingKind;
  areaSlug: string | null;
  order: number;
  title: string;
  excerpt: string;
  seoDescription: string;
  placeholder: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
  sources: Source[];
};

/** Detail pages also get the long text as a Markdoc tree, rendered in step 5. */
export type WithBody<T> = T & { body: MarkdocNode };
