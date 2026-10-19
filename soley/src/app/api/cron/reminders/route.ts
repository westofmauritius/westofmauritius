import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/data";
import { emailLeadReminder, emailQuoteReminder } from "@/lib/email/templates";
import { safeLocale } from "@/lib/i18n-server";
import { dueLeadReminders, dueQuoteReminders } from "@/lib/reminders";

/**
 * Daily reminders (scheduled in vercel.json). Vercel Cron calls this with
 * "Authorization: Bearer <CRON_SECRET>"; any other caller is refused.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  const now = new Date();
  const [assignments, requests, quotes, installers] = await Promise.all([
    db.select("lead_assignments", { status: "offered" }),
    db.select("quote_requests", { status: "quoted" }),
    db.select("quotes"),
    db.select("installers"),
  ]);

  let leads = 0;
  for (const a of dueLeadReminders(assignments, now)) {
    const installer = installers.find((i) => i.id === a.installer_id);
    if (!installer || installer.status !== "approved") continue;
    await emailLeadReminder(
      installer.contact_email,
      safeLocale(installer.locale),
      {
        company: installer.company_name,
        assignmentId: a.id,
      },
    );
    await db.update(
      "lead_assignments",
      { id: a.id },
      { reminder_sent_at: now.toISOString() },
    );
    leads += 1;
  }

  let households = 0;
  for (const r of dueQuoteReminders(requests, quotes, now)) {
    const [household] = await db.select("households", { id: r.household_id });
    if (household?.email) {
      await emailQuoteReminder(household.email, safeLocale(household.locale), {
        name: household.name ?? "",
        requestId: r.id,
      });
    }
    await db.update(
      "quote_requests",
      { id: r.id },
      { quote_reminder_sent_at: now.toISOString() },
    );
    households += 1;
  }

  return NextResponse.json({
    leadReminders: leads,
    quoteReminders: households,
  });
}
