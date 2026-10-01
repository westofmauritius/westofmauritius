import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { EnquiryCta } from "@/components/content/EnquiryCta";
import { LivingCard } from "@/components/content/LivingCard";
import { Prose } from "@/components/content/Prose";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";
import { resolveLocale } from "@/i18n/locale";
import type { Locale } from "@/i18n/routing";
import { getAreas } from "@/lib/content/areas";
import { getLivingArticle, getLivingArticles } from "@/lib/content/living";
import type { LivingArticle } from "@/lib/content/types";
import { localeAlternates } from "@/lib/seo/alternates";
import { ogImage } from "@/lib/seo/og-images";
import { openGraphBase } from "@/lib/seo/open-graph";
import { livingArticleSchema } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/seo/urls";
import { brandName } from "@/lib/site";

type Props = PageProps<"/[locale]/live-in-the-west/[slug]">;

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
  pathname: "/live-in-the-west/[slug]" as const,
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
    title: article.title,
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

export default async function LivingArticlePage({ params }: Props) {
  const { locale, article } = await load(params);
  const [t, all, areas] = await Promise.all([
    getTranslations({ locale }),
    getLivingArticles(locale, { kind: article.kind }),
    getAreas(locale),
  ]);
  const area = areas.find((a) => a.slug === article.areaSlug);
  const related = all.filter((a) => a.key !== article.key).slice(0, 3);
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "long" });

  return (
    <>
      {article.placeholder && <PlaceholderNotice />}
      {!article.placeholder && (
        <JsonLd
          data={livingArticleSchema(
            article,
            absoluteUrl(articleHref(article, locale), locale),
            {
              locale,
              brand: brandName[locale],
            },
          )}
        />
      )}

      <Container size="wide" className="pt-8">
        <Breadcrumbs
          locale={locale}
          label={t("Breadcrumbs.label")}
          items={[
            { label: t("Breadcrumbs.home"), href: "/" },
            { label: t("Pages.live.title"), href: "/live-in-the-west" },
            { label: article.title, href: articleHref(article, locale) },
          ]}
        />
      </Container>

      <Container
        size="wide"
        className="grid gap-12 py-12 lg:grid-cols-[8fr_4fr] lg:gap-16"
      >
        <div>
          <p className="mb-5 eyebrow text-coral-600">{t("LivePage.eyebrow")}</p>
          <h1 className="text-display-1">{article.title}</h1>
          {article.excerpt && (
            <p className="mt-6 text-xl leading-relaxed text-ink-muted">
              {article.excerpt}
            </p>
          )}
          {article.updatedAt && (
            <p className="mt-4 text-sm text-ink-muted">
              {t("LiveArticle.updated", {
                date: dateFormat.format(new Date(article.updatedAt)),
              })}
            </p>
          )}
          <Prose node={article.body} className="mt-12" />
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <EnquiryCta
            area={area && { slug: area.slug, name: area.name }}
            position={`live-article-${article.key}`}
          />
        </div>
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
