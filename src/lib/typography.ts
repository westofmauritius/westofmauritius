import type { Locale } from "@/i18n/routing";

/**
 * Small typographic fixes per language, applied to titles and short texts.
 *
 * French puts a space before : ; ? ! and inside « », and the line must never
 * break at that space ("Guide exemple / : les plages"). We replace ordinary
 * spaces there with a narrow no-break space (U+202F), as French typesetting
 * does, so editors can simply type a normal space in Keystatic.
 */
export function typeset(text: string, locale: Locale): string {
  if (locale !== "fr" || !text) return text;
  return text.replace(/ ([:;?!»])/g, " $1").replace(/« /g, "« ");
}
