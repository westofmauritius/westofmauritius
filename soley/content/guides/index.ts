import type { MDXContent } from "mdx/types";
import type { Locale } from "@/i18n/routing";

/**
 * The guides. Each guide has one MDX file per language
 * (content/guides/<locale>/<slug>.mdx) with its own translated slug, title
 * and description. The body text lives in the MDX files; everything about
 * the guide (slugs, titles, dates) lives here, typed.
 *
 * To add a guide: write the MDX files, then add an entry below.
 * To add a language: add its slug, title, description and loader to every
 * guide (guides without the language are simply not listed in it).
 */

type GuideVersion = {
  slug: string;
  title: string;
  description: string;
  load: () => Promise<{ default: MDXContent }>;
};

export type Guide = {
  key: string;
  /** Date the guide was last reviewed against its sources, ISO format. */
  reviewed: string;
  versions: Partial<Record<Locale, GuideVersion>>;
};

export const guides: Guide[] = [
  {
    key: "battery",
    reviewed: "2026-10-19",
    versions: {
      en: {
        slug: "battery-or-not",
        title: "Battery or not? How to decide",
        description:
          "When a home battery is worth considering in Mauritius, when it is not, and the questions to ask every installer.",
        load: () => import("./en/battery-or-not.mdx"),
      },
      fr: {
        slug: "batterie-ou-pas",
        title: "Batterie ou pas ? Comment décider",
        description:
          "Quand une batterie domestique mérite réflexion à Maurice, quand elle n’est pas utile, et les questions à poser à chaque installateur.",
        load: () => import("./fr/batterie-ou-pas.mdx"),
      },
    },
  },
  {
    key: "read-quote",
    reviewed: "2026-10-19",
    versions: {
      en: {
        slug: "how-to-read-a-solar-quote",
        title: "How to read a solar quote",
        description:
          "System size, production, equipment, warranties, CEB registration: what to check in a solar quote before you sign.",
        load: () => import("./en/how-to-read-a-solar-quote.mdx"),
      },
      fr: {
        slug: "comment-lire-un-devis-solaire",
        title: "Comment lire un devis solaire",
        description:
          "Taille du système, production, matériel, garanties, déclaration au CEB : ce qu’il faut vérifier dans un devis solaire avant de signer.",
        load: () => import("./fr/comment-lire-un-devis-solaire.mdx"),
      },
    },
  },
  {
    key: "grid",
    reviewed: "2026-10-19",
    versions: {
      en: {
        slug: "grid-connection-ceb",
        title: "Connecting your solar system to the CEB grid",
        description:
          "Why your solar system must be registered with the CEB, selling surplus electricity, and what to ask your installer.",
        load: () => import("./en/grid-connection-ceb.mdx"),
      },
      fr: {
        slug: "raccordement-au-reseau-ceb",
        title: "Raccorder votre installation solaire au réseau du CEB",
        description:
          "Pourquoi votre installation solaire doit être déclarée au CEB, la revente du surplus, et quoi demander à votre installateur.",
        load: () => import("./fr/raccordement-au-reseau-ceb.mdx"),
      },
    },
  },
];

export function findGuide(locale: Locale, slug: string) {
  const guide = guides.find((g) => g.versions[locale]?.slug === slug);
  return guide ? { guide, version: guide.versions[locale]! } : null;
}

export const guidesIn = (locale: Locale) =>
  guides
    .filter((g) => g.versions[locale])
    .map((g) => ({ guide: g, version: g.versions[locale]! }));
