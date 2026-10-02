import { defineRouting } from "next-intl/routing";

/**
 * Languages and URLs.
 *
 * To add a language (e.g. German):
 *   1. add "de" to `locales`
 *   2. add a "de" path to every entry in `pathnames`
 *   3. create messages/de.json and register it in src/i18n/request.ts
 *   4. add the brand name in src/lib/site.ts
 *
 * The French domain (ouestmaurice.mu) is connected in the deployment step by
 * adding a `domains` entry here, e.g.
 *   domains: [
 *     { domain: "westofmauritius.mu", defaultLocale: "en", locales: ["en"] },
 *     { domain: "ouestmaurice.mu", defaultLocale: "fr", locales: ["fr"] },
 *   ]
 * Because every link and hreflang tag is built from this file, nothing else
 * in the code needs to change.
 */
export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",

  // Every URL starts with the language: /en/…, /fr/…
  localePrefix: "always",

  // We write hreflang tags into the HTML ourselves (src/lib/seo/alternates.ts)
  // because only the page knows the right URL for content with translated
  // slugs. This turns off next-intl's duplicate HTTP `Link` header.
  alternateLinks: false,

  // While French is hidden (src/i18n/published.ts), "/" always opens the
  // English site; once published, the browser's language decides.
  localeDetection: process.env.NEXT_PUBLIC_FRENCH_PUBLISHED === "true",

  // No language cookie: the language is always in the URL, and the first
  // visit to "/" uses the browser's language. Without it, the public site
  // sets no cookies at all, so no cookie banner is needed (DECISIONS.md).
  localeCookie: false,

  /**
   * Internal route (the folder name in src/app/[locale]) → public URL per
   * language. Code always links to the internal route, e.g.
   * <Link href="/places/[slug]">, and the visitor sees /fr/lieux/… in French.
   */
  pathnames: {
    "/": "/",
    "/areas": { en: "/areas", fr: "/regions" },
    "/areas/[slug]": { en: "/areas/[slug]", fr: "/regions/[slug]" },
    "/guides": "/guides",
    // [category] and [slug] are themselves translated (e.g. "plages"), see
    // src/lib/guide-categories.ts and the guide's "URL in this language".
    "/guides/[category]": "/guides/[category]",
    "/guides/[category]/[slug]": "/guides/[category]/[slug]",
    "/places": { en: "/places", fr: "/lieux" },
    "/places/[slug]": { en: "/places/[slug]", fr: "/lieux/[slug]" },
    "/living-in-the-west": {
      en: "/living-in-the-west",
      fr: "/vivre-dans-l-ouest",
    },
    "/living-in-the-west/enquire": {
      en: "/living-in-the-west/enquire",
      fr: "/vivre-dans-l-ouest/demande",
    },
    "/living-in-the-west/[slug]": {
      en: "/living-in-the-west/[slug]",
      fr: "/vivre-dans-l-ouest/[slug]",
    },
    "/about": { en: "/about", fr: "/a-propos" },
    "/about/oliver": { en: "/about/oliver", fr: "/a-propos/oliver" },
    "/contact": "/contact",
    "/privacy": { en: "/privacy", fr: "/confidentialite" },
    "/cookies": "/cookies",
    "/terms": { en: "/terms", fr: "/conditions" },
    "/credits": "/credits",
    "/community": { en: "/community", fr: "/communaute" },
    "/thank-you": { en: "/thank-you", fr: "/merci" },
    "/newsletter": "/newsletter",
    "/styleguide": "/styleguide",
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
/** Routes without a [param], which can be linked to with a plain string. */
export type StaticPathname = Exclude<AppPathname, `${string}[${string}`>;
