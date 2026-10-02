import NextLink from "next/link";
import { getLocale } from "next-intl/server";
import { getPathname, type Href } from "./pathname";
import type { Locale } from "./routing";

export type { Href };

type LinkProps = Omit<React.ComponentProps<typeof NextLink>, "href"> & {
  /** Internal route, e.g. "/areas" or { pathname: "/places/[slug]", params: { slug } }. */
  href: Href;
  /** Another language than the current page's. */
  locale?: Locale;
  /** A section of the target page, e.g. "living" for #living. */
  hash?: string;
};

/**
 * Language-aware link for server components: works out the public URL on the
 * server (/fr/lieux/…) and renders a plain Next.js link. Unlike next-intl's
 * own Link it needs no translation library in the browser, which keeps the
 * JavaScript on every page smaller. (Client components inside forms use
 * next-intl's Link from ./navigation.)
 */
export async function Link({
  href,
  locale,
  hash,
  prefetch = false,
  ...props
}: LinkProps) {
  const target = locale ?? ((await getLocale()) as Locale);
  const path = getPathname({ href, locale: target });
  // No prefetching by default: a page full of cards would otherwise fetch
  // dozens of pages in the background as they scroll into view, costing
  // phones data and processor time. Every page is a static file served
  // from the edge, so a click still opens it quickly. The header keeps
  // prefetching for the main sections (pass prefetch to opt in).
  return (
    <NextLink
      href={hash ? `${path}#${hash}` : path}
      prefetch={prefetch}
      {...props}
    />
  );
}
