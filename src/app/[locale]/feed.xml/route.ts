import { getTranslations } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { getGuides } from "@/lib/content/guides";
import { guideCategories } from "@/lib/guide-categories";
import { absoluteUrl } from "@/lib/seo/urls";
import { brandName } from "@/lib/site";

// Written once at build time, like the pages: nothing runs per request.
export const dynamic = "force-static";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const escape = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * RSS feed of the guides, one per language (/en/feed.xml, /fr/feed.xml), so
 * readers and newsletter tools can follow new articles. Placeholder guides
 * are left out.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/[locale]/feed.xml">,
) {
  const { locale: raw } = await params;
  const locale: Locale = routing.locales.includes(raw as Locale)
    ? (raw as Locale)
    : routing.defaultLocale;
  const [t, guides] = await Promise.all([
    getTranslations({ locale, namespace: "Home" }),
    getGuides(locale),
  ]);

  const items = guides
    .filter((g) => !g.placeholder)
    .map((guide) => {
      const url = absoluteUrl(
        {
          pathname: "/guides/[category]/[slug]",
          params: {
            category: guideCategories[guide.category].slug[locale],
            slug: guide.slug,
          },
        },
        locale,
      );
      const date = guide.updatedAt ?? guide.publishedAt;
      return `    <item>
      <title>${escape(guide.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escape(guide.excerpt)}</description>${
        date ? `\n      <pubDate>${new Date(date).toUTCString()}</pubDate>` : ""
      }
    </item>`;
    })
    .join("\n");

  const home = absoluteUrl("/", locale);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(brandName[locale])}</title>
    <link>${home}</link>
    <description>${escape(t("intro"))}</description>
    <language>${locale}</language>
    <atom:link href="${absoluteUrl("/", locale)}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
