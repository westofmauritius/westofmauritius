import { getTranslations } from "next-intl/server";
import { ButtonLink, Container } from "@/components/ui";

export default async function Forbidden() {
  const t = await getTranslations("auth");
  return (
    <Container narrow className="py-20">
      <h1 className="text-4xl">{t("forbiddenTitle")}</h1>
      <p className="mt-4 text-lg text-ink-muted">{t("forbiddenBody")}</p>
      <ButtonLink href="/sign-in" className="mt-8">
        {t("title")}
      </ButtonLink>
    </Container>
  );
}
