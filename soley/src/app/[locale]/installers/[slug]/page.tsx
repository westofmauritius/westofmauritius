import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Stars } from "@/components/directory/Stars";
import { VerifiedBadge } from "@/components/directory/VerifiedBadge";
import { JsonLd } from "@/components/seo/JsonLd";
import { Alert, Badge, ButtonLink, Card, Container } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { formatDate, formatNumber } from "@/lib/format";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { getDirectoryEntry } from "@/lib/services/directory";

// Profiles change when admins approve installers or publish reviews.
export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/installers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const entry = await getDirectoryEntry(slug).catch(() => null);
  if (!entry) return {};
  const t = await getTranslations({ locale, namespace: "directory" });
  const description =
    (locale === "fr"
      ? entry.installer.description_fr
      : entry.installer.description_en) ?? t("badgeHint");
  return pageMetadata({
    locale,
    href: { pathname: "/installers/[slug]", params: { slug } },
    title: `${entry.installer.company_name}: ${t("badge")}`,
    description: description.slice(0, 160),
    // Demo companies must never be indexed.
    noindex: entry.installer.is_demo,
  });
}

export default async function InstallerProfile({
  params,
}: PageProps<"/[locale]/installers/[slug]">) {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const entry = await getDirectoryEntry(slug).catch(() => null);
  if (!entry) notFound();
  const { installer, regions, rating, reviewCount, reviews } = entry;
  const t = await getTranslations("directory");
  const tr = await getTranslations("regions");
  const tc = await getTranslations("common");
  const description =
    (locale === "fr" ? installer.description_fr : installer.description_en) ??
    installer.description_en ??
    installer.description_fr;

  return (
    <Container narrow className="py-10 sm:py-14">
      {!installer.is_demo && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: installer.company_name,
            url: absoluteUrl(
              { pathname: "/installers/[slug]", params: { slug } },
              locale,
            ),
            ...(installer.website ? { sameAs: [installer.website] } : {}),
            ...(description ? { description } : {}),
            areaServed: regions.map((r) => ({
              "@type": "AdministrativeArea",
              name: tr(r),
            })),
            address: {
              "@type": "PostalAddress",
              addressCountry: "MU",
              ...(installer.address
                ? { streetAddress: installer.address }
                : {}),
            },
            ...(rating !== null
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: Math.round(rating * 10) / 10,
                    reviewCount,
                    bestRating: 5,
                    worstRating: 1,
                  },
                  review: reviews.slice(0, 5).map((r) => ({
                    "@type": "Review",
                    reviewRating: {
                      "@type": "Rating",
                      ratingValue: r.rating,
                      bestRating: 5,
                    },
                    author: { "@type": "Person", name: r.author_display_name },
                    datePublished: r.created_at.slice(0, 10),
                    reviewBody: r.body,
                  })),
                }
              : {}),
          }}
        />
      )}
      <Link
        href="/installers"
        className="inline-flex min-h-11 items-center font-semibold text-ocean-600 underline underline-offset-4"
      >
        ← {t("back")}
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <VerifiedBadge />
        {installer.is_demo && <Badge tone="warning">{tc("demoNotice")}</Badge>}
      </div>
      <h1 className="mt-3 text-4xl">{installer.company_name}</h1>
      <p className="mt-2">
        {rating === null ? (
          <span className="text-ink-muted">{t("noReviews")}</span>
        ) : (
          <Stars
            rating={rating}
            label={t("rating", {
              rating: formatNumber(rating, locale),
              count: reviewCount,
            })}
          />
        )}
      </p>
      {!installer.active && (
        <Alert tone="info" className="mt-4">
          {t("paused")}
        </Alert>
      )}

      <Card className="mt-8 space-y-3">
        <h2 className="text-xl">{t("about")}</h2>
        {description && <p className="whitespace-pre-line">{description}</p>}
        <p>
          <span className="font-semibold">{t("regions")}:</span>{" "}
          {regions.map((r) => tr(r)).join(", ")}
        </p>
        {installer.certifications.length > 0 && (
          <p>
            <span className="font-semibold">{t("certifications")}:</span>{" "}
            {installer.certifications.join(", ")}
          </p>
        )}
        {installer.years_in_business !== null && (
          <p>{t("years", { years: installer.years_in_business })}</p>
        )}
        {installer.website && (
          <p>
            <a
              href={installer.website}
              rel="nofollow noopener"
              target="_blank"
              className="font-semibold text-ocean-600 underline"
            >
              {t("website")}
            </a>
          </p>
        )}
      </Card>

      <section aria-labelledby="reviews" className="mt-10">
        <h2 id="reviews" className="text-2xl">
          {t("reviewsTitle")}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">{t("reviewsNote")}</p>
        {reviews.length === 0 ? (
          <p className="mt-4 text-ink-muted">{t("noReviews")}</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {reviews.map((review) => (
              <Card as="li" key={review.id}>
                <Stars rating={review.rating} label={`${review.rating} / 5`} />
                {review.title && (
                  <h3 className="mt-2 text-lg">{review.title}</h3>
                )}
                <p className="mt-2 whitespace-pre-line">{review.body}</p>
                <p className="mt-2 text-sm text-ink-muted">
                  {review.author_display_name},{" "}
                  {formatDate(review.created_at, locale)}
                  {review.is_demo && (
                    <Badge tone="warning" className="ml-2">
                      {tc("demo")}
                    </Badge>
                  )}
                </p>
              </Card>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-12 rounded-card bg-sun-100 p-6">
        <p>{t("ctaNote")}</p>
        <ButtonLink href="/get-quotes" size="lg" className="mt-4">
          {t("cta")}
        </ButtonLink>
      </div>
    </Container>
  );
}
