import "server-only";
import { calculatorDefaults, policyFacts } from "@content/facts";
import { getDb } from "../data";
import type {
  AdminNoteRow,
  InstallerStatus,
  InvoiceStatus,
  RequestStatus,
  ReviewStatus,
} from "../data/schema";
import { emailInstallerDecision, emailReviewInvite } from "../email/templates";
import { safeLocale } from "../i18n-server";
import { newId } from "../ids";
import { offerToInstallers } from "./assignments";

/** The vetting checklist items, in display order. */
export const checklistItems = [
  "registration",
  "insurance",
  "certificates",
  "references",
  "siteVisit",
  "cebProcess",
] as const;

export class AdminError extends Error {
  constructor(public code: "notFound" | "conflict") {
    super(code);
  }
}

// ---------------------------------------------------------------- installers

export async function saveInstallerReview(
  installerId: string,
  data: {
    checklist: Record<string, boolean>;
    siteVisitDate: string | null;
    siteVisitBy: string | null;
    decisionNote: string | null;
  },
  admin: string,
) {
  await getDb().upsert("installer_reviews", {
    installer_id: installerId,
    checklist: data.checklist,
    site_visit_date: data.siteVisitDate,
    site_visit_by: data.siteVisitBy,
    decision_note: data.decisionNote,
    updated_by: admin,
    updated_at: new Date().toISOString(),
  });
}

/** Approval needs a complete checklist: the "Reviewed by Soley" promise. */
export async function setInstallerStatus(
  installerId: string,
  status: InstallerStatus,
) {
  const db = getDb();
  const [installer] = await db.select("installers", { id: installerId });
  if (!installer) throw new AdminError("notFound");
  if (status === "approved") {
    const [review] = await db.select("installer_reviews", {
      installer_id: installerId,
    });
    const complete = checklistItems.every(
      (item) => review?.checklist[item] === true,
    );
    if (!complete) throw new AdminError("conflict");
  }
  await db.update(
    "installers",
    { id: installerId },
    {
      status,
      approved_at:
        status === "approved"
          ? (installer.approved_at ?? new Date().toISOString())
          : installer.approved_at,
    },
  );
  const firstDecision =
    (status === "approved" &&
      installer.status !== "approved" &&
      installer.status !== "suspended") ||
    (status === "rejected" && installer.status !== "rejected");
  if (firstDecision) {
    await emailInstallerDecision(
      installer.contact_email,
      safeLocale(installer.locale),
      {
        name: installer.contact_name,
        company: installer.company_name,
        approved: status === "approved",
      },
    );
  }
}

export async function updateInstallerProfile(
  installerId: string,
  data: {
    description_en: string | null;
    description_fr: string | null;
    monthly_lead_cap: number | null;
    active: boolean;
  },
) {
  await getDb().update("installers", { id: installerId }, data);
}

// ---------------------------------------------------------------- notes

export async function addNote(
  subjectType: AdminNoteRow["subject_type"],
  subjectId: string,
  author: string,
  body: string,
) {
  await getDb().insert("admin_notes", {
    id: newId(),
    subject_type: subjectType,
    subject_id: subjectId,
    author,
    body,
    created_at: new Date().toISOString(),
  });
}

export async function listNotes(
  subjectType: AdminNoteRow["subject_type"],
  subjectId: string,
) {
  return getDb().select(
    "admin_notes",
    { subject_type: subjectType, subject_id: subjectId },
    { orderBy: "created_at", ascending: false },
  );
}

// ---------------------------------------------------------------- requests

/** Sends a request to installers chosen by an admin (max three in total). */
export async function offerManually(
  requestId: string,
  installerIds: string[],
  admin: string,
) {
  const db = getDb();
  const [request] = await db.select("quote_requests", { id: requestId });
  if (!request) throw new AdminError("notFound");
  const existing = await db.select("lead_assignments", {
    quote_request_id: requestId,
  });
  const activeCount = existing.filter(
    (a) => !["declined", "withdrawn"].includes(a.status),
  ).length;
  const fresh = installerIds.filter(
    (id) => !existing.some((a) => a.installer_id === id),
  );
  if (
    fresh.length === 0 ||
    activeCount + fresh.length > request.max_installers
  ) {
    throw new AdminError("conflict");
  }
  const approved = await db.select("installers", {
    id: fresh,
    status: "approved",
  });
  if (approved.length !== fresh.length) throw new AdminError("conflict");
  await offerToInstallers(request, fresh, admin);
}

/**
 * Takes a request back from an installer. A fee already charged for an
 * accepted lead is removed only if it has not been invoiced yet.
 */
export async function withdrawAssignment(assignmentId: string) {
  const db = getDb();
  const [assignment] = await db.select("lead_assignments", {
    id: assignmentId,
  });
  if (!assignment) throw new AdminError("notFound");
  if (["won", "lost"].includes(assignment.status))
    throw new AdminError("conflict");
  await db.update(
    "lead_assignments",
    { id: assignmentId },
    {
      status: "withdrawn",
      ...(assignment.invoice_id ? {} : { fee_mur: null, billed_month: null }),
    },
  );
}

export async function setRequestStatus(
  requestId: string,
  status: RequestStatus,
) {
  const db = getDb();
  const [request] = await db.select("quote_requests", { id: requestId });
  if (!request) throw new AdminError("notFound");
  await db.update(
    "quote_requests",
    { id: requestId },
    {
      status,
      ...(status === "installed"
        ? { installed_at: new Date().toISOString() }
        : {}),
    },
  );
  if (status === "installed" && request.chosen_quote_id) {
    await inviteReview(requestId);
  }
}

/** After installation, ask the household for a review of the chosen installer. */
export async function inviteReview(requestId: string) {
  const db = getDb();
  const [request] = await db.select("quote_requests", { id: requestId });
  if (!request?.chosen_quote_id) return;
  const [[quote], [household]] = await Promise.all([
    db.select("quotes", { id: request.chosen_quote_id }),
    db.select("households", { id: request.household_id }),
  ]);
  if (!quote || !household?.email) return;
  const [installer] = await db.select("installers", { id: quote.installer_id });
  if (!installer) return;
  await emailReviewInvite(household.email, safeLocale(household.locale), {
    name: household.name ?? "",
    company: installer.company_name,
    requestId,
  });
}

// ---------------------------------------------------------------- invoices

/** Creates the invoice for one installer and month from its billable leads. */
export async function createInvoice(installerId: string, month: string) {
  const db = getDb();
  if (
    (await db.select("invoices", { installer_id: installerId, month })).length
  ) {
    throw new AdminError("conflict");
  }
  const leads = (
    await db.select("lead_assignments", {
      installer_id: installerId,
      billed_month: month,
    })
  ).filter((a) => a.fee_mur !== null && !a.invoice_id);
  if (!leads.length) throw new AdminError("conflict");
  const sequence =
    (await db.select("invoices")).filter((i) => i.month === month).length + 1;
  const id = newId();
  await db.insert("invoices", {
    id,
    number: `SOL-${month}-${String(sequence).padStart(4, "0")}`,
    installer_id: installerId,
    month,
    lead_count: leads.length,
    total_mur: leads.reduce((sum, a) => sum + (a.fee_mur ?? 0), 0),
    status: "draft",
    sent_at: null,
    paid_at: null,
    created_at: new Date().toISOString(),
  });
  await db.update(
    "lead_assignments",
    { id: leads.map((a) => a.id) },
    { invoice_id: id },
  );
}

export async function setInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus,
) {
  const now = new Date().toISOString();
  await getDb().update(
    "invoices",
    { id: invoiceId },
    {
      status,
      ...(status === "sent" ? { sent_at: now } : {}),
      ...(status === "paid" ? { paid_at: now } : {}),
    },
  );
  if (status === "void") {
    // The leads go back to "not invoiced" so a corrected invoice can be made.
    await getDb().update(
      "lead_assignments",
      { invoice_id: invoiceId },
      { invoice_id: null },
    );
    await getDb().remove("invoices", { id: invoiceId });
  }
}

// ---------------------------------------------------------------- reviews

export async function moderateReview(
  reviewId: string,
  status: Exclude<ReviewStatus, "pending">,
  note: string | null,
  admin: string,
) {
  await getDb().update(
    "reviews",
    { id: reviewId },
    {
      status,
      moderation_note: note,
      moderated_by: admin,
      moderated_at: new Date().toISOString(),
    },
  );
}

// ---------------------------------------------------------------- facts and settings

export type FactUpdate = {
  key: string;
  value: number | null;
  source_name: string | null;
  source_url: string | null;
  source_date: string | null;
  verified: boolean;
};

export async function saveFact(update: FactUpdate, admin: string) {
  if (!(update.key in policyFacts)) throw new AdminError("notFound");
  await getDb().upsert("facts", {
    ...update,
    updated_by: admin,
    updated_at: new Date().toISOString(),
  });
}

export async function saveCalculatorSettings(
  values: Record<string, number>,
  admin: string,
) {
  const now = new Date().toISOString();
  const rows = Object.entries(values)
    .filter(([key]) => key in calculatorDefaults)
    .map(([key, value]) => ({
      key,
      value,
      updated_by: admin,
      updated_at: now,
    }));
  await getDb().upsert("calculator_settings", rows);
}

export async function savePlatformSettings(
  data: {
    lead_price_mur: number;
    default_monthly_cap: number;
    auto_routing: boolean;
  },
  admin: string,
) {
  await getDb().upsert("platform_settings", {
    id: true,
    ...data,
    updated_by: admin,
    updated_at: new Date().toISOString(),
  });
}
