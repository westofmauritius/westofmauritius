import { describe, expect, it } from "vitest";
import { calculateSolar, MAX_KWP, MIN_KWP } from "./calculator";

// Fixed settings so the tests do not change when the defaults in
// content/facts.ts are updated. Round numbers make the expected values easy
// to check by hand.
const settings = {
  tariffMurPerKwh: 9,
  sunHoursPerDay: 5,
  performanceRatio: 0.78,
  costPerKwpMur: 60_000,
  batteryCostMur: 150_000,
  roofM2PerKwp: 6,
};
const grant = { sharePercent: 25, maxMur: 75_000 };

describe("calculateSolar", () => {
  it("sizes the system from the bill", () => {
    // Rs 3,000 ÷ 9 = 333 kWh a month → 4,000 kWh a year → 10.96 kWh a day
    // → 10.96 ÷ (5 × 0.78) = 2.81 kWp → rounded to 3 kWp.
    const r = calculateSolar(
      { monthlyBillMur: 3000, sizing: "bill", battery: false },
      settings,
      grant,
    );
    expect(r.monthlyKwh).toBe(333);
    expect(r.neededKwp).toBe(2.8);
    expect(r.systemKwp).toBe(3);
    expect(r.limitedByRoof).toBe(false);
    // 3 kWp × 3.9 kWh × 365 = 4,270.5 kWh
    expect(r.yearlyProductionKwh).toBe(4271);
    expect(r.coverage).toBe(1);
    expect(r.costMur).toBe(180_000);
    expect(r.grantMur).toBe(45_000);
    expect(r.grantCapped).toBe(false);
    expect(r.netCostMur).toBe(135_000);
    // Only own use counts: 4,000 kWh × 9 = 36,000.
    expect(r.yearlySavingMur).toBe(36_000);
    expect(r.paybackYears).toBe(3.8);
  });

  it("caps the grant at its maximum", () => {
    const r = calculateSolar(
      { monthlyBillMur: 10_000, sizing: "bill", battery: true },
      settings,
      grant,
    );
    expect(r.costMur).toBeGreaterThan(300_000);
    expect(r.grantMur).toBe(75_000);
    expect(r.grantCapped).toBe(true);
    expect(r.netCostMur).toBe(r.costMur - 75_000);
  });

  it("adds the battery to the cost and the grant base", () => {
    const without = calculateSolar(
      { monthlyBillMur: 2000, sizing: "bill", battery: false },
      settings,
      grant,
    );
    const withBattery = calculateSolar(
      { monthlyBillMur: 2000, sizing: "bill", battery: true },
      settings,
      grant,
    );
    expect(withBattery.costMur - without.costMur).toBe(150_000);
    expect(withBattery.yearlySavingMur).toBe(without.yearlySavingMur);
  });

  it("limits the size to what fits on the roof", () => {
    // 12 m² ÷ 6 m² per kWp = 2 kWp, less than the ~5.6 kWp needed.
    const r = calculateSolar(
      { monthlyBillMur: 6000, sizing: "roof", roofAreaM2: 12, battery: false },
      settings,
      grant,
    );
    expect(r.systemKwp).toBe(2);
    expect(r.limitedByRoof).toBe(true);
    expect(r.coverage).toBeLessThan(1);
  });

  it("ignores a roof that is big enough", () => {
    const r = calculateSolar(
      { monthlyBillMur: 3000, sizing: "roof", roofAreaM2: 100, battery: false },
      settings,
      grant,
    );
    expect(r.systemKwp).toBe(3);
    expect(r.limitedByRoof).toBe(false);
  });

  it("uses the desired size when given", () => {
    const r = calculateSolar(
      { monthlyBillMur: 3000, sizing: "size", desiredKwp: 5, battery: false },
      settings,
      grant,
    );
    expect(r.systemKwp).toBe(5);
    // Output beyond own use earns nothing in this model.
    expect(r.yearlySavingMur).toBe(36_000);
  });

  it("keeps sizes between the minimum and the maximum", () => {
    const tiny = calculateSolar(
      { monthlyBillMur: 200, sizing: "bill", battery: false },
      settings,
      grant,
    );
    expect(tiny.systemKwp).toBe(MIN_KWP);
    const huge = calculateSolar(
      { monthlyBillMur: 1_000_000, sizing: "bill", battery: false },
      settings,
      grant,
    );
    expect(huge.systemKwp).toBe(MAX_KWP);
  });

  it("returns an empty result for an empty bill", () => {
    const r = calculateSolar(
      { monthlyBillMur: 0, sizing: "bill", battery: false },
      settings,
      grant,
    );
    expect(r.systemKwp).toBe(0);
    expect(r.costMur).toBe(0);
    expect(r.paybackYears).toBeNull();
  });

  it("never returns a negative bill or cost", () => {
    const r = calculateSolar(
      { monthlyBillMur: -500, sizing: "bill", battery: true },
      settings,
      grant,
    );
    expect(r.costMur).toBe(0);
    expect(r.netCostMur).toBe(0);
  });

  it("follows the settings", () => {
    const cheaper = calculateSolar(
      { monthlyBillMur: 3000, sizing: "bill", battery: false },
      { ...settings, costPerKwpMur: 40_000 },
      grant,
    );
    expect(cheaper.costMur).toBe(120_000);
    expect(cheaper.grantMur).toBe(30_000);
  });
});
