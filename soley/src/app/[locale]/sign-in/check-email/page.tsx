import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container, SectionHeading } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/sign-in/check-email">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "auth" });
  return pageMetadata({
    locale,
    href: "/sign-in/check-email",
    title: t("checkTitle"),
    noindex: true,
  });
}

export default async function CheckEmailPage({
  params,
}: PageProps<"/[locale]/sign-in/check-email">) {
  await resolveLocale(params);
  const t = await getTranslations("auth");
  return (
    <Container narrow className="py-12">
      <SectionHeading as="h1" title={t("checkTitle")} intro={t("checkBody")} />
      <Link
        href="/sign-in"
        className="mt-6 inline-flex min-h-11 items-center font-semibold text-ocean-600 underline underline-offset-4"
      >
        {t("checkAgain")}
      </Link>
    </Container>
  );
}
