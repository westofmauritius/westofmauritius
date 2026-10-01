import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { siteUrl } from "@/lib/site";

export type Href = Parameters<typeof getPathname>[0]["href"];

/** Full public URL of an internal route, e.g. https://westmauritius.mu/fr/lieux/x. */
export function absoluteUrl(href: Href, locale: Locale): string {
  return siteUrl + getPathname({ href, locale });
}
