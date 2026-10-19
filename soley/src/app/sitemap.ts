import type { MetadataRoute } from "next";
import { guides } from "@content/guides";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { listDirectory } from "@/lib/services/directory";
import { site } from "@/lib/site";

// Rebuilt hourly so newly approved installers are listed.
export const revalidate = 3600;

type Href = Parameters<typeof getPathname>[0]["href"];

/** Public pages only; signed-in areas and thank-you pages are left out. */
const publicPages: { href: Href; priority: number }[] = [
  { href: "/", priority: 1 },
  { href: "/calculator", priority: 0.9 },
  { href: "/get-quotes", priority: 0.9 },
  { href: "/grant-guide", priority: 0.9 },
  { href: "/installers", priority: 0.7 },
  { href: "/guides", priority: 0.7 },
  { href: "/for-installers", priority: 0.6 },
  { href: "/for-installers/apply", priority: 0.4 },
  { href: "/about", priority: 0.5 },
  { href: "/contact", priority: 0.4 },
  { href: "/privacy", priority: 0.2 },
  { href: "/terms", priority: 0.2 },
  { href: "/cookies", priority: 0.2 },
];

const url = (href: Href, locale: Locale) =>
  `${site.url}${getPathname({ href, locale })}`;

/** One entry per language, each listing all language versions (hreflang). */
function entries(
  perLocale: Partial<Record<Locale, Href>>,
  priority: number,
  lastModified?: string,
) {
  const languages = Object.fromEntries(
    Object.entries(perLocale).map(([l, href]) => [l, url(href, l as Locale)]),
  );
  return Object.entries(perLocale).map(([l, href]) => ({
    url: url(href, l as Locale),
    priority,
    ...(lastModified ? { lastModified } : {}),
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const all = (href: Href) =>
    Object.fromEntries(routing.locales.map((l) => [l, href]));
  const pages = publicPages.flatMap((p) => entries(all(p.href), p.priority));
  const guidePages = guides.flatMap((guide) =>
    entries(
      Object.fromEntries(
        Object.entries(guide.versions).map(([l, v]) => [
          l,
          { pathname: "/guides/[slug]", params: { slug: v.slug } },
        ]),
      ),
      0.6,
      guide.reviewed,
    ),
  );
  // Demo companies are never listed.
  const installers = await listDirectory().catch(() => []);
  const installerPages = installers
    .filter((e) => !e.installer.is_demo)
    .flatMap((e) =>
      entries(
        all({
          pathname: "/installers/[slug]",
          params: { slug: e.installer.slug },
        }),
        0.5,
        e.installer.updated_at,
      ),
    );
  return [...pages, ...guidePages, ...installerPages];
}
