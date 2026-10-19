import type { Locale } from "@/i18n/routing";

/**
 * Number formats for Mauritius. Rupees are written "Rs 75,000" in English
 * and "75 000 Rs" in French, which is what Intl produces for en-MU / fr-MU.
 */
const intlLocale = (locale: Locale) => `${locale}-MU`;

export function formatMur(value: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "MUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(
  value: number,
  locale: Locale,
  maximumFractionDigits = 1,
) {
  return new Intl.NumberFormat(intlLocale(locale), {
    maximumFractionDigits,
  }).format(value);
}

export function formatDate(
  value: string | Date,
  locale: Locale,
  style: "long" | "short" = "long",
) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: style === "long" ? "long" : "medium",
    timeZone: "Indian/Mauritius",
  }).format(date);
}

/** "2026-07" → "July 2026" / "juillet 2026". */
export function formatMonth(month: string, locale: Locale) {
  const [year, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat(intlLocale(locale), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year ?? 2026, (m ?? 1) - 1, 1)));
}
