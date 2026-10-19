import "server-only";
import { getDb } from "../data";
import type { InvoiceRow, LeadAssignmentRow } from "../data/schema";

export type MonthLine = {
  installerId: string;
  month: string;
  leadCount: number;
  totalMur: number;
  assignments: LeadAssignmentRow[];
  invoice: InvoiceRow | null;
};

/**
 * Billable leads per installer and month. A lead is billable once the
 * installer accepted it; the fee was fixed at that moment (fee_mur).
 */
export async function billingLines(installerId?: string): Promise<MonthLine[]> {
  const db = getDb();
  const [assignments, invoices] = await Promise.all([
    db.select(
      "lead_assignments",
      installerId ? { installer_id: installerId } : {},
    ),
    db.select("invoices", installerId ? { installer_id: installerId } : {}),
  ]);
  const lines = new Map<string, MonthLine>();
  for (const a of assignments) {
    if (a.fee_mur === null || !a.billed_month) continue;
    const key = `${a.installer_id}|${a.billed_month}`;
    let line = lines.get(key);
    if (!line) {
      line = {
        installerId: a.installer_id,
        month: a.billed_month,
        leadCount: 0,
        totalMur: 0,
        assignments: [],
        invoice:
          invoices.find(
            (i) =>
              i.installer_id === a.installer_id && i.month === a.billed_month,
          ) ?? null,
      };
      lines.set(key, line);
    }
    line.leadCount += 1;
    line.totalMur += a.fee_mur;
    line.assignments.push(a);
  }
  return [...lines.values()].sort((a, b) =>
    a.month === b.month
      ? a.installerId.localeCompare(b.installerId)
      : b.month.localeCompare(a.month),
  );
}
