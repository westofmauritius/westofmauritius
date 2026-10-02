import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Byline } from "@/components/author/Byline";
import { EnquiryCta } from "@/components/content/EnquiryCta";
import { LivingCard } from "@/components/content/LivingCard";
import { Faq } from "@/components/content/Faq";
import { Prose } from "@/components/content/Prose";
import { Sources } from "@/components/content/Sources";
import { SummaryTable } from "@/components/content/SummaryTable";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";
import { Link } from "@/i18n/Link";
import { resolveLocale } from "@/i18n/locale";
import type { Locale } from "@/i18n/routing";
import { getAreas } from "@/lib/content/areas";
import { getAuthor } from "@/lib/content/author";
import { getLivingArticle, getLivingArticles } from "@/lib/content/living";
import type { LivingArticle } from "@/lib/content/types";
import { localeAlternates } from "@/lib/seo/alternates";
import { ogImage } from "@/lib/seo/og-images";
import { openGraphBase } from "@/lib/seo/open-graph";
import { seoTitle } from "@/lib/seo/titles";
import { faqSchema, livingArticleSchema } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/seo/urls";
import { brandName } from "@/lib/site";

type Props = PageProps<"/[locale]/living-in-the-west/[slug]">;

export const dynamicParams = false;

// One page per article and language, each under its translated URL.
export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const articles = await getLivingArticles(params.locale as Locale);
  return articles.map((a) => ({ slug: a.slug }));
}

const articleHref = (article: LivingArticle, locale: Locale) => ({
  pathname: "/living-in-the-west/[slug]" as const,
  params: { slug: article.slugs[locale] },
});

async function load(params: Props["params"]) {
  const locale = await resolveLocale(params);
  const article = await getLivingArticle(locale, (await params).slug);
  if (!article) notFound();
  return { locale, article };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, article } = await load(params);
  return {
    title: seoTitle(article.title, brandName[locale]),
    description: article.seoDescription,
    alternates: localeAlternates((l) => articleHref(article, l), locale),
    openGraph: {
      ...openGraphBase(locale),
      images: ogImage(locale, article.title, "living", article.key),
      type: "article",
      title: article.title,
      description: article.seoDescription,
    },
    ...(article.placeholder && { robots: { index: false } }),
  };
}

/** Articles that help people deciding where to live, rather than buyers. */
const decidingKinds = new Set(["question", "comparison", "area"]);

export default async function LivingArticlePage({ params }: Props) {
  const { locale, article } = await load(params);
  const [t, all, areas, author] = await Promise.all([
    getTranslations({ locale }),
    getLivingArticles(locale),
    getAreas(locale),
    getAuthor(locale),
  ]);
  const area = areas.find((a) => a.slug === article.areaSlug);
  const aboutAreas = areas.filter(
    (a) =>
      article.relatedAreaSlugs.includes(a.slug) || a.slug === article.areaSlug,
  );
  // Related reading: same kind first, then anything sharing an area.
  const related = [
    ...all.filter((a) => a.kind === article.kind),
    ...all.filter((a) =>
      a.relatedAreaSlugs.some((s) => article.relatedAreaSlugs.includes(s)),
    ),
  ]
    .filter((a, i, list) => a.key !== article.key && list.indexOf(a) === i)
    .slice(0, 3);
  const url = absoluteUrl(articleHref(article, locale), locale);

  return (
    <>
      {article.placeholder && <PlaceholderNotice />}
      {!article.placeholder && (
        <JsonLd
          data={livingArticleSchema(article, url, {
            locale,
            brand: brandName[locale],
            author,
          })}
        />
      )}
      {!article.placeholder && article.faqs.length > 0 && (
        <JsonLd data={faqSchema(article.faqs)} />
      )}

      <Container size="wide" className="pt-8">
        <Breadcrumbs
          locale={locale}
          label={t("Breadcrumbs.label")}
          items={[
            { label: t("Breadcrumbs.home"), href: "/" },
            { label: t("Pages.live.title"), href: "/living-in-the-west" },
            { label: article.title, href: articleHref(article, locale) },
          ]}
        />
      </Container>

      <Container
        size="wide"
        className="grid gap-12 py-12 lg:grid-cols-[8fr_4fr] lg:gap-16"
      >
        <div className="min-w-0">
          <p className="mb-5 eyebrow text-coral-600">
            {t(`LiveArticle.kinds.${article.kind}`)}
          </p>
          <h1 className="text-display-1">{article.title}</h1>
          {article.excerpt && (
            <p className="mt-6 lead text-ink-muted">{article.excerpt}</p>
          )}
          <Byline
            locale={locale}
            publishedAt={article.publishedAt}
            updatedAt={article.updatedAt}
            className="mt-8"
          />

          {/* The answer first: people (and search engines) want it before the detail. */}
          {article.shortAnswer && (
            <div className="mt-10 border-l-4 border-lagoon-500 bg-lagoon-50 px-6 py-6 sm:px-8">
              <h2 className="eyebrow text-lagoon-800">
                {t("AreaLiving.shortAnswer")}
              </h2>
              <p className="mt-3 font-display text-2xl leading-snug">
                {article.shortAnswer}
              </p>
            </div>
          )}

          <Prose node={article.body} locale={locale} className="mt-12" />

          {article.table && (
            <SummaryTable table={article.table} className="mt-14" />
          )}

          {article.faqs.length > 0 && (
            <section aria-labelledby="faq-title" className="mt-16">
              <h2 id="faq-title" className="text-display-3">
                {t("LiveArticle.faqTitle")}
              </h2>
              <Faq items={article.faqs} className="mt-6" />
            </section>
          )}

          <Sources
            sources={article.sources}
            locale={locale}
            className="mt-14"
          />
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <EnquiryCta
            area={area && { slug: area.slug, name: area.name }}
            intent={decidingKinds.has(article.kind) ? "move" : "buy"}
            position={`living-${article.key}`}
          />
          {aboutAreas.length > 0 && (
            <nav aria-labelledby="areas-title">
              <h2 id="areas-title" className="mb-4 eyebrow text-ink-muted">
                {t("LiveArticle.areasTitle")}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {aboutAreas.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={{
                        pathname: "/areas/[slug]",
                        params: { slug: a.slug },
                      }}
                      className="inline-block rounded-full border border-line px-4 py-2 text-sm hover:border-ocean-900"
                    >
                      {t("AreaPage.livingLink", { name: a.name })}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>
      </Container>

      {related.length > 0 && (
        <section className="border-t border-line bg-sand-50 py-16">
          <Container size="wide">
            <h2 className="text-display-3">{t("LiveArticle.related")}</h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <li key={a.key}>
                  <LivingCard article={a} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  );
}
