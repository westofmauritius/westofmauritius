/**
 * Which reminders are due. Pure functions over rows; the daily job
 * (/api/cron/reminders) sends them and records that they were sent, so
 * nobody gets the same reminder twice.
 */

/** Installers get one reminder when a lead is unanswered after this long. */
export const LEAD_REMINDER_HOURS = 24;
/** Households get one reminder when quotes wait this long without a choice. */
export const QUOTE_REMINDER_DAYS = 5;

const HOUR = 3_600_000;

type AssignmentLike = {
  id: string;
  status: string;
  offered_at: string;
  reminder_sent_at: string | null;
};

type RequestLike = {
  id: string;
  status: string;
  quote_reminder_sent_at: string | null;
};

type QuoteLike = { quote_request_id: string; created_at: string };

export function dueLeadReminders<T extends AssignmentLike>(
  assignments: T[],
  now: Date,
): T[] {
  const cutoff = now.getTime() - LEAD_REMINDER_HOURS * HOUR;
  return assignments.filter(
    (a) =>
      a.status === "offered" &&
      !a.reminder_sent_at &&
      new Date(a.offered_at).getTime() <= cutoff,
  );
}

/**
 * Requests whose household has quotes but has not chosen: reminded once,
 * counted from the latest quote, so a quote that just arrived is not rushed.
 */
export function dueQuoteReminders<T extends RequestLike>(
  requests: T[],
  quotes: QuoteLike[],
  now: Date,
): T[] {
  const cutoff = now.getTime() - QUOTE_REMINDER_DAYS * 24 * HOUR;
  return requests.filter((r) => {
    if (r.status !== "quoted" || r.quote_reminder_sent_at) return false;
    const own = quotes.filter((q) => q.quote_request_id === r.id);
    if (own.length === 0) return false;
    const latest = Math.max(
      ...own.map((q) => new Date(q.created_at).getTime()),
    );
    return latest <= cutoff;
  });
}
