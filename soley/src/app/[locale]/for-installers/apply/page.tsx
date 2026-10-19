import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container, SectionHeading } from "@/components/ui";
import { resolveLocale } from "@/i18n/locale";
import { pageMetadata } from "@/lib/seo";
import { ApplicationForm } from "./ApplicationForm";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/for-installers/apply">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "forInstallers.apply" });
  return pageMetadata({
    locale,
    href: "/for-installers/apply",
    title: t("metaTitle"),
  });
}

export default async function ApplyPage({
  params,
}: PageProps<"/[locale]/for-installers/apply">) {
  await resolveLocale(params);
  const t = await getTranslations("forInstallers.apply");
  return (
    <Container narrow className="py-10 sm:py-14">
      <SectionHeading as="h1" title={t("title")} intro={t("intro")} />
      <div className="mt-8 rounded-card border border-line bg-white p-5 sm:p-8">
        <ApplicationForm />
      </div>
    </Container>
  );
}
