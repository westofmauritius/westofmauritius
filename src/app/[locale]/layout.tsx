import type { Metadata } from "next";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { FormsProvider } from "@/components/forms/FormsProvider";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { consentTexts, currentConsent } from "@/lib/forms/consent";
import { resolveLocale } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { allowIndexing, brandName, siteUrl } from "@/lib/site";
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
    // Before launch (or on preview addresses) nothing is indexed; see allowIndexing.
    ...(!allowIndexing && { robots: { index: false, follow: false } }),
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

  return (
    <html lang={locale} className={`${fontVariables} h-full`}>
      <body className="flex min-h-full flex-col">
        {/* Gives client components the language. messages={null}: no
            client component needs texts, so none are sent to the browser. */}
        <NextIntlClientProvider messages={null}>
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
              { label: t("areas"), href: "/areas" },
              { label: t("guides"), href: "/guides" },
              { label: t("places"), href: "/places" },
              { label: t("live"), href: "/live-in-the-west" },
              { label: t("about"), href: "/about" },
            ]}
            navLabel={t("mainNav")}
            menuLabel={t("openMenu")}
            closeLabel={t("closeMenu")}
            languageLabel={l("label")}
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
                  { label: t("areas"), href: "/areas" },
                  { label: t("guides"), href: "/guides" },
                  { label: t("places"), href: "/places" },
                ],
              },
              {
                title: f("liveHere"),
                items: [{ label: t("live"), href: "/live-in-the-west" }],
              },
              {
                title: f("about"),
                items: [
                  { label: t("about"), href: "/about" },
                  { label: t("contact"), href: "/contact" },
                  { label: f("privacy"), href: "/privacy" },
                  { label: f("cookies"), href: "/cookies" },
                  { label: f("terms"), href: "/terms" },
                ],
              },
            ]}
            newsletter={
              <FormsProvider>
                <NewsletterForm
                  consentText={consentTexts[currentConsent.newsletter][locale]}
                />
              </FormsProvider>
            }
            legal={`© ${new Date().getFullYear()} ${brand}. ${f("rights")}`}
          />
        </NextIntlClientProvider>
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
