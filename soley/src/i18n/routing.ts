import { defineRouting } from "next-intl/routing";

/**
 * Languages and URLs.
 *
 * To add a language (Mauritian Creole is planned, code "mfe"):
 *   1. add the code to `locales` below
 *   2. add a path for it to every entry in `pathnames`
 *   3. create messages/mfe.json (copy en.json) and register it in
 *      src/i18n/request.ts
 *   4. add guide files in content/guides/mfe/ (optional: missing guides fall
 *      back to not being listed in that language)
 *   5. add the language name in messages/*.json under "language"
 * TypeScript then reports every place that still needs the new language.
 */
export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",

  // Every URL starts with the language: /en/…, /fr/…, so search engines and
  // shared WhatsApp links always land in the right language.
  localePrefix: "always",

  // hreflang tags are written into the HTML by each page (src/lib/seo.ts).
  alternateLinks: false,

  // The first visit to "/" goes to the browser's language.
  localeDetection: true,

  // The language lives in the URL; no cookie is needed for it.
  localeCookie: false,

  /**
   * Internal route (folder in src/app/[locale]) → public URL per language.
   * Code always links to the internal route, e.g. <Link href="/calculator">,
   * and a French visitor sees /fr/calculateur.
   */
  pathnames: {
    "/": "/",
    "/calculator": { en: "/calculator", fr: "/calculateur" },
    "/get-quotes": { en: "/get-quotes", fr: "/obtenir-des-devis" },
    "/get-quotes/thank-you": {
      en: "/get-quotes/thank-you",
      fr: "/obtenir-des-devis/merci",
    },
    "/grant-guide": { en: "/grant-guide", fr: "/guide-subvention" },
    "/installers": { en: "/installers", fr: "/installateurs" },
    "/installers/[slug]": {
      en: "/installers/[slug]",
      fr: "/installateurs/[slug]",
    },
    // [slug] is itself translated: each guide has a slug per language
    // (content/guides/<locale>/<slug>.mdx).
    "/guides": "/guides",
    "/guides/[slug]": "/guides/[slug]",
    "/for-installers": { en: "/for-installers", fr: "/pour-installateurs" },
    "/for-installers/apply": {
      en: "/for-installers/apply",
      fr: "/pour-installateurs/candidature",
    },
    "/for-installers/thank-you": {
      en: "/for-installers/thank-you",
      fr: "/pour-installateurs/merci",
    },
    "/about": { en: "/about", fr: "/a-propos" },
    "/contact": "/contact",
    "/privacy": { en: "/privacy", fr: "/confidentialite" },
    "/terms": { en: "/terms", fr: "/conditions" },
    "/cookies": "/cookies",
    "/sign-in": { en: "/sign-in", fr: "/connexion" },
    "/sign-in/check-email": {
      en: "/sign-in/check-email",
      fr: "/connexion/verifiez-vos-emails",
    },

    // Household account
    "/account": { en: "/account", fr: "/mon-compte" },
    "/account/requests/[id]": {
      en: "/account/requests/[id]",
      fr: "/mon-compte/demandes/[id]",
    },
    "/account/privacy": {
      en: "/account/privacy",
      fr: "/mon-compte/confidentialite",
    },

    // Installer portal
    "/portal": { en: "/portal", fr: "/portail" },
    "/portal/leads/[id]": {
      en: "/portal/leads/[id]",
      fr: "/portail/demandes/[id]",
    },
    "/portal/billing": { en: "/portal/billing", fr: "/portail/facturation" },
    "/portal/profile": { en: "/portal/profile", fr: "/portail/profil" },

    // Admin: same paths in every language (internal tool, not indexed).
    "/admin": "/admin",
    "/admin/installers": "/admin/installers",
    "/admin/installers/[id]": "/admin/installers/[id]",
    "/admin/requests": "/admin/requests",
    "/admin/requests/[id]": "/admin/requests/[id]",
    "/admin/invoices": "/admin/invoices",
    "/admin/reviews": "/admin/reviews",
    "/admin/facts": "/admin/facts",
    "/admin/settings": "/admin/settings",
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
/** Routes without [params], which can be linked with a plain string. */
export type StaticPathname = {
  [P in AppPathname]: P extends `${string}[${string}` ? never : P;
}[AppPathname];
