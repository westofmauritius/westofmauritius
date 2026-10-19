import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { calculatorDefaults, type CalculatorSettingKey } from "@content/facts";
import { Calculator } from "@/components/calculator/Calculator";
import { Badge, Container, SectionHeading } from "@/components/ui";
import { resolveLocale } from "@/i18n/locale";
import { getLiveFacts, sourceLabel } from "@/lib/facts";
import { formatMur, formatNumber } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

// Values can be changed in Admin → Settings (revalidated on save).
export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/calculator">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "calculator" });
  return pageMetadata({
    locale,
    href: "/calculator",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

const settingKeys = Object.keys(calculatorDefaults) as CalculatorSettingKey[];

export default async function CalculatorPage({
  params,
}: PageProps<"/[locale]/calculator">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations("calculator");
  const tc = await getTranslations("common");
  const facts = await getLiveFacts();
  const grant = {
    sharePercent: facts.grantSharePercent,
    maxMur: facts.grantMaxMur,
  };

  return (
    <Container className="py-10 sm:py-14">
      <SectionHeading as="h1" title={t("title")} intro={t("intro")} />
      <div className="mt-8">
        <Calculator settings={facts.calculator} grant={grant} />
      </div>

      <section aria-labelledby="assumptions" className="mt-14 max-w-3xl">
        <h2 id="assumptions" className="text-2xl">
          {t("assumptionsTitle")}
        </h2>
        <p className="mt-3 text-ink-muted">{t("assumptionsIntro")}</p>
        <ul className="mt-5 divide-y divide-line rounded-card border border-line bg-white">
          {settingKeys.map((key) => {
            const value = facts.calculator[key];
            const shown = key.endsWith("Mur")
              ? formatNumber(value, locale, 0)
              : formatNumber(value, locale, 2);
            const placeholder =
              "placeholder" in calculatorDefaults[key] &&
              value === calculatorDefaults[key].value;
            return (
              <li
                key={key}
                className="flex flex-wrap items-center justify-between gap-2 p-4"
              >
                <span>{t(`assumptions.${key}`, { value: shown })}</span>
                {placeholder && (
                  <Badge tone="warning">{t("placeholderValue")}</Badge>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-5">
          {t("grantNote", {
            share: grant.sharePercent,
            max: formatMur(grant.maxMur, locale),
          })}{" "}
          <span className="text-sm text-ink-muted">
            {tc("source", { source: sourceLabel("grantMaxMur", locale) })}
          </span>
        </p>
        <p className="mt-3">{t("surplusNote")}</p>
        <p className="mt-3 text-sm text-ink-muted">{tc("estimateNote")}</p>
      </section>
    </Container>
  );
}
