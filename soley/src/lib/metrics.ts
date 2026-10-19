import { hoursBetween } from "./time";

/**
 * Figures for the admin dashboard, calculated from plain rows so they can
 * be tested without a database.
 */

type RequestLike = { created_at: string; status: string };
type AssignmentLike = {
  offered_at: string;
  responded_at: string | null;
  status: string;
  fee_mur: number | null;
};

/** Monday 00:00 UTC of the week containing `date`, as YYYY-MM-DD. */
export function weekStart(date: Date): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

/** Requests per week for the last `weeks` weeks, oldest first, empty weeks included. */
export function requestsPerWeek(requests: RequestLike[], now: Date, weeks = 8) {
  const starts: string[] = [];
  const current = new Date(`${weekStart(now)}T00:00:00Z`);
  for (let i = weeks - 1; i >= 0; i -= 1) {
    starts.push(
      new Date(current.getTime() - i * 7 * 86_400_000)
        .toISOString()
        .slice(0, 10),
    );
  }
  const counts = new Map(starts.map((s) => [s, 0]));
  for (const r of requests) {
    const key = weekStart(new Date(r.created_at));
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return starts.map((week) => ({ week, count: counts.get(week) ?? 0 }));
}

export function dashboardMetrics(
  requests: RequestLike[],
  assignments: AssignmentLike[],
) {
  const responded = assignments.filter((a) => a.responded_at);
  const avgResponseHours = responded.length
    ? responded.reduce(
        (sum, a) =>
          sum + Math.max(0, hoursBetween(a.offered_at, a.responded_at!)),
        0,
      ) / responded.length
    : null;

  // Share of requests where the household chose one of the quotes.
  const decided = requests.filter((r) =>
    ["chosen", "installed"].includes(r.status),
  ).length;
  const withQuotes = requests.filter((r) =>
    ["quoted", "chosen", "installed"].includes(r.status),
  ).length;
  const winRate = withQuotes ? decided / withQuotes : null;

  // Billed fees per request received: what one request brings in on average.
  const billed = assignments.reduce((sum, a) => sum + (a.fee_mur ?? 0), 0);
  const revenuePerRequest = requests.length ? billed / requests.length : null;

  return {
    totalRequests: requests.length,
    avgResponseHours,
    winRate,
    billedMur: billed,
    revenuePerRequest,
  };
}
