import NextLink from "next/link";
import { getLocale } from "next-intl/server";
import { getPathname } from "./navigation";
import type { Locale } from "./routing";

export type Href = Parameters<typeof getPathname>[0]["href"];

type LinkProps = Omit<React.ComponentProps<typeof NextLink>, "href"> & {
  /** Internal route, e.g. "/areas" or { pathname: "/places/[slug]", params: { slug } }. */
  href: Href;
  /** Another language than the current page's. */
  locale?: Locale;
};

/**
 * Language-aware link for server components: works out the public URL on the
 * server (/fr/lieux/…) and renders a plain Next.js link. Unlike next-intl's
 * own Link it needs no translation library in the browser, which keeps the
 * JavaScript on every page smaller. (Client components inside forms use
 * next-intl's Link from ./navigation.)
 */
export async function Link({ href, locale, ...props }: LinkProps) {
  const target = locale ?? ((await getLocale()) as Locale);
  return <NextLink href={getPathname({ href, locale: target })} {...props} />;
}
