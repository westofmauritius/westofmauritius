import "server-only";
import { cache } from "react";
import type { Locale } from "@/i18n/routing";
import { toOptionalPhoto } from "./photo";
import { reader } from "./reader";
import type { Photo } from "./types";

/** Start-page settings from Keystatic (Start page). */
export const getHomepage = cache(async (locale: Locale): Promise<{ hero: Photo | null }> => {
  const entry = await reader.singletons.homepage.read();
  return { hero: entry ? toOptionalPhoto(entry.hero, locale) : null };
});
