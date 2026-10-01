import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { QueryMessage } from "@/components/ui/QueryMessage";
import { resolveLocale } from "@/i18n/locale";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/newsletter">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "NewsletterStatus" });
  return { title: t("title"), robots: { index: false } };
}

/** Result of the confirm / unsubscribe links in newsletter e-mails (?status=…). */
export default async function NewsletterPage({
  params,
}: PageProps<"/[locale]/newsletter">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "NewsletterStatus" });
  const back = await getTranslations({ locale, namespace: "ThankYou" });
  return (
    <Container size="prose" className="py-24 text-center">
      <h1 className="text-display-1">{t("title")}</h1>
      <p className="mt-6 lead text-ink-muted">
        <QueryMessage
          param="status"
          messages={{
            confirmed: t("confirmed"),
            unsubscribed: t("unsubscribed"),
            invalid: t("invalid"),
          }}
          fallback={t("default")}
        />
      </p>
      <ButtonLink href="/" className="mt-10">
        {back("back")}
      </ButtonLink>
    </Container>
  );
}
