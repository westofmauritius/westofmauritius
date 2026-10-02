import type { Locale } from "@/i18n/routing";

/**
 * "1 October 2026" in English (British order, as used in Mauritius) and
 * "1 octobre 2026" in French. One place, so every page writes dates alike.
 */
export function longDate(locale: Locale) {
  const format = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, {
    dateStyle: "long",
    timeZone: "Indian/Mauritius",
  });
  return (iso: string) => format.format(new Date(iso));
}
