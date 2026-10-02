import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Byline } from "@/components/author/Byline";
import { EnquiryCta } from "@/components/content/EnquiryCta";
import { GuideCard } from "@/components/content/GuideCard";
import { PlaceCard } from "@/components/content/PlaceCard";
import { Prose } from "@/components/content/Prose";
import { Sources } from "@/components/content/Sources";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";
import { Link } from "@/i18n/Link";
import { resolveLocale } from "@/i18n/locale";
import type { Locale } from "@/i18n/routing";
import { getAreas } from "@/lib/content/areas";
import { getAuthor } from "@/lib/content/author";
import { getGuide, getGuides } from "@/lib/content/guides";
import { getPlaces } from "@/lib/content/places";
import type { Guide } from "@/lib/content/types";
import { categoryFromSlug, guideCategories } from "@/lib/guide-categories";
import { localeAlternates } from "@/lib/seo/alternates";
import { ogImage } from "@/lib/seo/og-images";
import { openGraphBase } from "@/lib/seo/open-graph";
import { articleSchema } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/seo/urls";
import { brandName } from "@/lib/site";

type Props = PageProps<"/[locale]/guides/[category]/[slug]">;

export const dynamicParams = false;

// One page per guide and language, each under its own translated URL.
// Generates both [category] and [slug]: the category page above is a page,
// not a layout, so its params are not passed down to this function.
export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as Locale;
  const guides = await getGuides(locale);
  return guides.map((guide) => ({
    category: guideCategories[guide.category].slug[locale],
    slug: guide.slug,
  }));
}

/** The guide's internal route in a given language. */
function guideHref(guide: Guide, locale: Locale) {
  return {
    pathname: "/guides/[category]/[slug]" as const,
    params: {
      category: guideCategories[guide.category].slug[locale],
      slug: guide.slugs[locale],
    },
  };
}

async function load(params: Props["params"]) {
  const locale = await resolveLocale(params);
  const { category, slug } = await params;
  const key = categoryFromSlug(category, locale);
  const guide = key && (await getGuide(locale, key, slug));
  if (!guide) notFound();
  return { locale, guide };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, guide } = await load(params);
  return {
    title: guide.title,
    description: guide.seoDescription,
    alternates: localeAlternates((l) => guideHref(guide, l), locale),
    openGraph: {
      ...openGraphBase(locale),
      images: ogImage(locale, guide.title, "guides", guide.category, guide.key),
      type: "article",
      title: guide.title,
      description: guide.seoDescription,
      ...(guide.publishedAt && { publishedTime: guide.publishedAt }),
      ...(guide.updatedAt && { modifiedTime: guide.updatedAt }),
    },
    ...(guide.placeholder && { robots: { index: false } }),
  };
}

export default async function GuidePage({ params }: Props) {
  const { locale, guide } = await load(params);
  const [t, allPlaces, areas, sameCategory, author] = await Promise.all([
    getTranslations({ locale }),
    getPlaces(locale),
    getAreas(locale),
    getGuides(locale, { category: guide.category }),
    getAuthor(locale),
  ]);

  // Keep the order chosen in the editor.
  const places = guide.placeSlugs
    .map((slug) => allPlaces.find((p) => p.slug === slug))
    .filter((p) => p !== undefined);
  const guideAreas = areas.filter((a) => guide.areaSlugs.includes(a.slug));
  const areaName = (slug: string) =>
    areas.find((a) => a.slug === slug)?.name ?? slug;
  const more = sameCategory.filter((g) => g.key !== guide.key).slice(0, 3);

  const categoryTitle = t(`GuideCategories.${guide.category}.title`);
  const categorySlug = guideCategories[guide.category].slug[locale];
  const url = absoluteUrl(guideHref(guide, locale), locale);

  return (
    <>
      {guide.placeholder && <PlaceholderNotice />}
      {!guide.placeholder && (
        <JsonLd
          data={articleSchema(guide, url, {
            locale,
            brand: brandName[locale],
            author,
            mentions: places.map((p) => ({
              name: p.name,
              url: absoluteUrl(
                { pathname: "/places/[slug]", params: { slug: p.slug } },
                locale,
              ),
            })),
          })}
        />
      )}

      <Container size="wide" className="pt-8">
        <Breadcrumbs
          locale={locale}
          label={t("Breadcrumbs.label")}
          items={[
            { label: t("Breadcrumbs.home"), href: "/" },
            { label: t("Pages.guides.title"), href: "/guides" },
            {
              label: categoryTitle,
              href: {
                pathname: "/guides/[category]",
                params: { category: categorySlug },
              },
            },
            { label: guide.title, href: guideHref(guide, locale) },
          ]}
        />
      </Container>

      {/* Article header: centred, like a magazine feature. */}
      <header className="py-12 text-center sm:py-16">
        <Container size="prose">
          <p className="mb-5 eyebrow text-coral-600">{categoryTitle}</p>
          <h1 className="text-display-1">{guide.title}</h1>
          {guide.excerpt && (
            <p className="mt-6 lead text-ink-muted">{guide.excerpt}</p>
          )}
          <Byline
            locale={locale}
            publishedAt={guide.publishedAt}
            updatedAt={guide.updatedAt}
            align="center"
            className="mt-8"
          />
        </Container>
      </header>

      <Container size="wide">
        <Photo
          photo={guide.hero}
          fallbackTone={guide.placeholderTone}
          fallbackLabel={guide.title}
          aspect="aspect-[4/3] sm:aspect-[21/9]"
          sizes="100vw"
          priority
        />
      </Container>

      <Container size="prose" className="py-14">
        <Prose node={guide.body} locale={locale} />
        <Sources sources={guide.sources} locale={locale} className="mt-12" />
        <EnquiryCta position={`guide-${guide.key}`} className="mt-12" />

        {guideAreas.length > 0 && (
          <div className="mt-12 border-t border-line pt-8">
            <h2 className="mb-4 eyebrow text-ink-muted">
              {t("GuidePage.areasTitle")}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {guideAreas.map((area) => (
                <li key={area.slug}>
                  <Link
                    href={{
                      pathname: "/areas/[slug]",
                      params: { slug: area.slug },
                    }}
                    className="inline-block rounded-full border border-line px-4 py-2 text-sm hover:border-ocean-900"
                  >
                    {area.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>

      {places.length > 0 && (
        <section className="border-t border-line bg-sand-50 py-16">
          <Container size="wide">
            <h2 className="text-display-3">{t("GuidePage.placesTitle")}</h2>
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
              {places.map((place) => (
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

      {more.length > 0 && (
        <section className="py-16">
          <Container size="wide">
            <h2 className="text-display-3">
              {t("GuidePage.moreTitle", { category: categoryTitle })}
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
              {more.map((g) => (
                <GuideCard key={g.key} guide={g} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
