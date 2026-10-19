import "server-only";
import { getDb, isDemoMode } from "../data";

/** Limits per public form: at most `max` submissions per `windowSeconds`. */
export const limits = {
  quoteRequest: { windowSeconds: 3600, max: 5 },
  installerApplication: { windowSeconds: 3600, max: 3 },
  signIn: { windowSeconds: 900, max: 5 },
  contact: { windowSeconds: 3600, max: 5 },
  review: { windowSeconds: 3600, max: 5 },
} as const;

/**
 * True if this submission is allowed. Counted per form and per IP address
 * (and per e-mail where there is one), in the database so the limit holds
 * across all server instances.
 */
export async function withinRateLimit(
  form: keyof typeof limits,
  keys: string[],
): Promise<boolean> {
  const { windowSeconds } = limits[form];
  // The demo store serves the end-to-end tests, which submit many forms
  // from one address; the real limits apply on Supabase.
  const max = limits[form].max * (isDemoMode() ? 100 : 1);
  const db = getDb();
  const results = await Promise.all(
    keys
      .filter(Boolean)
      .map((key) => db.rateLimitHit(`${form}:${key}`, windowSeconds, max)),
  );
  return results.every(Boolean);
}
