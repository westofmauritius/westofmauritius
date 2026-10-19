import "server-only";
import { getDb } from "../data";
import type {
  HouseholdRow,
  InstallerRow,
  LeadAssignmentRow,
  QuoteRequestRow,
  QuoteRow,
} from "../data/schema";
import { safeLocale } from "../i18n-server";
import { emailNewQuote } from "../email/templates";
import { newId } from "../ids";
import { monthKey } from "../time";
import type { QuoteInput } from "../validation/quote";
import { getPlatformSettings } from "./settings";

/** Statuses in which the installer has taken the lead (and may see contacts). */
export const ACCEPTED_STATUSES = ["accepted", "quoted", "won", "lost"] as const;

export type LeadView = {
  assignment: LeadAssignmentRow;
  request: QuoteRequestRow;
  /** Only once the installer has accepted the lead. */
  household: HouseholdRow | null;
  quote: QuoteRow | null;
};

export class LeadError extends Error {
  constructor(public code: "notFound" | "notAllowed" | "closed") {
    super(code);
  }
}

/** All leads of an installer, newest first. */
export async function listLeads(installerId: string): Promise<LeadView[]> {
  const db = getDb();
  const assignments = await db.select(
    "lead_assignments",
    { installer_id: installerId },
    { orderBy: "offered_at", ascending: false },
  );
  if (!assignments.length) return [];
  const [requests, quotes] = await Promise.all([
    db.select("quote_requests", {
      id: assignments.map((a) => a.quote_request_id),
    }),
    db.select("quotes", { installer_id: installerId }),
  ]);
  return assignments.flatMap((assignment) => {
    const request = requests.find((r) => r.id === assignment.quote_request_id);
    if (!request) return [];
    return [
      {
        assignment,
        request,
        household: null,
        quote: quotes.find((q) => q.assignment_id === assignment.id) ?? null,
      },
    ];
  });
}

/**
 * One lead as the installer may see it. The household's contact details
 * are only included after the installer has accepted the lead: an
 * installer who declines never learns who the household is.
 */
export async function getLead(
  assignmentId: string,
  installerId: string,
): Promise<LeadView> {
  const db = getDb();
  const [assignment] = await db.select("lead_assignments", {
    id: assignmentId,
  });
  if (!assignment || assignment.installer_id !== installerId)
    throw new LeadError("notFound");
  const [request] = await db.select("quote_requests", {
    id: assignment.quote_request_id,
  });
  if (!request) throw new LeadError("notFound");
  const accepted = (ACCEPTED_STATUSES as readonly string[]).includes(
    assignment.status,
  );
  const [household] = accepted
    ? await db.select("households", { id: request.household_id })
    : [];
  const [quote] = await db.select("quotes", { assignment_id: assignment.id });
  return {
    assignment,
    request,
    household: household && !household.erased_at ? household : null,
    quote: quote ?? null,
  };
}

const requestOpen = (request: QuoteRequestRow) =>
  !["chosen", "installed", "cancelled"].includes(request.status);

/** Accepting makes the lead billable at today's price. */
export async function acceptLead(
  assignmentId: string,
  installer: InstallerRow,
) {
  if (installer.status !== "approved") throw new LeadError("notAllowed");
  const { assignment, request } = await getLead(assignmentId, installer.id);
  if (assignment.status !== "offered" || !requestOpen(request))
    throw new LeadError("closed");
  const settings = await getPlatformSettings();
  const now = new Date();
  await getDb().update(
    "lead_assignments",
    { id: assignment.id },
    {
      status: "accepted",
      responded_at: now.toISOString(),
      fee_mur: settings.lead_price_mur,
      billed_month: monthKey(now),
    },
  );
}

export async function declineLead(
  assignmentId: string,
  installer: InstallerRow,
  reason: string,
) {
  const { assignment } = await getLead(assignmentId, installer.id);
  if (assignment.status !== "offered") throw new LeadError("closed");
  await getDb().update(
    "lead_assignments",
    { id: assignment.id },
    {
      status: "declined",
      responded_at: new Date().toISOString(),
      decline_reason: reason,
    },
  );
}

/** Creates or updates the installer's quote and tells the household. */
export async function saveQuote(
  assignmentId: string,
  installer: InstallerRow,
  input: QuoteInput,
) {
  if (installer.status !== "approved") throw new LeadError("notAllowed");
  const db = getDb();
  const { assignment, request, quote } = await getLead(
    assignmentId,
    installer.id,
  );
  if (
    !["accepted", "quoted"].includes(assignment.status) ||
    !requestOpen(request)
  ) {
    throw new LeadError("closed");
  }
  const now = new Date().toISOString();
  const values = {
    price_mur: input.price_mur,
    system_kwp: input.system_kwp,
    panel_brand: input.panel_brand,
    panel_model: input.panel_model ?? null,
    panel_count: input.panel_count,
    panel_watt: input.panel_watt ?? null,
    inverter_brand: input.inverter_brand,
    inverter_model: input.inverter_model ?? null,
    inverter_kw: input.inverter_kw ?? null,
    battery_brand: input.battery_brand ?? null,
    battery_kwh: input.battery_kwh ?? null,
    panel_warranty_years: input.panel_warranty_years,
    inverter_warranty_years: input.inverter_warranty_years,
    workmanship_warranty_years: input.workmanship_warranty_years,
    battery_warranty_years: input.battery_warranty_years ?? null,
    yearly_production_kwh: input.yearly_production_kwh,
    start_weeks: input.start_weeks,
    duration_days: input.duration_days,
    includes_ceb_application: input.includes_ceb_application,
    valid_until: input.valid_until,
    notes: input.notes ?? null,
  };
  if (quote) {
    await db.update("quotes", { id: quote.id }, { ...values, updated_at: now });
    return "updated";
  }
  await db.insert("quotes", {
    id: newId(),
    assignment_id: assignment.id,
    quote_request_id: request.id,
    installer_id: installer.id,
    ...values,
    created_at: now,
    updated_at: now,
  });
  await db.update(
    "lead_assignments",
    { id: assignment.id },
    { status: "quoted" },
  );
  if (request.status === "new" || request.status === "assigned") {
    await db.update("quote_requests", { id: request.id }, { status: "quoted" });
  }
  const [household] = await db.select("households", {
    id: request.household_id,
  });
  if (household?.email) {
    const count = (await db.select("quotes", { quote_request_id: request.id }))
      .length;
    await emailNewQuote(household.email, safeLocale(household.locale), {
      name: household.name ?? "",
      company: installer.company_name,
      reference: request.reference,
      requestId: request.id,
      count,
    });
  }
  return "created";
}
