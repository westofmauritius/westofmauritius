// Conversions between dollars (used in scenario files and in the UI) and
// cents (used for every calculation in the engine).

export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function toDollars(cents: number): number {
  return cents / 100;
}

/**
 * Parses what a learner typed in an amount field. Accepts "4000", "4,000",
 * "4000.50" and "$4,000". Returns 0 for an empty field and null when the text
 * is not a valid positive amount.
 */
export function parseAmount(text: string): number | null {
  const cleaned = text.replace(/[$,\s]/g, "");
  if (cleaned === "") return 0;
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return toCents(Number(cleaned));
}

const amountFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 400000 -> "4,000.00"; negative values are shown in brackets, as accountants do. */
export function formatAmount(cents: number): string {
  const text = amountFormat.format(Math.abs(cents) / 100);
  return cents < 0 ? `(${text})` : text;
}

/** 400000 -> "$4,000" for use in sentences. Cents are shown only when present. */
export function formatDollars(cents: number): string {
  const abs = Math.abs(cents);
  const text = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: abs % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(abs / 100);
  return cents < 0 ? `($${text})` : `$${text}`;
}
