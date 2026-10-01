import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";

/**
 * Social sharing images are drawn at build time by scripts/generate-og.tsx
 * into public/og/<locale>/…jpg (not in git). These helpers give pages the
 * matching URL, so the script and the pages always agree on the paths.
 */
export function ogImagePath(locale: Locale, ...segments: string[]): string {
  return `/og/${locale}/${segments.join("/")}.jpg`;
}

type OgImages = NonNullable<NonNullable<Metadata["openGraph"]>["images"]>;

export function ogImage(
  locale: Locale,
  alt: string,
  ...segments: string[]
): OgImages {
  return [
    {
      url: ogImagePath(locale, ...segments),
      width: 1200,
      height: 630,
      alt,
      type: "image/jpeg",
    },
  ];
}
