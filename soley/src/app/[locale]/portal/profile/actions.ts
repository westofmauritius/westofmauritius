"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/actions/form-state";
import { actionViewer } from "@/lib/auth/roles";
import { getDb } from "@/lib/data";
import { addInstallerDocuments } from "@/lib/services/installers";
import { fieldErrors } from "@/lib/validation/common";
import {
  checkFiles,
  documentKinds,
  type DocumentKind,
} from "@/lib/validation/installer";
import { installerProfileSchema } from "@/lib/validation/profile";

export async function saveProfileAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const installer = (await actionViewer())?.installer;
  if (!installer) return { status: "error", message: "notAllowed" };
  const parsed = installerProfileSchema.safeParse({
    ...Object.fromEntries(formData),
    regions: formData.getAll("regions"),
  });
  if (!parsed.success)
    return { status: "error", errors: fieldErrors(parsed.error) };
  const db = getDb();
  await db.update(
    "installers",
    { id: installer.id },
    {
      active: parsed.data.active,
      monthly_lead_cap: parsed.data.monthly_lead_cap ?? null,
      locale: parsed.data.locale,
    },
  );
  await db.remove("installer_regions", { installer_id: installer.id });
  await db.insert(
    "installer_regions",
    parsed.data.regions.map((region) => ({
      installer_id: installer.id,
      region,
    })),
  );
  revalidatePath("/[locale]/portal", "layout");
  revalidatePath("/[locale]/installers", "layout");
  return { status: "success" };
}

export async function uploadDocumentAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const installer = (await actionViewer())?.installer;
  if (!installer) return { status: "error", message: "notAllowed" };
  const kind = formData.get("kind");
  const file = formData.get("file");
  if (!documentKinds.includes(kind as DocumentKind)) {
    return { status: "error", errors: { kind: "required" } };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", errors: { file: "required" } };
  }
  const files = [{ kind: kind as DocumentKind, file }];
  const errors = checkFiles(files, { requireRegistration: false });
  if (Object.keys(errors).length)
    return { status: "error", errors: { file: Object.values(errors)[0]! } };
  await addInstallerDocuments(installer.id, files);
  revalidatePath("/[locale]/portal/profile", "page");
  return { status: "success" };
}
