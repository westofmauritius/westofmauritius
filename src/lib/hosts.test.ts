import { describe, expect, it } from "vitest";
import { decideHost } from "./hosts";

const config = {
  siteUrl: "https://westofmauritius.mu",
  indexing: "auto",
} as const;

describe("decideHost", () => {
  it("lets search engines index the production domain", () => {
    expect(decideHost("https://westofmauritius.mu/en/areas", config)).toEqual({
      kind: "serve",
      indexable: true,
    });
  });

  it("blocks preview addresses", () => {
    expect(
      decideHost("https://westofmauritius.oliver.workers.dev/en", config),
    ).toEqual({ kind: "serve", indexable: false });
    expect(decideHost("http://localhost:8787/en", config)).toEqual({
      kind: "serve",
      indexable: false,
    });
  });

  it("blocks everything when indexing is switched off", () => {
    expect(
      decideHost("https://westofmauritius.mu/en", {
        ...config,
        indexing: "off",
      }),
    ).toEqual({ kind: "serve", indexable: false });
  });

  it("redirects www and the retired domain, keeping path and query", () => {
    expect(decideHost("https://www.westofmauritius.mu/en?q=1", config)).toEqual(
      {
        kind: "redirect",
        location: "https://westofmauritius.mu/en?q=1",
      },
    );
    expect(decideHost("https://westmauritius.mu/en/places", config)).toEqual({
      kind: "redirect",
      location: "https://westofmauritius.mu/en/places",
    });
  });
});
