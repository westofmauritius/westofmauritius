import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Figtree } from "next/font/google";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { resolveLocale } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import "../globals.css";

// One variable font, self-hosted by Next.js at build time (no request to
// Google from the visitor's browser), swapped in without layout shift.
const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  variable: "--font-figtree",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(site.url),
    title: t("defaultTitle"),
    description: t("defaultDescription"),
    applicationName: site.name,
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a2e4a",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "common" });
  return (
    <html lang={locale} className={figtree.variable}>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only z-50 rounded-full bg-sun-400 px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            {t("skipToContent")}
          </a>
          <SiteHeader />
          <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <SiteFooter />
          <WhatsAppButton />
          <ConsentBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
