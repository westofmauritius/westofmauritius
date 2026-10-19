import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/data";
import { outbox } from "@/lib/email/send";

/**
 * The development outbox: e-mails that were not sent because no Resend key
 * is configured. Only available in demo mode (local development and the
 * end-to-end tests); a 404 everywhere else.
 *
 *   GET /api/dev/outbox?to=someone@example.com
 */
export async function GET(request: Request) {
  if (!isDemoMode() || process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const to = new URL(request.url).searchParams.get("to")?.toLowerCase();
  const emails = outbox().filter(
    (email) => !to || email.to.toLowerCase() === to,
  );
  return NextResponse.json(emails);
}
