import type { Locale } from "@/i18n/routing";
import type { Photo } from "./types";

type RawPhoto = {
  image: string;
  alt: Record<Locale, { text: string }>;
  credit: string;
  creditUrl: string | null;
};

/** Picks the alt text for the current language. */
export function toPhoto(raw: RawPhoto, locale: Locale): Photo {
  return {
    src: raw.image,
    alt: raw.alt[locale].text,
    credit: raw.credit,
    creditUrl: raw.creditUrl,
  };
}

/** Keystatic stores an optional photo as { discriminant: true, value: photo }. */
export function toOptionalPhoto(
  raw:
    | { discriminant: true; value: RawPhoto }
    | { discriminant: false; value: null },
  locale: Locale,
): Photo | null {
  return raw.discriminant ? toPhoto(raw.value, locale) : null;
}
