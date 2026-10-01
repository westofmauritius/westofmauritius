import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { EnquiryCta } from "@/components/content/EnquiryCta";
import { PlaceCard } from "@/components/content/PlaceCard";
import { Prose } from "@/components/content/Prose";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SiteMap } from "@/components/map/SiteMap";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link, getPathname } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
import { getArea, getAreas } from "@/lib/content/areas";
import { getPlaces } from "@/lib/content/places";
import type { Place, PlaceCategory } from "@/lib/content/types";
import { localeAlternates } from "@/lib/seo/alternates";
import { ogImage } from "@/lib/seo/og-images";
import { openGraphBase } from "@/lib/seo/open-graph";
import { areaSchema } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/seo/urls";

type Props = PageProps<"/[locale]/areas/[slug]">;

// Every area page is built ahead of time; unknown slugs are a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  const areas = await getAreas(routing.defaultLocale);
  return areas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const area = await getArea(slug, locale);
  if (!area) return {};
  return {
    title: area.name,
    description: area.seoDescription,
    alternates: localeAlternates(
      { pathname: "/areas/[slug]", params: { slug } },
      locale,
    ),
    openGraph: {
      ...openGraphBase(locale),
      images: ogImage(locale, area.name, "areas", slug),
      title: area.name,
      description: area.seoDescription,
    },
    // Placeholder pages stay out of Google until real content is written.
    ...(area.placeholder && { robots: { index: false } }),
  };
}

// The order categories are shown in on an area page.
const categoryOrder: PlaceCategory[] = [
  "restaurant",
  "beach",
  "sunset",
  "activity",
  "shopping",
];

export default async function AreaPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const [area, areas, places, t] = await Promise.all([
    getArea(slug, locale),
    getAreas(locale),
    getPlaces(locale, { area: slug }),
    getTranslations({ locale }),
  ]);
  if (!area) notFound();

  const byCategory = categoryOrder
    .map((category) => ({
      category,
      places: places.filter((p) => p.category === category),
    }))
    .filter((group) => group.places.length > 0);
  const otherAreas = areas.filter((a) => a.slug !== slug);
  const href = { pathname: "/areas/[slug]", params: { slug } } as const;

  return (
    <>
      {area.placeholder && <PlaceholderNotice />}
      {!area.placeholder && (
        <JsonLd data={areaSchema(area, absoluteUrl(href, locale))} />
      )}

      <Container size="wide" className="pt-8">
        <Breadcrumbs
          locale={locale}
          label={t("Breadcrumbs.label")}
          items={[
            { label: t("Breadcrumbs.home"), href: "/" },
            { label: t("Pages.areas.title"), href: "/areas" },
            { label: area.name, href },
          ]}
        />
      </Container>

      {/* Intro: text beside the main photo on large screens, above it on phones. */}
      <Container
        size="wide"
        className="grid gap-10 py-10 lg:grid-cols-[5fr_7fr] lg:items-end"
      >
        <div>
          <p className="mb-4 eyebrow text-coral-600">{area.tagline}</p>
          <h1 className="text-display-1">{area.name}</h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-muted">
            {area.intro}
          </p>
        </div>
        <Photo
          photo={area.hero}
          fallbackTone={area.placeholderTone}
          fallbackLabel={area.name}
          aspect="aspect-[4/3]"
          sizes="(min-width: 1024px) 58vw, 100vw"
          priority
          credit={area.hero?.credit}
        />
      </Container>

      <Container
        size="wide"
        className="grid gap-12 py-10 lg:grid-cols-[7fr_5fr]"
      >
        <Prose node={area.body} />
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SiteMap
            name={area.name}
            center={area.location}
            zoom={area.mapZoom}
            markers={places.map((place) => placeMarker(place, locale))}
            className="aspect-square"
          />
          <EnquiryCta
            area={{ slug: area.slug, name: area.name }}
            position={`area-${area.slug}`}
            className="mt-6"
          />
        </aside>
      </Container>

      <section className="mt-10 border-t border-line bg-sand-50 py-16">
        <Container size="wide">
          <SectionHeading
            title={t("AreaPage.placesTitle", { name: area.name })}
            intro={
              places.length > 0
                ? t("AreaPage.placesIntro", { name: area.name })
                : t("AreaPage.noPlaces", { name: area.name })
            }
          />
          {byCategory.map(({ category, places }) => (
            <div key={category} className="mt-14">
              <h3 className="mb-6 eyebrow text-ink-muted">
                {t(`Categories.${category}.many`)}
              </h3>
              <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {places.map((place) => (
                  <PlaceCard key={place.slug} place={place} />
                ))}
              </div>
            </div>
          ))}
        </Container>
      </section>

      <Container size="wide" className="py-16">
        <h2 className="mb-6 eyebrow text-ink-muted">
          {t("AreaPage.otherAreas")}
        </h2>
        <ul className="flex flex-wrap gap-x-8 gap-y-3 font-display text-2xl">
          {otherAreas.map((a) => (
            <li key={a.slug}>
              <Link
                href={{ pathname: "/areas/[slug]", params: { slug: a.slug } }}
                className="hover:text-coral-600"
              >
                {a.name}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}

function placeMarker(place: Place, locale: (typeof routing.locales)[number]) {
  return {
    id: place.slug,
    lat: place.location.lat,
    lng: place.location.lng,
    label: place.name,
    href: getPathname({
      href: { pathname: "/places/[slug]", params: { slug: place.slug } },
      locale,
    }),
    highlight: place.featured,
  };
}
