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
};

/**
 * "Home / Areas / Tamarin" trail. Also tells Google the page's place in the
 * site (BreadcrumbList), which it can show in search results.
 */
export function Breadcrumbs({ items, locale, label }: BreadcrumbsProps) {
  return (
    <nav aria-label={label} className="text-xs tracking-wide text-ink-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="text-ink">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className="hover:text-ink hover:underline"
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
