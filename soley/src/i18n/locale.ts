import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "./routing";

/**
 * Call at the top of every layout and page in src/app/[locale]:
 *
 *   const locale = await resolveLocale(params);
 *
 * It turns the URL segment into a typed Locale (404 for unknown languages)
 * and tells next-intl the language up front, which lets static pages be
 * rendered at build time.
 */
export async function resolveLocale(
  params: Promise<{ locale: string }>,
): Promise<Locale> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return locale;
}
