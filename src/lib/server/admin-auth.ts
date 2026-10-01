import "server-only";
import { cookies } from "next/headers";

/**
 * Admin sessions without a user database: one password (ADMIN_PASSWORD) and
 * a signed cookie. The cookie holds an expiry time plus an HMAC-SHA256
 * signature made with ADMIN_SESSION_SECRET, so it cannot be forged or
 * extended without the secret.
 */

export const SESSION_COOKIE = "wm_admin";
const SESSION_HOURS = 8;

const encoder = new TextEncoder();

/** Admin is only switched on when both secrets are set (and long enough). */
export function adminConfigured(): boolean {
  return (
    Boolean(process.env.ADMIN_PASSWORD) &&
    (process.env.ADMIN_SESSION_SECRET ?? "").length >= 32
  );
}

async function hmacKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.ADMIN_SESSION_SECRET ?? ""),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

const toBase64Url = (bytes: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromBase64Url = (text: string) => {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
};

/**
 * Compares the given password with ADMIN_PASSWORD in constant time (by
 * comparing SHA-256 digests byte by byte), so response times reveal nothing.
 */
export async function passwordMatches(given: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(given)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

/** A new session cookie value: "<expiry ms>.<signature>". */
export async function createSession(): Promise<{
  value: string;
  maxAge: number;
}> {
  const expires = String(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(),
    encoder.encode(expires),
  );
  return {
    value: `${expires}.${toBase64Url(signature)}`,
    maxAge: SESSION_HOURS * 60 * 60,
  };
}

/** True when the cookie value is correctly signed and not expired. */
export async function verifySession(
  value: string | undefined,
): Promise<boolean> {
  if (!value || !adminConfigured()) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  try {
    // crypto.subtle.verify compares in constant time.
    return await crypto.subtle.verify(
      "HMAC",
      await hmacKey(),
      fromBase64Url(signature),
      encoder.encode(expires),
    );
  } catch {
    return false;
  }
}

/** For server components and route handlers: is the current visitor logged in? */
export async function isAdmin(): Promise<boolean> {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Cookie settings: not readable by scripts, HTTPS only, never sent cross-site. */
export const sessionCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge,
});
