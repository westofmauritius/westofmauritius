import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PlaceCard } from "@/components/content/PlaceCard";
import { PlaceExplorer } from "@/components/content/PlaceExplorer";
import { placeMarker } from "@/components/map/markers";
import { SiteMap } from "@/components/map/SiteMap";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { resolveLocale } from "@/i18n/locale";
import { getAreas } from "@/lib/content/areas";
import { getPlaces } from "@/lib/content/places";
import type { PlaceCategory } from "@/lib/content/types";
import { localeAlternates } from "@/lib/seo/alternates";
import { openGraphBase } from "@/lib/seo/open-graph";

const categories: PlaceCategory[] = [
  "restaurant",
  "beach",
  "sunset",
  "activity",
  "shopping",
];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/places">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Pages.places" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: localeAlternates("/places", locale),
    openGraph: {
      ...openGraphBase(locale),
      title: t("title"),
      description: t("intro"),
    },
  };
}

/** Every place, with search and filters (area, category, featured). */
export default async function PlacesPage({
  params,
}: PageProps<"/[locale]/places">) {
  const locale = await resolveLocale(params);
  const [t, places, areas] = await Promise.all([
    getTranslations({ locale }),
    getPlaces(locale),
    getAreas(locale),
  ]);
  const areaName = (slug: string) =>
    areas.find((a) => a.slug === slug)?.name ?? slug;

  return (
    <Container size="wide" className="py-12 sm:py-16">
      <SectionHeading
        as="h1"
        eyebrow={t("PlacesPage.eyebrow")}
        title={t("Pages.places.title")}
        intro={t("Pages.places.intro")}
      />
      <div className="mt-10">
        <PlaceExplorer
          locale={locale}
          places={places.map((place) => ({
            slug: place.slug,
            name: place.name,
            summary: place.summary,
            areaSlug: place.areaSlug,
            areaName: areaName(place.areaSlug),
            category: place.category,
            categoryLabel: t(`Categories.${place.category}.one`),
            featured: place.featured,
            card: (
              <PlaceCard place={place} areaName={areaName(place.areaSlug)} />
            ),
          }))}
          areas={areas.map((a) => ({ value: a.slug, label: a.name }))}
          categories={categories.map((c) => ({
            value: c,
            label: t(`Categories.${c}.many`),
          }))}
          labels={{
            search: t("PlacesPage.search"),
            searchPlaceholder: t("PlacesPage.searchPlaceholder"),
            area: t("PlacesPage.area"),
            anyArea: t("PlacesPage.anyArea"),
            category: t("PlacesPage.category"),
            anyCategory: t("PlacesPage.anyCategory"),
            featuredOnly: t("PlacesPage.featuredOnly"),
            reset: t("PlacesPage.reset"),
            resultsOne: t.raw("PlacesPage.resultsOne") as string,
            results: t.raw("PlacesPage.results") as string,
            noResults: t("PlacesPage.noResults"),
            resultsHeading: t("PlacesPage.resultsHeading"),
          }}
        />
      </div>

      {/* Every place at once: the quickest way to see what is near what. */}
      <section className="mt-20 sm:mt-28">
        <SectionHeading
          title={t("PlacesPage.mapTitle")}
          intro={t("PlacesPage.mapIntro")}
        />
        <SiteMap
          name={t("PlacesPage.mapName")}
          center={{ lat: -20.37, lng: 57.37 }}
          zoom={10}
          markers={places.map((place) => placeMarker(place, locale))}
          className="mt-8 aspect-[4/5] sm:aspect-[16/9]"
        />
      </section>
    </Container>
  );
}
