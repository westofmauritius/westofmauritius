import "server-only";
import { getDb } from "../data";
import type {
  InstallerRow,
  LeadAssignmentRow,
  QuoteRequestRow,
  QuoteRow,
  ReviewRow,
} from "../data/schema";
import { emailQuoteOutcome } from "../email/templates";
import { safeLocale } from "../i18n-server";
import { newId } from "../ids";
import { installerStats } from "./assignments";

export class HouseholdError extends Error {
  constructor(public code: "notFound" | "conflict") {
    super(code);
  }
}

export type QuoteOffer = {
  quote: QuoteRow;
  installer: Pick<
    InstallerRow,
    "id" | "slug" | "company_name" | "years_in_business" | "is_demo"
  >;
  rating: number | null;
  reviewCount: number;
};

export type HouseholdRequest = {
  request: QuoteRequestRow;
  /** Installers working on the request (no contact details needed here). */
  assignments: (LeadAssignmentRow & { company: string })[];
  offers: QuoteOffer[];
  review: ReviewRow | null;
};

/** The household's own requests, newest first. */
export async function listHouseholdRequests(householdId: string) {
  return getDb().select(
    "quote_requests",
    { household_id: householdId },
    { orderBy: "created_at", ascending: false },
  );
}

/**
 * One request with its quotes, only if it belongs to the household. Any
 * other id gives "not found", so ids cannot be guessed to see others' data.
 */
export async function getHouseholdRequest(
  requestId: string,
  householdId: string,
): Promise<HouseholdRequest> {
  const db = getDb();
  const [request] = await db.select("quote_requests", { id: requestId });
  if (!request || request.household_id !== householdId)
    throw new HouseholdError("notFound");
  const [assignments, quotes, reviews] = await Promise.all([
    db.select("lead_assignments", { quote_request_id: requestId }),
    db.select(
      "quotes",
      { quote_request_id: requestId },
      { orderBy: "price_mur" },
    ),
    db.select("reviews", { quote_request_id: requestId }),
  ]);
  const installerIds = [...new Set(assignments.map((a) => a.installer_id))];
  const [installers, stats] = await Promise.all([
    installerIds.length
      ? db.select("installers", { id: installerIds })
      : Promise.resolve([]),
    installerStats(),
  ]);
  const company = (id: string) =>
    installers.find((i) => i.id === id)?.company_name ?? "";
  // A withdrawn installer's quote is no longer offered.
  const live = new Set(
    assignments.filter((a) => a.status !== "withdrawn").map((a) => a.id),
  );
  const offers: QuoteOffer[] = quotes
    .filter((q) => live.has(q.assignment_id))
    .flatMap((quote) => {
      const installer = installers.find((i) => i.id === quote.installer_id);
      if (!installer) return [];
      const s = stats.get(installer.id);
      return [
        {
          quote,
          installer: {
            id: installer.id,
            slug: installer.slug,
            company_name: installer.company_name,
            years_in_business: installer.years_in_business,
            is_demo: installer.is_demo,
          },
          rating: s?.rating ?? null,
          reviewCount: s?.reviewCount ?? 0,
        },
      ];
    });
  return {
    request,
    assignments: assignments
      .filter((a) => !["declined", "withdrawn"].includes(a.status))
      .map((a) => ({ ...a, company: company(a.installer_id) })),
    offers,
    review: reviews[0] ?? null,
  };
}

/** The household picks a quote: that installer wins, the others are told. */
export async function chooseQuote(
  requestId: string,
  quoteId: string,
  householdId: string,
) {
  const db = getDb();
  const { request, offers } = await getHouseholdRequest(requestId, householdId);
  if (!["assigned", "quoted"].includes(request.status))
    throw new HouseholdError("conflict");
  const chosen = offers.find((o) => o.quote.id === quoteId);
  if (!chosen) throw new HouseholdError("notFound");
  const now = new Date().toISOString();
  await db.update(
    "quote_requests",
    { id: requestId },
    {
      status: "chosen",
      chosen_quote_id: quoteId,
      chosen_at: now,
    },
  );
  const assignments = await db.select("lead_assignments", {
    quote_request_id: requestId,
  });
  const installers = await db.select("installers", {
    id: assignments.map((a) => a.installer_id),
  });
  for (const a of assignments) {
    const won = a.id === chosen.quote.assignment_id;
    if (["accepted", "quoted"].includes(a.status)) {
      await db.update(
        "lead_assignments",
        { id: a.id },
        { status: won ? "won" : "lost" },
      );
    } else if (a.status === "offered") {
      // Still unanswered: nothing to do any more, and nothing to bill.
      await db.update(
        "lead_assignments",
        { id: a.id },
        { status: "withdrawn" },
      );
      continue;
    } else continue;
    const installer = installers.find((i) => i.id === a.installer_id);
    if (installer) {
      await emailQuoteOutcome(
        installer.contact_email,
        safeLocale(installer.locale),
        {
          company: installer.company_name,
          reference: request.reference,
          won,
          assignmentId: a.id,
        },
      );
    }
  }
}

/** None of the quotes suits the household: the request is closed. */
export async function closeRequest(requestId: string, householdId: string) {
  const db = getDb();
  const { request } = await getHouseholdRequest(requestId, householdId);
  if (["chosen", "installed", "cancelled"].includes(request.status))
    throw new HouseholdError("conflict");
  await db.update("quote_requests", { id: requestId }, { status: "cancelled" });
  const assignments = await db.select("lead_assignments", {
    quote_request_id: requestId,
  });
  for (const a of assignments) {
    if (a.status === "offered")
      await db.update(
        "lead_assignments",
        { id: a.id },
        { status: "withdrawn" },
      );
    if (["accepted", "quoted"].includes(a.status)) {
      await db.update("lead_assignments", { id: a.id }, { status: "lost" });
    }
  }
}

/** The household confirms the installation is finished, which unlocks the review. */
export async function confirmInstalled(requestId: string, householdId: string) {
  const { request } = await getHouseholdRequest(requestId, householdId);
  if (request.status !== "chosen") throw new HouseholdError("conflict");
  await getDb().update(
    "quote_requests",
    { id: requestId },
    {
      status: "installed",
      installed_at: new Date().toISOString(),
    },
  );
}

/**
 * A review from a verified customer: only for a request of this household
 * that reached "installed", only for the installer that was chosen, once.
 * It waits for moderation before it is shown.
 */
export async function submitReview(
  requestId: string,
  householdId: string,
  input: {
    rating: number;
    title?: string;
    body: string;
    author_display_name: string;
  },
) {
  const db = getDb();
  const { request, review, offers } = await getHouseholdRequest(
    requestId,
    householdId,
  );
  if (request.status !== "installed" || !request.chosen_quote_id || review) {
    throw new HouseholdError("conflict");
  }
  const chosen = offers.find((o) => o.quote.id === request.chosen_quote_id);
  if (!chosen) throw new HouseholdError("conflict");
  await db.insert("reviews", {
    id: newId(),
    quote_request_id: requestId,
    installer_id: chosen.installer.id,
    household_id: householdId,
    rating: input.rating,
    title: input.title ?? null,
    body: input.body,
    author_display_name: input.author_display_name,
    status: "pending",
    moderated_by: null,
    moderated_at: null,
    moderation_note: null,
    is_demo: false,
    created_at: new Date().toISOString(),
  });
}
