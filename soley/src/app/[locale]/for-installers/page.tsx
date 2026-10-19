import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ButtonLink, Card, Container, SectionHeading } from "@/components/ui";
import { resolveLocale } from "@/i18n/locale";
import { formatMur } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { getPlatformSettings } from "@/lib/services/settings";

// The lead price can be changed in Admin → Settings (revalidated on save).
export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/for-installers">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "forInstallers" });
  return pageMetadata({
    locale,
    href: "/for-installers",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

async function leadPrice(): Promise<number> {
  try {
    return (await getPlatformSettings()).lead_price_mur;
  } catch {
    return 0; // no database at build time: show the general wording
  }
}

export default async function ForInstallersPage({
  params,
}: PageProps<"/[locale]/for-installers">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations("forInstallers");
  const price = await leadPrice();
  const list = (key: "fair" | "requirements") =>
    (["1", "2", "3", "4"] as const).map((n) => t(`${key}.${n}`));

  return (
    <>
      <section className="bg-gradient-to-b from-ocean-50 to-surface py-12 sm:py-16">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow={t("eyebrow")}
            title={t("title")}
            intro={t("intro")}
          />
          <ButtonLink href="/for-installers/apply" size="lg" className="mt-8">
            {t("cta")}
          </ButtonLink>
        </Container>
      </section>

      <section aria-labelledby="how" className="py-12">
        <Container>
          <SectionHeading id="how" title={t("howTitle")} />
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(["1", "2", "3", "4"] as const).map((step) => (
              <Card as="li" key={step}>
                <span
                  aria-hidden="true"
                  className="inline-flex size-10 items-center justify-center rounded-full bg-sun-400 text-lg font-extrabold"
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

      <section
        aria-labelledby="price"
        className="on-dark bg-ocean-900 py-12 text-white"
      >
        <Container>
          <h2 id="price" className="text-3xl">
            {t("priceTitle")}
          </h2>
          <p className="mt-4 max-w-2xl text-xl">
            {price > 0
              ? t("priceSet", { price: formatMur(price, locale) })
              : t("priceUnset")}
          </p>
          <p className="mt-2 max-w-2xl text-ocean-100">{t("priceInvoice")}</p>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="text-2xl">{t("fairTitle")}</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5">
                {list("fair").map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
            <Card>
              <h2 className="text-2xl">{t("requirementsTitle")}</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5">
                {list("requirements").map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          </div>
          <ButtonLink href="/for-installers/apply" size="lg" className="mt-10">
            {t("cta")}
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}
