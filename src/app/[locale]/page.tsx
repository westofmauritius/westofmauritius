import type { Metadata } from "next";
import { SunsetNow } from "@/components/sun/SunsetNow";
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
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Headline } from "@/components/ui/Headline";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/Link";
import { resolveLocale } from "@/i18n/locale";
import { getAreas } from "@/lib/content/areas";
import { getGuides } from "@/lib/content/guides";
import { getHomepage } from "@/lib/content/homepage";
import { getPlaces } from "@/lib/content/places";
import { localeAlternates } from "@/lib/seo/alternates";
import { AuthorAvatar } from "@/components/author/AuthorAvatar";
import { getAuthor } from "@/lib/content/author";
import { organizationSchema } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/seo/urls";
import { HeroVideo } from "@/components/home/HeroVideo";
import { heroVideo } from "@/lib/hero-video";
import imageLoader from "@/lib/image-loader";
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
  const [t, home, areas, places, guides, author] = await Promise.all([
    getTranslations({ locale, namespace: "Home" }),
    getHomepage(locale),
    getAreas(locale),
    getPlaces(locale),
    getGuides(locale),
    getAuthor(locale),
  ]);
  const c = await getTranslations({ locale, namespace: "Community" });
  const r = await getTranslations({ locale, namespace: "Region" });
  // The hero's sunset clock: Tamarin's bay sits mid coast.
  const tamarin = areas.find((a) => a.slug === "tamarin");
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
          author,
        )}
      />

      {/*
        Hero. Phones: the photo fills the screen behind the headline. Large
        screens: magazine split, text on deep blue on the left and the photo
        on the right, fading into the blue. The photo is portrait, so this
        shows all of it sharply instead of cropping and enlarging it.
      */}
      <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-end overflow-hidden bg-hero text-white lg:min-h-[88vh] lg:items-center">
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
                // On phones the photo is a backdrop under a dark scrim, so a
                // slightly smaller file looks the same and lets the first
                // screen (fonts and photo) arrive sooner on slow networks.
                sizes="(min-width: 1024px) 56vw, 80vw"
                priority
                className="h-full w-full"
              />
            </div>
          </div>
        ) : (
          <HeroArt className="absolute inset-0 -z-10 h-full w-full" />
        )}
        {/* The background video, once there is footage (src/lib/hero-video.ts).
            It loads after the page and only where it should; the photo
            above is its poster and stays the page's main image. */}
        {heroVideo && home.hero && (
          <HeroVideo
            sources={heroVideo.sources}
            small={heroVideo.small}
            poster={imageLoader({ src: home.hero.src, width: 1280 })}
            labels={{ pause: t("videoPause"), play: t("videoPlay") }}
          />
        )}
        {/* Keeps the white text legible: darker under the text on phones,
            a fade from the blue into the photo on large screens. */}
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-hero/95 from-35% via-hero/80 via-60% to-hero/15 lg:left-[44%] lg:bg-linear-to-r lg:from-hero lg:from-0% lg:via-hero/25 lg:via-35% lg:to-transparent" />
        {/* On phones the text sits on the photo: a scrim on the text block
            itself (fading out in its top padding) keeps the small accent
            eyebrow above 4.5:1 however tall the screen is. */}
        <Container
          size="wide"
          className="pt-32 pb-14 max-lg:bg-linear-to-t max-lg:from-hero/75 max-lg:via-hero/70 max-lg:via-80% max-lg:to-transparent sm:pb-20"
        >
          <Eyebrow icon="pin" tone="dark" className="mb-6">
            {r("label")}
          </Eyebrow>
          <Headline
            as="h1"
            size="display"
            tone="dark"
            className="max-w-4xl text-white lg:max-w-[34rem] xl:max-w-[38rem]"
          >
            {t("title")}
          </Headline>
          <p className="mt-6 max-w-xl lead text-ocean-100 lg:max-w-[30rem]">
            {t("intro")}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/guides" variant="light">
              {t("ctaGuides")}
            </ButtonLink>
            <ButtonLink
              href="/living-in-the-west"
              variant="outlineLight"
              data-umami-event="cta-living-in-the-west"
              data-umami-event-position="home-hero"
            >
              {t("ctaLive")}
            </ButtonLink>
          </div>
          {tamarin && (
            <SunsetNow
              place={tamarin.name}
              location={tamarin.location}
              locale={locale}
              className="mt-8 text-small text-ocean-100"
            />
          )}
        </Container>
      </section>

      {/* Areas: straight after the hero, so it starts close to it. Each card
          carries the village's tagline, so the section says something even
          before anyone clicks. */}
      <section className="pt-12 pb-12 sm:pt-16 sm:pb-16">
        <Container size="wide">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading title={t("areasTitle")} />
            <Link
              href="/areas"
              className="text-small font-medium text-lagoon-700 hover:underline"
            >
              {t("allAreas")} →
            </Link>
          </div>
          <ul className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-6">
            {areas.map((area) => (
              <li
                key={area.slug}
                // 192 px wide on phones: phones then load the 384 px file,
                // which keeps these off the hero photo's bandwidth.
                className="w-48 shrink-0 snap-start md:w-auto"
              >
                <Link
                  href={{
                    pathname: "/areas/[slug]",
                    params: { slug: area.slug },
                  }}
                  className="group relative block overflow-hidden rounded-2xl"
                >
                  {area.hero ? (
                    <Photo
                      photo={area.hero}
                      fallbackTone={area.placeholderTone}
                      fallbackLabel={area.name}
                      aspect="aspect-[3/4]"
                      sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 192px"
                      className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <PlaceholderImage
                      tone={area.placeholderTone}
                      aspect="aspect-[3/4]"
                      className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  )}
                  <span className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-ocean-950/85 via-ocean-950/20 to-transparent p-4 text-white">
                    <span className="type-h4">{area.name}</span>
                    <span className="mt-1 line-clamp-3 text-small leading-snug text-white/90">
                      {area.tagline}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* From a local: the site is written by a named Mauritian. */}
      <section className="py-14 sm:py-20">
        <Container
          size="wide"
          className="grid items-center gap-10 lg:grid-cols-[5fr_7fr] lg:gap-20"
        >
          <div>
            <p className="mb-5 eyebrow">{t("localEyebrow")}</p>
            <Headline>{t("localTitle")}</Headline>
          </div>
          <div>
            <p className="lead text-ink-muted">
              {t("localText", { name: author.name })}
            </p>
            {/* The short bio only once it is written (not a placeholder). */}
            {!author.placeholder && author.shortBio && (
              <p className="mt-6 type-h4">{author.shortBio}</p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link
                href="/about/olivier"
                className="group inline-flex items-center gap-3"
              >
                <AuthorAvatar author={author} size={48} />
                <span>
                  <span className="block font-medium group-hover:underline">
                    {t("localAuthor", { name: author.name })}
                  </span>
                  {author.role && (
                    <span className="block text-small text-ink-muted">
                      {author.role}
                    </span>
                  )}
                </span>
              </Link>
              <Link
                href="/about"
                className="text-small font-medium text-lagoon-700 hover:underline"
              >
                {t("localHow")} →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Places worth knowing */}
      {highlights.length > 0 && (
        <section className="py-14 sm:py-20">
          <Container size="wide">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading title={t("featuredTitle")} />
              <Link
                href="/places"
                className="text-small font-medium text-lagoon-700 hover:underline"
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
      <section className="py-14 sm:py-20">
        <Container size="wide">
          <SectionHeading title={t("themesTitle")} />
          <div className="mt-10">
            <GuideThemes />
          </div>

          {guides.length > 0 && (
            <div className="mt-20">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <h2 className="type-h3">{t("latestTitle")}</h2>
                <Link
                  href="/guides"
                  className="text-small font-medium text-lagoon-700 hover:underline"
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
      <section className="py-14 sm:py-20">
        <Container size="wide">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading title={t("mapTitle")} />
            <Link
              href="/places"
              className="text-small font-medium text-lagoon-700 hover:underline"
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

      {/* Community: the newsletter offer and the WhatsApp group. The form
          itself is in the footer just below, so this band points to it and
          to the community page instead of repeating it. */}
      <section className="py-14 sm:py-20">
        <Container
          size="wide"
          className="grid items-center gap-8 lg:grid-cols-[7fr_5fr] lg:gap-16"
        >
          <div>
            <p className="mb-5 eyebrow">{c("homeEyebrow")}</p>
            <h2 className="max-w-2xl type-h2">{c("homeTitle")}</h2>
          </div>
          <div>
            <p className="lead text-ink-muted">{c("homeText")}</p>
            <ButtonLink
              href="/community"
              variant="accent"
              className="mt-8"
              data-umami-event="cta-community"
              data-umami-event-position="home-band"
            >
              {c("homeCta")}
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* Living in the West: the entry to the property section */}
      <section className="relative isolate overflow-hidden bg-ocean-900 py-24 text-white sm:py-32">
        <Container size="wide" className="max-w-3xl lg:max-w-6xl">
          <p className="mb-5 eyebrow text-accent-on-dark">{t("liveEyebrow")}</p>
          <Headline tone="dark" className="max-w-3xl text-white">
            {t("liveTitle")}
          </Headline>
          <p className="mt-6 max-w-2xl lead text-ocean-100">{t("liveText")}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/living-in-the-west" variant="light">
              {t("liveCta")}
            </ButtonLink>
            <ButtonLink
              href="/living-in-the-west"
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
