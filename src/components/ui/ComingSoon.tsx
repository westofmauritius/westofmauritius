import { getTranslations } from "next-intl/server";
import { Badge } from "./Badge";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

/**
 * Temporary body for section pages that are built in later steps, so the
 * navigation and language switcher can be tested end to end now.
 */
export async function ComingSoon({
  title,
  intro,
}: {
  title: string;
  intro: string;
}) {
  const t = await getTranslations("ComingSoon");
  return (
    <Container className="py-16 sm:py-24">
      <Badge variant="placeholder" className="mb-6">
        {t("badge")}
      </Badge>
      <SectionHeading as="h1" title={title} intro={intro} />
      <p className="mt-8 text-ink-muted">{t("body")}</p>
    </Container>
  );
}
