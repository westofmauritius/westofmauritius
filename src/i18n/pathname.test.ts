import { describe, expect, it } from "vitest";
import { getPathname } from "./pathname";

describe("getPathname", () => {
  it("prefixes the language, also on the start page", () => {
    expect(getPathname({ href: "/", locale: "en" })).toBe("/en");
    expect(getPathname({ href: "/", locale: "fr" })).toBe("/fr");
  });

  it("uses the translated path", () => {
    expect(getPathname({ href: "/areas", locale: "en" })).toBe("/en/areas");
    expect(getPathname({ href: "/areas", locale: "fr" })).toBe("/fr/regions");
    expect(
      getPathname({ href: "/living-in-the-west/enquire", locale: "fr" }),
    ).toBe("/fr/vivre-dans-l-ouest/demande");
  });

  it("fills in parameters", () => {
    expect(
      getPathname({
        href: { pathname: "/places/[slug]", params: { slug: "tamarin-bay" } },
        locale: "fr",
      }),
    ).toBe("/fr/lieux/tamarin-bay");
    expect(
      getPathname({
        href: {
          pathname: "/guides/[category]/[slug]",
          params: { category: "plages", slug: "plages-de-la-cote-ouest" },
        },
        locale: "fr",
      }),
    ).toBe("/fr/guides/plages/plages-de-la-cote-ouest");
  });

  it("adds a query string", () => {
    expect(
      getPathname({
        href: {
          pathname: "/living-in-the-west/enquire",
          query: { area: "tamarin", source: "area-page" },
        },
        locale: "en",
      }),
    ).toBe("/en/living-in-the-west/enquire?area=tamarin&source=area-page");
  });
});
