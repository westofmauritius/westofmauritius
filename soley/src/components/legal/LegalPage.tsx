import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { legalPages, type LegalPageKey } from "@content/legal";
import { Alert, Container } from "@/components/ui";
import type { Locale } from "@/i18n/routing";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

const hrefs = {
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
} as const;

export async function legalMetadata(
  key: LegalPageKey,
  locale: Locale,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "legal" });
  return pageMetadata({
    locale,
    href: hrefs[key],
    title: t(`${key}Title`),
    description: t(`${key}Description`),
  });
}

/** A legal text from content/legal, with the draft notice while unreviewed. */
export async function LegalPage({
  pageKey,
  locale,
}: {
  pageKey: LegalPageKey;
  locale: Locale;
}) {
  const t = await getTranslations("legal");
  const page = legalPages[pageKey];
  const { default: Body } = await page.load[locale]();
  return (
    <Container narrow className="py-10 sm:py-14">
      <h1 className="text-4xl">{t(`${pageKey}Title`)}</h1>
      <p className="mt-3 text-sm text-ink-muted">
        {t("updated", { date: formatDate(page.updated, locale) })}
      </p>
      {page.draft && (
        <Alert tone="warning" className="mt-6">
          {t("draftNotice")}
        </Alert>
      )}
      <div className="prose mt-8">
        <Body />
      </div>
    </Container>
  );
}
