import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("quotes values that need it and keeps numbers", () => {
    expect(toCsv([["a", 'say "hi"', "x,y", 750, null]])).toBe(
      '﻿a,"say ""hi""","x,y",750,\r\n',
    );
  });

  it("neutralises spreadsheet formulas but not negative numbers", () => {
    expect(toCsv([["=SUM(A1)", "-5", "@x"]])).toBe("﻿'=SUM(A1),-5,'@x\r\n");
  });
});
