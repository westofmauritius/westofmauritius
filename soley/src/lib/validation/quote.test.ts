import { describe, expect, it } from "vitest";
import { quoteSchema } from "./quote";

const valid = {
  price_mur: "215 000",
  system_kwp: "3.6",
  panel_brand: "Brand",
  panel_model: "",
  panel_count: "8",
  panel_watt: "450",
  inverter_brand: "Brand",
  inverter_model: "",
  inverter_kw: "4",
  battery_brand: "",
  battery_kwh: "",
  panel_warranty_years: "25",
  inverter_warranty_years: "10",
  workmanship_warranty_years: "5",
  battery_warranty_years: "",
  yearly_production_kwh: "4900",
  start_weeks: "4",
  duration_days: "2",
  includes_ceb_application: "on",
  valid_until: "2026-12-31",
  notes: "",
};

describe("quote validation", () => {
  it("accepts a quote without a battery", () => {
    const quote = quoteSchema.parse(valid);
    expect(quote.price_mur).toBe(215_000);
    expect(quote.battery_kwh).toBeUndefined();
  });

  it("needs the battery size when a battery is quoted", () => {
    const result = quoteSchema.safeParse({
      ...valid,
      battery_brand: "Battery",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0]?.path).toEqual(["battery_kwh"]);
  });

  it("rejects missing warranties and nonsense prices", () => {
    expect(
      quoteSchema.safeParse({ ...valid, panel_warranty_years: "" }).success,
    ).toBe(false);
    expect(quoteSchema.safeParse({ ...valid, price_mur: "5" }).success).toBe(
      false,
    );
  });
});
