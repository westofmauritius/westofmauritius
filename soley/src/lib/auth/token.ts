/**
 * Signed tokens for demo-mode sign-in links and session cookies
 * (production uses Supabase Auth). Format: base64url(payload).signature,
 * where the signature is HMAC-SHA256 with SESSION_SECRET. Works in Node and
 * edge runtimes (Web Crypto).
 */

const encoder = new TextEncoder();

const base64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromBase64url = (value: string) =>
  Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), (c) =>
    c.charCodeAt(0),
  );

async function key(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export type TokenPayload = {
  email: string;
  exp: number;
  nonce?: string;
  purpose: "link" | "session";
};

export async function signToken(
  payload: TokenPayload,
  secret: string,
): Promise<string> {
  const body = base64url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await key(secret),
    encoder.encode(body),
  );
  return `${body}.${base64url(new Uint8Array(signature))}`;
}

export async function verifyToken(
  token: string,
  secret: string,
  purpose: TokenPayload["purpose"],
  now = Date.now(),
): Promise<TokenPayload | null> {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await key(secret),
      fromBase64url(signature),
      encoder.encode(body),
    );
    if (!valid) return null;
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64url(body)),
    ) as TokenPayload;
    if (payload.purpose !== purpose || payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}
