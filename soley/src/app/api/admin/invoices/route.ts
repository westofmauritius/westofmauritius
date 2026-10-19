import { NextResponse, type NextRequest } from "next/server";
import { currentEmail, isAdmin } from "@/lib/auth/session";
import { toCsv } from "@/lib/csv";
import { getDb } from "@/lib/data";
import { billingLines } from "@/lib/services/billing";

/**
 * Invoice basis as CSV: one row per accepted request, so every amount can
 * be traced to a request. Admins only.
 *
 *   GET /api/admin/invoices?month=2026-10
 */
export async function GET(request: NextRequest) {
  const email = await currentEmail();
  if (!email || !(await isAdmin(email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const month = request.nextUrl.searchParams.get("month");
  const validMonth = month && /^\d{4}-\d{2}$/.test(month) ? month : null;
  const db = getDb();
  const [lines, installers, requests] = await Promise.all([
    billingLines(),
    db.select("installers"),
    db.select("quote_requests"),
  ]);
  const rows: (string | number | null)[][] = [
    [
      "month",
      "installer",
      "brn",
      "invoice_number",
      "invoice_status",
      "request_reference",
      "accepted_at",
      "fee_mur",
    ],
  ];
  for (const line of lines) {
    if (validMonth && line.month !== validMonth) continue;
    const installer = installers.find((i) => i.id === line.installerId);
    for (const a of line.assignments) {
      rows.push([
        line.month,
        installer?.company_name ?? "",
        installer?.brn ?? "",
        line.invoice?.number ?? "",
        line.invoice?.status ?? "not_invoiced",
        requests.find((r) => r.id === a.quote_request_id)?.reference ?? "",
        a.responded_at,
        a.fee_mur,
      ]);
    }
  }
  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="soley-invoices-${validMonth ?? "all"}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
