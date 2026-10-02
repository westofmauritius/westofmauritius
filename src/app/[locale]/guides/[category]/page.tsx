import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { GuideCard } from "@/components/content/GuideCard";
import { PlaceCard } from "@/components/content/PlaceCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { placeMarker } from "@/components/map/markers";
import { SiteMap } from "@/components/map/SiteMap";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { resolveLocale } from "@/i18n/locale";
import type { Locale } from "@/i18n/routing";
import { getAreas } from "@/lib/content/areas";
import { getGuides } from "@/lib/content/guides";
import { getPlaces } from "@/lib/content/places";
import {
  categoryFromSlug,
  guideCategories,
  guideCategoryKeys,
} from "@/lib/guide-categories";
import { localeAlternates } from "@/lib/seo/alternates";
import { ogImage } from "@/lib/seo/og-images";
import { openGraphBase } from "@/lib/seo/open-graph";
import { seoTitle } from "@/lib/seo/titles";
import { brandName } from "@/lib/site";

type Props = PageProps<"/[locale]/guides/[category]">;

export const dynamicParams = false;

// One page per category and language, with the category's translated URL:
// /en/guides/beaches, /fr/guides/plages …
export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as Locale;
  return guideCategoryKeys.map((key) => ({
    category: guideCategories[key].slug[locale],
  }));
}

async function resolveCategory(params: Props["params"]) {
  const locale = await resolveLocale(params);
  const key = categoryFromSlug((await params).category, locale);
  if (!key) notFound();
  return { locale, key };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, key } = await resolveCategory(params);
  const placeCategory = guideCategories[key].placeCategory;
  const [t, guides, places] = await Promise.all([
    getTranslations({ locale, namespace: `GuideCategories.${key}` }),
    getGuides(locale, { category: key }),
    placeCategory ? getPlaces(locale, { category: placeCategory }) : [],
  ]);
  // A theme with only placeholder examples so far (restaurants, shopping)
  // stays out of search engines until real guides or places exist.
  const hasRealContent =
    guides.some((g) => !g.placeholder) || places.some((p) => !p.placeholder);
  return {
    title: seoTitle(t("metaTitle"), brandName[locale]),
    description: t("metaDescription"),
    ...(!hasRealContent && { robots: { index: false } }),
    alternates: localeAlternates(
      (l) => ({
        pathname: "/guides/[category]",
        params: { category: guideCategories[key].slug[l] },
      }),
      locale,
    ),
    openGraph: {
      ...openGraphBase(locale),
      images: ogImage(locale, t("title"), "guides", key),
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
  };
}

/** A theme: its guides, then every place in the matching category on a map and in a list. */
export default async function GuideCategoryPage({ params }: Props) {
  const { locale, key } = await resolveCategory(params);
  const category = guideCategories[key];
  const [t, guides, places, areas] = await Promise.all([
    getTranslations({ locale }),
    getGuides(locale, { category: key }),
    category.placeCategory
      ? getPlaces(locale, { category: category.placeCategory })
      : Promise.resolve(null),
    getAreas(locale),
  ]);
  const title = t(`GuideCategories.${key}.title`);
  const areaName = (slug: string) =>
    areas.find((a) => a.slug === slug)?.name ?? slug;

  return (
    <>
      <Container size="wide" className="pt-8">
        <Breadcrumbs
          locale={locale}
          label={t("Breadcrumbs.label")}
          items={[
            { label: t("Breadcrumbs.home"), href: "/" },
            { label: t("Pages.guides.title"), href: "/guides" },
            {
              label: title,
              href: {
                pathname: "/guides/[category]",
                params: { category: category.slug[locale] },
              },
            },
          ]}
        />
      </Container>

      <Container size="wide" className="py-10">
        <SectionHeading
          as="h1"
          title={title}
          intro={t(`GuideCategories.${key}.intro`)}
        />

        {guides.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 eyebrow text-ink-muted">
              {t("CategoryPage.guidesTitle")}
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
              {guides.map((guide) => (
                <GuideCard key={guide.key} guide={guide} />
              ))}
            </div>
          </section>
        )}
      </Container>

      {/* Themes without places (practical information) end with the guides. */}
      {places && (
        <section className="border-t border-line bg-sand-50 py-16">
          <Container size="wide">
            <h2 className="text-display-3">
              {t("CategoryPage.placesTitle", { category: title })}
            </h2>
            {places.length > 0 ? (
              <>
                <SiteMap
                  name={t("CategoryPage.mapName", { category: title })}
                  center={{ lat: -20.36, lng: 57.37 }}
                  zoom={11}
                  markers={places.map((place) => placeMarker(place, locale))}
                  className="mt-8 aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]"
                />
                <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
                  {places.map((place) => (
                    <PlaceCard
                      key={place.slug}
                      place={place}
                      areaName={areaName(place.areaSlug)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-4 text-ink-muted">
                {t("CategoryPage.noPlaces")}
              </p>
            )}
          </Container>
        </section>
      )}
    </>
  );
}
