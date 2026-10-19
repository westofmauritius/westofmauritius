import { z } from "zod";
import {
  amount,
  checkbox,
  checkboxTrue,
  choice,
  email,
  optional,
  phone,
  region,
  shortText,
} from "./common";

export const propertyTypes = ["house", "apartment", "other"] as const;
export const ownerships = ["owner", "tenant"] as const;
export const roofTypes = [
  "concrete_flat",
  "sheet_metal",
  "tiles",
  "other",
] as const;
export const shadings = ["none", "some", "a_lot", "unknown"] as const;
export const batteryInterests = ["yes", "no", "unsure"] as const;
export const timelines = ["asap", "3_months", "6_months", "exploring"] as const;
export const financings = ["cash", "dbm_loan", "bank_loan", "unsure"] as const;
export const contactMethods = ["phone", "whatsapp", "email"] as const;

/**
 * The quote form, one schema per step. The client checks a step before
 * moving on; the server checks the whole form (`quoteRequestSchema`) again.
 */
export const homeStep = z.object({
  property_type: choice(propertyTypes),
  ownership: choice(ownerships),
  roof_type: choice(roofTypes),
  roof_area_m2: optional(
    amount.pipe(
      z.number().min(5, { error: "tooSmall" }).max(5000, { error: "tooLarge" }),
    ),
  ),
  shading: choice(shadings),
});

export const usageStep = z.object({
  monthly_bill_mur: amount.pipe(
    z
      .number()
      .min(300, { error: "tooSmall" })
      .max(1_000_000, { error: "tooLarge" }),
  ),
  battery_interest: choice(batteryInterests),
  desired_kwp: optional(
    amount.pipe(
      z.number().min(1, { error: "tooSmall" }).max(50, { error: "tooLarge" }),
    ),
  ),
});

export const locationStep = z.object({
  region,
  town: optional(z.string().trim().max(80, { error: "tooLong" })),
});

export const planStep = z.object({
  timeline: choice(timelines),
  financing: choice(financings),
  grant_interest: checkbox,
});

export const contactStep = z.object({
  name: shortText(100),
  email,
  phone,
  whatsapp: optional(phone),
  preferred_contact: choice(contactMethods),
  notes: optional(z.string().trim().max(1000, { error: "tooLong" })),
  consent: checkboxTrue,
});

export const quoteRequestSchema = homeStep
  .extend(usageStep.shape)
  .extend(locationStep.shape)
  .extend(planStep.shape)
  .extend(contactStep.shape);

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

export const quoteFormSteps = [
  { key: "home", schema: homeStep },
  { key: "usage", schema: usageStep },
  { key: "location", schema: locationStep },
  { key: "plan", schema: planStep },
  { key: "contact", schema: contactStep },
] as const;

export type QuoteFormStepKey = (typeof quoteFormSteps)[number]["key"];
