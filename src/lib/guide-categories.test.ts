import { describe, expect, it } from "vitest";
import { routing } from "@/i18n/routing";
import {
  categoryFromSlug,
  guideCategories,
  guideCategoryKeys,
  translateCategorySlug,
} from "./guide-categories";

describe("guide categories", () => {
  it("maps translated slugs back to the category", () => {
    expect(categoryFromSlug("plages", "fr")).toBe("beaches");
    expect(categoryFromSlug("beaches", "en")).toBe("beaches");
    expect(categoryFromSlug("plages", "en")).toBeUndefined();
  });

  it("translates slugs between languages", () => {
    expect(translateCategorySlug("couchers-de-soleil", "fr", "en")).toBe(
      "sunsets",
    );
    expect(translateCategorySlug("sunsets", "en", "fr")).toBe(
      "couchers-de-soleil",
    );
  });

  it("has a unique URL-safe slug per language", () => {
    for (const locale of routing.locales) {
      const slugs = guideCategoryKeys.map(
        (k) => guideCategories[k].slug[locale],
      );
      expect(new Set(slugs).size).toBe(slugs.length);
      for (const slug of slugs)
        expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });
});
