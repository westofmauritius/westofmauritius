import { z } from "zod";
import { amount, checkbox, optional } from "./common";
import { regions } from "../regions";

/** What installers can change themselves in the portal. */
export const installerProfileSchema = z.object({
  active: checkbox,
  monthly_lead_cap: optional(
    amount.pipe(
      z
        .number()
        .int({ error: "number" })
        .min(1, { error: "tooSmall" })
        .max(500, { error: "tooLarge" }),
    ),
  ),
  regions: z.array(z.enum(regions)).min(1, { error: "required" }),
  locale: z.enum(["en", "fr"]),
});
