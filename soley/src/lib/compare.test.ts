import { describe, expect, it } from "vitest";
import { bestIds, quoteFigures } from "./compare";

const quote = {
  id: "a",
  price_mur: 200_000,
  system_kwp: 4,
  yearly_production_kwh: 5_000,
  panel_warranty_years: 25,
  inverter_warranty_years: 10,
  workmanship_warranty_years: 5,
  start_weeks: 4,
};
const grant = { sharePercent: 25, maxMur: 75_000 };

describe("quoteFigures", () => {
  it("deducts the grant and estimates payback from the bill", () => {
    // Bill Rs 3,000 at Rs 9/kWh = 4,000 kWh a year, less than the 5,000 produced.
    const f = quoteFigures(quote, 3000, { tariffMurPerKwh: 9 }, grant);
    expect(f.grantMur).toBe(50_000);
    expect(f.afterGrantMur).toBe(150_000);
    expect(f.pricePerKwpMur).toBe(50_000);
    expect(f.yearlySavingMur).toBe(36_000);
    expect(f.paybackYears).toBe(4.2);
  });

  it("caps the grant", () => {
    const f = quoteFigures(
      { ...quote, price_mur: 500_000 },
      3000,
      { tariffMurPerKwh: 9 },
      grant,
    );
    expect(f.grantMur).toBe(75_000);
  });
});

describe("bestIds", () => {
  const items = [
    { id: "a", price: 200 },
    { id: "b", price: 150 },
    { id: "c", price: 150 },
  ];
  it("marks the lowest or highest, ties included", () => {
    expect([...bestIds(items, (i) => i.price, "low")]).toEqual(["b", "c"]);
    expect([...bestIds(items, (i) => i.price, "high")]).toEqual(["a"]);
  });
  it("marks nothing for one quote or when all are equal", () => {
    expect(bestIds([items[0]!], (i) => i.price, "low").size).toBe(0);
    expect(bestIds(items.slice(1), (i) => i.price, "low").size).toBe(0);
  });
});
