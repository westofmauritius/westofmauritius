import { z } from "zod";
import { email, shortText } from "./common";

export const contactSchema = z.object({
  name: shortText(100),
  email,
  message: z
    .string()
    .trim()
    .min(10, { error: "tooShort" })
    .max(4000, { error: "tooLong" }),
});
