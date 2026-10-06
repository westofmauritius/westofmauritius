import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AreaPhotoStrip } from "@/components/content/AreaPhotoStrip";
import { Prose } from "@/components/content/Prose";
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";
import { Link } from "@/i18n/Link";
import { resolveLocale } from "@/i18n/locale";
import { longDate } from "@/lib/dates";
import type { StaticPathname } from "@/i18n/routing";
import { getAreas } from "@/lib/content/areas";
import { getTextPage, type TextPageKey } from "@/lib/content/pages";
import { localeAlternates } from "@/lib/seo/alternates";
import { openGraphBase } from "@/lib/seo/open-graph";

type Props = { params: Promise<{ locale: string }> };

type Options = {
  /**
   * Pictures for pages that are about the coast itself (About). The hero is
   * shown beside the title, the others in a column next to the text. Area
   * photos are used so every picture is already credited and links on.
   */
  photos?: { hero: string; aside: string[] };
};

/**
 * The About and legal pages share one layout: title, intro, text, date.
 * Each route file is two lines: `const page = textPage("privacy", "/privacy")`.
 *
 * The text sits on the left of the wide page grid, like the area pages,
 * rather than in a lone centred column: on a large screen a centred column
 * leaves both sides empty and the page feels unfinished.
 */
export function textPage(
  key: TextPageKey,
  href: StaticPathname,
  options: Options = {},
) {
  async function generateMetadata({ params }: Props): Promise<Metadata> {
    const locale = await resolveLocale(params);
    const page = await getTextPage(key, locale);
    return {
      title: page.title,
      description: page.seoDescription,
      alternates: localeAlternates(href, locale),
      openGraph: {
        ...openGraphBase(locale),
        title: page.title,
        description: page.seoDescription,
      },
      ...(page.placeholder && { robots: { index: false } }),
    };
  }

  async function Page({ params }: Props) {
    const locale = await resolveLocale(params);
    const [page, areas, t] = await Promise.all([
      getTextPage(key, locale),
      getAreas(locale),
      getTranslations({ locale }),
    ]);
    const date = longDate(locale);
    const { photos } = options;
    const hero = photos && areas.find((a) => a.slug === photos.hero);
    const aside = (photos?.aside ?? [])
      .map((slug) => areas.find((a) => a.slug === slug))
      .filter((a) => a !== undefined);

    const header = (
      <div>
        <h1 className="type-h1">{page.title}</h1>
        {page.intro && (
          <p className="mt-6 max-w-2xl lead text-ink-muted">{page.intro}</p>
        )}
      </div>
    );

    return (
      <>
        {page.placeholder && <PlaceholderNotice />}

        {hero ? (
          <Container
            size="wide"
            className="grid gap-10 pt-10 pb-6 lg:grid-cols-[5fr_7fr] lg:items-end"
          >
            {header}
            <Photo
              photo={hero.hero}
              fallbackTone={hero.placeholderTone}
              fallbackLabel={hero.name}
              aspect="aspect-[16/10]"
              sizes="(min-width: 1024px) 58vw, 100vw"
              priority
              parallax
              className="rounded-2xl"
            />
          </Container>
        ) : (
          <Container size="wide" className="pt-14 sm:pt-20">
            {header}
          </Container>
        )}

        <Container
          size="wide"
          className="grid gap-14 py-12 sm:py-16 lg:grid-cols-[minmax(0,42rem)_20rem] lg:justify-between"
        >
          <div>
            <Prose node={page.body} locale={locale} />
            {page.updatedAt && (
              <p className="mt-16 border-t border-line pt-6 text-small text-ink-muted">
                {t("LiveArticle.updated", { date: date(page.updatedAt) })}
              </p>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            {aside.length > 0 ? (
              <AreaPhotoStrip areas={aside} />
            ) : (
              <div className="rounded-2xl bg-sand-50 p-6 ring-1 ring-line">
                <p className="type-h4">{t("TextPage.asideTitle")}</p>
                <p className="mt-2 text-small text-ink-muted">
                  {t("TextPage.asideText")}
                </p>
                <Link
                  href="/contact"
                  className="mt-4 inline-block text-small font-medium text-lagoon-700 hover:underline"
                >
                  {t("TextPage.asideLink")} →
                </Link>
              </div>
            )}
          </aside>
        </Container>
      </>
    );
  }

  return { generateMetadata, Page };
}
