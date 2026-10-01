import config from "../../keystatic.config";

/**
 * The editor is available when:
 * - running locally (`npm run dev`), where edits are saved straight to disk, or
 * - GitHub storage is configured, where edits become commits.
 * A production build without GitHub storage hides it: it could not save
 * anything there (the live site has no writable disk).
 */
export const keystaticEnabled =
  process.env.NODE_ENV === "development" || config.storage.kind === "github";
