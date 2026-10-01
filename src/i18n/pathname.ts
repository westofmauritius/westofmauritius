import {
  routing,
  type AppPathname,
  type Locale,
  type StaticPathname,
} from "./routing";

/** Names of the [params] in a route, e.g. "slug" for "/places/[slug]". */
type ParamNames<P extends string> =
  P extends `${string}[${infer Name}]${infer Rest}`
    ? Name | ParamNames<Rest>
    : never;

type Query = Record<string, string>;

/** An internal route, e.g. "/areas" or { pathname: "/places/[slug]", params: { slug } }. */
export type Href =
  | StaticPathname
  | {
      [P in AppPathname]: {
        pathname: P;
        query?: Query;
      } & (ParamNames<P> extends never
        ? { params?: never }
        : { params: Record<ParamNames<P>, string> });
    }[AppPathname];

/**
 * The public path of an internal route in a language:
 *   getPathname({ href: { pathname: "/places/[slug]", params: { slug: "x" } }, locale: "fr" })
 *   → "/fr/lieux/x"
 *
 * Same result as next-intl's getPathname (see pathname.test.ts), but
 * as a plain function. next-intl's version comes from createNavigation(),
 * whose module also holds its client-side Link; importing it from server
 * code made every page ship next-intl's browser code (~14 kB) for nothing.
 */
export function getPathname({
  href,
  locale,
}: {
  href: Href;
  locale: Locale;
}): string {
  const route = typeof href === "string" ? { pathname: href } : href;
  const value = routing.pathnames[route.pathname] as
    string | Record<Locale, string>;
  let path = typeof value === "string" ? value : value[locale];
  const params: Record<string, string> =
    "params" in route && route.params ? route.params : {};
  for (const [name, slug] of Object.entries(params)) {
    path = path.replace(`[${name}]`, encodeURIComponent(slug));
  }
  const query =
    "query" in route && route.query
      ? `?${new URLSearchParams(route.query).toString()}`
      : "";
  return `/${locale}${path === "/" ? "" : path}${query}`;
}
