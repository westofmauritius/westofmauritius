import "server-only";
import { cookies } from "next/headers";
import type { Locale } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { getDb, usesSupabase } from "../data";
import { emailMagicLink } from "../email/templates";
import { site } from "../site";
import { createAuthClient } from "./supabase-server";
import { signToken, verifyToken } from "./token";

/**
 * Sign-in with a magic link sent by e-mail, for every role.
 *
 * Production: Supabase Auth sends the link and keeps the session in its
 * cookies. Demo mode (development, end-to-end tests): Soley signs its own
 * link and session cookie with SESSION_SECRET, and the link goes to the
 * development outbox.
 */

export const SESSION_COOKIE = "soley_session";
const SESSION_DAYS = 30;
const LINK_MINUTES = 60;

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (value && value.length >= 32) return value;
  if (
    process.env.NODE_ENV !== "production" ||
    process.env.SOLEY_DEMO_MODE === "true"
  ) {
    return "development-only-secret-do-not-use-in-production";
  }
  throw new Error("SESSION_SECRET must be set (32+ characters)");
}

// One-time use of demo links within this server process.
const used = globalThis as unknown as { __soleyUsedLinks?: Set<string> };
const usedLinks = () => (used.__soleyUsedLinks ??= new Set());

/** Only paths on this site are allowed after sign-in (no open redirects). */
export function safeNext(next: unknown): string | null {
  return typeof next === "string" && /^\/(en|fr)(\/[\w\-/]*)?$/.test(next)
    ? next
    : null;
}

export async function sendSignInLink(
  email: string,
  locale: Locale,
  next: string | null,
) {
  const callback = new URL("/auth/callback", site.url);
  callback.searchParams.set("locale", locale);
  if (next) callback.searchParams.set("next", next);

  if (usesSupabase()) {
    const supabase = await createAuthClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callback.toString(), shouldCreateUser: true },
    });
    if (error) throw new Error(`Sign-in link failed: ${error.message}`);
    return;
  }

  const token = await signToken(
    {
      email,
      exp: Date.now() + LINK_MINUTES * 60_000,
      nonce: crypto.randomUUID(),
      purpose: "link",
    },
    secret(),
  );
  callback.searchParams.set("token", token);
  await emailMagicLink(email, locale, callback.toString());
}

/**
 * Completes sign-in from the link (called by /auth/callback). Returns the
 * signed-in e-mail, or null if the link is invalid or expired.
 */
export async function completeSignIn(
  params: URLSearchParams,
): Promise<string | null> {
  if (usesSupabase()) {
    const supabase = await createAuthClient();
    const code = params.get("code");
    const tokenHash = params.get("token_hash");
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      return error ? null : (data.user?.email ?? null);
    }
    if (tokenHash) {
      const { data, error } = await supabase.auth.verifyOtp({
        type: "email",
        token_hash: tokenHash,
      });
      return error ? null : (data.user?.email ?? null);
    }
    return null;
  }

  const token = params.get("token");
  if (!token) return null;
  const payload = await verifyToken(token, secret(), "link");
  if (!payload || !payload.nonce || usedLinks().has(payload.nonce)) return null;
  usedLinks().add(payload.nonce);
  const session = await signToken(
    {
      email: payload.email,
      exp: Date.now() + SESSION_DAYS * 86_400_000,
      purpose: "session",
    },
    secret(),
  );
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production" && site.url.startsWith("https"),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
  return payload.email;
}

/** The signed-in person's e-mail, or null. */
export async function currentEmail(): Promise<string | null> {
  if (usesSupabase()) {
    const supabase = await createAuthClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.email?.toLowerCase() ?? null;
  }
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  const payload = await verifyToken(value, secret(), "session");
  return payload?.email.toLowerCase() ?? null;
}

export async function signOut() {
  if (usesSupabase()) {
    const supabase = await createAuthClient();
    await supabase.auth.signOut();
  }
  (await cookies()).delete(SESSION_COOKIE);
}

/** Where a sign-in link should land, e.g. "/fr/portail". */
export const pathFor = (
  href: Parameters<typeof getPathname>[0]["href"],
  locale: Locale,
) => getPathname({ href, locale });

/** True if the e-mail has admin rights (env bootstrap list or admins table). */
export async function isAdmin(email: string): Promise<boolean> {
  const fromEnv = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (fromEnv.includes(email.toLowerCase())) return true;
  const rows = await getDb().select("admins", { email });
  return rows.length > 0;
}
