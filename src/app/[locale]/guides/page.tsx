import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { GuideCard } from "@/components/content/GuideCard";
import { Container } from "@/components/ui/Container";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { getGuides } from "@/lib/content/guides";
import { guideCategories, guideCategoryKeys } from "@/lib/guide-categories";
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
        {/* Scrolls sideways on phones, a row of five on large screens. */}
        <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {guideCategoryKeys.map((key) => (
            <li key={key} className="w-64 shrink-0 snap-start sm:w-auto">
              <Link
                href={{
                  pathname: "/guides/[category]",
                  params: { category: guideCategories[key].slug[locale] },
                }}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-sm">
                  <PlaceholderImage
                    tone={guideCategories[key].tone}
                    aspect="aspect-[3/4]"
                    className="transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  {/* Dark fade behind the title keeps white text readable on light images. */}
                  <span className="absolute inset-x-0 top-0 bg-linear-to-b from-ocean-950/55 to-transparent p-5 pb-12 font-display text-3xl text-white">
                    {t(`GuideCategories.${key}.title`)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {t(`GuideCategories.${key}.intro`)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
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
