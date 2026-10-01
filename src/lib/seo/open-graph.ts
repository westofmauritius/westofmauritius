import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { brandName } from "@/lib/site";
import { ogImage } from "./og-images";

const ogLocale: Record<Locale, string> = { en: "en_GB", fr: "fr_FR" };

/**
 * Open Graph fields every page shares. Next.js replaces (not merges) the
 * layout's openGraph when a page sets its own, so pages spread this in:
 *   openGraph: { ...openGraphBase(locale), title, description }
 */
export function openGraphBase(
  locale: Locale,
): NonNullable<Metadata["openGraph"]> {
  return {
    siteName: brandName[locale],
    locale: ogLocale[locale],
    alternateLocale: routing.locales
      .filter((l) => l !== locale)
      .map((l) => ogLocale[l]),
    type: "website",
    // The generic sharing image; pages with their own pass `images` after this.
    images: ogImage(locale, brandName[locale], "default"),
  };
}
