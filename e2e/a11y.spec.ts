import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** Automated WCAG 2.2 AA checks (axe) on every kind of page, in both languages. */
const pages = [
  "/en",
  "/fr",
  "/en/areas",
  "/fr/regions/tamarin",
  "/en/places",
  "/fr/lieux/example-restaurant-tamarin",
  "/en/guides",
  "/fr/guides/plages",
  "/en/guides/beaches/example-guide-beaches",
  "/en/live-in-the-west",
  "/fr/vivre-dans-l-ouest/pds",
  "/en/live-in-the-west/enquire",
  "/fr/contact",
  "/en/privacy",
  "/fr/nexiste-pas",
];

for (const path of pages) {
  test(`no accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      // The map canvas is supplementary (every place is also listed as text);
      // its third-party controls are checked separately in manual review.
      .exclude(".maplibregl-map")
      .analyze();
    expect(
      results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`),
    ).toEqual([]);
  });
}
