"use client";

import { useLocale, useTranslations } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";

/**
 * Links to the current page in the other languages.
 *
 * The page's hreflang tags (written by src/lib/seo.ts) are the single source
 * of "this page in another language", so the switcher reads them when it is
 * clicked. That keeps it right even for guides whose slug differs per
 * language, and after client-side navigation. Admin pages share their paths
 * across languages; other pages without hreflang tags (signed-in areas) go
 * to the language's start page, which is also the link's plain href.
 */
function targetFor(locale: Locale) {
  const link = document.querySelector<HTMLLinkElement>(
    `link[rel="alternate"][hreflang="${locale}"]`,
  );
  if (link) {
    const url = new URL(link.href);
    return url.pathname + url.search;
  }
  const path = window.location.pathname;
  if (/^\/[a-z]{2,3}\/admin/.test(path)) {
    return path.replace(/^\/[a-z]{2,3}/, `/${locale}`) + window.location.search;
  }
  return `/${locale}`;
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("language");
  const others = routing.locales.filter((l) => l !== locale);

  return (
    <ul className={className} aria-label={t("label")}>
      {others.map((l) => (
        <li key={l}>
          <a
            href={`/${l}`}
            hrefLang={l}
            lang={l}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey) return;
              event.preventDefault();
              window.location.assign(targetFor(l));
            }}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-2 font-semibold underline-offset-4 hover:underline sm:px-3"
            title={t("switchTo", { language: t(l) })}
          >
            {/* The code on small phones, where the full name does not fit. */}
            <span aria-hidden="true" className="sm:hidden">
              {l.toUpperCase()}
            </span>
            <span className="sr-only sm:not-sr-only">{t(l)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
