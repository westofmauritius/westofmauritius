import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { routing } from "@/i18n/routing";
import { guides } from "./index";

describe("guides", () => {
  it("has unique slugs per language", () => {
    for (const locale of routing.locales) {
      const slugs = guides.map((g) => g.versions[locale]?.slug).filter(Boolean);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it("has an MDX file for every listed version, and no unlisted files", () => {
    for (const locale of routing.locales) {
      const files = readdirSync(join(__dirname, locale)).map((f) =>
        f.replace(/\.mdx$/, ""),
      );
      const listed = guides
        .map((g) => g.versions[locale]?.slug)
        .filter(Boolean);
      expect(files.sort()).toEqual([...listed].sort());
    }
  });

  it("keeps descriptions within search result length", () => {
    for (const guide of guides) {
      for (const version of Object.values(guide.versions)) {
        expect(version.description.length).toBeLessThanOrEqual(160);
      }
    }
  });
});
