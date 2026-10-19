import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { officialLinks } from "@content/facts";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  Alert,
  ButtonLink,
  Card,
  Container,
  SectionHeading,
  Stat,
} from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { getLiveFacts, sourceLabel } from "@/lib/facts";
import { formatDate, formatMur } from "@/lib/format";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

// Grant figures can be edited in Admin → Facts (revalidated on save).
export const revalidate = 300;

const stepKeys = ["1", "2", "3", "4", "5", "6"] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/grant-guide">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "grantGuide" });
  const facts = await getLiveFacts();
  return pageMetadata({
    locale,
    href: "/grant-guide",
    title: t("metaTitle"),
    description: t("metaDescription", {
      amount: formatMur(facts.grantMaxMur, locale),
      share: facts.grantSharePercent,
    }),
  });
}

export default async function GrantGuidePage({
  params,
}: PageProps<"/[locale]/grant-guide">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations("grantGuide");
  const facts = await getLiveFacts();
  const amount = formatMur(facts.grantMaxMur, locale);
  // A worked example with a round price, clearly labelled as an example.
  const exampleCost = 200_000;
  const exampleGrant = Math.min(
    (exampleCost * facts.grantSharePercent) / 100,
    facts.grantMaxMur,
  );
  const official = [
    { key: "ceb", label: t("officialCeb"), ...officialLinks.ceb },
    { key: "dbm", label: t("officialDbm"), ...officialLinks.dbm },
  ];

  return (
    <Container narrow className="py-10 sm:py-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: t("title"),
          description: t("metaDescription", {
            amount,
            share: facts.grantSharePercent,
          }),
          inLanguage: locale,
          url: absoluteUrl("/grant-guide", locale),
          step: stepKeys.map((key, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: t(`steps.${key}.title`),
            text: t(`steps.${key}.body`),
            url: `${absoluteUrl("/grant-guide", locale)}#step-${key}`,
          })),
        }}
      />
      <SectionHeading as="h1" title={t("title")} intro={t("intro")} />

      <section aria-labelledby="facts" className="mt-10">
        <h2 id="facts" className="text-2xl">
          {t("factsTitle")}
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat emphasis label={t("factMax")} value={amount} />
          <Stat label={t("factShare")} value={`${facts.grantSharePercent} %`} />
          <Stat label={t("factLaunched")} value={t("factLaunchedValue")} />
        </dl>
        <p className="mt-3 text-sm text-ink-muted">
          {t("factsSource", { source: sourceLabel("grantMaxMur", locale) })}
        </p>
        <p className="mt-3">
          {t("example", {
            cost: formatMur(exampleCost, locale),
            grant: formatMur(exampleGrant, locale),
            net: formatMur(exampleCost - exampleGrant, locale),
          })}{" "}
          <Link
            href="/calculator"
            className="font-semibold text-ocean-600 underline underline-offset-4"
          >
            {t("calculatorLink")}
          </Link>
        </p>
      </section>

      <section aria-labelledby="steps" className="mt-12">
        <h2 id="steps" className="text-2xl">
          {t("stepsTitle")}
        </h2>
        <ol className="mt-6 space-y-6">
          {stepKeys.map((key) => (
            <li key={key} id={`step-${key}`} className="flex gap-4">
              <span
                aria-hidden="true"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-sun-400 text-lg font-extrabold"
              >
                {key}
              </span>
              <div>
                <h3 className="text-xl">{t(`steps.${key}.title`)}</h3>
                <p className="mt-1">{t(`steps.${key}.body`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Card className="mt-12">
        <h2 className="text-xl">{t("officialTitle")}</h2>
        <ul className="mt-4 space-y-3">
          {official.map((link) => (
            <li key={link.key}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-ocean-600 underline underline-offset-4"
              >
                {link.label}
              </a>
              <span className="block text-sm text-ink-muted">
                {t("checked", { date: formatDate(link.checkedOn, locale) })}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Alert tone="info" className="mt-6">
        {t("notOfficial")}
      </Alert>

      <div className="mt-12 rounded-card bg-sun-100 p-6 sm:p-8">
        <h2 className="text-2xl">{t("ctaTitle")}</h2>
        <p className="mt-2">{t("ctaBody")}</p>
        <ButtonLink href="/get-quotes" size="lg" className="mt-4">
          {t("ctaButton")}
        </ButtonLink>
      </div>
    </Container>
  );
}
