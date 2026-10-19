import { NextResponse, type NextRequest } from "next/server";
import { completeSignIn, safeNext } from "@/lib/auth/session";
import { safeLocale } from "@/lib/i18n-server";

/**
 * Where the magic link lands. Completes the sign-in, then continues to the
 * page the person wanted, or to the sign-in page, which forwards them to
 * their area. A bad or used link goes back to sign-in with a message.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const locale = safeLocale(params.get("locale"));
  const email = await completeSignIn(params);
  const signIn = locale === "fr" ? "/fr/connexion" : "/en/sign-in";
  if (!email) {
    return NextResponse.redirect(new URL(`${signIn}?error=link`, request.url));
  }
  const next = safeNext(params.get("next")) ?? signIn;
  return NextResponse.redirect(new URL(next, request.url));
}
