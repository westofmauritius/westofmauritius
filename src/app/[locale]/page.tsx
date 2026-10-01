import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { GuideCard } from "@/components/content/GuideCard";
import { GuideThemes } from "@/components/content/GuideThemes";
import { PlaceCard } from "@/components/content/PlaceCard";
import { HeroArt } from "@/components/home/HeroArt";
import { placeMarker } from "@/components/map/markers";
import { SiteMap } from "@/components/map/SiteMap";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/Link";
import { resolveLocale } from "@/i18n/locale";
import { getAreas } from "@/lib/content/areas";
import { getGuides } from "@/lib/content/guides";
import { getHomepage } from "@/lib/content/homepage";
import { getPlaces } from "@/lib/content/places";
import { localeAlternates } from "@/lib/seo/alternates";
import { organizationSchema } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/seo/urls";
import { brandName } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Home" });
  return {
    // The start page uses the full brand name as its title, without the "· Brand" suffix.
    title: { absolute: `${brandName[locale]} · ${t("eyebrow")}` },
    alternates: localeAlternates("/", locale),
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const [t, home, areas, places, guides] = await Promise.all([
    getTranslations({ locale, namespace: "Home" }),
    getHomepage(locale),
    getAreas(locale),
    getPlaces(locale),
    getGuides(locale),
  ]);
  const areaName = (slug: string) =>
    areas.find((a) => a.slug === slug)?.name ?? slug;
  // Real places before placeholder examples; within each group featured
  // places stay first (getPlaces sorts them). sort() is stable.
  const highlights = [...places]
    .sort((a, b) => Number(a.placeholder) - Number(b.placeholder))
    .slice(0, 8);

  return (
    <>
      <JsonLd
        data={organizationSchema(
          brandName[locale],
          locale,
          absoluteUrl("/", locale),
        )}
      />

      {/*
        Hero. Phones: the photo fills the screen behind the headline. Large
        screens: magazine split, text on deep blue on the left and the photo
        on the right, fading into the blue. The photo is portrait, so this
        shows all of it sharply instead of cropping and enlarging it.
      */}
      <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-end overflow-hidden bg-ocean-950 text-white lg:min-h-[88vh] lg:items-center">
        {home.hero ? (
          // Wrapped: Photo's own figure is position: relative, so the
          // absolute positioning has to live on a parent. hero-drift makes
          // the photo slowly zoom in and out (see globals.css).
          <div className="absolute inset-0 -z-10 overflow-hidden lg:left-[44%]">
            <div className="h-full hero-drift">
              <Photo
                photo={home.hero}
                fallbackTone="sunset"
                fallbackLabel=""
                aspect=""
                sizes="(min-width: 1024px) 56vw, 100vw"
                priority
                className="h-full w-full"
              />
            </div>
          </div>
        ) : (
          <HeroArt className="absolute inset-0 -z-10 h-full w-full" />
        )}
        {/* Keeps the white text legible: darker under the text on phones,
            a fade from the blue into the photo on large screens. */}
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-ocean-950/90 via-ocean-950/40 to-transparent lg:left-[44%] lg:bg-linear-to-r lg:from-ocean-950 lg:via-ocean-950/25 lg:via-35% lg:to-transparent" />
        <Container size="wide" className="pt-32 pb-14 sm:pb-20">
          <p className="mb-5 eyebrow text-coral-200">{t("eyebrow")}</p>
          <h1 className="max-w-4xl text-display-1 text-white lg:max-w-[34rem] xl:max-w-[38rem]">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-xl lead text-ocean-100 lg:max-w-[30rem]">
            {t("intro")}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/guides" variant="light">
              {t("ctaGuides")}
            </ButtonLink>
            <ButtonLink
              href="/live-in-the-west"
              variant="outlineLight"
              data-umami-event="cta-live-in-the-west"
              data-umami-event-position="home-hero"
            >
              {t("ctaLive")}
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* Areas */}
      <section className="py-20 sm:py-28">
        <Container size="wide">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading title={t("areasTitle")} />
            <Link
              href="/areas"
              className="text-sm font-medium text-lagoon-700 hover:underline"
            >
              {t("allAreas")} →
            </Link>
          </div>
          <ul className="-mx-4 mt-12 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-6">
            {areas.map((area) => (
              <li
                key={area.slug}
                className="w-56 shrink-0 snap-start md:w-auto"
              >
                <Link
                  href={{
                    pathname: "/areas/[slug]",
                    params: { slug: area.slug },
                  }}
                  className="group relative block overflow-hidden rounded-sm"
                >
                  {area.hero ? (
                    <Photo
                      photo={area.hero}
                      fallbackTone={area.placeholderTone}
                      fallbackLabel={area.name}
                      aspect="aspect-[3/4]"
                      sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 224px"
                      className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <PlaceholderImage
                      tone={area.placeholderTone}
                      aspect="aspect-[3/4]"
                      className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  )}
                  <span className="absolute inset-x-0 top-0 bg-linear-to-b from-ocean-950/75 to-transparent p-4 pb-14 font-display text-2xl text-white">
                    {area.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Places worth knowing */}
      {highlights.length > 0 && (
        <section className="border-t border-line bg-sand-50 py-20 sm:py-28">
          <Container size="wide">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading title={t("featuredTitle")} />
              <Link
                href="/places"
                className="text-sm font-medium text-lagoon-700 hover:underline"
              >
                {t("allPlaces")} →
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
              {highlights.map((place) => (
                <PlaceCard
                  key={place.slug}
                  place={place}
                  areaName={areaName(place.areaSlug)}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Guide themes and the latest guides */}
      <section className="py-20 sm:py-28">
        <Container size="wide">
          <SectionHeading title={t("themesTitle")} />
          <div className="mt-10">
            <GuideThemes />
          </div>

          {guides.length > 0 && (
            <div className="mt-20">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <h2 className="text-display-3">{t("latestTitle")}</h2>
                <Link
                  href="/guides"
                  className="text-sm font-medium text-lagoon-700 hover:underline"
                >
                  {t("allGuides")} →
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
                {guides.slice(0, 4).map((guide) => (
                  <GuideCard key={guide.key} guide={guide} />
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* Every place on one map: the quickest way to see the coast at a glance. */}
      <section className="border-t border-line bg-sand-50 py-20 sm:py-28">
        <Container size="wide">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading title={t("mapTitle")} />
            <Link
              href="/places"
              className="text-sm font-medium text-lagoon-700 hover:underline"
            >
              {t("allOnMap")} →
            </Link>
          </div>
          <SiteMap
            name={t("mapTitle")}
            center={{ lat: -20.37, lng: 57.37 }}
            zoom={10}
            markers={places.map((place) => placeMarker(place, locale))}
            className="mt-10 aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]"
          />
        </Container>
      </section>

      {/* Live in the West: the entry to the property section */}
      <section className="relative isolate overflow-hidden bg-ocean-900 py-24 text-white sm:py-32">
        <div
          aria-hidden="true"
          className="absolute -top-40 -right-40 -z-10 size-[36rem] rounded-full bg-coral-500/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-48 -left-32 -z-10 size-[30rem] rounded-full bg-lagoon-500/20 blur-3xl"
        />
        <Container size="wide" className="max-w-3xl lg:max-w-6xl">
          <p className="mb-5 eyebrow text-coral-200">{t("liveEyebrow")}</p>
          <h2 className="max-w-3xl text-display-2 text-white">
            {t("liveTitle")}
          </h2>
          <p className="mt-6 max-w-2xl lead text-ocean-100">{t("liveText")}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/live-in-the-west" variant="light">
              {t("liveCta")}
            </ButtonLink>
            <ButtonLink
              href="/live-in-the-west"
              variant="outlineLight"
              data-umami-event="cta-enquire"
              data-umami-event-position="home-band"
            >
              {t("liveEnquire")}
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
