import type { LeadRow, SubscriberRow, WhatsappRow } from "./types";

export type ConversionRow = {
  source: string;
  leads: number;
  newsletter: number;
  whatsapp: number;
  total: number;
};

/**
 * Counts sign ups per page ("source"), across the three ways people convert:
 * property enquiries, newsletter sign ups and WhatsApp group requests. The
 * source is set by the link or form that started it, e.g. "area-tamarin" or
 * "guide-sunset-spots". Most converting pages first.
 */
export function conversionsBySource(
  leads: Pick<LeadRow, "source">[],
  subscribers: Pick<SubscriberRow, "source">[],
  whatsapp: Pick<WhatsappRow, "source">[],
): ConversionRow[] {
  const rows = new Map<string, ConversionRow>();
  const add = (source: string, key: "leads" | "newsletter" | "whatsapp") => {
    const name = source || "(unknown)";
    const row = rows.get(name) ?? {
      source: name,
      leads: 0,
      newsletter: 0,
      whatsapp: 0,
      total: 0,
    };
    row[key] += 1;
    row.total += 1;
    rows.set(name, row);
  };
  leads.forEach((l) => add(l.source, "leads"));
  subscribers.forEach((s) => add(s.source, "newsletter"));
  whatsapp.forEach((w) => add(w.source, "whatsapp"));
  return [...rows.values()].sort(
    (a, b) =>
      b.total - a.total ||
      b.leads - a.leads ||
      a.source.localeCompare(b.source),
  );
}
