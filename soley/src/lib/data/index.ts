import "server-only";
import type { Db, FileStore } from "./db";
import { createMemoryDb, createMemoryFileStore } from "./memory";
import { createSupabaseDb, createSupabaseFileStore } from "./supabase";
import { demoData } from "../demo/seed-data";

export type { Db, FileStore } from "./db";

/** True when the app runs on Supabase (production). */
export const usesSupabase = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

/**
 * True when the in-memory store with demo data may be used: always in
 * development and tests, and in production only when SOLEY_DEMO_MODE=true
 * is set on purpose (end-to-end tests). A live site without Supabase fails
 * loudly instead of silently losing data.
 */
export const isDemoMode = () =>
  !usesSupabase() &&
  (process.env.NODE_ENV !== "production" ||
    process.env.SOLEY_DEMO_MODE === "true");

// Kept on globalThis so the memory store survives hot reloads in development.
const holder = globalThis as unknown as {
  __soleyDb?: Db;
  __soleyFiles?: FileStore;
};

export function getDb(): Db {
  if (holder.__soleyDb) return holder.__soleyDb;
  if (usesSupabase()) holder.__soleyDb = createSupabaseDb();
  else if (isDemoMode()) holder.__soleyDb = createMemoryDb(demoData());
  else {
    throw new Error(
      "No database: set the Supabase variables (see .env.example), or SOLEY_DEMO_MODE=true for a demo.",
    );
  }
  return holder.__soleyDb;
}

export function getFileStore(): FileStore {
  if (holder.__soleyFiles) return holder.__soleyFiles;
  holder.__soleyFiles = usesSupabase()
    ? createSupabaseFileStore()
    : createMemoryFileStore();
  return holder.__soleyFiles;
}

/** For tests: replace the database with a fresh one. */
export function setDbForTests(
  db: Db,
  files: FileStore = createMemoryFileStore(),
) {
  holder.__soleyDb = db;
  holder.__soleyFiles = files;
}
