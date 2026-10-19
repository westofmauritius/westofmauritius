import { describe, expect, it } from "vitest";
import { requestReference, slugify } from "./ids";

describe("ids", () => {
  it("makes readable references", () => {
    expect(requestReference()).toMatch(/^SOL-[0-9A-HJKMNP-TV-Z]{5}$/);
  });

  it("slugifies company names with accents", () => {
    expect(slugify("Lagon Énergie Ltée")).toBe("lagon-energie-ltee");
    expect(slugify("  A & B Solar  ")).toBe("a-b-solar");
  });
});
