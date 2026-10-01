import { expect, test } from "@playwright/test";

test("the start page leads to an area and on to a place", async ({ page }) => {
  await page.goto("/en");
  await expect(page).toHaveTitle(/West Mauritius/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Areas" })
    .click();
  await expect(page).toHaveURL(/\/en\/areas$/);
  await expect(
    page.getByRole("link", { name: "Areas", exact: true }).first(),
  ).toHaveAttribute("aria-current", "page");

  await page.getByRole("link", { name: "Tamarin" }).first().click();
  await expect(page).toHaveURL(/\/en\/areas\/tamarin$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Tamarin" }),
  ).toBeVisible();

  await page
    .getByRole("link", { name: "Example restaurant, Tamarin" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/en\/places\/example-restaurant-tamarin$/);
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(crumbs.getByRole("link", { name: "Tamarin" })).toBeVisible();
});

test("unknown pages show the translated 404", async ({ page }) => {
  const response = await page.goto("/fr/nexiste-pas");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Page introuvable" }),
  ).toBeVisible();
});

test("the skip link moves focus to the content", async ({ page }) => {
  await page.goto("/en/guides");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("structured data and hreflang are present", async ({ page }) => {
  await page.goto("/fr/guides/plages");
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", /\/en\/guides\/beaches$/);
  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  expect(jsonLd.join()).toContain("BreadcrumbList");
});
