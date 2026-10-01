import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { GuideCard } from "@/components/content/GuideCard";
import { GuideThemes } from "@/components/content/GuideThemes";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { resolveLocale } from "@/i18n/locale";
import { getGuides } from "@/lib/content/guides";
import { localeAlternates } from "@/lib/seo/alternates";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/guides">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Pages.guides" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: localeAlternates("/guides", locale),
    openGraph: { title: t("title"), description: t("intro") },
  };
}

/** Guides start page: the five themes, then the latest guides. */
export default async function GuidesPage({
  params,
}: PageProps<"/[locale]/guides">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale });
  const guides = await getGuides(locale);

  return (
    <Container size="wide" className="py-12 sm:py-16">
      <SectionHeading
        as="h1"
        eyebrow={t("GuidesPage.eyebrow")}
        title={t("Pages.guides.title")}
        intro={t("Pages.guides.intro")}
      />

      <section className="mt-14">
        <h2 className="mb-6 eyebrow text-ink-muted">
          {t("GuidesPage.categoriesTitle")}
        </h2>
        <GuideThemes />
      </section>

      <section className="mt-16">
        <h2 className="text-display-3">{t("GuidesPage.latestTitle")}</h2>
        {guides.length > 0 ? (
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <GuideCard key={guide.key} guide={guide} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-ink-muted">{t("GuidesPage.noGuides")}</p>
        )}
      </section>
    </Container>
  );
}
