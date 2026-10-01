import type { Node as MarkdocNode } from "@markdoc/markdoc";
import type { PlaceholderTone } from "@/components/ui/PlaceholderImage";

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
  location: LatLng;
  mapZoom: number;
  hero: Photo | null;
  placeholderTone: PlaceholderTone;
};

export type Place = {
  slug: string;
  name: string;
  category: PlaceCategory;
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

/** Detail pages also get the long text as a Markdoc tree, rendered in step 5. */
export type WithBody<T> = T & { body: MarkdocNode };
