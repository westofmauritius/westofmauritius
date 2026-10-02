import { expect, test } from "@playwright/test";

/**
 * French is built but hidden until its content is ready
 * (src/i18n/published.ts). The e2e build runs with French hidden, so these
 * tests check that it stays out of sight; the switching tests run only when
 * the build sets NEXT_PUBLIC_FRENCH_PUBLISHED=true.
 */
const frenchPublished = process.env.NEXT_PUBLIC_FRENCH_PUBLISHED === "true";

test.describe("while French is hidden", () => {
  test.skip(frenchPublished, "French is published in this build");

  test("the start page opens in English, whatever the browser language", async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: "fr-FR" });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
    await context.close();
  });

  test("no language switcher and no French hreflang", async ({ page }) => {
    await page.goto("/en/guides/sunsets/sunset-spots");
    await expect(page.getByRole("link", { name: "Français" })).toHaveCount(0);
    await expect(page.locator('link[hreflang="fr"]')).toHaveCount(0);
    await expect(page.locator('link[hreflang="en"]')).toHaveCount(1);
  });

  test("French pages exist but are noindex", async ({ page }) => {
    await page.goto("/fr");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });

  test("the sitemap lists no French URLs", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("/en/");
    expect(xml).not.toMatch(/\/fr(\/|<)/);
  });
});

test.describe("once French is published", () => {
  test.skip(!frenchPublished, "French is hidden in this build");

  test("the start page follows the browser language", async ({ browser }) => {
    const context = await browser.newContext({ locale: "fr-FR" });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(/\/fr$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await context.close();
  });

  test("switching language keeps you on the same page, with translated URLs", async ({
    page,
  }) => {
    await page.goto("/en/guides/sunsets/sunset-spots");
    await page
      .getByRole("banner")
      .getByRole("link", { name: "Français" })
      .first()
      .click();
    await expect(page).toHaveURL(
      /\/fr\/guides\/couchers-de-soleil\/ou-voir-le-coucher-du-soleil$/,
    );
    await page
      .getByRole("banner")
      .getByRole("link", { name: "English" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/en\/guides\/sunsets\/sunset-spots$/);
  });
});
