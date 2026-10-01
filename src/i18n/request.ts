import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import type en from "../../messages/en.json";
import { routing, type Locale } from "./routing";

type Messages = typeof en;

/**
 * One loader per language. `satisfies` makes TypeScript check that every
 * language file has exactly the same keys as en.json, so a missing French
 * translation is a build error instead of a broken page.
 */
const messageLoaders = {
  en: () => import("../../messages/en.json"),
  fr: () => import("../../messages/fr.json"),
} satisfies Record<Locale, () => Promise<{ default: Messages }>>;

// Runs on the server for every request and tells next-intl which language and
// texts to use.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await messageLoaders[locale]()).default,
  };
});
