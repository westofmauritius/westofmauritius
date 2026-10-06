import { Eyebrow } from "@/components/ui/Eyebrow";
import type { Metadata } from "next";
import { SunsetNow } from "@/components/sun/SunsetNow";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AreaLivingSection } from "@/components/area/AreaLivingSection";
import { Byline } from "@/components/author/Byline";
import { PlaceCard } from "@/components/content/PlaceCard";
import { Prose } from "@/components/content/Prose";
import { Sources } from "@/components/content/Sources";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { placeMarker } from "@/components/map/markers";
import { SiteMap } from "@/components/map/SiteMap";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/Link";
import { resolveLocale } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
import { getArea, getAreas } from "@/lib/content/areas";
import { getLivingArticles } from "@/lib/content/living";
import { getPlaces } from "@/lib/content/places";
import type { PlaceCategory } from "@/lib/content/types";
import { localeAlternates } from "@/lib/seo/alternates";
import { ogImage } from "@/lib/seo/og-images";
import { openGraphBase } from "@/lib/seo/open-graph";
import { areaSchema, faqSchema } from "@/lib/seo/schema";
import { seoTitle } from "@/lib/seo/titles";
import { absoluteUrl } from "@/lib/seo/urls";
import { brandName } from "@/lib/site";

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
  const [area, t] = await Promise.all([
    getArea(slug, locale),
    getTranslations({ locale, namespace: "Metadata" }),
  ]);
  if (!area) return {};
  const title = t("areaTitle", { name: area.name });
  return {
    title: seoTitle(title, brandName[locale]),
    description: area.seoDescription,
    alternates: localeAlternates(
      { pathname: "/areas/[slug]", params: { slug } },
      locale,
    ),
    openGraph: {
      ...openGraphBase(locale),
      images: ogImage(locale, area.name, "areas", slug),
      title,
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
  const [area, areas, places, t, articles] = await Promise.all([
    getArea(slug, locale),
    getAreas(locale),
    getPlaces(locale, { area: slug }),
    getTranslations({ locale }),
    getLivingArticles(locale),
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
      {/* FAQ data only once the answers are real. */}
      {!area.placeholder &&
        !area.living.placeholder &&
        area.living.faqs.length > 0 && (
          <JsonLd data={faqSchema(area.living.faqs)} />
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
          <Eyebrow icon="pin" className="mb-5">
            {t("Region.label")}
          </Eyebrow>
          <h1 className="type-h1">{area.name}</h1>
          <p className="mt-3 text-lead font-medium text-ink-muted">
            {area.tagline}
          </p>
          <p className="mt-6 lead text-ink-muted">{area.intro}</p>
          <Byline
            locale={locale}
            publishedAt={null}
            updatedAt={area.updatedAt}
            className="mt-8"
          />
          <SunsetNow
            place={area.name}
            location={area.location}
            locale={locale}
            className="mt-5 text-small text-ink-muted"
          />
          <a
            href="#living"
            className="mt-6 inline-block text-small font-medium text-lagoon-700 hover:underline"
          >
            {t("AreaPage.livingLink", { name: area.name })} ↓
          </a>
        </div>
        <Photo
          photo={area.hero}
          fallbackTone={area.placeholderTone}
          fallbackLabel={area.name}
          aspect="aspect-[4/3]"
          sizes="(min-width: 1024px) 58vw, 100vw"
          priority
          parallax
          className="rounded-2xl"
        />
      </Container>

      <Container
        size="wide"
        className="grid gap-12 py-10 lg:grid-cols-[7fr_5fr]"
      >
        <Prose node={area.body} locale={locale} />
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SiteMap
            name={area.name}
            center={area.location}
            zoom={area.mapZoom}
            markers={places.map((place) => placeMarker(place, locale))}
            className="aspect-square"
          />
        </aside>
      </Container>

      <section className="relative mt-10 bg-sand-50 py-16">
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
              <h3 className="mb-6 eyebrow">
                {t(`Categories.${category}.many`)}
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
                {places.map((place) => (
                  <PlaceCard key={place.slug} place={place} />
                ))}
              </div>
            </div>
          ))}
        </Container>
      </section>

      <AreaLivingSection
        area={area}
        locale={locale}
        // Articles naming this area, the most specific first: articles about
        // only this area, then comparisons, then coast wide questions.
        reading={articles
          .filter(
            (a) =>
              a.relatedAreaSlugs.includes(slug) &&
              a.kind !== "scheme" &&
              a.kind !== "general",
          )
          .sort(
            (a, b) => a.relatedAreaSlugs.length - b.relatedAreaSlugs.length,
          )}
      />

      <Container size="wide" className="py-16">
        <Sources sources={area.sources} locale={locale} className="mb-16" />
        <h2 className="mb-6 eyebrow">{t("AreaPage.otherAreas")}</h2>
        <ul className="flex flex-wrap gap-x-8 gap-y-3 type-h4">
          {otherAreas.map((a) => (
            <li key={a.slug}>
              <Link
                href={{ pathname: "/areas/[slug]", params: { slug: a.slug } }}
                className="hover:text-accent"
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
