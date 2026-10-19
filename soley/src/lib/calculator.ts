import type { CalculatorSettings } from "@content/facts";

/**
 * The solar savings calculator. A pure function: the same inputs always
 * give the same result, with no access to the network, the database or the
 * clock. That makes it easy to test (calculator.test.ts) and lets the
 * browser and the server use the same code.
 *
 * Model (all values are averages, so every result is an estimate):
 *   monthly use (kWh)   = bill ÷ tariff
 *   size needed (kWp)   = daily use ÷ (sun hours × performance ratio)
 *   yearly output (kWh) = size × sun hours × performance ratio × 365
 *   cost                = size × cost per kWp (+ battery)
 *   grant               = min(cost × grant share, grant cap)
 *   yearly saving       = min(output, yearly use) × tariff
 *   payback (years)     = net cost ÷ yearly saving
 *
 * Surplus sold to the CEB is not counted (no export tariff is known; see
 * PLAN.md, Assumption 5), so the saving is conservative.
 */

export type SizingMode = "bill" | "roof" | "size";

export type CalculatorInput = {
  /** Average monthly electricity bill, MUR. */
  monthlyBillMur: number;
  /** How the system size is chosen. */
  sizing: SizingMode;
  /** Usable roof area in m² (sizing "roof"). */
  roofAreaM2?: number;
  /** Desired system size in kWp (sizing "size"). */
  desiredKwp?: number;
  /** Add a home battery. */
  battery: boolean;
};

export type GrantRules = {
  /** Share of the system cost the grant covers, in percent. */
  sharePercent: number;
  /** Maximum grant per household, MUR. */
  maxMur: number;
};

export type CalculatorResult = {
  monthlyKwh: number;
  /** Size that would cover the household's whole use. */
  neededKwp: number;
  /** Recommended (or chosen) size, rounded to 0.5 kWp. */
  systemKwp: number;
  /** True if the roof is too small to cover the whole use. */
  limitedByRoof: boolean;
  yearlyProductionKwh: number;
  /** Share of the yearly use the system covers, 0–1. */
  coverage: number;
  costMur: number;
  grantMur: number;
  /** True if the grant hit its maximum. */
  grantCapped: boolean;
  netCostMur: number;
  yearlySavingMur: number;
  /** Years until the net cost is paid back; null if there is no saving. */
  paybackYears: number | null;
};

/** Smallest system worth quoting and the step sizes are rounded to. */
export const MIN_KWP = 1;
export const MAX_KWP = 50;
const STEP_KWP = 0.5;
const DAYS_PER_YEAR = 365;

const roundToStep = (value: number) => Math.round(value / STEP_KWP) * STEP_KWP;
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const roundMur = (value: number) => Math.round(value / 100) * 100;

export function calculateSolar(
  input: CalculatorInput,
  settings: CalculatorSettings,
  grant: GrantRules,
): CalculatorResult {
  const bill = Math.max(0, input.monthlyBillMur);
  const kwhPerKwpPerDay = settings.sunHoursPerDay * settings.performanceRatio;

  const monthlyKwh =
    settings.tariffMurPerKwh > 0 ? bill / settings.tariffMurPerKwh : 0;
  const yearlyUseKwh = monthlyKwh * 12;
  const neededKwp =
    kwhPerKwpPerDay > 0 ? yearlyUseKwh / DAYS_PER_YEAR / kwhPerKwpPerDay : 0;

  let target = neededKwp;
  let limitedByRoof = false;
  if (input.sizing === "size" && input.desiredKwp && input.desiredKwp > 0) {
    target = input.desiredKwp;
  } else if (
    input.sizing === "roof" &&
    input.roofAreaM2 &&
    input.roofAreaM2 > 0 &&
    settings.roofM2PerKwp > 0
  ) {
    const roofMaxKwp = input.roofAreaM2 / settings.roofM2PerKwp;
    if (roofMaxKwp < neededKwp) {
      target = roofMaxKwp;
      limitedByRoof = true;
    }
  }

  const systemKwp =
    bill > 0 || input.sizing === "size"
      ? clamp(roundToStep(target), MIN_KWP, MAX_KWP)
      : 0;
  // A roof smaller than the minimum system still limits it; say so.
  if (
    input.sizing === "roof" &&
    input.roofAreaM2 &&
    settings.roofM2PerKwp > 0
  ) {
    limitedByRoof =
      limitedByRoof || systemKwp * settings.roofM2PerKwp > input.roofAreaM2;
  }

  const yearlyProductionKwh = systemKwp * kwhPerKwpPerDay * DAYS_PER_YEAR;
  const selfUsedKwh = Math.min(yearlyProductionKwh, yearlyUseKwh);
  const coverage =
    yearlyUseKwh > 0 ? Math.min(1, yearlyProductionKwh / yearlyUseKwh) : 0;

  const costMur = roundMur(
    systemKwp * settings.costPerKwpMur +
      (input.battery && systemKwp > 0 ? settings.batteryCostMur : 0),
  );
  const uncappedGrant = (costMur * grant.sharePercent) / 100;
  const grantMur = roundMur(Math.min(uncappedGrant, grant.maxMur));
  const grantCapped = uncappedGrant > grant.maxMur;
  const netCostMur = Math.max(0, costMur - grantMur);
  const yearlySavingMur = roundMur(selfUsedKwh * settings.tariffMurPerKwh);
  const paybackYears =
    yearlySavingMur > 0
      ? Math.round((netCostMur / yearlySavingMur) * 10) / 10
      : null;

  return {
    monthlyKwh: Math.round(monthlyKwh),
    neededKwp: Math.round(neededKwp * 10) / 10,
    systemKwp,
    limitedByRoof,
    yearlyProductionKwh: Math.round(yearlyProductionKwh),
    coverage: Math.round(coverage * 100) / 100,
    costMur,
    grantMur,
    grantCapped,
    netCostMur,
    yearlySavingMur,
    paybackYears,
  };
}
