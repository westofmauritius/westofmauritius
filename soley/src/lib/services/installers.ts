import "server-only";
import type { Locale } from "@/i18n/routing";
import { consentVersions } from "../consent";
import { getDb, getFileStore } from "../data";
import type { InstallerDocumentRow, InstallerRow } from "../data/schema";
import { newId, slugify } from "../ids";
import {
  certificationList,
  type InstallerApplicationInput,
  type UploadedFile,
} from "../validation/installer";

/** A file name safe for storage paths. */
const safeFileName = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "_")
    .slice(-80) || "document";

async function uniqueSlug(company: string): Promise<string> {
  const base = slugify(company) || "installer";
  const existing = new Set(
    (await getDb().select("installers")).map((i) => i.slug),
  );
  if (!existing.has(base)) return base;
  for (let n = 2; ; n += 1)
    if (!existing.has(`${base}-${n}`)) return `${base}-${n}`;
}

export class DuplicateApplicationError extends Error {}

/** Stores documents in the private bucket and records them. */
export async function addInstallerDocuments(
  installerId: string,
  files: UploadedFile[],
) {
  const db = getDb();
  const store = getFileStore();
  const rows: InstallerDocumentRow[] = [];
  for (const { kind, file } of files) {
    const id = newId();
    const path = `${installerId}/${id}-${safeFileName(file.name)}`;
    await store.put(path, await file.arrayBuffer(), file.type);
    rows.push({
      id,
      installer_id: installerId,
      kind,
      file_name: file.name.slice(0, 200),
      storage_path: path,
      content_type: file.type,
      size_bytes: file.size,
      created_at: new Date().toISOString(),
    });
  }
  if (rows.length) await db.insert("installer_documents", rows);
  return rows;
}

/** Saves a partner application with its regions, documents and consent. */
export async function createInstallerApplication(
  input: InstallerApplicationInput,
  files: UploadedFile[],
  locale: Locale,
): Promise<InstallerRow> {
  const db = getDb();
  if (
    (await db.select("installers", { contact_email: input.contact_email }))
      .length
  ) {
    throw new DuplicateApplicationError();
  }
  const now = new Date().toISOString();
  const [installer] = (await db.insert("installers", {
    id: newId(),
    slug: await uniqueSlug(input.company_name),
    company_name: input.company_name,
    brn: input.brn ?? null,
    contact_name: input.contact_name,
    contact_email: input.contact_email,
    phone: input.phone,
    whatsapp: input.whatsapp ?? null,
    website: input.website ?? null,
    address: input.address,
    // The description is kept in the language it was written in; admin can
    // add the other language when approving.
    description_en: input.locale === "en" ? (input.description ?? null) : null,
    description_fr: input.locale === "fr" ? (input.description ?? null) : null,
    years_in_business: input.years_in_business,
    certifications: certificationList(input.certifications),
    ceb_registered: input.ceb_registered,
    locale: input.locale,
    status: "applied",
    active: true,
    monthly_lead_cap: null,
    approved_at: null,
    last_offered_at: null,
    is_demo: false,
    created_at: now,
    updated_at: now,
  })) as [InstallerRow];

  await db.insert(
    "installer_regions",
    input.regions.map((region) => ({ installer_id: installer.id, region })),
  );
  await addInstallerDocuments(installer.id, files);
  await db.insert("consents", {
    id: newId(),
    household_id: null,
    quote_request_id: null,
    installer_id: installer.id,
    purpose: "installerTerms",
    text_version: consentVersions.installerTerms,
    locale,
    granted: true,
    created_at: now,
  });
  return installer;
}
