import type { Metadata } from "next";
import Script from "next/script";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { NewsletterSignup } from "@/components/forms/NewsletterSignup";
import { resolveLocale } from "@/i18n/locale";
import { isPublished } from "@/i18n/published";
import { getPathname, type Href } from "@/i18n/pathname";
import { routing } from "@/i18n/routing";
import { guideCategories } from "@/lib/guide-categories";
import { fontVariables } from "@/lib/fonts";
import { brandName, searchIndexing, siteUrl } from "@/lib/site";
import { openGraphBase } from "@/lib/seo/open-graph";
import "../globals.css";

// Build one static version of every page per language.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const brand = brandName[locale];

  return {
    // Turns relative URLs in metadata (e.g. images) into absolute ones.
    metadataBase: new URL(siteUrl),
    // Pages set only their own title; the brand is appended automatically.
    title: { default: brand, template: `%s · ${brand}` },
    description: t("description"),
    openGraph: openGraphBase(locale),
    twitter: { card: "summary_large_image" },
    // Hidden languages (French, until published) and the kill switch keep
    // pages out of search engines; preview hosts are blocked per request
    // (worker.mjs). Pages that set robots themselves are placeholders, which
    // are noindex anyway.
    ...((searchIndexing === "off" || !isPublished(locale)) && {
      robots: { index: false, follow: false },
    }),
  };
}

// The root layout: the <html> element, fonts, header and footer, per language.
export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Nav" });
  const f = await getTranslations({ locale, namespace: "Footer" });
  const l = await getTranslations({ locale, namespace: "LanguageSwitcher" });
  const brand = brandName[locale];
  /** A navigation entry with its public URL in this language (e.g. /fr/regions). */
  const item = (label: string, href: Href) => ({
    label,
    href,
    path: getPathname({ href, locale }),
  });

  return (
    <html lang={locale} className={`${fontVariables} h-full`}>
      <body className="flex min-h-full flex-col">
        {/*
          No NextIntlClientProvider for the whole site: header and footer get
          finished URLs and texts from the server, so most pages ship no
          translation library to the browser. Form pages add their own
          (FormsProvider).
        */}
        {/* First stop for keyboard users: jump past the header to the content. */}
        <a
          href="#main"
          className="sr-only z-[60] rounded-full bg-ocean-900 px-5 py-3 text-sm text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {l("skipToContent")}
        </a>
        <SiteHeader
          brandName={brand}
          items={[
            item(t("areas"), "/areas"),
            item(t("guides"), "/guides"),
            item(t("places"), "/places"),
            item(t("about"), "/about"),
            { ...item(t("live"), "/living-in-the-west"), highlight: true },
          ]}
          navLabel={t("mainNav")}
          menuLabel={t("openMenu")}
          closeLabel={t("closeMenu")}
          languageLabel={l("label")}
          locale={locale}
        />
        <main
          id="main"
          tabIndex={-1}
          className="flex flex-1 flex-col outline-none"
        >
          {children}
        </main>
        <SiteFooter
          brandName={brand}
          tagline={f("tagline")}
          columns={[
            {
              title: f("explore"),
              items: [
                item(t("areas"), "/areas"),
                item(t("guides"), "/guides"),
                item(t("places"), "/places"),
                item(f("planTrip"), {
                  pathname: "/guides/[category]",
                  params: { category: guideCategories.practical.slug[locale] },
                }),
              ],
            },
            {
              title: f("liveHere"),
              items: [
                item(t("live"), "/living-in-the-west"),
                item(f("community"), "/community"),
              ],
            },
            {
              title: f("about"),
              items: [
                item(t("about"), "/about"),
                item(f("author"), "/about/oliver"),
                item(t("contact"), "/contact"),
                item(f("privacy"), "/privacy"),
                item(f("cookies"), "/cookies"),
                item(f("terms"), "/terms"),
                item(f("credits"), "/credits"),
              ],
            },
          ]}
          newsletter={<NewsletterSignup locale={locale} source="footer" />}
          legal={`© ${new Date().getFullYear()} ${brand}. ${f("rights")}`}
        />
        {/*
          Umami: cookie-free visitor statistics and conversion events
          (data-umami-event on links, track() in forms). Only loaded when
          configured; honours the browser's Do Not Track setting.
        */}
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            data-do-not-track="true"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
