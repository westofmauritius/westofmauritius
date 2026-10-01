import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Runs before every page request. It sends visitors without a language in the
 * URL (e.g. "/") to the right one — based on a previous choice (cookie) or
 * their browser language — and maps translated URLs like /fr/lieux/… to the
 * internal route folders.
 */
export default createMiddleware(routing);

export const config = {
  // Skip API routes, the CMS and admin (added later), Next.js internals and
  // any request for a file (anything with a dot, e.g. favicon.ico).
  matcher: "/((?!api|keystatic|admin|_next|_vercel|.*\\..*).*)",
};
