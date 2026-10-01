import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  adminConfigured,
  createSession,
  passwordMatches,
  sessionCookieOptions,
} from "@/lib/server/admin-auth";
import { clientIp, hashIp } from "@/lib/server/request";
import { getStore } from "@/lib/server/store";

const back = (request: Request, path: string) =>
  Response.redirect(new URL(path, request.url), 303);

/** Log-in form target. At most 5 attempts per 15 minutes per visitor. */
export async function POST(request: Request) {
  if (!adminConfigured()) return back(request, "/admin/login");

  const store = getStore();
  if (!store) return back(request, "/admin/login?error=unavailable");
  const ipHash = await hashIp(clientIp(request.headers));
  if ((await store.hit("admin-login", ipHash, 15)) > 5) {
    return back(request, "/admin/login?error=locked");
  }

  const form = await request.formData();
  const password = form.get("password");
  if (typeof password !== "string" || !(await passwordMatches(password))) {
    return back(request, "/admin/login?error=wrong");
  }

  const session = await createSession();
  (await cookies()).set(
    SESSION_COOKIE,
    session.value,
    sessionCookieOptions(session.maxAge),
  );
  return back(request, "/admin/leads");
}
