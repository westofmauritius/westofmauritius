import type { Locale } from "@/i18n/routing";
import type { OpeningHours, Weekday } from "@/lib/content/types";

export const weekdayOrder: Weekday[] = [
  "mo",
  "tu",
  "we",
  "th",
  "fr",
  "sa",
  "su",
];

/** Short weekday name in the visitor's language, e.g. "Tue" / "mar.". */
function dayName(day: Weekday, locale: Locale): string {
  // 1 January 2024 was a Monday, so day i of the week is 2024-01-(1 + i).
  const date = new Date(Date.UTC(2024, 0, 1 + weekdayOrder.indexOf(day)));
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Turns a set of days into a compact label, joining runs of consecutive days:
 * ["tu","we","th","fr","sa","su"] → "Tue–Sun"; ["mo","we"] → "Mon, Wed".
 */
export function formatDays(days: Weekday[], locale: Locale): string {
  const sorted = weekdayOrder.filter((d) => days.includes(d));
  const runs: Weekday[][] = [];
  for (const day of sorted) {
    const run = runs.at(-1);
    const prev = run?.at(-1);
    if (
      run &&
      prev &&
      weekdayOrder.indexOf(day) === weekdayOrder.indexOf(prev) + 1
    )
      run.push(day);
    else runs.push([day]);
  }
  return runs
    .map((run) =>
      run.length >= 3
        ? `${dayName(run[0], locale)}–${dayName(run.at(-1)!, locale)}`
        : run.map((d) => dayName(d, locale)).join(", "),
    )
    .join(", ");
}

/** Days that appear in no row, i.e. the place is closed. */
export function closedDays(rows: OpeningHours[]): Weekday[] {
  const open = new Set(rows.flatMap((r) => r.days));
  return weekdayOrder.filter((d) => !open.has(d));
}
