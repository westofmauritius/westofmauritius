import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Faq } from "@/components/home/Faq";
import { HouseIllustration } from "@/components/home/HouseIllustration";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  Alert,
  ButtonLink,
  Card,
  Container,
  SectionHeading,
} from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { getLiveFacts, sourceLabel } from "@/lib/facts";
import { formatMur } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

// Facts can be edited in the admin panel; the page is rebuilt at most every
// five minutes, and immediately when an admin saves (revalidatePath).
export const revalidate = 300;

const faqKeys = [
  "cost",
  "who",
  "vetting",
  "grant",
  "official",
  "obligation",
] as const;
const trustKeys = ["vetted", "independent", "free", "privacy"] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "home" });
  return pageMetadata({
    locale,
    href: "/",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations("home");
  const tc = await getTranslations("common");
  const facts = await getLiveFacts();
  const amount = formatMur(facts.grantMaxMur, locale);
  const share = facts.grantSharePercent;
  const faq = faqKeys.map((key) => ({
    q: t(`faq.${key}.q`),
    a: t(`faq.${key}.a`, { amount, share }),
  }));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: site.name,
          url: site.url,
          logo: `${site.url}/icon.svg`,
          email: site.contactEmail,
          areaServed: { "@type": "Country", name: "Mauritius" },
          description: tc("independent"),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />

      {/* Hero: the promise and the calculator, both above the fold. */}
      <section className="bg-gradient-to-b from-ocean-50 to-surface pt-8 pb-12 sm:pt-14">
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="inline-flex rounded-full bg-sun-100 px-3 py-1 text-sm font-bold text-ocean-900">
                {t("grantBadge", { amount, share })}
              </p>
              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl">
                {t("title")}
              </h1>
              <p className="mt-4 max-w-xl text-lg text-ink-muted sm:text-xl">
                {t("intro")}
              </p>
              <p className="mt-3 text-sm font-semibold text-ocean-700">
                {t("eyebrow")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/get-quotes" size="lg">
                  {t("ctaQuotes")}
                </ButtonLink>
                <ButtonLink href="/calculator" size="lg" variant="ghost">
                  {t("ctaCalculator")}
                </ButtonLink>
              </div>
            </div>
            <figure className="hidden lg:block">
              <HouseIllustration title={t("heroImageAlt")} className="w-full" />
              <figcaption className="mt-2 text-xs text-ink-muted">
                {tc("placeholderPhoto")}
              </figcaption>
            </figure>
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section aria-labelledby="how" className="py-14">
        <Container>
          <SectionHeading
            id="how"
            title={t("howTitle")}
            intro={t("howIntro")}
          />
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {(["1", "2", "3"] as const).map((step) => (
              <Card as="li" key={step}>
                <span
                  aria-hidden="true"
                  className="inline-flex size-10 items-center justify-center rounded-full bg-sun-400 text-lg font-extrabold text-ocean-950"
                >
                  {step}
                </span>
                <h3 className="mt-4 text-xl">{t(`steps.${step}.title`)}</h3>
                <p className="mt-2 text-ink-muted">{t(`steps.${step}.body`)}</p>
              </Card>
            ))}
          </ol>
        </Container>
      </section>

      {/* Trust */}
      <section
        aria-labelledby="trust"
        className="on-dark bg-ocean-900 py-14 text-white"
      >
        <Container>
          <h2 id="trust" className="text-3xl sm:text-4xl">
            {t("trustTitle")}
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2">
            {trustKeys.map((key) => (
              <li key={key} className="flex gap-4">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  width="28"
                  height="28"
                  className="mt-0.5 shrink-0 text-sun-300"
                >
                  <path
                    d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5l-8-3Zm-1.2 14.2-3.5-3.5 1.4-1.4 2.1 2.1 4.9-4.9 1.4 1.4-6.3 6.3Z"
                    fill="currentColor"
                  />
                </svg>
                <div>
                  <h3 className="text-xl">{t(`trust.${key}.title`)}</h3>
                  <p className="mt-1 text-ocean-100">
                    {t(`trust.${key}.body`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* The grant */}
      <section aria-labelledby="grant" className="py-14">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 id="grant" className="text-2xl sm:text-3xl">
                {t("grantTitle")}
              </h2>
              <p className="mt-3 text-lg">
                {t("grantBody", { amount, share })}
              </p>
              <p className="mt-3 text-sm text-ink-muted">
                {tc("source", { source: sourceLabel("grantMaxMur", locale) })}
              </p>
              <Link
                href="/grant-guide"
                className="mt-4 inline-flex min-h-11 items-center font-semibold text-ocean-600 underline underline-offset-4"
              >
                {t("grantLink")}
              </Link>
            </Card>
            <Alert tone="warning" title={t("warningTitle")}>
              <p>{t("warningBody")}</p>
              <p className="mt-2 text-sm">
                {tc("source", {
                  source: sourceLabel("cebUnregisteredWarning", locale),
                })}
              </p>
            </Alert>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="pb-14">
        <Container narrow>
          <SectionHeading id="faq" title={t("faqTitle")} />
          <div className="mt-6">
            <Faq items={faq} />
          </div>
        </Container>
      </section>

      {/* Final call to action */}
      <section aria-labelledby="cta" className="pb-6">
        <Container>
          <div className="rounded-card bg-sun-100 p-8 text-center sm:p-12">
            <h2 id="cta" className="text-3xl">
              {t("ctaTitle")}
            </h2>
            <p className="mt-2 text-lg">{t("ctaBody")}</p>
            <ButtonLink href="/get-quotes" size="lg" className="mt-6">
              {t("ctaButton")}
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
