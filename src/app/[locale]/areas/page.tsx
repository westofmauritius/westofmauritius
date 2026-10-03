import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteMap } from "@/components/map/SiteMap";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPathname } from "@/i18n/pathname";
import { Link } from "@/i18n/Link";
import { resolveLocale } from "@/i18n/locale";
import { getAreas } from "@/lib/content/areas";
import { localeAlternates } from "@/lib/seo/alternates";
import { openGraphBase } from "@/lib/seo/open-graph";
import { seoTitle } from "@/lib/seo/titles";
import { brandName } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/areas">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Pages.areas" });
  return {
    title: seoTitle(t("metaTitle"), brandName[locale]),
    description: t("metaDescription"),
    alternates: localeAlternates("/areas", locale),
    openGraph: {
      ...openGraphBase(locale),
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
  };
}

/** Overview of the six areas: a map with one pin per area, then a card each. */
export default async function AreasPage({
  params,
}: PageProps<"/[locale]/areas">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale });
  const areas = await getAreas(locale);

  // Centre of all areas, so the whole coast fits on the map.
  const center = {
    lat: areas.reduce((sum, a) => sum + a.location.lat, 0) / areas.length,
    lng: areas.reduce((sum, a) => sum + a.location.lng, 0) / areas.length,
  };

  return (
    <Container size="wide" className="py-12 sm:py-16">
      <SectionHeading
        as="h1"
        eyebrow={t("AreasPage.eyebrow")}
        title={t("Pages.areas.title")}
        intro={t("Pages.areas.intro")}
      />
      <p className="mt-6">
        <Link
          href="/living-in-the-west/find-your-area"
          className="text-small font-medium text-lagoon-700 hover:underline"
          data-umami-event="cta-quiz"
          data-umami-event-position="areas"
        >
          {t("Quiz.title")} {t("Quiz.cta")} →
        </Link>
      </p>

      <SiteMap
        name={t("AreasPage.mapLabel")}
        center={center}
        zoom={11}
        markers={areas.map((area) => ({
          id: area.slug,
          lat: area.location.lat,
          lng: area.location.lng,
          label: area.name,
          href: getPathname({
            href: { pathname: "/areas/[slug]", params: { slug: area.slug } },
            locale,
          }),
          highlight: true,
        }))}
        className="mt-10 aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]"
      />

      {/* Hidden heading: the cards' titles are h3s and need an h2 above them. */}
      <h2 className="sr-only">{t("AreasPage.listHeading")}</h2>
      <div className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((area) => (
          <Card
            key={area.slug}
            href={{ pathname: "/areas/[slug]", params: { slug: area.slug } }}
            title={area.name}
            eyebrow={area.tagline}
            image={
              area.hero && (
                <Photo
                  photo={area.hero}
                  fallbackTone={area.placeholderTone}
                  fallbackLabel={area.name}
                  aspect="aspect-[4/3]"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              )
            }
            placeholderTone={area.placeholderTone}
            placeholder={area.placeholder}
            placeholderLabel={t("Placeholder.label")}
          />
        ))}
      </div>
    </Container>
  );
}
