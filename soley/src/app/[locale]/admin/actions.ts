"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/actions/form-state";
import { actionViewer } from "@/lib/auth/roles";
import type {
  InstallerStatus,
  InvoiceStatus,
  RequestStatus,
} from "@/lib/data/schema";
import {
  addNote,
  AdminError,
  checklistItems,
  createInvoice,
  moderateReview,
  offerManually,
  saveCalculatorSettings,
  saveFact,
  saveInstallerReview,
  savePlatformSettings,
  setInstallerStatus,
  setInvoiceStatus,
  setRequestStatus,
  updateInstallerProfile,
  withdrawAssignment,
} from "@/lib/services/admin";
import { suggestInstallers } from "@/lib/services/assignments";
import { getDb } from "@/lib/data";
import { fieldErrors } from "@/lib/validation/common";
import {
  calculatorSettingsSchema,
  factSchema,
  installerAdminProfileSchema,
  installerReviewSchema,
  moderationSchema,
  noteSchema,
  platformSettingsSchema,
} from "@/lib/validation/admin";

/**
 * Admin server actions. Each one checks that the caller is an admin before
 * doing anything: a server action is a public endpoint, whatever page the
 * button is on.
 */
async function adminEmail(): Promise<string | null> {
  const viewer = await actionViewer();
  return viewer?.admin ? viewer.email : null;
}

const denied: FormState = { status: "error", message: "notAllowed" };

function failed(error: unknown): FormState {
  if (error instanceof AdminError)
    return { status: "error", message: "conflict" };
  console.error("Admin action failed", error);
  return { status: "error", message: "server" };
}

/** Everything the admin pages show; public pages too after facts change. */
function refreshAdmin() {
  revalidatePath("/[locale]/admin", "layout");
}

// ------------------------------------------------------------- installers

export async function saveInstallerReviewAction(
  installerId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await adminEmail();
  if (!admin) return denied;
  const parsed = installerReviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { status: "error", errors: fieldErrors(parsed.error) };
  const checklist = Object.fromEntries(
    checklistItems.map((item) => [
      item,
      formData.get(`check_${item}`) === "on",
    ]),
  );
  await saveInstallerReview(
    installerId,
    {
      checklist,
      siteVisitDate: parsed.data.site_visit_date ?? null,
      siteVisitBy: parsed.data.site_visit_by ?? null,
      decisionNote: parsed.data.decision_note ?? null,
    },
    admin,
  );
  refreshAdmin();
  return { status: "success" };
}

export async function setInstallerStatusAction(
  installerId: string,
  status: InstallerStatus,
  _previous: FormState,
): Promise<FormState> {
  if (!(await adminEmail())) return denied;
  try {
    await setInstallerStatus(installerId, status);
  } catch (error) {
    return failed(error);
  }
  refreshAdmin();
  revalidatePath("/[locale]/installers", "layout");
  return { status: "success" };
}

export async function saveInstallerProfileAction(
  installerId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await adminEmail())) return denied;
  const parsed = installerAdminProfileSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success)
    return { status: "error", errors: fieldErrors(parsed.error) };
  await updateInstallerProfile(installerId, {
    description_en: parsed.data.description_en ?? null,
    description_fr: parsed.data.description_fr ?? null,
    monthly_lead_cap: parsed.data.monthly_lead_cap ?? null,
    active: parsed.data.active,
  });
  refreshAdmin();
  revalidatePath("/[locale]/installers", "layout");
  return { status: "success" };
}

export async function addNoteAction(
  subjectType: "installer" | "quote_request",
  subjectId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await adminEmail();
  if (!admin) return denied;
  const parsed = noteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { status: "error", errors: fieldErrors(parsed.error) };
  await addNote(subjectType, subjectId, admin, parsed.data.body);
  refreshAdmin();
  return { status: "success" };
}

// ------------------------------------------------------------- requests

export async function offerSuggestedAction(
  requestId: string,
  _previous: FormState,
): Promise<FormState> {
  const admin = await adminEmail();
  if (!admin) return denied;
  try {
    const [request] = await getDb().select("quote_requests", { id: requestId });
    if (!request) return { status: "error", message: "conflict" };
    const { selected } = await suggestInstallers(request);
    await offerManually(
      requestId,
      selected.map((c) => c.id),
      admin,
    );
  } catch (error) {
    return failed(error);
  }
  refreshAdmin();
  return { status: "success" };
}

export async function offerManualAction(
  requestId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await adminEmail();
  if (!admin) return denied;
  const installerId = formData.get("installer_id");
  if (typeof installerId !== "string" || !installerId) {
    return { status: "error", errors: { installer_id: "required" } };
  }
  try {
    await offerManually(requestId, [installerId], admin);
  } catch (error) {
    return failed(error);
  }
  refreshAdmin();
  return { status: "success" };
}

export async function withdrawAssignmentAction(
  assignmentId: string,
  _previous: FormState,
): Promise<FormState> {
  if (!(await adminEmail())) return denied;
  try {
    await withdrawAssignment(assignmentId);
  } catch (error) {
    return failed(error);
  }
  refreshAdmin();
  return { status: "success" };
}

export async function setRequestStatusAction(
  requestId: string,
  status: RequestStatus,
  _previous: FormState,
): Promise<FormState> {
  if (!(await adminEmail())) return denied;
  try {
    await setRequestStatus(requestId, status);
  } catch (error) {
    return failed(error);
  }
  refreshAdmin();
  return { status: "success" };
}

// ------------------------------------------------------------- invoices

export async function createInvoiceAction(
  installerId: string,
  month: string,
  _previous: FormState,
): Promise<FormState> {
  if (!(await adminEmail())) return denied;
  try {
    await createInvoice(installerId, month);
  } catch (error) {
    return failed(error);
  }
  refreshAdmin();
  revalidatePath("/[locale]/portal", "layout");
  return { status: "success" };
}

export async function setInvoiceStatusAction(
  invoiceId: string,
  status: InvoiceStatus,
  _previous: FormState,
): Promise<FormState> {
  if (!(await adminEmail())) return denied;
  await setInvoiceStatus(invoiceId, status);
  refreshAdmin();
  revalidatePath("/[locale]/portal", "layout");
  return { status: "success" };
}

// ------------------------------------------------------------- reviews

export async function moderateReviewAction(
  reviewId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await adminEmail();
  if (!admin) return denied;
  const parsed = moderationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { status: "error", errors: fieldErrors(parsed.error) };
  await moderateReview(
    reviewId,
    parsed.data.decision,
    parsed.data.note ?? null,
    admin,
  );
  refreshAdmin();
  revalidatePath("/[locale]/installers", "layout");
  return { status: "success" };
}

// ------------------------------------------------------------- facts and settings

/** Public pages show facts: rebuild them all after a change. */
function refreshPublic() {
  revalidatePath("/[locale]", "layout");
}

export async function saveFactAction(
  key: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await adminEmail();
  if (!admin) return denied;
  const parsed = factSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { status: "error", errors: fieldErrors(parsed.error) };
  try {
    await saveFact(
      {
        key,
        value: parsed.data.value ?? null,
        source_name: parsed.data.source_name ?? null,
        source_url: parsed.data.source_url ?? null,
        source_date: parsed.data.source_date ?? null,
        verified: parsed.data.verified,
      },
      admin,
    );
  } catch (error) {
    return failed(error);
  }
  refreshPublic();
  return { status: "success" };
}

export async function saveSettingsAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await adminEmail();
  if (!admin) return denied;
  const values = Object.fromEntries(formData);
  const calculator = calculatorSettingsSchema.safeParse(values);
  const platform = platformSettingsSchema.safeParse(values);
  if (!calculator.success || !platform.success) {
    return {
      status: "error",
      errors: {
        ...(calculator.success ? {} : fieldErrors(calculator.error)),
        ...(platform.success ? {} : fieldErrors(platform.error)),
      },
    };
  }
  await saveCalculatorSettings(calculator.data, admin);
  await savePlatformSettings(platform.data, admin);
  refreshPublic();
  return { status: "success" };
}
