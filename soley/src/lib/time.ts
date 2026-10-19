/** "YYYY-MM" of a moment in Mauritius time (UTC+4), used for billing months. */
export function monthKey(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Indian/Mauritius",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(d);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  return `${year}-${month}`;
}

/** Hours between two ISO timestamps. */
export const hoursBetween = (from: string, to: string) =>
  (new Date(to).getTime() - new Date(from).getTime()) / 3_600_000;
