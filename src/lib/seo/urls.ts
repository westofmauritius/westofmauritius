import { getPathname, type Href } from "@/i18n/pathname";
import type { Locale } from "@/i18n/routing";
import { siteUrl } from "@/lib/site";

export type { Href } from "@/i18n/pathname";

/** Full public URL of an internal route, e.g. https://westmauritius.mu/fr/lieux/x. */
export function absoluteUrl(href: Href, locale: Locale): string {
  return siteUrl + getPathname({ href, locale });
}
