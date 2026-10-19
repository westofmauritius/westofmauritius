import type { CalculatorSettings } from "@content/facts";
import type { GrantRules } from "./calculator";

/**
 * Derived figures for the quote comparison, so households compare like for
 * like: the price after the grant, the price per kWp and a payback
 * estimate based on their own bill. Pure function, tested in compare.test.ts.
 */

export type ComparableQuote = {
  id: string;
  price_mur: number;
  system_kwp: number;
  yearly_production_kwh: number;
  panel_warranty_years: number;
  inverter_warranty_years: number;
  workmanship_warranty_years: number;
  start_weeks: number;
};

export type QuoteFigures = {
  grantMur: number;
  afterGrantMur: number;
  pricePerKwpMur: number;
  yearlySavingMur: number;
  paybackYears: number | null;
};

export function quoteFigures(
  quote: ComparableQuote,
  monthlyBillMur: number,
  settings: Pick<CalculatorSettings, "tariffMurPerKwh">,
  grant: GrantRules,
): QuoteFigures {
  const grantMur = Math.round(
    Math.min((quote.price_mur * grant.sharePercent) / 100, grant.maxMur),
  );
  const afterGrantMur = quote.price_mur - grantMur;
  const yearlyUseKwh =
    settings.tariffMurPerKwh > 0
      ? (monthlyBillMur / settings.tariffMurPerKwh) * 12
      : 0;
  const yearlySavingMur = Math.round(
    Math.min(quote.yearly_production_kwh, yearlyUseKwh) *
      settings.tariffMurPerKwh,
  );
  return {
    grantMur,
    afterGrantMur,
    pricePerKwpMur: Math.round(quote.price_mur / quote.system_kwp),
    yearlySavingMur,
    paybackYears:
      yearlySavingMur > 0
        ? Math.round((afterGrantMur / yearlySavingMur) * 10) / 10
        : null,
  };
}

type Direction = "low" | "high";

/**
 * Ids of the best quote(s) for a value: the lowest price, the highest
 * production… Only meaningful with two or more quotes; ties share "best".
 */
export function bestIds<T extends { id: string }>(
  items: T[],
  value: (item: T) => number | null,
  direction: Direction,
): Set<string> {
  if (items.length < 2) return new Set();
  const values = items
    .map((i) => value(i))
    .filter((v): v is number => v !== null);
  if (values.length === 0) return new Set();
  const target =
    direction === "low" ? Math.min(...values) : Math.max(...values);
  if (values.every((v) => v === target)) return new Set();
  return new Set(items.filter((i) => value(i) === target).map((i) => i.id));
}
