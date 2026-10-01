import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Shown for any unknown URL inside a language, e.g. /fr/does-not-exist.
export default async function NotFound() {
  const t = await getTranslations("NotFound");
  return (
    <Container className="py-24">
      <SectionHeading
        as="h1"
        eyebrow="404"
        title={t("title")}
        intro={t("body")}
      />
      <ButtonLink href="/" className="mt-8">
        {t("back")}
      </ButtonLink>
    </Container>
  );
}
