import { z } from "zod";
import { calculatorDefaults } from "@content/facts";
import { amount, checkbox, optional } from "./common";

const text = (max: number) =>
  optional(z.string().trim().max(max, { error: "tooLong" }));

export const installerReviewSchema = z.object({
  site_visit_date: optional(z.iso.date({ error: "invalid" })),
  site_visit_by: text(100),
  decision_note: text(3000),
});

export const installerAdminProfileSchema = z.object({
  description_en: text(1500),
  description_fr: text(1500),
  monthly_lead_cap: optional(
    amount.pipe(
      z
        .number()
        .int()
        .min(1, { error: "tooSmall" })
        .max(500, { error: "tooLarge" }),
    ),
  ),
  active: checkbox,
});

export const noteSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, { error: "required" })
    .max(3000, { error: "tooLong" }),
});

export const factSchema = z.object({
  value: optional(amount.pipe(z.number().min(0, { error: "tooSmall" }))),
  source_name: text(200),
  source_url: optional(
    z
      .string()
      .trim()
      .max(500)
      .pipe(z.url({ error: "invalid" })),
  ),
  source_date: text(20),
  verified: checkbox,
});

const positive = amount.pipe(
  z
    .number()
    .gt(0, { error: "tooSmall" })
    .max(10_000_000, { error: "tooLarge" }),
);

/** Every calculator setting must be a positive number; efficiency is 0–1. */
export const calculatorSettingsSchema = z.object({
  tariffMurPerKwh: positive,
  sunHoursPerDay: amount.pipe(
    z.number().gt(0, { error: "tooSmall" }).max(12, { error: "tooLarge" }),
  ),
  performanceRatio: amount.pipe(
    z.number().gt(0, { error: "tooSmall" }).max(1, { error: "tooLarge" }),
  ),
  costPerKwpMur: positive,
  batteryCostMur: positive,
  roofM2PerKwp: positive,
}) satisfies z.ZodType<Record<keyof typeof calculatorDefaults, number>>;

export const platformSettingsSchema = z.object({
  lead_price_mur: amount.pipe(
    z
      .number()
      .int({ error: "number" })
      .min(0, { error: "tooSmall" })
      .max(100_000, { error: "tooLarge" }),
  ),
  default_monthly_cap: amount.pipe(
    z
      .number()
      .int({ error: "number" })
      .min(1, { error: "tooSmall" })
      .max(1000, { error: "tooLarge" }),
  ),
  auto_routing: checkbox,
});

export const moderationSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  note: text(1000),
});
