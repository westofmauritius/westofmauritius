import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PlaceCard } from "@/components/content/PlaceCard";
import { PlaceExplorer } from "@/components/content/PlaceExplorer";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { resolveLocale } from "@/i18n/locale";
import { getAreas } from "@/lib/content/areas";
import { getPlaces } from "@/lib/content/places";
import type { PlaceCategory } from "@/lib/content/types";
import { localeAlternates } from "@/lib/seo/alternates";

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
    openGraph: { title: t("title"), description: t("intro") },
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
            results: t.raw("PlacesPage.results") as string,
            noResults: t("PlacesPage.noResults"),
          }}
        />
      </div>
    </Container>
  );
}
