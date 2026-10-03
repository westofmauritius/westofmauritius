import { getLocale, getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/ButtonLink";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { inPlace } from "@/lib/place-names";

type EnquiryCtaProps = {
  /** Pre-selects this area in the form and names it in the heading. */
  area?: { slug: string; name: string };
  /**
   * "buy": for property articles ("Thinking of buying?").
   * "move": for guides and area pages, where readers are still deciding
   * whether to move ("Thinking of moving here? Get a free shortlist").
   */
  intent?: "buy" | "move";
  tone?: "ocean" | "coral";
  /** Where on the site the link sits; sent to analytics with the click. */
  position: string;
  className?: string;
};

/**
 * Box linking to the lead form, with the area filled in when there is one.
 * Clicks are tracked as "cta-enquire" with their position, and the position
 * travels to the form as "source", so each lead records the page it came from.
 */
export async function EnquiryCta({
  area,
  intent = "buy",
  tone = "ocean",
  position,
  className,
}: EnquiryCtaProps) {
  const t = await getTranslations("LiveArticle");
  const locale = (await getLocale()) as Locale;
  const title =
    intent === "move"
      ? area
        ? t("moveTitleArea", { area: inPlace(area.name, locale) })
        : t("moveTitle")
      : area
        ? t("ctaTitleArea", { area: area.name })
        : t("ctaTitle");
  return (
    <aside
      className={cn(
        "rounded-sm p-7 text-white",
        tone === "coral" ? "bg-coral-600" : "bg-ocean-900",
        className,
      )}
    >
      <p className="type-h4">{title}</p>
      <p
        className={cn(
          "mt-3 text-small leading-relaxed",
          tone === "coral" ? "text-white" : "text-ocean-100",
        )}
      >
        {intent === "move" ? t("moveText") : t("ctaText")}
      </p>
      <ButtonLink
        href={{
          pathname: "/living-in-the-west/enquire",
          query: { ...(area && { area: area.slug }), source: position },
        }}
        variant="light"
        className="mt-6 w-full"
        data-umami-event="cta-enquire"
        data-umami-event-position={position}
      >
        {intent === "move" ? t("moveButton") : t("ctaButton")}
      </ButtonLink>
    </aside>
  );
}
