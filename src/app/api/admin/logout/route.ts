import { cookies } from "next/headers";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/admin-auth";

export async function POST(request: Request) {
  (await cookies()).set(SESSION_COOKIE, "", sessionCookieOptions(0));
  return Response.redirect(new URL("/admin/login", request.url), 303);
}
