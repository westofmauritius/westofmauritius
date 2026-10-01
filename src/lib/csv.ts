/**
 * Builds a CSV file that opens correctly in Excel, Numbers and Google Sheets:
 * UTF-8 with a byte-order mark (so accents survive in Excel), comma-separated,
 * every value quoted.
 *
 * Values starting with = + - @ are prefixed with an apostrophe: otherwise a
 * spreadsheet would run them as formulas, and a form field is an easy way to
 * smuggle one in ("CSV injection").
 */
export function toCsv<T>(
  rows: T[],
  columns: { header: string; value: (row: T) => unknown }[],
): string {
  const cell = (value: unknown) => {
    let text = Array.isArray(value)
      ? value.join(", ")
      : value == null
        ? ""
        : String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const lines = [
    columns.map((c) => cell(c.header)).join(","),
    ...rows.map((row) => columns.map((c) => cell(c.value(row))).join(",")),
  ];
  return "﻿" + lines.join("\r\n") + "\r\n";
}
