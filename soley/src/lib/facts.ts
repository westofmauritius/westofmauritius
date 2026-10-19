import "server-only";
import { formatDate, formatMonth } from "./format";
import {
  calculatorDefaults,
  defaultCalculatorSettings,
  policyFacts,
  type CalculatorSettings,
} from "@content/facts";
import { getDb } from "./data";

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
  const live: LiveFacts = {
    grantMaxMur: policyFacts.grantMaxMur.value,
    grantSharePercent: policyFacts.grantSharePercent.value,
    calculator: { ...defaultCalculatorSettings },
  };
  try {
    const db = getDb();
    const [facts, settings] = await Promise.all([
      db.select("facts"),
      db.select("calculator_settings"),
    ]);
    for (const fact of facts) {
      if (fact.value === null) continue;
      if (fact.key === "grantMaxMur") live.grantMaxMur = Number(fact.value);
      if (fact.key === "grantSharePercent")
        live.grantSharePercent = Number(fact.value);
    }
    for (const setting of settings) {
      if (setting.key in calculatorDefaults) {
        live.calculator[setting.key as keyof CalculatorSettings] = Number(
          setting.value,
        );
      }
    }
  } catch (error) {
    // No database (e.g. a build without Supabase variables): the defaults
    // from content/facts.ts are used, which is always safe.
    if (process.env.NODE_ENV !== "production")
      console.warn("Facts: using defaults", error);
  }
  return live;
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
