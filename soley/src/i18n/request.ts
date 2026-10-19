import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import type en from "../../messages/en.json";
import { routing, type Locale } from "./routing";

type Messages = typeof en;

/**
 * One loader per language. `satisfies` makes TypeScript check that every
 * language is registered; src/i18n/messages.test.ts checks that every file
 * has exactly the same keys as en.json.
 */
const messageLoaders = {
  en: () => import("../../messages/en.json"),
  fr: () => import("../../messages/fr.json"),
} satisfies Record<Locale, () => Promise<{ default: Messages }>>;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  return {
    locale,
    messages: (await messageLoaders[locale]()).default,
    timeZone: "Indian/Mauritius",
  };
});
