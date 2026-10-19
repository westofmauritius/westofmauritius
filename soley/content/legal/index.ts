import type { MDXContent } from "mdx/types";
import type { Locale } from "@/i18n/routing";

/**
 * The legal pages. DRAFTS: they must be reviewed by a lawyer before launch
 * (LAUNCH_CHECKLIST.md); every page shows a draft notice while `draft` is
 * true. Placeholders the lawyer or owner must fill in are in [brackets].
 */
export const legalPages = {
  privacy: {
    draft: true,
    updated: "2026-10-19",
    load: {
      en: () => import("./en/privacy.mdx"),
      fr: () => import("./fr/privacy.mdx"),
    },
  },
  terms: {
    draft: true,
    updated: "2026-10-19",
    load: {
      en: () => import("./en/terms.mdx"),
      fr: () => import("./fr/terms.mdx"),
    },
  },
  cookies: {
    draft: true,
    updated: "2026-10-19",
    load: {
      en: () => import("./en/cookies.mdx"),
      fr: () => import("./fr/cookies.mdx"),
    },
  },
} satisfies Record<
  string,
  {
    draft: boolean;
    updated: string;
    load: Record<Locale, () => Promise<{ default: MDXContent }>>;
  }
>;

export type LegalPageKey = keyof typeof legalPages;
