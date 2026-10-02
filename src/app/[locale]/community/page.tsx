import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NewsletterSignup } from "@/components/forms/NewsletterSignup";
import { WhatsappSignup } from "@/components/forms/WhatsappSignup";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { resolveLocale } from "@/i18n/locale";
import { localeAlternates } from "@/lib/seo/alternates";
import { openGraphBase } from "@/lib/seo/open-graph";
import { seoTitle } from "@/lib/seo/titles";
import { brandName } from "@/lib/site";

type Props = PageProps<"/[locale]/community">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Pages.community" });
  return {
    title: seoTitle(t("metaTitle"), brandName[locale]),
    description: t("intro"),
    alternates: localeAlternates("/community", locale),
    openGraph: {
      ...openGraphBase(locale),
      title: t("metaTitle"),
      description: t("intro"),
    },
  };
}

/**
 * The newsletter and the WhatsApp group, side by side. Both keep readers
 * coming back between visits, which is what turns a guide into a community
 * (and, later, into leads). Sign ups record "community" as their source.
 */
export default async function CommunityPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale });
  const points = t.raw("Community.newsletterPoints") as string[];

  return (
    <>
      <Container size="wide" className="pt-8">
        <Breadcrumbs
          locale={locale}
          label={t("Breadcrumbs.label")}
          items={[
            { label: t("Breadcrumbs.home"), href: "/" },
            { label: t("Footer.community"), href: "/community" },
          ]}
        />
      </Container>

      <Container size="wide" className="py-14 sm:py-20">
        <div className="max-w-3xl">
          <p className="mb-5 eyebrow text-coral-600">
            {t("Community.eyebrow")}
          </p>
          <h1 className="text-display-1">{t("Pages.community.title")}</h1>
          <p className="mt-6 lead text-ink-muted">
            {t("Pages.community.intro")}
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <section
            aria-labelledby="newsletter-title"
            className="rounded-sm bg-ocean-900 p-7 text-white sm:p-10"
          >
            <h2 id="newsletter-title" className="mb-6 eyebrow text-coral-200">
              {t("Community.newsletterTitle")}
            </h2>
            <NewsletterSignup locale={locale} source="community" />
            <ul className="mt-8 space-y-2 border-t border-white/15 pt-6 text-sm text-ocean-100">
              {points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span aria-hidden="true" className="text-coral-200">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="whatsapp-title"
            className="rounded-sm bg-sand-100 p-7 sm:p-10"
          >
            <h2 id="whatsapp-title" className="text-display-3">
              {t("Community.whatsappTitle")}
            </h2>
            <p className="mt-4 leading-relaxed text-ink-muted">
              {t("Community.whatsappText")}
            </p>
            <div className="mt-8">
              <WhatsappSignup locale={locale} source="community" />
            </div>
          </section>
        </div>
      </Container>
    </>
  );
}
