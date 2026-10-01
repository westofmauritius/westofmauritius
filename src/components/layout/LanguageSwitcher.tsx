"use client";

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

// Shown in each language's own name, so a visitor can always find theirs.
const languageNames: Record<Locale, { short: string; full: string }> = {
  en: { short: "EN", full: "English" },
  fr: { short: "FR", full: "Français" },
};

/**
 * Links to the current page in each other language. Plain links (not a
 * dropdown) so they work without JavaScript and search engines can follow them.
 */
export function LanguageSwitcher({ label }: { label: string }) {
  const locale = useLocale();
  // The internal route, e.g. "/places/[slug]", plus its params ({ slug }).
  const pathname = usePathname();
  const params = useParams();

  return (
    <ul
      aria-label={label}
      className="flex items-center gap-1 text-xs font-medium tracking-[0.14em]"
    >
      {routing.locales.map((l) => (
        <li key={l}>
          <Link
            // TypeScript cannot tell that these params belong to this pathname,
            // but they always do: both describe the page we are on.
            // @ts-expect-error -- pathname and params come from the same route
            href={{ pathname, params }}
            locale={l}
            hrefLang={l}
            lang={l}
            title={languageNames[l].full}
            aria-current={l === locale ? "true" : undefined}
            className={cn(
              "flex min-h-11 min-w-11 items-center justify-center rounded-full px-2 transition-colors",
              l === locale ? "text-ink" : "text-ink-muted hover:text-ink",
            )}
          >
            <span aria-hidden="true">{languageNames[l].short}</span>
            <span className="sr-only">{languageNames[l].full}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
