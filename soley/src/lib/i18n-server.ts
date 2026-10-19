import { hasLocale } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";

/** A locale passed to a server action, checked (falls back to English). */
export const safeLocale = (value: unknown): Locale =>
  typeof value === "string" && hasLocale(routing.locales, value)
    ? value
    : routing.defaultLocale;
