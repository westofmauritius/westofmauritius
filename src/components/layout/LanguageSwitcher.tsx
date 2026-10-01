"use client";

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { translateCategorySlug } from "@/lib/guide-categories";

// Shown in each language's own name, so a visitor can always find theirs.
const languageNames: Record<Locale, { short: string; full: string }> = {
  en: { short: "EN", full: "English" },
  fr: { short: "FR", full: "Français" },
};

/**
 * Links to the current page in each language. Plain links (not a dropdown)
 * so they work without JavaScript and search engines can follow them.
 */
export function LanguageSwitcher({ label }: { label: string }) {
  return (
    <ul
      aria-label={label}
      className="flex items-center gap-1 text-xs font-medium tracking-[0.14em]"
    >
      {routing.locales.map((l) => (
        <li key={l}>
          <LanguageLink target={l} />
        </li>
      ))}
    </ul>
  );
}

const linkClass = (active: boolean) =>
  cn(
    "flex min-h-11 min-w-11 items-center justify-center rounded-full px-2 transition-colors",
    active ? "text-ink" : "text-ink-muted hover:text-ink",
  );

/**
 * Finding "this page in French" is easy for most pages: same route, same
 * params. Some pages have translated params, though (/guides/beaches/x ↔
 * /guides/plages/y). Every page already lists its translations in its
 * <link rel="alternate" hreflang> tags (src/lib/seo/alternates.ts), so once
 * the page is loaded we use those. On the server, before that, we build the
 * link from the route and translate the guide category.
 */
function LanguageLink({ target }: { target: Locale }) {
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams<Record<string, string>>();
  const alternate = useSyncExternalStore(
    subscribeToHead,
    () => alternatePath(target),
    () => null,
  );

  const active = target === locale;
  const inner = (
    <>
      <span aria-hidden="true">{languageNames[target].short}</span>
      <span className="sr-only">{languageNames[target].full}</span>
    </>
  );
  const common = {
    hrefLang: target,
    lang: target,
    title: languageNames[target].full,
    "aria-current": active ? ("true" as const) : undefined,
    className: linkClass(active),
  };

  if (alternate) {
    // A full page load: the whole page, including <html lang>, changes language.
    return (
      <a href={alternate} {...common}>
        {inner}
      </a>
    );
  }

  const translatedParams = params.category
    ? {
        ...params,
        category: translateCategorySlug(params.category, locale, target),
      }
    : params;
  return (
    <Link
      // TypeScript cannot tell that these params belong to this pathname,
      // but they always do: both describe the page we are on.
      // @ts-expect-error -- pathname and params come from the same route
      href={{ pathname, params: translatedParams }}
      locale={target}
      {...common}
    >
      {inner}
    </Link>
  );
}

/** Path of this page in another language, from the hreflang tags in <head>. */
function alternatePath(target: Locale): string | null {
  const tag = document.querySelector(
    `link[rel="alternate"][hreflang="${target}"]`,
  );
  const href = tag?.getAttribute("href");
  if (!href) return null;
  // Only the path: the tags hold full URLs with the production domain.
  const url = new URL(href, window.location.href);
  return url.pathname + url.search;
}

/** Re-read the tags when Next.js swaps the <head> after client-side navigation. */
function subscribeToHead(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.head, {
    childList: true,
    subtree: true,
    attributes: true,
  });
  return () => observer.disconnect();
}
