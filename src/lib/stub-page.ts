import type { Metadata } from "next";
import { createElement } from "react";
import { getTranslations } from "next-intl/server";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { resolveLocale } from "@/i18n/locale";
import type { StaticPathname } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo/alternates";

type StubKey = "areas" | "guides" | "live" | "about" | "contact" | "privacy";
type Props = { params: Promise<{ locale: string }> };

/**
 * Temporary "coming soon" page for a section, with a translated title,
 * hreflang tags and noindex (so unfinished pages stay out of Google).
 * Each section replaces its stub with a real page in a later step.
 */
export function stubPage(key: StubKey, href: StaticPathname) {
  async function generateMetadata({ params }: Props): Promise<Metadata> {
    const locale = await resolveLocale(params);
    const t = await getTranslations({ locale, namespace: "Pages" });
    return {
      title: t(`${key}.title`),
      description: t(`${key}.intro`),
      // Only static routes are stubbed, so `href` never needs params.
      alternates: localeAlternates(
        href as Parameters<typeof localeAlternates>[0],
        locale,
      ),
      robots: { index: false },
    };
  }

  async function Page({ params }: Props) {
    const locale = await resolveLocale(params);
    const t = await getTranslations({ locale, namespace: "Pages" });
    return createElement(ComingSoon, {
      title: t(`${key}.title`),
      intro: t(`${key}.intro`),
    });
  }

  return { generateMetadata, Page };
}
