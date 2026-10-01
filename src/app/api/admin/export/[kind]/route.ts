import { toCsv } from "@/lib/csv";
import { isAdmin } from "@/lib/server/admin-auth";
import {
  budgetLabel,
  leadFiltersFrom,
  timeframeLabel,
  topicLabel,
} from "@/lib/server/admin-data";
import { getStore } from "@/lib/server/store";

/** CSV downloads for the admin: leads (with the page's filters), contacts, newsletter. */
export async function GET(
  request: Request,
  { params }: RouteContext<"/api/admin/export/[kind]">,
) {
  if (!(await isAdmin())) return new Response("Not found", { status: 404 });
  const store = getStore();
  if (!store) return new Response("No database configured", { status: 503 });

  const { kind } = await params;
  const url = new URL(request.url);
  const today = new Date().toISOString().slice(0, 10);
  let csv: string;

  if (kind === "leads") {
    const leads = await store.listLeads(
      leadFiltersFrom(url.searchParams),
      100_000,
    );
    csv = toCsv(leads, [
      { header: "Received (UTC)", value: (l) => l.createdAt },
      { header: "Name", value: (l) => l.name },
      { header: "E-mail", value: (l) => l.email },
      { header: "Phone / WhatsApp", value: (l) => l.phone },
      { header: "Country", value: (l) => l.country },
      { header: "Budget", value: (l) => budgetLabel(l.budget) },
      { header: "Timeframe", value: (l) => timeframeLabel(l.timeframe) },
      { header: "Areas", value: (l) => l.areas },
      { header: "Message", value: (l) => l.message },
      { header: "Newsletter", value: (l) => (l.newsletter ? "yes" : "no") },
      { header: "Language", value: (l) => l.locale },
      { header: "Source", value: (l) => l.source },
      { header: "Consent version", value: (l) => l.consentVersion },
    ]);
  } else if (kind === "contacts") {
    const messages = await store.listContacts(100_000);
    csv = toCsv(messages, [
      { header: "Received (UTC)", value: (m) => m.createdAt },
      { header: "Name", value: (m) => m.name },
      { header: "E-mail", value: (m) => m.email },
      { header: "Topic", value: (m) => topicLabel(m.topic) },
      { header: "Message", value: (m) => m.message },
      { header: "Language", value: (m) => m.locale },
    ]);
  } else if (kind === "newsletter") {
    // Only confirmed, still-subscribed addresses may be e-mailed.
    const subscribers = (await store.listSubscribers(100_000)).filter(
      (s) => s.confirmedAt && !s.unsubscribedAt,
    );
    csv = toCsv(subscribers, [
      { header: "E-mail", value: (s) => s.email },
      { header: "Language", value: (s) => s.locale },
      { header: "Confirmed (UTC)", value: (s) => s.confirmedAt },
    ]);
  } else {
    return new Response("Not found", { status: 404 });
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="west-mauritius-${kind}-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
