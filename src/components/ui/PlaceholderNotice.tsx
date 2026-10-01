import { getTranslations } from "next-intl/server";
import { Container } from "./Container";

/**
 * Bar at the top of a page whose content is invented, so nobody mistakes it
 * for real information. Shown whenever the entry's "Placeholder" box is ticked.
 */
export async function PlaceholderNotice() {
  const t = await getTranslations("Placeholder");
  return (
    <div className="border-b border-dashed border-coral-400 bg-coral-50 text-coral-700">
      <Container size="wide" className="py-3 text-sm">
        <strong className="mr-2 text-xs font-semibold tracking-[0.14em] uppercase">
          {t("label")}
        </strong>
        {t("notice")}
      </Container>
    </div>
  );
}
