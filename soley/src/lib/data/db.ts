import type { TableName, Tables } from "./schema";

/**
 * The small database interface all Soley code uses. Two adapters implement
 * it: Supabase (production) and memory (development, tests, demo). Business
 * logic is written once on top of it (src/lib/services), so both adapters
 * behave the same.
 *
 * Filters are deliberately simple: equality, "in" (an array) and "is null"
 * (null). Anything more is done in TypeScript, which is fine at Soley's
 * scale (hundreds of rows a month).
 */

type Scalar = string | number | boolean;
export type Where<R> = {
  [K in keyof R]?: R[K] extends unknown ? Scalar | Scalar[] | null : never;
};

export type SelectOptions<R> = {
  orderBy?: keyof R & string;
  ascending?: boolean;
  limit?: number;
};

export interface Db {
  select<T extends TableName>(
    table: T,
    where?: Where<Tables[T]>,
    options?: SelectOptions<Tables[T]>,
  ): Promise<Tables[T][]>;
  /** Inserts full rows (ids and timestamps are set by the caller). */
  insert<T extends TableName>(
    table: T,
    rows: Tables[T] | Tables[T][],
  ): Promise<Tables[T][]>;
  /** Inserts or replaces rows by primary key. */
  upsert<T extends TableName>(
    table: T,
    rows: Tables[T] | Tables[T][],
  ): Promise<Tables[T][]>;
  update<T extends TableName>(
    table: T,
    where: Where<Tables[T]>,
    patch: Partial<Tables[T]>,
  ): Promise<Tables[T][]>;
  remove<T extends TableName>(table: T, where: Where<Tables[T]>): Promise<void>;
  /** Counts a hit for `key`; false when over `max` hits in the window. */
  rateLimitHit(
    key: string,
    windowSeconds: number,
    max: number,
  ): Promise<boolean>;
}

/** Private file storage for installer documents. */
export interface FileStore {
  put(path: string, data: ArrayBuffer, contentType: string): Promise<void>;
  get(path: string): Promise<{ data: ArrayBuffer; contentType: string } | null>;
  remove(paths: string[]): Promise<void>;
}

/** True if a row matches a filter (shared by the memory adapter and tests). */
export function matches<R extends object>(
  row: R,
  where: Where<R> = {},
): boolean {
  return Object.entries(where).every(([key, expected]) => {
    const actual = (row as Record<string, unknown>)[key];
    if (expected === null) return actual === null || actual === undefined;
    if (Array.isArray(expected)) return expected.includes(actual as Scalar);
    if (typeof actual === "string" && typeof expected === "string") {
      // E-mail columns are case-insensitive (citext) in Postgres.
      return key.includes("email")
        ? actual.toLowerCase() === expected.toLowerCase()
        : actual === expected;
    }
    return actual === expected;
  });
}
