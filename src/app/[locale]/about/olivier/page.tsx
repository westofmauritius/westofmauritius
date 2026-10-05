import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthorAvatar } from "@/components/author/AuthorAvatar";
import { GuideCard } from "@/components/content/GuideCard";
import { AreaPhotoStrip } from "@/components/content/AreaPhotoStrip";
import { Prose } from "@/components/content/Prose";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";
import { Link } from "@/i18n/Link";
import { resolveLocale } from "@/i18n/locale";
import { getAreas } from "@/lib/content/areas";
import { getAuthor } from "@/lib/content/author";
import { getGuides } from "@/lib/content/guides";
import { localeAlternates } from "@/lib/seo/alternates";
import { openGraphBase } from "@/lib/seo/open-graph";
import { Wave } from "@/components/ui/Wave";
import { profilePageSchema } from "@/lib/seo/schema";

type Props = PageProps<"/[locale]/about/olivier">;

/**
 * The author page (Keystatic → Site → Author). Bylines on every guide link
 * here, and the structured data names it as the author's profile, so it is
 * where readers and search engines learn who is behind the site.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [author, t] = await Promise.all([
    getAuthor(locale),
    getTranslations({ locale, namespace: "Home" }),
  ]);
  const title = t("localAuthor", { name: author.name });
  return {
    title,
    description: author.seoDescription,
    alternates: localeAlternates("/about/olivier", locale),
    openGraph: {
      ...openGraphBase(locale),
      type: "profile",
      title,
      description: author.seoDescription,
    },
    // Until the bio is written the page is a placeholder: keep it out of search.
    ...(author.placeholder && { robots: { index: false } }),
  };
}

export default async function AuthorPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const [author, guides, areas, t] = await Promise.all([
    getAuthor(locale),
    getGuides(locale),
    getAreas(locale),
    getTranslations({ locale }),
  ]);
  const written = guides.filter((g) => !g.placeholder);
  const lastGuide = written
    .map((g) => g.updatedAt ?? g.publishedAt)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);
  // Pictures of the coast beside the bio, so the page shows what it is about.
  const photoAreas = ["black-river", "la-gaulette", "flic-en-flac"]
    .map((slug) => areas.find((a) => a.slug === slug))
    .filter((a) => a !== undefined);

  return (
    <>
      {author.placeholder && <PlaceholderNotice />}
      {!author.placeholder && (
        <JsonLd data={profilePageSchema(author, locale, lastGuide ?? null)} />
      )}

      <Container size="wide" className="pt-8">
        <Breadcrumbs
          locale={locale}
          label={t("Breadcrumbs.label")}
          items={[
            { label: t("Breadcrumbs.home"), href: "/" },
            { label: t("Nav.about"), href: "/about" },
            { label: author.name, href: "/about/olivier" },
          ]}
        />
      </Container>

      {/* Text on the left of the wide grid and photos beside it, like the
          About page, instead of a narrow centred column. */}
      <Container
        size="wide"
        className="grid gap-14 py-14 sm:py-20 lg:grid-cols-[minmax(0,42rem)_20rem] lg:justify-between"
      >
        <div>
          <header className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
            <AuthorAvatar author={author} size={128} />
            <div>
              <p className="mb-3 eyebrow">{t("Author.pageEyebrow")}</p>
              <h1 className="type-h1">{author.name}</h1>
              {author.role && (
                <p className="mt-3 lead text-ink-muted">{author.role}</p>
              )}
            </div>
          </header>

          <Prose node={author.body} locale={locale} className="mt-12" />

          <p className="mt-12 border-t border-line pt-6 text-small">
            <Link
              href="/contact"
              className="font-medium text-lagoon-700 hover:underline"
            >
              {t("Author.contact", { name: author.name })} →
            </Link>
            {author.links.length > 0 && (
              <span className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {author.links.map((url) => (
                  <a
                    key={url}
                    href={url}
                    rel="me"
                    className="text-ink-muted underline underline-offset-4 hover:text-ink"
                  >
                    {new URL(url).hostname.replace(/^www\./, "")}
                  </a>
                ))}
              </span>
            )}
          </p>
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <AreaPhotoStrip areas={photoAreas} />
        </aside>
      </Container>

      {written.length > 0 && (
        <section className="relative bg-sand-50 py-16">
          <Wave className="text-sand-50" />
          <Container size="wide">
            <h2 className="type-h3">
              {t("Author.writes", { name: author.name })}
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
              {written.map((guide) => (
                <GuideCard key={guide.key} guide={guide} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
