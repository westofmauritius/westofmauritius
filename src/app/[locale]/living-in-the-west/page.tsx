import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LivingCard } from "@/components/content/LivingCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/Link";
import { resolveLocale } from "@/i18n/locale";
import { getAreas } from "@/lib/content/areas";
import { getLivingArticles } from "@/lib/content/living";
import type { LivingArticle } from "@/lib/content/types";
import { localeAlternates } from "@/lib/seo/alternates";
import { openGraphBase } from "@/lib/seo/open-graph";
import { seoTitle } from "@/lib/seo/titles";
import { brandName } from "@/lib/site";

type Props = PageProps<"/[locale]/living-in-the-west">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Pages.live" });
  return {
    title: seoTitle(t("metaTitle"), brandName[locale]),
    description: t("intro"),
    alternates: localeAlternates("/living-in-the-west", locale),
    openGraph: {
      ...openGraphBase(locale),
      title: t("metaTitle"),
      description: t("intro"),
    },
  };
}

/**
 * The "Living in the West" hub: every page for people moving to the west
 * coast, one click away. The order follows how people decide: the big
 * questions, then the areas, then comparisons, then how buying works. Each
 * block links deep (area pages jump straight to their Living section), so
 * the hub passes its weight to the pages that answer specific searches.
 */
export default async function LivingInTheWestPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const [t, articles, areas] = await Promise.all([
    getTranslations({ locale }),
    getLivingArticles(locale),
    getAreas(locale),
  ]);
  const ofKind = (kind: LivingArticle["kind"]) =>
    articles.filter((a) => a.kind === kind);
  const questions = ofKind("question");
  const comparisons = ofKind("comparison");
  const buying = [...ofKind("general"), ...ofKind("scheme")];
  const areaGuides = ofKind("area");
  const audiences = ["Abroad", "Home", "Invest"] as const;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ocean-900 text-white">
        <div
          aria-hidden="true"
          className="absolute -top-32 right-0 -z-10 size-[32rem] rounded-full bg-coral-500/25 blur-3xl"
        />
        <Container size="wide" className="pt-8">
          <Breadcrumbs
            locale={locale}
            label={t("Breadcrumbs.label")}
            tone="light"
            items={[
              { label: t("Breadcrumbs.home"), href: "/" },
              { label: t("Pages.live.title"), href: "/living-in-the-west" },
            ]}
          />
        </Container>
        <Container size="wide" className="py-16 sm:py-24">
          <p className="mb-5 eyebrow text-coral-200">{t("LivePage.eyebrow")}</p>
          <h1 className="max-w-3xl text-display-1 text-white">
            {t("Pages.live.title")}
          </h1>
          <p className="mt-6 max-w-2xl lead text-ocean-100">
            {t("Pages.live.intro")}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink
              href={{
                pathname: "/living-in-the-west/enquire",
                query: { source: "living-hub-hero" },
              }}
              variant="light"
              data-umami-event="cta-enquire"
              data-umami-event-position="living-hub-hero"
            >
              {t("LivePage.heroShortlist")}
            </ButtonLink>
            <ButtonLink
              href="/living-in-the-west/find-your-area"
              variant="outlineLight"
              data-umami-event="cta-quiz"
              data-umami-event-position="living-hub-hero"
            >
              {t("Quiz.cta")}
            </ButtonLink>
          </div>
        </Container>
      </section>

      {questions.length > 0 && (
        <ArticleGrid
          title={t("LivePage.questionsTitle")}
          intro={t("LivePage.questionsIntro")}
          articles={questions}
        />
      )}

      <section
        id="areas"
        className="scroll-mt-20 border-t border-line bg-sand-50 py-16 sm:py-20"
      >
        <Container size="wide">
          <SectionHeading
            title={t("LivePage.areasLivingTitle")}
            intro={t("LivePage.areasLivingIntro")}
          />
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3">
            {areas.map((area) => (
              <li key={area.slug}>
                <Link
                  href={{
                    pathname: "/areas/[slug]",
                    params: { slug: area.slug },
                  }}
                  // Straight to the Living section of the area page.
                  hash="living"
                  className="group block"
                >
                  <div className="overflow-hidden rounded-sm">
                    <Photo
                      photo={area.hero}
                      fallbackTone={area.placeholderTone}
                      fallbackLabel={area.name}
                      aspect="aspect-[4/3]"
                      sizes="(min-width: 1024px) 33vw, 50vw"
                      className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="mt-3 font-display text-xl group-hover:underline sm:text-2xl">
                    {t("AreaPage.livingLink", { name: area.name })}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {comparisons.length > 0 && (
        <ArticleGrid
          title={t("LivePage.compareTitle")}
          intro={t("LivePage.compareIntro")}
          articles={comparisons}
        />
      )}

      <Container size="wide" className="border-t border-line py-16 sm:py-20">
        <h2 className="mb-8 eyebrow text-ink-muted">
          {t("LivePage.audienceTitle")}
        </h2>
        <ul className="grid gap-10 md:grid-cols-3">
          {audiences.map((key) => (
            <li key={key} className="border-t border-line pt-6">
              <h3 className="text-2xl">{t(`LivePage.audience${key}`)}</h3>
              <p className="mt-3 leading-relaxed text-ink-muted">
                {t(`LivePage.audience${key}Text`)}
              </p>
            </li>
          ))}
        </ul>
      </Container>

      {buying.length > 0 && (
        <ArticleGrid
          title={t("LivePage.buyingTitle")}
          intro={t("LivePage.buyingIntro")}
          articles={buying}
          tinted
        />
      )}

      {areaGuides.length > 0 && (
        <section className="py-16 sm:py-20">
          <Container size="wide">
            <SectionHeading
              title={t("LivePage.areasTitle")}
              intro={t("LivePage.areasIntro")}
            />
            <ul className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {areaGuides.map((a) => (
                <li key={a.key} className="border-t border-line pt-4">
                  <Link
                    href={{
                      pathname: "/living-in-the-west/[slug]",
                      params: { slug: a.slug },
                    }}
                    className="font-display text-xl hover:text-coral-600"
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* The footer below carries the newsletter, so this band is only
          the shortlist: one clear next step. */}
      <section className="bg-sand-100 py-20 sm:py-24">
        <Container size="prose" className="text-center">
          <h2 className="text-display-2">{t("LivePage.enquireTitle")}</h2>
          <p className="mt-5 lead text-ink-muted">
            {t("LivePage.enquireText")}
          </p>
          <ButtonLink
            href={{
              pathname: "/living-in-the-west/enquire",
              query: { source: "living-hub-bottom" },
            }}
            variant="accent"
            className="mt-8"
            data-umami-event="cta-enquire"
            data-umami-event-position="living-hub-bottom"
          >
            {t("LivePage.enquireCta")}
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}

function ArticleGrid({
  title,
  intro,
  articles,
  tinted,
}: {
  title: string;
  intro: string;
  articles: LivingArticle[];
  tinted?: boolean;
}) {
  return (
    <section
      className={`border-t border-line py-16 sm:py-20 ${tinted ? "bg-sand-50" : ""}`}
    >
      <Container size="wide">
        <SectionHeading title={title} intro={intro} />
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <li key={a.key}>
              <LivingCard article={a} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
