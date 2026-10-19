import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ButtonLink, Container } from "@/components/ui";
import { resolveLocale } from "@/i18n/locale";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/for-installers/thank-you">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({
    locale,
    namespace: "forInstallers.thanks",
  });
  return pageMetadata({
    locale,
    href: "/for-installers/thank-you",
    title: t("metaTitle"),
    noindex: true,
  });
}

export default async function ApplicationThanksPage({
  params,
}: PageProps<"/[locale]/for-installers/thank-you">) {
  await resolveLocale(params);
  const t = await getTranslations("forInstallers.thanks");
  const tn = await getTranslations("nav");
  return (
    <Container narrow className="py-12 sm:py-16">
      <div className="rounded-card bg-success-50 p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-lg">{t("body")}</p>
      </div>
      <p className="mt-8">{t("signIn")}</p>
      <ButtonLink href="/sign-in" className="mt-4">
        {tn("signIn")}
      </ButtonLink>
    </Container>
  );
}
