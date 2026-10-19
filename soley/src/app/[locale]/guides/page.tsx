import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { guidesIn } from "@content/guides";
import { ButtonLink, Card, Container, SectionHeading } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/guides">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "guides" });
  return pageMetadata({
    locale,
    href: "/guides",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function GuidesPage({
  params,
}: PageProps<"/[locale]/guides">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations("guides");
  return (
    <Container className="py-10 sm:py-14">
      <SectionHeading as="h1" title={t("title")} intro={t("intro")} />
      <ul className="mt-10 grid gap-4 md:grid-cols-2">
        <Card as="li" className="flex flex-col gap-2 border-sun-400 bg-sun-50">
          <h2 className="text-xl">{t("grantCard")}</h2>
          <p className="text-ink-muted">{t("grantCardBody")}</p>
          <Link
            href="/grant-guide"
            className="mt-auto inline-flex min-h-11 items-center font-semibold text-ocean-600 underline underline-offset-4"
          >
            {t("read")}
          </Link>
        </Card>
        {guidesIn(locale).map(({ guide, version }) => (
          <Card as="li" key={guide.key} className="flex flex-col gap-2">
            <h2 className="text-xl">{version.title}</h2>
            <p className="text-ink-muted">{version.description}</p>
            <p className="text-sm text-ink-muted">
              {t("reviewed", { date: formatDate(guide.reviewed, locale) })}
            </p>
            <Link
              href={{
                pathname: "/guides/[slug]",
                params: { slug: version.slug },
              }}
              aria-label={`${t("read")}: ${version.title}`}
              className="mt-auto inline-flex min-h-11 items-center font-semibold text-ocean-600 underline underline-offset-4"
            >
              {t("read")}
            </Link>
          </Card>
        ))}
      </ul>
      <div className="mt-12 rounded-card bg-sun-100 p-8 text-center">
        <h2 className="text-2xl">{t("ctaTitle")}</h2>
        <ButtonLink href="/get-quotes" size="lg" className="mt-4">
          {t("ctaButton")}
        </ButtonLink>
      </div>
    </Container>
  );
}
