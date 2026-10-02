import type { Metadata } from "next";

/** Google shows roughly 60 characters of a title before cutting it off. */
const maxLength = 60;

/**
 * A page title with " · West of Mauritius" added only when it still fits.
 * Long, specific titles ("Tamarin vs Grand Baie: which is better to live
 * in?") earn the click on their own; the brand would only push the words
 * people searched for out of view.
 */
export function seoTitle(title: string, brand: string): Metadata["title"] {
  return title.length + brand.length + 3 <= maxLength
    ? title
    : { absolute: title };
}
