"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { translatePath } from "@/lib/localized-paths";

// Shown in each language's own name, so a visitor can always find theirs.
const languageNames: Record<Locale, { short: string; full: string }> = {
  en: { short: "EN", full: "English" },
  fr: { short: "FR", full: "Français" },
};

/**
 * Links to the current page in each language. Plain links (not a dropdown)
 * so they work without JavaScript and search engines can follow them.
 */
export function LanguageSwitcher({
  label,
  locale,
}: {
  label: string;
  locale: Locale;
}) {
  return (
    <ul
      aria-label={label}
      className="flex items-center gap-0.5 rounded-full bg-sand-100 p-1 text-xs font-semibold tracking-[0.12em]"
    >
      {routing.locales.map((l) => (
        <li key={l}>
          <LanguageLink target={l} current={locale} />
        </li>
      ))}
    </ul>
  );
}

/**
 * "This page in French": in the server-rendered HTML the URL is translated
 * from the routing table (src/lib/localized-paths.ts). Once the page has
 * loaded, the page's own hreflang tags are used instead: they also know
 * translated slugs that only content has (/guides/beaches/x ↔ /guides/plages/y).
 *
 * A plain <a> (full page load): the whole page, including <html lang>,
 * changes language.
 */
function LanguageLink({
  target,
  current,
}: {
  target: Locale;
  current: Locale;
}) {
  const pathname = usePathname();
  const fromHead = useSyncExternalStore(
    subscribeToHead,
    () => alternatePath(target),
    () => null,
  );
  const href = fromHead ?? translatePath(pathname, current, target);
  const active = target === current;

  return (
    <a
      href={href}
      hrefLang={target}
      lang={target}
      title={languageNames[target].full}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex min-h-9 min-w-11 items-center justify-center rounded-full px-2 transition-colors",
        active
          ? "bg-white text-ink shadow-sm"
          : "text-ocean-700 hover:text-ink",
      )}
    >
      <span aria-hidden="true">{languageNames[target].short}</span>
      <span className="sr-only">{languageNames[target].full}</span>
    </a>
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
