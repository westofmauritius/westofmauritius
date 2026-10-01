import "server-only";
import messages from "../../../messages/en.json";
import type { LeadFilters } from "./types";

/** English labels for stored codes, for the admin tables and CSV files. */
export const budgetLabel = (code: string) =>
  (messages.Forms.budgets as Record<string, string>)[code] ?? code;
export const timeframeLabel = (code: string) =>
  (messages.Forms.timeframes as Record<string, string>)[code] ?? code;
export const topicLabel = (code: string) =>
  (messages.Forms.contact.topics as Record<string, string>)[code] ?? code;

/** Reads the lead filters from URL parameters (only known keys, trimmed). */
export function leadFiltersFrom(
  params: URLSearchParams | Record<string, unknown>,
): LeadFilters {
  const get = (key: string) => {
    const value =
      params instanceof URLSearchParams ? params.get(key) : params[key];
    return typeof value === "string" && value.trim()
      ? value.trim().slice(0, 100)
      : undefined;
  };
  const date = (key: string) => {
    const value = get(key);
    return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
  };
  return {
    q: get("q"),
    budget: get("budget"),
    timeframe: get("timeframe"),
    area: get("area"),
    country: get("country")?.toUpperCase(),
    from: date("from"),
    to: date("to"),
  };
}
