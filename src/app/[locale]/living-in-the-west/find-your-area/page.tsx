import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AreaQuiz } from "@/components/quiz/AreaQuiz";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { Link } from "@/i18n/Link";
import { resolveLocale } from "@/i18n/locale";
import { getAreas } from "@/lib/content/areas";
import { inPlace } from "@/lib/place-names";
import { quizQuestions } from "@/lib/quiz";
import { localeAlternates } from "@/lib/seo/alternates";
import { openGraphBase } from "@/lib/seo/open-graph";
import { seoTitle } from "@/lib/seo/titles";
import { brandName } from "@/lib/site";

type Props = PageProps<"/[locale]/living-in-the-west/find-your-area">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Quiz" });
  return {
    title: seoTitle(t("metaTitle"), brandName[locale]),
    description: t("intro"),
    alternates: localeAlternates("/living-in-the-west/find-your-area", locale),
    openGraph: {
      ...openGraphBase(locale),
      title: t("metaTitle"),
      description: t("intro"),
    },
  };
}

/**
 * The village quiz. Each result panel is built here on the server (photo,
 * the area's own intro, a link to its Living section and a shortlist with
 * the area filled in), and the small client component only chooses which
 * one to show.
 */
export default async function FindYourAreaPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const [t, areas] = await Promise.all([
    getTranslations({ locale }),
    getAreas(locale),
  ]);
  // The question texts in messages/*.json, keyed like src/lib/quiz.ts.
  const qt = await getTranslations({ locale, namespace: "Quiz.questions" });
  const text = (key: string) => qt(key as Parameters<typeof qt>[0]);

  const results = Object.fromEntries(
    areas.map((area) => [
      area.slug,
      <article
        key={area.slug}
        className="grid gap-8 rounded-2xl bg-sand-50 p-6 sm:p-8 lg:grid-cols-[5fr_6fr] lg:items-center"
      >
        <Photo
          photo={area.hero}
          fallbackTone={area.placeholderTone}
          fallbackLabel={area.name}
          aspect="aspect-[4/3]"
          sizes="(min-width: 1024px) 40vw, 100vw"
        />
        <div>
          <p className="mb-3 eyebrow">{t("Quiz.match")}</p>
          <h2 className="type-h2">{area.name}</h2>
          <p className="mt-4 leading-relaxed text-ink-muted">{area.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink
              href={{
                pathname: "/living-in-the-west/enquire",
                query: { area: area.slug, source: "quiz" },
              }}
              variant="accent"
              data-umami-event="cta-enquire"
              data-umami-event-position="quiz"
            >
              {t("Quiz.shortlist", { name: inPlace(area.name, locale) })}
            </ButtonLink>
            <Link
              href={{ pathname: "/areas/[slug]", params: { slug: area.slug } }}
              hash="living"
              className="inline-flex min-h-11 items-center px-2 text-small font-medium text-lagoon-700 hover:underline"
            >
              {t("Quiz.living", { name: inPlace(area.name, locale) })} →
            </Link>
          </div>
        </div>
      </article>,
    ]),
  );

  return (
    <>
      <Container size="wide" className="pt-8">
        <Breadcrumbs
          locale={locale}
          label={t("Breadcrumbs.label")}
          items={[
            { label: t("Breadcrumbs.home"), href: "/" },
            { label: t("Pages.live.title"), href: "/living-in-the-west" },
            {
              label: t("Quiz.title"),
              href: "/living-in-the-west/find-your-area",
            },
          ]}
        />
      </Container>
      <Container size="prose" className="py-14 sm:py-20">
        <p className="mb-5 eyebrow">{t("Quiz.eyebrow")}</p>
        <h1 className="type-h1">{t("Quiz.title")}</h1>
        <p className="mt-6 lead text-ink-muted">{t("Quiz.intro")}</p>
        <div className="mt-14">
          <AreaQuiz
            questions={quizQuestions.map((question) => ({
              id: question.id,
              legend: text(`${question.id}.legend`),
              options: question.options.map((o) => ({
                id: o.id,
                label: text(`${question.id}.options.${o.id}`),
              })),
            }))}
            order={areas.map((a) => a.slug)}
            results={results}
            labels={{
              submit: t("Quiz.submit"),
              missing: t("Quiz.missing"),
              again: t("Quiz.again"),
            }}
          />
        </div>
      </Container>
    </>
  );
}
