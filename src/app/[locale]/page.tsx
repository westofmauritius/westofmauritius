import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { resolveLocale } from "@/i18n/locale";
import { localeAlternates } from "@/lib/seo/alternates";
import { areaNames } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return { alternates: localeAlternates("/", locale) };
}

// Temporary start page. The full start page (featured places, guides, the
// "Live in the West" entry) is built in step 7.
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Home" });

  return (
    <>
      <Container
        size="wide"
        className="grid gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:items-center"
      >
        <div>
          <p className="mb-4 eyebrow text-coral-600">{t("eyebrow")}</p>
          <h1 className="text-display-1">{t("title")}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
            {t("intro")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/guides">{t("ctaGuides")}</ButtonLink>
            <ButtonLink href="/live-in-the-west" variant="outline">
              {t("ctaLive")}
            </ButtonLink>
          </div>
        </div>
        <PlaceholderImage
          tone="sunset"
          aspect="aspect-[4/5] sm:aspect-[4/3]"
          label="West coast"
        />
      </Container>
      <div className="border-t border-line bg-sand-50">
        <Container
          size="wide"
          className="py-6 text-center text-sm tracking-wide text-ink-muted"
        >
          {areaNames.join(" · ")}
        </Container>
      </div>
    </>
  );
}
