import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Stars } from "@/components/directory/Stars";
import { VerifiedBadge } from "@/components/directory/VerifiedBadge";
import {
  Alert,
  Badge,
  ButtonLink,
  Card,
  Container,
  SectionHeading,
  SelectField,
} from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { formatNumber } from "@/lib/format";
import { isRegion, regions } from "@/lib/regions";
import { pageMetadata } from "@/lib/seo";
import { listDirectory } from "@/lib/services/directory";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/installers">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "directory" });
  return pageMetadata({
    locale,
    href: "/installers",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function InstallersPage({
  params,
  searchParams,
}: PageProps<"/[locale]/installers">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations("directory");
  const tr = await getTranslations("regions");
  const tc = await getTranslations("common");
  const { region } = await searchParams;
  const selected = isRegion(region) ? region : undefined;
  const all = await listDirectory().catch(() => []);
  const entries = selected
    ? all.filter((e) => e.regions.includes(selected))
    : all;

  return (
    <Container className="py-10 sm:py-14">
      <SectionHeading as="h1" title={t("title")} intro={t("intro")} />

      {/* A plain GET form: the filter works without JavaScript and can be shared. */}
      <form method="get" className="mt-8 flex flex-wrap items-end gap-3">
        <SelectField
          name="region"
          label={t("filter")}
          defaultValue={selected ?? ""}
          placeholder={t("allRegions")}
          options={regions.map((r) => ({ value: r, label: tr(r) }))}
          className="min-w-60"
        />
        <button
          type="submit"
          className="min-h-12 rounded-full bg-ocean-800 px-5 font-semibold text-white"
        >
          {t("apply")}
        </button>
      </form>

      {entries.length === 0 ? (
        <Alert tone="info" className="mt-8">
          {all.length === 0 ? t("emptyAll") : t("empty")}
        </Alert>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {entries.map(
            ({ installer, regions: covered, rating, reviewCount }) => (
              <Card as="li" key={installer.id} className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <VerifiedBadge />
                  {installer.is_demo && (
                    <Badge tone="warning">{tc("demo")}</Badge>
                  )}
                </div>
                <h2 className="text-xl">{installer.company_name}</h2>
                <p className="text-sm">
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
                <p className="text-sm">
                  <span className="font-semibold">{t("regions")}:</span>{" "}
                  {covered.map((r) => tr(r)).join(", ")}
                </p>
                {installer.years_in_business !== null && (
                  <p className="text-sm text-ink-muted">
                    {t("years", { years: installer.years_in_business })}
                  </p>
                )}
                {!installer.active && (
                  <p className="text-sm text-ink-muted">{t("paused")}</p>
                )}
                <Link
                  href={{
                    pathname: "/installers/[slug]",
                    params: { slug: installer.slug },
                  }}
                  aria-label={`${t("profile")}: ${installer.company_name}`}
                  className="mt-auto inline-flex min-h-11 items-center font-semibold text-ocean-600 underline underline-offset-4"
                >
                  {t("profile")}
                </Link>
              </Card>
            ),
          )}
        </ul>
      )}

      <div className="mt-12 rounded-card bg-sun-100 p-6 sm:p-8">
        <p className="max-w-2xl">{t("ctaNote")}</p>
        <ButtonLink href="/get-quotes" size="lg" className="mt-4">
          {t("cta")}
        </ButtonLink>
      </div>
    </Container>
  );
}
