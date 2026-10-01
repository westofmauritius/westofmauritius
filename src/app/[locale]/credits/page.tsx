import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { resolveLocale } from "@/i18n/locale";
import { getAreas } from "@/lib/content/areas";
import { getGuides } from "@/lib/content/guides";
import { getHomepage } from "@/lib/content/homepage";
import { getPlaces } from "@/lib/content/places";
import type { Photo as PhotoData } from "@/lib/content/types";
import { optimizableImage } from "@/lib/image-sizes";
import { localeAlternates } from "@/lib/seo/alternates";
import { openGraphBase } from "@/lib/seo/open-graph";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "CreditsPage" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: localeAlternates("/credits", locale),
    openGraph: {
      ...openGraphBase(locale),
      title: t("title"),
      description: t("intro"),
    },
  };
}

/**
 * Every photo on the site with its photographer, licence and source.
 *
 * The owner wants no text on the photos themselves, but Creative Commons
 * licences (CC BY, CC BY-SA) require attribution "in a reasonable manner":
 * one page that lists them all, linked from every page's footer, does that.
 * The list is built from the content, so new photos appear automatically.
 * A credit is stored as "Name · Licence · Source" (see keystatic.config.ts).
 */
export default async function CreditsPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const [t, home, areas, places, guides] = await Promise.all([
    getTranslations({ locale, namespace: "CreditsPage" }),
    getHomepage(locale),
    getAreas(locale),
    getPlaces(locale),
    getGuides(locale),
  ]);

  const all: (PhotoData | null)[] = [
    home.hero,
    ...areas.map((a) => a.hero),
    ...places.flatMap((p) => p.images),
    ...guides.map((g) => g.hero),
  ];
  // Real photos with a credit, each listed once. The same original can be
  // stored as several files (one per page), so compare by its source link.
  const seen = new Set<string>();
  const photos = all.filter((photo): photo is PhotoData => {
    if (!photo?.credit || !optimizableImage.test(photo.src)) return false;
    const id = photo.creditUrl ?? photo.src;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  return (
    <Container size="wide" className="py-14 sm:py-20">
      <h1 className="text-display-1">{t("title")}</h1>
      <p className="mt-6 max-w-2xl lead text-ink-muted">{t("intro")}</p>
      {photos.length === 0 ? (
        <p className="mt-12">{t("none")}</p>
      ) : (
        <ul className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {photos.map((photo) => {
            const [name, licence] = photo.credit.split(" · ");
            return (
              <li key={photo.src} className="text-sm">
                <Photo
                  photo={photo}
                  fallbackTone="sand"
                  fallbackLabel=""
                  aspect="aspect-[4/3]"
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="rounded-sm"
                />
                <p className="mt-3 text-ink">{photo.alt}</p>
                <p className="mt-1 text-ink-muted">
                  {t("by", { name })}
                  {licence && (
                    <>
                      <br />
                      {/* "CC BY-SA 4.0" shown as "CC BY SA 4.0": no hyphens on the site. */}
                      {t("licence", { licence: licence.replace(/-/g, " ") })}
                    </>
                  )}
                </p>
                {photo.creditUrl && (
                  <a
                    href={photo.creditUrl}
                    rel="noopener"
                    target="_blank"
                    className="mt-1 inline-block text-lagoon-700 underline underline-offset-4"
                  >
                    {t("source")}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
