import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Runs before every page request (Next.js 16 calls this file "proxy"; it
 * was "middleware" before). It sends visitors without a language in the URL
 * to their browser's language and maps translated URLs such as
 * /fr/calculateur to the internal route folders.
 */
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next.js internals and requests for files.
  matcher: "/((?!api|auth|_next|_vercel|.*\\..*).*)",
};
