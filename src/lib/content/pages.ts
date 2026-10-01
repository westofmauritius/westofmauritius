import "server-only";
import type { Node } from "@markdoc/markdoc";
import { cache } from "react";
import type { Locale } from "@/i18n/routing";
import { typeset } from "@/lib/typography";
import { reader } from "./reader";

export type TextPageKey = "about" | "privacy" | "cookies" | "terms";

export type TextPage = {
  title: string;
  intro: string;
  seoDescription: string;
  placeholder: boolean;
  updatedAt: string | null;
  body: Node;
};

/** One of the editable text pages (Keystatic → Site). */
export const getTextPage = cache(async (key: TextPageKey, locale: Locale): Promise<TextPage> => {
  const entry = await reader.singletons[key].read({ resolveLinkedFiles: true });
  if (!entry) throw new Error(`Missing content/pages/${key}/index.yaml`);
  const text = entry.content[locale];
  return {
    title: typeset(text.title, locale),
    intro: typeset(text.intro, locale),
    seoDescription: text.seoDescription || text.intro,
    placeholder: entry.placeholder,
    updatedAt: entry.updatedAt,
    body: text.body.node,
  };
});
