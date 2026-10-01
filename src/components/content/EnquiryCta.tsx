import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/cn";

type EnquiryCtaProps = {
  /** Pre-selects this area in the form and names it in the heading. */
  area?: { slug: string; name: string };
  /** Where on the site the link sits; sent to analytics with the click. */
  position: string;
  className?: string;
};

/**
 * "Thinking of buying?" box linking to the lead form. Used on Live in the
 * West articles, area pages and guides: the paths that lead to an enquiry.
 * Clicks are tracked as "cta-enquire" with their position.
 */
export async function EnquiryCta({ area, position, className }: EnquiryCtaProps) {
  const t = await getTranslations("LiveArticle");
  return (
    <aside className={cn("rounded-sm bg-ocean-900 p-7 text-white", className)}>
      <p className="font-display text-2xl leading-tight">
        {area ? t("ctaTitleArea", { area: area.name }) : t("ctaTitle")}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ocean-100">{t("ctaText")}</p>
      <ButtonLink
        href={{
          pathname: "/live-in-the-west/enquire",
          query: { ...(area && { area: area.slug }), source: position },
        }}
        variant="light"
        className="mt-6 w-full"
        data-umami-event="cta-enquire"
        data-umami-event-position={position}
      >
        {t("ctaButton")}
      </ButtonLink>
    </aside>
  );
}
