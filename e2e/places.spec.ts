import { expect, test } from "@playwright/test";

test("places can be searched and filtered, and filters live in the URL", async ({
  page,
}) => {
  await page.goto("/fr/lieux");
  const results = page.getByRole("status");
  await expect(results).toHaveText("10 adresses");

  await page.getByLabel("Rechercher").fill("riviere");
  await expect(results).toHaveText("2 adresses");
  await expect(page).toHaveURL(/\?q=riviere/);

  await page.getByLabel("Rechercher").fill("");
  await page.getByLabel("Catégorie").selectOption("beach");
  await expect(results).toHaveText("2 adresses");

  await page.getByRole("button", { name: "Effacer les filtres" }).click();
  await expect(results).toHaveText("10 adresses");

  await page.goto("/en/places?area=le-morne&featured=1");
  await expect(page.getByRole("status")).toHaveText("0 places");
});

test("the photo gallery opens, moves with the keyboard and closes", async ({
  page,
}) => {
  await page.goto("/en/places/example-restaurant-tamarin");
  const opener = page.getByRole("button", { name: "Open photo 2 of 4" });
  await opener.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("figcaption")).toContainText("2 / 4");
  await page.keyboard.press("ArrowRight");
  await expect(dialog.locator("figcaption")).toContainText("3 / 4");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});
