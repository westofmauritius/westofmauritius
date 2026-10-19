import { getTranslations } from "next-intl/server";
import { ButtonLink, Container } from "@/components/ui";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <Container narrow className="py-20">
      <h1 className="text-4xl">{t("title")}</h1>
      <p className="mt-4 text-lg text-ink-muted">{t("body")}</p>
      <ButtonLink href="/" className="mt-8">
        {t("home")}
      </ButtonLink>
    </Container>
  );
}
