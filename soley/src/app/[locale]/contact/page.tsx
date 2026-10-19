import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, Container, SectionHeading } from "@/components/ui";
import { resolveLocale } from "@/i18n/locale";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { ContactForm } from "./ContactForm";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "contact" });
  return pageMetadata({
    locale,
    href: "/contact",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function ContactPage({
  params,
}: PageProps<"/[locale]/contact">) {
  await resolveLocale(params);
  const t = await getTranslations("contact");
  return (
    <Container narrow className="py-10 sm:py-14">
      <SectionHeading as="h1" title={t("title")} intro={t("intro")} />
      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <dt className="text-sm text-ink-muted">{t("emailLabel")}</dt>
          <dd className="mt-1">
            <a
              href={`mailto:${site.contactEmail}`}
              className="font-semibold break-all text-ocean-600 underline"
            >
              {site.contactEmail}
            </a>
          </dd>
        </Card>
        {site.whatsappNumber && (
          <Card>
            <dt className="text-sm text-ink-muted">{t("whatsappLabel")}</dt>
            <dd className="mt-1">
              <a
                href={`https://wa.me/${site.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-ocean-600 underline"
              >
                {t("whatsappLink")}
              </a>
            </dd>
          </Card>
        )}
      </dl>
      <Card className="mt-8">
        <h2 className="text-xl">{t("formTitle")}</h2>
        <div className="mt-4">
          <ContactForm />
        </div>
      </Card>
      <p className="mt-8 text-sm text-ink-muted">{t("controller")}</p>
    </Container>
  );
}
