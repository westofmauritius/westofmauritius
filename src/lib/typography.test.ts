import { describe, expect, it } from "vitest";
import { typeset } from "./typography";

const NNBSP = " ";

describe("typeset", () => {
  it("adds a narrow no-break space before French double punctuation", () => {
    expect(typeset("Guide : les plages ? Oui !", "fr")).toBe(
      `Guide${NNBSP}: les plages${NNBSP}? Oui${NNBSP}!`,
    );
  });

  it("handles French quotation marks", () => {
    expect(typeset("« Bonjour »", "fr")).toBe(`«${NNBSP}Bonjour${NNBSP}»`);
  });

  it("leaves English untouched", () => {
    expect(typeset("Guide : test", "en")).toBe("Guide : test");
  });
});
