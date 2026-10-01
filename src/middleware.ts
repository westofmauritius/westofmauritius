import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Runs before every page request. It sends visitors without a language in the
 * URL (e.g. "/") to the right one — based on a previous choice (cookie) or
 * their browser language — and maps translated URLs like /fr/lieux/… to the
 * internal route folders.
 *
 * Why "middleware.ts" and not Next.js 16's newer "proxy.ts": a proxy always
 * runs as Node.js code, which on Cloudflare pulls a second copy of the
 * Next.js server into the Worker (~3 MB, over the free plan's limit) and is
 * only experimentally supported by OpenNext. Middleware runs in the small,
 * fully supported "edge" runtime. Next.js prints a deprecation warning for
 * this file name during the build; that is expected.
 */
export default createMiddleware(routing);

export const config = {
  // Skip API routes, the CMS, admin (added later), Next.js internals and any
  // request for a file (anything with a dot, e.g. favicon.ico).
  matcher: "/((?!api|keystatic|admin|_next|_vercel|.*\\..*).*)",
};
