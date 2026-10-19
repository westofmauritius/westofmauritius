import { z } from "zod";
import { amount, checkbox, optional, shortText } from "./common";

const int = (min: number, max: number) =>
  amount.pipe(
    z
      .number()
      .int({ error: "number" })
      .min(min, { error: "tooSmall" })
      .max(max, { error: "tooLarge" }),
  );
const decimal = (min: number, max: number) =>
  amount.pipe(
    z.number().min(min, { error: "tooSmall" }).max(max, { error: "tooLarge" }),
  );
const text = (max: number) =>
  optional(z.string().trim().max(max, { error: "tooLong" }));

/**
 * A structured quote. Every installer answers the same fields, which is
 * what makes the side-by-side comparison for households possible.
 */
export const quoteSchema = z
  .object({
    price_mur: int(1000, 50_000_000),
    system_kwp: decimal(0.5, 100),
    panel_brand: shortText(80),
    panel_model: text(80),
    panel_count: int(1, 500),
    panel_watt: optional(int(50, 1000)),
    inverter_brand: shortText(80),
    inverter_model: text(80),
    inverter_kw: optional(decimal(0.5, 200)),
    battery_brand: text(80),
    battery_kwh: optional(decimal(0.5, 200)),
    panel_warranty_years: int(0, 40),
    inverter_warranty_years: int(0, 40),
    workmanship_warranty_years: int(0, 40),
    battery_warranty_years: optional(int(0, 40)),
    yearly_production_kwh: int(100, 1_000_000),
    start_weeks: int(0, 104),
    duration_days: int(1, 90),
    includes_ceb_application: checkbox,
    valid_until: z.iso.date({ error: "invalid" }),
    notes: text(1500),
  })
  .refine((q) => !q.battery_brand || q.battery_kwh !== undefined, {
    error: "required",
    path: ["battery_kwh"],
  });

export type QuoteInput = z.infer<typeof quoteSchema>;

export const declineReasons = [
  "tooFar",
  "tooBusy",
  "tooSmall",
  "notSuitable",
  "other",
] as const;

export const declineSchema = z.object({
  reason: z.enum(declineReasons, { error: "required" }),
});
