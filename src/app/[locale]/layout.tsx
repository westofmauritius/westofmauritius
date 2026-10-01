import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { resolveLocale } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { brandName, siteUrl } from "@/lib/site";
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
    openGraph: {
      siteName: brand,
      locale: locale === "fr" ? "fr_FR" : "en_GB",
      type: "website",
    },
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
          <main className="flex flex-1 flex-col">{children}</main>
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
                ],
              },
            ]}
            legal={`© ${new Date().getFullYear()} ${brand}. ${f("rights")}`}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
