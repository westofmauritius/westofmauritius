import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { QueryMessage } from "@/components/ui/QueryMessage";
import { resolveLocale } from "@/i18n/locale";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/thank-you">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "ThankYou" });
  return { title: t("title"), robots: { index: false } };
}

/** Where forms land after a submission without JavaScript (?form=lead|contact|newsletter). */
export default async function ThankYouPage({
  params,
}: PageProps<"/[locale]/thank-you">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "ThankYou" });
  return (
    <Container size="prose" className="py-24 text-center">
      <h1 className="text-display-1">{t("title")}</h1>
      <p className="mt-6 lead text-ink-muted">
        <QueryMessage
          param="form"
          messages={{
            lead: t("lead"),
            contact: t("contact"),
            newsletter: t("newsletter"),
            whatsapp: t("whatsapp"),
          }}
          fallback={t("contact")}
        />
      </p>
      <ButtonLink href="/" className="mt-10">
        {t("back")}
      </ButtonLink>
    </Container>
  );
}
