import "server-only";
import { memoryStore } from "./memory-store";
import { neonStore } from "./neon-store";
import type { Store } from "./types";

/**
 * The store to use: Neon when DATABASE_URL is set. Without it, the in-memory
 * store is used in development and tests (ALLOW_MEMORY_STORE=1); a live site
 * without a database gets null, and the forms answer "temporarily
 * unavailable" instead of pretending to save.
 */
export function getStore(): Store | null {
  const url = process.env.DATABASE_URL;
  if (url) return neonStore(url);
  if (
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_MEMORY_STORE === "1"
  ) {
    return memoryStore;
  }
  return null;
}
