import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { QuoteForm } from "@/components/quote-form/QuoteForm";
import { Container, SectionHeading } from "@/components/ui";
import { resolveLocale } from "@/i18n/locale";
import { isRegion } from "@/lib/regions";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/get-quotes">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "quoteForm" });
  return pageMetadata({
    locale,
    href: "/get-quotes",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

/** Answers carried over from the calculator link, checked one by one. */
function prefillFrom(query: Record<string, string | string[] | undefined>) {
  const prefill: Record<string, string> = {};
  const one = (key: string) => {
    const value = query[key];
    return typeof value === "string" ? value : undefined;
  };
  const bill = one("bill");
  if (bill && /^\d{2,7}$/.test(bill)) prefill.monthly_bill_mur = bill;
  const region = one("region");
  if (isRegion(region)) prefill.region = region;
  const battery = one("battery");
  if (battery === "yes" || battery === "no") prefill.battery_interest = battery;
  const kwp = one("kwp");
  if (kwp && /^\d{1,2}(\.\d)?$/.test(kwp)) prefill.desired_kwp = kwp;
  return prefill;
}

export default async function GetQuotesPage({
  params,
  searchParams,
}: PageProps<"/[locale]/get-quotes">) {
  await resolveLocale(params);
  const t = await getTranslations("quoteForm");
  const prefill = prefillFrom(await searchParams);
  return (
    <Container narrow className="py-10 sm:py-14">
      <SectionHeading as="h1" title={t("title")} intro={t("intro")} />
      <div className="mt-8 rounded-card border border-line bg-white p-5 sm:p-8">
        <QuoteForm prefill={prefill} />
      </div>
    </Container>
  );
}
