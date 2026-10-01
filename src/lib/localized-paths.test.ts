import { describe, expect, it } from "vitest";
import { translatePath } from "./localized-paths";

describe("translatePath", () => {
  it("translates fixed paths", () => {
    expect(translatePath("/en", "en", "fr")).toBe("/fr");
    expect(translatePath("/en/about", "en", "fr")).toBe("/fr/a-propos");
    expect(translatePath("/fr/vivre-dans-l-ouest/demande", "fr", "en")).toBe(
      "/en/live-in-the-west/enquire",
    );
  });

  it("keeps parameters and translates guide categories", () => {
    expect(translatePath("/fr/regions/tamarin", "fr", "en")).toBe(
      "/en/areas/tamarin",
    );
    expect(translatePath("/en/places/x", "en", "fr")).toBe("/fr/lieux/x");
    expect(translatePath("/fr/guides/plages", "fr", "en")).toBe(
      "/en/guides/beaches",
    );
    expect(translatePath("/en/guides/sunsets/a-guide", "en", "fr")).toBe(
      "/fr/guides/couchers-de-soleil/a-guide",
    );
  });

  it("falls back to the other language's start page for unknown paths", () => {
    expect(translatePath("/en/nope/deeper", "en", "fr")).toBe("/fr");
  });
});
