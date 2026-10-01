import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LivingCard } from "@/components/content/LivingCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/Link";
import { resolveLocale } from "@/i18n/locale";
import { getAreas } from "@/lib/content/areas";
import { getLivingArticles } from "@/lib/content/living";
import { localeAlternates } from "@/lib/seo/alternates";
import { openGraphBase } from "@/lib/seo/open-graph";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/live-in-the-west">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Pages.live" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: localeAlternates("/live-in-the-west", locale),
    openGraph: {
      ...openGraphBase(locale),
      title: t("title"),
      description: t("intro"),
    },
  };
}

/** The property section: who it is for, ways to buy, areas, and the enquiry. */
export default async function LiveInTheWestPage({
  params,
}: PageProps<"/[locale]/live-in-the-west">) {
  const locale = await resolveLocale(params);
  const [t, articles, areas] = await Promise.all([
    getTranslations({ locale }),
    getLivingArticles(locale),
    getAreas(locale),
  ]);
  const schemes = articles.filter((a) => a.kind === "scheme");
  const general = articles.filter((a) => a.kind === "general");
  const areaGuides = articles.filter((a) => a.kind === "area");
  const audiences = ["Abroad", "Home", "Invest"] as const;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ocean-900 text-white">
        <div
          aria-hidden="true"
          className="absolute -top-32 right-0 -z-10 size-[32rem] rounded-full bg-coral-500/25 blur-3xl"
        />
        <Container size="wide" className="py-20 sm:py-28">
          <p className="mb-5 eyebrow text-coral-200">{t("LivePage.eyebrow")}</p>
          <h1 className="max-w-3xl text-display-1 text-white">
            {t("Pages.live.title")}
          </h1>
          <p className="mt-6 max-w-2xl lead text-ocean-100">
            {t("Pages.live.intro")}
          </p>
          <ButtonLink
            href="/live-in-the-west/enquire"
            variant="light"
            className="mt-9"
            data-umami-event="cta-enquire"
            data-umami-event-position="live-hero"
          >
            {t("LivePage.enquireCta")}
          </ButtonLink>
        </Container>
      </section>

      <Container size="wide" className="py-16 sm:py-20">
        <h2 className="mb-8 eyebrow text-ink-muted">
          {t("LivePage.audienceTitle")}
        </h2>
        <ul className="grid gap-10 md:grid-cols-3">
          {audiences.map((key) => (
            <li key={key} className="border-t border-line pt-6">
              <h3 className="text-2xl">{t(`LivePage.audience${key}`)}</h3>
              <p className="mt-3 leading-relaxed text-ink-muted">
                {t(`LivePage.audience${key}Text`)}
              </p>
            </li>
          ))}
        </ul>
      </Container>

      {schemes.length > 0 && (
        <section className="border-t border-line bg-sand-50 py-16 sm:py-20">
          <Container size="wide">
            <SectionHeading
              title={t("LivePage.schemesTitle")}
              intro={t("LivePage.schemesIntro")}
            />
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {schemes.map((a) => (
                <li key={a.key}>
                  <LivingCard article={a} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {areaGuides.length > 0 && (
        <section className="py-16 sm:py-20">
          <Container size="wide">
            <SectionHeading
              title={t("LivePage.areasTitle")}
              intro={t("LivePage.areasIntro")}
            />
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {areaGuides.map((a) => {
                const area = areas.find((x) => x.slug === a.areaSlug);
                return (
                  <li key={a.key}>
                    <Link
                      href={{
                        pathname: "/live-in-the-west/[slug]",
                        params: { slug: a.slug },
                      }}
                      className="group relative block overflow-hidden rounded-sm"
                    >
                      <PlaceholderImage
                        tone={area?.placeholderTone ?? "lagoon"}
                        aspect="aspect-[16/10]"
                        className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                      <span className="absolute inset-x-0 top-0 bg-linear-to-b from-ocean-950/60 to-transparent p-5 pb-12 font-display text-2xl text-white">
                        {a.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Container>
        </section>
      )}

      {general.length > 0 && (
        <section className="border-t border-line py-16 sm:py-20">
          <Container size="wide">
            <SectionHeading title={t("LivePage.generalTitle")} />
            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              {general.map((a) => (
                <li key={a.key}>
                  <LivingCard article={a} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <section className="bg-sand-100 py-20 sm:py-24">
        <Container size="prose" className="text-center">
          <h2 className="text-display-2">{t("LivePage.enquireTitle")}</h2>
          <p className="mt-5 lead text-ink-muted">
            {t("LivePage.enquireText")}
          </p>
          <ButtonLink
            href="/live-in-the-west/enquire"
            variant="accent"
            className="mt-8"
            data-umami-event="cta-enquire"
            data-umami-event-position="live-bottom"
          >
            {t("LivePage.enquireCta")}
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}
