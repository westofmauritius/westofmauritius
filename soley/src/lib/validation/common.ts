import { z } from "zod";
import { regions } from "../regions";

/**
 * Shared field rules. Error messages are translation keys under
 * "validation" in messages/*.json, so the same schema gives English or
 * French errors on the client and the server.
 */

/** Empty strings from HTML forms become undefined for optional fields. */
export const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    schema.optional(),
  );

/** Numbers typed by people: "3 500", "3,500" and "Rs 3500" all work. */
export const amount = z.preprocess(
  (value) => {
    if (typeof value === "number") return value;
    if (typeof value !== "string") return value;
    const cleaned = value.replace(/[^\d.]/g, "");
    return cleaned === "" ? undefined : Number(cleaned);
  },
  z.number({ error: "number" }).finite({ error: "number" }),
);

export const email = z
  .string({ error: "required" })
  .trim()
  .toLowerCase()
  .min(1, { error: "required" })
  .max(254, { error: "tooLong" })
  .pipe(z.email({ error: "email" }));

/**
 * Phone numbers: Mauritian (+230, 7 or 8 digits) or international. We keep
 * what the person typed, only checking it has 7 to 15 digits.
 */
export const phone = z
  .string({ error: "required" })
  .trim()
  .min(1, { error: "required" })
  .max(30, { error: "tooLong" })
  .refine((value) => /^\+?[\d\s().-]+$/.test(value), { error: "phone" })
  .refine(
    (value) => {
      const digits = value.replace(/\D/g, "").length;
      return digits >= 7 && digits <= 15;
    },
    { error: "phone" },
  );

export const shortText = (max = 120) =>
  z
    .string({ error: "required" })
    .trim()
    .min(1, { error: "required" })
    .max(max, { error: "tooLong" });

export const region = z.enum(regions, { error: "required" });

export const choice = <const T extends readonly [string, ...string[]]>(
  values: T,
) => z.enum(values, { error: "required" });

export const checkboxTrue = z.preprocess(
  (value) => value === true || value === "on" || value === "true",
  z.literal(true, { error: "consent" }),
);

export const checkbox = z.preprocess(
  (value) => value === true || value === "on" || value === "true",
  z.boolean(),
);

/** Turns a Zod error into { field: translationKey } for the form. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path.join(".");
    if (field && !result[field]) {
      result[field] = issue.message in knownKeys ? issue.message : "invalid";
    }
  }
  return result;
}

const knownKeys = {
  required: 1,
  number: 1,
  email: 1,
  phone: 1,
  tooLong: 1,
  tooSmall: 1,
  tooShort: 1,
  tooLarge: 1,
  consent: 1,
  invalid: 1,
  fileType: 1,
  fileSize: 1,
} as const;
