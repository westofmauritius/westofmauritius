import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

/** Signed-in areas, in every language (see src/i18n/routing.ts). */
const signedInArea =
  /^\/(en|fr)\/(account|mon-compte|portal|portail|admin)(\/|$)/;

/**
 * Runs before every page request (Next.js 16 calls this file "proxy"; it
 * was "middleware" before).
 *
 * 1. Language routing: visitors without a language in the URL go to their
 *    browser's language, and translated URLs (/fr/calculateur) map to the
 *    internal route folders.
 * 2. On Supabase, it refreshes the sign-in session for signed-in areas, so
 *    people are not signed out when the short-lived access token expires
 *    (pages cannot write cookies themselves).
 */
export default async function proxy(request: NextRequest) {
  const response = intl(request);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anonKey && signedInArea.test(request.nextUrl.pathname)) {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          for (const { name, value, options } of list)
            response.cookies.set(name, value, options);
        },
      },
    });
    await supabase.auth.getUser();
  }
  return response;
}

export const config = {
  // Skip API routes, the sign-in callback, Next.js internals and files.
  matcher: "/((?!api|auth|_next|_vercel|.*\\..*).*)",
};
