import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  const columns = [
    { header: "Name", value: (r: { name: string; areas: string[] }) => r.name },
    {
      header: "Areas",
      value: (r: { name: string; areas: string[] }) => r.areas,
    },
  ];

  it("quotes values, joins lists and starts with a BOM", () => {
    const csv = toCsv(
      [{ name: 'Anne "A" Côté', areas: ["tamarin", "le-morne"] }],
      columns,
    );
    expect(csv).toBe(
      '﻿"Name","Areas"\r\n"Anne ""A"" Côté","tamarin, le-morne"\r\n',
    );
  });

  it("neutralises spreadsheet formulas", () => {
    const csv = toCsv([{ name: "=HYPERLINK(1)", areas: [] }], columns);
    expect(csv).toContain(`"'=HYPERLINK(1)"`);
  });
});
