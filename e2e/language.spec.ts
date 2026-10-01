import { expect, test } from "@playwright/test";

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
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");

  await page
    .getByRole("banner")
    .getByRole("link", { name: "English" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/en\/guides\/sunsets\/sunset-spots$/);
});

test("translated paths for places and Live in the West", async ({ page }) => {
  await page.goto("/en/places/le-morne-public-beach");
  await page
    .getByRole("banner")
    .getByRole("link", { name: "Français" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/fr\/lieux\/le-morne-public-beach$/);

  await page.goto("/fr/vivre-dans-l-ouest/acheter-au-morne");
  await page
    .getByRole("banner")
    .getByRole("link", { name: "English" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/en\/live-in-the-west\/buying-in-le-morne$/);
});
