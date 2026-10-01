import type messages from "../messages/en.json";
import type { routing } from "./i18n/routing";

// Gives next-intl our locales and message keys, so t("Nav.areas") is
// type-checked and autocompleted.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
