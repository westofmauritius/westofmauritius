import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PlaceCard } from "@/components/content/PlaceCard";
import { PlaceGallery } from "@/components/content/PlaceGallery";
import { Prose } from "@/components/content/Prose";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SiteMap } from "@/components/map/SiteMap";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";
import { getPathname } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
import { getAreas } from "@/lib/content/areas";
import { getPlace, getPlaces } from "@/lib/content/places";
import { closedDays, formatDays } from "@/lib/opening-hours";
import { optimizableImage } from "@/lib/image-sizes";
import { localeAlternates } from "@/lib/seo/alternates";
import { ogImage } from "@/lib/seo/og-images";
import { openGraphBase } from "@/lib/seo/open-graph";
import { placeSchema } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/seo/urls";

type Props = PageProps<"/[locale]/places/[slug]">;

// Every place page is built ahead of time; unknown slugs are a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  const places = await getPlaces(routing.defaultLocale);
  return places.map((place) => ({ slug: place.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const place = await getPlace(slug, locale);
  if (!place) return {};
  return {
    title: place.name,
    description: place.seoDescription,
    alternates: localeAlternates(
      { pathname: "/places/[slug]", params: { slug } },
      locale,
    ),
    openGraph: {
      ...openGraphBase(locale),
      images: ogImage(locale, place.name, "places", slug),
      title: place.name,
      description: place.seoDescription,
      // Social networks need a photo (not an SVG); otherwise the generated image is used.
      ...(place.images[0] &&
        optimizableImage.test(place.images[0].src) && {
          images: [{ url: place.images[0].src, alt: place.images[0].alt }],
        }),
    },
    ...(place.placeholder && { robots: { index: false } }),
  };
}

export default async function PlacePage({ params }: Props) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const [place, areas, t] = await Promise.all([
    getPlace(slug, locale),
    getAreas(locale),
    getTranslations({ locale }),
  ]);
  if (!place) notFound();

  const area = areas.find((a) => a.slug === place.areaSlug)!;
  const nearby = (await getPlaces(locale, { area: area.slug }))
    .filter((p) => p.slug !== slug)
    .slice(0, 3);
  const href = { pathname: "/places/[slug]", params: { slug } } as const;
  const category = t(`Categories.${place.category}.one`);
  const closed = closedDays(place.openingHours);
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "long" });

  return (
    <>
      {place.placeholder && <PlaceholderNotice />}
      {!place.placeholder && (
        <JsonLd
          data={placeSchema(place, area.name, absoluteUrl(href, locale))}
        />
      )}

      <Container size="wide" className="pt-8">
        <Breadcrumbs
          locale={locale}
          label={t("Breadcrumbs.label")}
          items={[
            { label: t("Breadcrumbs.home"), href: "/" },
            { label: t("Pages.areas.title"), href: "/areas" },
            {
              label: area.name,
              href: { pathname: "/areas/[slug]", params: { slug: area.slug } },
            },
            { label: place.name, href },
          ]}
        />
      </Container>

      <Container size="wide" className="py-10">
        <p className="mb-4 eyebrow text-coral-600">
          {category} · {area.name}
        </p>
        <h1 className="max-w-4xl text-display-1">{place.name}</h1>
        {(place.featured || place.placeholder) && (
          <div className="mt-5 flex gap-2">
            {place.featured && (
              <Badge variant="featured">{t("Featured.label")}</Badge>
            )}
            {place.placeholder && (
              <Badge variant="placeholder">{t("Placeholder.label")}</Badge>
            )}
          </div>
        )}
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
          {place.summary}
        </p>
      </Container>

      <Container size="wide">
        {place.images.length > 0 ? (
          <PlaceGallery
            photos={place.images}
            labels={{
              open: t.raw("PlacePage.galleryOpen") as string,
              close: t("PlacePage.galleryClose"),
              previous: t("PlacePage.galleryPrevious"),
              next: t("PlacePage.galleryNext"),
              // Raw template: the gallery fills in {credit} per photo.
              photoBy: t.raw("PlacePage.photoBy") as string,
            }}
          />
        ) : (
          <Photo
            photo={null}
            fallbackTone={place.placeholderTone}
            fallbackLabel={place.name}
            aspect="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
            sizes="100vw"
          />
        )}
      </Container>

      <Container
        size="wide"
        className="grid gap-12 py-14 lg:grid-cols-[7fr_5fr]"
      >
        <Prose node={place.body} />

        {/* Practical details, beside the text on large screens. */}
        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-sm bg-sand-50 p-6 ring-1 ring-line">
            <h2 className="mb-6 eyebrow text-ink-muted">
              {t("PlacePage.details")}
            </h2>
            <dl className="space-y-6 text-sm">
              {place.address && (
                <div>
                  <dt className="font-medium">{t("PlacePage.address")}</dt>
                  <dd className="mt-1 text-ink-muted">
                    {place.address}, {area.name}
                  </dd>
                </div>
              )}

              <div>
                <dt className="font-medium">{t("PlacePage.openingHours")}</dt>
                <dd className="mt-1 text-ink-muted">
                  {place.openingHours.length > 0 ? (
                    <table className="w-full">
                      <tbody>
                        {place.openingHours.map((row, i) => (
                          <tr key={i}>
                            <th
                              scope="row"
                              className="py-0.5 pr-4 text-left font-normal"
                            >
                              {formatDays(row.days, locale)}
                            </th>
                            <td className="py-0.5 tabular-nums">
                              {row.opens}–{row.closes}
                            </td>
                          </tr>
                        ))}
                        {closed.length > 0 && (
                          <tr>
                            <th
                              scope="row"
                              className="py-0.5 pr-4 text-left font-normal"
                            >
                              {formatDays(closed, locale)}
                            </th>
                            <td className="py-0.5">{t("PlacePage.closed")}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  ) : (
                    t("PlacePage.hoursUnknown")
                  )}
                  {place.hoursNote && (
                    <p className="mt-2 italic">{place.hoursNote}</p>
                  )}
                </dd>
              </div>

              {place.phone && (
                <div>
                  <dt className="font-medium">{t("PlacePage.phone")}</dt>
                  <dd className="mt-1">
                    <a
                      href={`tel:${place.phone.replace(/\s/g, "")}`}
                      className="text-lagoon-700 hover:underline"
                    >
                      {place.phone}
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-8 flex flex-col gap-3">
              {/* A partner (affiliate) link takes the main button and is labelled as such. */}
              {place.affiliateUrl ? (
                <>
                  <a
                    href={place.affiliateUrl}
                    target="_blank"
                    rel="sponsored noopener"
                    className={buttonClass("accent")}
                  >
                    {t("PlacePage.book")}
                  </a>
                  <p className="text-xs text-ink-muted">
                    {t("PlacePage.partnerLink")}
                  </p>
                </>
              ) : (
                place.website && (
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener"
                    className={buttonClass("primary")}
                  >
                    {t("PlacePage.website")}
                  </a>
                )
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`}
                target="_blank"
                rel="noopener"
                className={buttonClass("outline")}
              >
                {t("PlacePage.directions")}
              </a>
            </div>

            <p className="mt-6 text-xs text-ink-muted">
              {place.lastVerified &&
                t("PlacePage.lastVerified", {
                  date: dateFormat.format(new Date(place.lastVerified)),
                }) + " "}
              {t("PlacePage.checkDetails")}
            </p>
          </div>

          <SiteMap
            name={place.name}
            center={place.location}
            zoom={15}
            markers={[
              {
                id: place.slug,
                lat: place.location.lat,
                lng: place.location.lng,
                label: place.name,
                href: getPathname({ href, locale }),
                highlight: true,
              },
            ]}
            className="aspect-[4/3]"
          />
        </aside>
      </Container>

      {nearby.length > 0 && (
        <section className="border-t border-line bg-sand-50 py-16">
          <Container size="wide">
            <h2 className="text-display-3">
              {t("PlacePage.moreIn", { area: area.name })}
            </h2>
            <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {nearby.map((p) => (
                <PlaceCard key={p.slug} place={p} areaName={area.name} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
