import "server-only";
import { safeLocale } from "../i18n-server";
import { getDb } from "../data";
import type {
  InstallerRow,
  LeadAssignmentRow,
  QuoteRequestRow,
} from "../data/schema";
import { emailNewLead } from "../email/templates";
import { formatMur } from "../format";
import { newId } from "../ids";
import type { Region } from "../regions";
import {
  selectInstallers,
  type RoutingCandidate,
  type RoutingResult,
} from "../routing";
import { hoursBetween, monthKey } from "../time";
import { getPlatformSettings } from "./settings";

const STATS_DAYS = 90;

export type InstallerStats = {
  leadsThisMonth: number;
  avgResponseHours: number | null;
  rating: number | null;
  reviewCount: number;
  accepted: number;
  declined: number;
  won: number;
  lost: number;
};

/** Response time, rating and volume per installer, for routing and dashboards. */
export async function installerStats(
  now = new Date(),
): Promise<Map<string, InstallerStats>> {
  const db = getDb();
  const [assignments, reviews] = await Promise.all([
    db.select("lead_assignments"),
    db.select("reviews", { status: "approved" }),
  ]);
  const thisMonth = monthKey(now);
  const since = now.getTime() - STATS_DAYS * 24 * 3_600_000;
  const stats = new Map<
    string,
    InstallerStats & {
      responseSum: number;
      responseCount: number;
      ratingSum: number;
    }
  >();
  const get = (id: string) => {
    let entry = stats.get(id);
    if (!entry) {
      entry = {
        leadsThisMonth: 0,
        avgResponseHours: null,
        rating: null,
        reviewCount: 0,
        accepted: 0,
        declined: 0,
        won: 0,
        lost: 0,
        responseSum: 0,
        responseCount: 0,
        ratingSum: 0,
      };
      stats.set(id, entry);
    }
    return entry;
  };
  for (const a of assignments) {
    const entry = get(a.installer_id);
    if (a.status !== "withdrawn" && monthKey(a.offered_at) === thisMonth)
      entry.leadsThisMonth += 1;
    if (a.responded_at && new Date(a.offered_at).getTime() >= since) {
      entry.responseSum += Math.max(
        0,
        hoursBetween(a.offered_at, a.responded_at),
      );
      entry.responseCount += 1;
    }
    if (a.status === "declined") entry.declined += 1;
    if (["accepted", "quoted", "won", "lost"].includes(a.status))
      entry.accepted += 1;
    if (a.status === "won") entry.won += 1;
    if (a.status === "lost") entry.lost += 1;
  }
  for (const r of reviews) {
    const entry = get(r.installer_id);
    entry.reviewCount += 1;
    entry.ratingSum += r.rating;
  }
  const result = new Map<string, InstallerStats>();
  for (const [
    id,
    { responseSum, responseCount, ratingSum, ...entry },
  ] of stats) {
    result.set(id, {
      ...entry,
      avgResponseHours: responseCount ? responseSum / responseCount : null,
      rating: entry.reviewCount ? ratingSum / entry.reviewCount : null,
    });
  }
  return result;
}

export async function routingCandidates(): Promise<RoutingCandidate[]> {
  const db = getDb();
  const [installers, regions, stats] = await Promise.all([
    db.select("installers"),
    db.select("installer_regions"),
    installerStats(),
  ]);
  return installers.map((i) => {
    const s = stats.get(i.id);
    return {
      id: i.id,
      status: i.status,
      active: i.active,
      regions: regions
        .filter((r) => r.installer_id === i.id)
        .map((r) => r.region),
      monthlyCap: i.monthly_lead_cap,
      leadsThisMonth: s?.leadsThisMonth ?? 0,
      avgResponseHours: s?.avgResponseHours ?? null,
      rating: s?.rating ?? null,
      reviewCount: s?.reviewCount ?? 0,
      lastOfferedAt: i.last_offered_at,
    };
  });
}

/** What automatic routing would choose for a request right now. */
export async function suggestInstallers(
  request: QuoteRequestRow,
): Promise<RoutingResult> {
  const db = getDb();
  const [existing, settings, candidates] = await Promise.all([
    db.select("lead_assignments", { quote_request_id: request.id }),
    getPlatformSettings(),
    routingCandidates(),
  ]);
  const active = existing.filter(
    (a) => !["declined", "withdrawn"].includes(a.status),
  );
  return selectInstallers(
    {
      region: request.region as Region,
      max: request.max_installers - active.length,
      // Never offer the same request twice to one installer.
      excludeIds: existing.map((a) => a.installer_id),
    },
    candidates,
    settings.default_monthly_cap,
  );
}

/**
 * Offers a request to installers: creates the assignments, marks the
 * request as assigned and e-mails each installer.
 */
export async function offerToInstallers(
  request: QuoteRequestRow,
  installerIds: string[],
  assignedBy: string,
): Promise<LeadAssignmentRow[]> {
  if (installerIds.length === 0) return [];
  const db = getDb();
  const now = new Date().toISOString();
  const rows: LeadAssignmentRow[] = installerIds.map((installerId) => ({
    id: newId(),
    quote_request_id: request.id,
    installer_id: installerId,
    status: "offered",
    assigned_by: assignedBy,
    offered_at: now,
    responded_at: null,
    decline_reason: null,
    fee_mur: null,
    billed_month: null,
    invoice_id: null,
    reminder_sent_at: null,
  }));
  await db.insert("lead_assignments", rows);
  await db.update("installers", { id: installerIds }, { last_offered_at: now });
  if (request.status === "new") {
    await db.update(
      "quote_requests",
      { id: request.id },
      { status: "assigned" },
    );
  }

  const installers = await db.select("installers", { id: installerIds });
  await Promise.all(
    rows.map((row) => notifyInstaller(row, request, installers)),
  );
  return rows;
}

async function notifyInstaller(
  row: LeadAssignmentRow,
  request: QuoteRequestRow,
  installers: InstallerRow[],
) {
  const installer = installers.find((i) => i.id === row.installer_id);
  if (!installer) return;
  const locale = safeLocale(installer.locale);
  const { getTranslations } = await import("next-intl/server");
  const tr = await getTranslations({ locale, namespace: "regions" });
  await emailNewLead(installer.contact_email, locale, {
    company: installer.company_name,
    region: tr(request.region),
    assignmentId: row.id,
    bill: formatMur(request.monthly_bill_mur, locale),
  });
}

/**
 * Automatic routing for a new request, when it is switched on in Admin →
 * Settings. If nobody is eligible the request stays "new" in the admin
 * queue for manual routing.
 */
export async function routeNewRequest(
  requestId: string,
): Promise<LeadAssignmentRow[]> {
  const db = getDb();
  const [request] = await db.select("quote_requests", { id: requestId });
  if (!request) return [];
  const settings = await getPlatformSettings();
  if (!settings.auto_routing) return [];
  const { selected } = await suggestInstallers(request);
  return offerToInstallers(
    request,
    selected.map((c) => c.id),
    "auto",
  );
}
