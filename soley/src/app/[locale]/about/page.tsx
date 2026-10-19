import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HouseIllustration } from "@/components/home/HouseIllustration";
import { ButtonLink, Container, SectionHeading } from "@/components/ui";
import { resolveLocale } from "@/i18n/locale";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "about" });
  return pageMetadata({
    locale,
    href: "/about",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

const sections = ["why", "team", "money", "not"] as const;

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about">) {
  await resolveLocale(params);
  const t = await getTranslations("about");
  const th = await getTranslations("home");
  const tn = await getTranslations("nav");
  return (
    <Container narrow className="py-10 sm:py-14">
      <SectionHeading as="h1" title={t("title")} intro={t("intro")} />
      <figure className="mt-8">
        <HouseIllustration title={th("heroImageAlt")} className="w-full" />
        <figcaption className="mt-2 text-sm text-ink-muted">
          {t("photoNote")}
        </figcaption>
      </figure>
      <div className="mt-10 space-y-8">
        {sections.map((key) => (
          <section key={key}>
            <h2 className="text-2xl">{t(`${key}Title`)}</h2>
            <p className="mt-2 text-lg">{t(key)}</p>
          </section>
        ))}
      </div>
      <ButtonLink href="/get-quotes" size="lg" className="mt-10">
        {tn("getQuotes")}
      </ButtonLink>
    </Container>
  );
}
