import "server-only";
import { formatDate, formatMonth } from "./format";
import {
  defaultCalculatorSettings,
  policyFacts,
  type CalculatorSettings,
} from "@content/facts";

/**
 * The live values of the facts and calculator settings: the defaults from
 * content/facts.ts, overridden by whatever admins saved in the database.
 * (The database lookup is added with the data layer.)
 */
export type LiveFacts = {
  grantMaxMur: number;
  grantSharePercent: number;
  calculator: CalculatorSettings;
};

export async function getLiveFacts(): Promise<LiveFacts> {
  return {
    grantMaxMur: policyFacts.grantMaxMur.value,
    grantSharePercent: policyFacts.grantSharePercent.value,
    calculator: defaultCalculatorSettings,
  };
}

/**
 * "L'Express via AllAfrica, 27 July 2026": a fact's source for display,
 * with its publication date in the reader's language.
 */
export function sourceLabel(
  key: keyof typeof policyFacts,
  locale: import("@/i18n/routing").Locale,
) {
  const { source } = policyFacts[key];
  if (!("published" in source) || !source.published) return source.name;
  const date =
    source.published.length === 7
      ? formatMonth(source.published, locale)
      : formatDate(source.published, locale);
  return `${source.name}, ${date}`;
}
