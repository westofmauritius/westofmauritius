import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Prose } from "@/components/content/Prose";
import { Container } from "@/components/ui/Container";
import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";
import { resolveLocale } from "@/i18n/locale";
import type { StaticPathname } from "@/i18n/routing";
import { getTextPage, type TextPageKey } from "@/lib/content/pages";
import { localeAlternates } from "@/lib/seo/alternates";
import { openGraphBase } from "@/lib/seo/open-graph";

type Props = { params: Promise<{ locale: string }> };

/**
 * The About and legal pages share one layout: title, intro, text, date.
 * Each route file is two lines: `const page = textPage("privacy", "/privacy")`.
 */
export function textPage(key: TextPageKey, href: StaticPathname) {
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
    const [page, t] = await Promise.all([
      getTextPage(key, locale),
      getTranslations({ locale }),
    ]);
    const date = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
    return (
      <>
        {page.placeholder && <PlaceholderNotice />}
        <Container size="prose" className="py-14 sm:py-20">
          <h1 className="text-display-1">{page.title}</h1>
          {page.intro && (
            <p className="mt-6 text-xl leading-relaxed text-ink-muted">
              {page.intro}
            </p>
          )}
          <Prose node={page.body} locale={locale} className="mt-12" />
          {page.updatedAt && (
            <p className="mt-16 border-t border-line pt-6 text-sm text-ink-muted">
              {t("LiveArticle.updated", {
                date: date.format(new Date(page.updatedAt)),
              })}
            </p>
          )}
        </Container>
      </>
    );
  }

  return { generateMetadata, Page };
}
