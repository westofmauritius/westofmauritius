import { z } from "zod";
import { amount, optional } from "./common";

export const reviewSchema = z.object({
  rating: amount.pipe(
    z
      .number()
      .int({ error: "required" })
      .min(1, { error: "required" })
      .max(5, { error: "required" }),
  ),
  title: optional(z.string().trim().max(100, { error: "tooLong" })),
  body: z
    .string()
    .trim()
    .min(20, { error: "tooShort" })
    .max(2000, { error: "tooLong" }),
  author_display_name: z
    .string()
    .trim()
    .min(2, { error: "required" })
    .max(60, { error: "tooLong" }),
});
