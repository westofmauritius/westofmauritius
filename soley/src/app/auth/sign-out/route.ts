import { NextResponse, type NextRequest } from "next/server";
import { signOut } from "@/lib/auth/session";
import { safeLocale } from "@/lib/i18n-server";

/** Signs out (POST only, so a link or prefetch cannot sign anyone out). */
export async function POST(request: NextRequest) {
  await signOut();
  const form = await request.formData();
  const locale = safeLocale(form.get("locale"));
  return NextResponse.redirect(new URL(`/${locale}`, request.url), {
    status: 303,
  });
}
