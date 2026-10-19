import type { Region } from "./regions";

/**
 * Lead routing: which installers get a household's request.
 *
 * Rules (from the brief, details in PLAN.md Assumption 7):
 * 1. Only installers that are approved, active and cover the request's
 *    region are eligible.
 * 2. Installers that reached their monthly cap are skipped.
 * 3. The rest are ranked by a score: half response speed, half rating.
 *    New installers without history get a neutral score, so they are not
 *    punished for being new.
 * 4. Fair rotation: scores are rounded to one decimal, and within the same
 *    rounded score the installer who was offered a lead longest ago goes
 *    first.
 * 5. At most `max` (three) are chosen. Admin can always change the result
 *    by hand.
 *
 * A pure function: all data comes in as arguments, so it is fully tested
 * (routing.test.ts).
 */

export type RoutingCandidate = {
  id: string;
  status: string;
  active: boolean;
  regions: readonly Region[];
  /** Personal cap; null = the platform default. */
  monthlyCap: number | null;
  /** Leads offered to this installer in the current month. */
  leadsThisMonth: number;
  /** Average hours to accept or decline a lead; null = no history. */
  avgResponseHours: number | null;
  /** Average approved review rating 1–5; null = no reviews. */
  rating: number | null;
  reviewCount: number;
  /** When the installer was last offered a lead; null = never. */
  lastOfferedAt: string | null;
};

export type SkipReason =
  "notApproved" | "inactive" | "wrongRegion" | "capReached" | "excluded";

export type RoutingResult = {
  selected: (RoutingCandidate & { score: number })[];
  skipped: { id: string; reason: SkipReason }[];
};

/** A response within the hour scores 1; after this many hours it scores 0. */
export const RESPONSE_HOURS_FOR_ZERO = 48;
/** Reviews needed before the rating counts in full. */
export const REVIEWS_FOR_FULL_WEIGHT = 5;
const NEUTRAL = 0.5;

export function responseScore(avgResponseHours: number | null): number {
  if (avgResponseHours === null) return NEUTRAL;
  return Math.min(
    1,
    Math.max(0, 1 - avgResponseHours / RESPONSE_HOURS_FOR_ZERO),
  );
}

export function ratingScore(
  rating: number | null,
  reviewCount: number,
): number {
  if (rating === null || reviewCount === 0) return NEUTRAL;
  const normalised = Math.min(1, Math.max(0, (rating - 1) / 4));
  // With few reviews, the score leans towards neutral: one 5-star review
  // should not beat a long, solid track record.
  const weight =
    Math.min(reviewCount, REVIEWS_FOR_FULL_WEIGHT) / REVIEWS_FOR_FULL_WEIGHT;
  return NEUTRAL * (1 - weight) + normalised * weight;
}

export function score(candidate: RoutingCandidate): number {
  return (
    0.5 * responseScore(candidate.avgResponseHours) +
    0.5 * ratingScore(candidate.rating, candidate.reviewCount)
  );
}

export function selectInstallers(
  request: { region: Region; max?: number; excludeIds?: readonly string[] },
  candidates: readonly RoutingCandidate[],
  defaultMonthlyCap: number,
): RoutingResult {
  const max = request.max ?? 3;
  const skipped: RoutingResult["skipped"] = [];
  const eligible: (RoutingCandidate & { score: number })[] = [];

  for (const candidate of candidates) {
    const cap = candidate.monthlyCap ?? defaultMonthlyCap;
    let reason: SkipReason | null = null;
    if (request.excludeIds?.includes(candidate.id)) reason = "excluded";
    else if (candidate.status !== "approved") reason = "notApproved";
    else if (!candidate.active) reason = "inactive";
    else if (!candidate.regions.includes(request.region))
      reason = "wrongRegion";
    else if (candidate.leadsThisMonth >= cap) reason = "capReached";
    if (reason) skipped.push({ id: candidate.id, reason });
    else eligible.push({ ...candidate, score: score(candidate) });
  }

  const offeredTime = (c: RoutingCandidate) =>
    c.lastOfferedAt ? new Date(c.lastOfferedAt).getTime() : 0;

  eligible.sort((a, b) => {
    const bucketA = Math.round(a.score * 10);
    const bucketB = Math.round(b.score * 10);
    if (bucketA !== bucketB) return bucketB - bucketA;
    const waited = offeredTime(a) - offeredTime(b);
    if (waited !== 0) return waited;
    return a.id.localeCompare(b.id);
  });

  return { selected: eligible.slice(0, Math.max(0, max)), skipped };
}
