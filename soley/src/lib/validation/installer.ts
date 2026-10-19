import { z } from "zod";
import {
  amount,
  checkbox,
  checkboxTrue,
  email,
  optional,
  phone,
  shortText,
} from "./common";
import { regions } from "../regions";

export const documentKinds = [
  "registration",
  "insurance",
  "certificate",
] as const;
export type DocumentKind = (typeof documentKinds)[number];

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;
/** Vercel accepts request bodies up to 4.5 MB; the files must fit in that. */
export const MAX_TOTAL_UPLOAD_BYTES = 4 * 1024 * 1024;

const url = z
  .string()
  .trim()
  .max(200, { error: "tooLong" })
  .transform((value) =>
    /^https?:\/\//i.test(value) ? value : `https://${value}`,
  )
  .pipe(z.url({ error: "invalid" }));

/** The partner application. Documents are checked separately (checkFiles). */
export const installerApplicationSchema = z.object({
  company_name: shortText(120),
  brn: optional(z.string().trim().max(40, { error: "tooLong" })),
  contact_name: shortText(100),
  contact_email: email,
  phone,
  whatsapp: optional(phone),
  website: optional(url),
  address: shortText(200),
  years_in_business: amount.pipe(
    z
      .number()
      .int({ error: "number" })
      .min(0, { error: "tooSmall" })
      .max(100, { error: "tooLarge" }),
  ),
  regions: z.array(z.enum(regions)).min(1, { error: "required" }),
  certifications: optional(z.string().trim().max(1000, { error: "tooLong" })),
  ceb_registered: checkbox,
  description: optional(z.string().trim().max(1500, { error: "tooLong" })),
  locale: z.enum(["en", "fr"]),
  terms: checkboxTrue,
});

export type InstallerApplicationInput = z.infer<
  typeof installerApplicationSchema
>;

/** Reads the application fields from a form, including the region list. */
export function applicationFromForm(formData: FormData) {
  return {
    ...Object.fromEntries(formData),
    regions: formData.getAll("regions"),
  };
}

/** One certificate per line, without empty lines or duplicates. */
export const certificationList = (text: string | undefined) =>
  [
    ...new Set(
      (text ?? "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean),
    ),
  ].slice(0, 20);

export type UploadedFile = { kind: DocumentKind; file: File };

/** Checks the uploaded documents: allowed types and the total size. */
export function checkFiles(
  files: UploadedFile[],
  { requireRegistration }: { requireRegistration: boolean },
): Record<string, string> {
  const errors: Record<string, string> = {};
  let total = 0;
  for (const { kind, file } of files) {
    total += file.size;
    if (!(ALLOWED_FILE_TYPES as readonly string[]).includes(file.type)) {
      errors[`doc_${kind}`] = "fileType";
    }
  }
  if (total > MAX_TOTAL_UPLOAD_BYTES) {
    for (const { kind } of files) errors[`doc_${kind}`] ??= "fileSize";
  }
  if (requireRegistration && !files.some((f) => f.kind === "registration")) {
    errors.doc_registration = "required";
  }
  return errors;
}

/** The non-empty files of a form, by document kind. */
export function filesFromForm(formData: FormData): UploadedFile[] {
  return documentKinds.flatMap((kind) =>
    formData
      .getAll(`doc_${kind}`)
      .filter((value): value is File => value instanceof File && value.size > 0)
      .map((file) => ({ kind, file })),
  );
}
