import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/forms/ContactForm";
import { FormsProvider } from "@/components/forms/FormsProvider";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { resolveLocale } from "@/i18n/locale";
import { localeAlternates } from "@/lib/seo/alternates";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Pages.contact" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: localeAlternates("/contact", locale),
  };
}

export default async function ContactPage({
  params,
}: PageProps<"/[locale]/contact">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Pages.contact" });
  return (
    <Container
      size="wide"
      className="grid gap-12 py-12 sm:py-16 lg:grid-cols-[4fr_7fr] lg:gap-20"
    >
      <SectionHeading as="h1" title={t("title")} intro={t("intro")} />
      <FormsProvider>
        <ContactForm />
      </FormsProvider>
    </Container>
  );
}
