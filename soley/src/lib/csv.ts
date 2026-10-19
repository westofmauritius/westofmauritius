/**
 * Builds a CSV file (RFC 4180) that Excel and Google Sheets open correctly:
 * values with commas, quotes or line breaks are quoted, and the file starts
 * with a byte order mark so accents (é, è) display right in Excel.
 */
export function toCsv(rows: (string | number | null | undefined)[][]): string {
  const cell = (value: string | number | null | undefined) => {
    const text = value === null || value === undefined ? "" : String(value);
    // A leading = + - @ would make spreadsheet apps run it as a formula.
    const safe =
      /^[=+\-@]/.test(text) && Number.isNaN(Number(text)) ? `'${text}` : text;
    return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return "﻿" + rows.map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n";
}
