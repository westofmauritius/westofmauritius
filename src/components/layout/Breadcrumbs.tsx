import { JsonLd } from "@/components/seo/JsonLd";
import { Link } from "@/i18n/Link";
import type { Locale } from "@/i18n/routing";
import { absoluteUrl, type Href } from "@/lib/seo/urls";

export type Crumb = { label: string; href: Href };

type BreadcrumbsProps = {
  /** From the start page down to the current page (which is last). */
  items: Crumb[];
  locale: Locale;
  label: string;
  /** "light" for use on the dark blue page headers. */
  tone?: "dark" | "light";
};

/**
 * "Home / Areas / Tamarin" trail. Also tells Google the page's place in the
 * site (BreadcrumbList), which it can show in search results.
 */
export function Breadcrumbs({
  items,
  locale,
  label,
  tone = "dark",
}: BreadcrumbsProps) {
  const light = tone === "light";
  return (
    <nav
      aria-label={label}
      className={`text-xs tracking-wide ${light ? "text-ocean-200" : "text-ink-muted"}`}
    >
      {/* Always one line: the current page's name is cut with "…" when space
          runs out (it is the page title just below anyway). A trail that
          wrapped only until the web font loaded would push the page down. */}
      <ol className="flex items-center gap-x-2 whitespace-nowrap">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li
              key={i}
              className={
                last ? "min-w-0 truncate" : "flex shrink-0 items-center gap-2"
              }
            >
              {last ? (
                <span
                  aria-current="page"
                  className={light ? "text-white" : "text-ink"}
                >
                  {item.label}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className={
                      light
                        ? "hover:text-white hover:underline"
                        : "hover:text-ink hover:underline"
                    }
                  >
                    {item.label}
                  </Link>
                  <span aria-hidden="true">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.label,
            item: absoluteUrl(item.href, locale),
          })),
        }}
      />
    </nav>
  );
}
