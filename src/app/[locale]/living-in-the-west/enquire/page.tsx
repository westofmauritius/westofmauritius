import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FormsProvider } from "@/components/forms/FormsProvider";
import { LeadForm } from "@/components/forms/LeadForm";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { resolveLocale } from "@/i18n/locale";
import { getAreas } from "@/lib/content/areas";
import { consentTexts, currentConsent } from "@/lib/forms/consent";
import { countryOptions } from "@/lib/forms/options";
import { localeAlternates } from "@/lib/seo/alternates";

type Props = PageProps<"/[locale]/living-in-the-west/enquire">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Enquire" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: localeAlternates("/living-in-the-west/enquire", locale),
  };
}

/** The lead form: the page every "Living in the West" path leads to. */
export default async function EnquirePage({ params }: Props) {
  const locale = await resolveLocale(params);
  const [t, areas] = await Promise.all([
    getTranslations({ locale }),
    getAreas(locale),
  ]);

  return (
    <>
      <Container size="wide" className="pt-8">
        <Breadcrumbs
          locale={locale}
          label={t("Breadcrumbs.label")}
          items={[
            { label: t("Breadcrumbs.home"), href: "/" },
            { label: t("Pages.live.title"), href: "/living-in-the-west" },
            { label: t("Enquire.title"), href: "/living-in-the-west/enquire" },
          ]}
        />
      </Container>
      <Container
        size="wide"
        className="grid gap-12 py-12 lg:grid-cols-[4fr_7fr] lg:gap-20 lg:py-16"
      >
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-5 eyebrow">{t("LivePage.eyebrow")}</p>
          <h1 className="type-h2">{t("Enquire.title")}</h1>
          <p className="mt-6 lead text-ink-muted">{t("Enquire.intro")}</p>
        </div>
        <FormsProvider>
          <LeadForm
            areas={areas.map((a) => ({ value: a.slug, label: a.name }))}
            countries={countryOptions(locale)}
            consentText={consentTexts[currentConsent.lead][locale]}
          />
        </FormsProvider>
      </Container>
    </>
  );
}
