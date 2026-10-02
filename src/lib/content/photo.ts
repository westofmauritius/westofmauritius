import type { Locale } from "@/i18n/routing";
import type { Photo, Source } from "./types";

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

/** Sources as stored by Keystatic, without empty rows. */
export function toSources(
  raw: readonly {
    title: string;
    publisher: string;
    url: string | null;
    checkedAt: string | null;
  }[],
): Source[] {
  return raw
    .filter((r) => r.title && r.url)
    .map((r) => ({
      title: r.title,
      publisher: r.publisher,
      url: r.url!,
      checkedAt: r.checkedAt,
    }));
}
