import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { findGuide, guidesIn } from "@content/guides";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink, Container } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { routing, type Locale } from "@/i18n/routing";
import { formatDate } from "@/lib/format";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  return guidesIn(params.locale as Locale).map(({ version }) => ({
    slug: version.slug,
  }));
}

/** The guide's address in every language it exists in (for hreflang). */
function hrefsFor(guide: NonNullable<ReturnType<typeof findGuide>>["guide"]) {
  return Object.fromEntries(
    routing.locales
      .filter((l) => guide.versions[l])
      .map((l) => [
        l,
        {
          pathname: "/guides/[slug]" as const,
          params: { slug: guide.versions[l]!.slug },
        },
      ]),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const found = findGuide(locale, slug);
  if (!found) return {};
  const metadata = await pageMetadata({
    locale,
    hrefs: hrefsFor(found.guide),
    title: found.version.title,
    description: found.version.description,
  });
  return { ...metadata, openGraph: { ...metadata.openGraph, type: "article" } };
}

export default async function GuidePage({
  params,
}: PageProps<"/[locale]/guides/[slug]">) {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const found = findGuide(locale, slug);
  if (!found) notFound();
  const { guide, version } = found;
  const { default: Body } = await version.load();
  const t = await getTranslations("guides");
  const url = absoluteUrl(
    { pathname: "/guides/[slug]", params: { slug } },
    locale,
  );

  return (
    <Container narrow className="py-10 sm:py-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: version.title,
          description: version.description,
          inLanguage: locale,
          dateModified: guide.reviewed,
          mainEntityOfPage: url,
          publisher: {
            "@type": "Organization",
            name: site.name,
            url: site.url,
          },
        }}
      />
      <Link
        href="/guides"
        className="inline-flex min-h-11 items-center font-semibold text-ocean-600 underline underline-offset-4"
      >
        ← {t("back")}
      </Link>
      <article className="mt-4">
        <h1 className="text-4xl">{version.title}</h1>
        <p className="mt-3 text-sm text-ink-muted">
          {t("reviewed", { date: formatDate(guide.reviewed, locale) })}
        </p>
        <div className="prose mt-8">
          <Body />
        </div>
      </article>
      <div className="mt-12 rounded-card bg-sun-100 p-6 sm:p-8">
        <h2 className="text-2xl">{t("ctaTitle")}</h2>
        <ButtonLink href="/get-quotes" size="lg" className="mt-4">
          {t("ctaButton")}
        </ButtonLink>
      </div>
    </Container>
  );
}
