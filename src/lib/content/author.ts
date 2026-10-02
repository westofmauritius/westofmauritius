import "server-only";
import type { Node } from "@markdoc/markdoc";
import { cache } from "react";
import type { Locale } from "@/i18n/routing";
import { typeset } from "@/lib/typography";
import { toOptionalPhoto } from "./photo";
import { reader } from "./reader";
import type { Photo } from "./types";

/**
 * The person behind the site (Keystatic → Site → Author). Every guide and
 * article is written by them; the byline, the author page and the
 * structured data all read from here.
 */
export type Author = {
  name: string;
  role: string;
  shortBio: string;
  seoDescription: string;
  /** True until the bio is written: page noindex, bio not shown elsewhere. */
  placeholder: boolean;
  photo: Photo | null;
  links: string[];
  body: Node;
};

export const getAuthor = cache(async (locale: Locale): Promise<Author> => {
  const entry = await reader.singletons.author.read({
    resolveLinkedFiles: true,
  });
  if (!entry) throw new Error("Missing content/author/index.yaml");
  const text = entry.content[locale];
  return {
    name: entry.name,
    role: typeset(text.role, locale),
    shortBio: typeset(text.shortBio, locale),
    seoDescription: text.seoDescription || text.shortBio,
    placeholder: entry.placeholder,
    photo: toOptionalPhoto(entry.photo, locale),
    links: entry.links.filter((l): l is string => Boolean(l)),
    body: text.body.node,
  };
});
