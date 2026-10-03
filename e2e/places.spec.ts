import { expect, test } from "@playwright/test";

test("places can be searched and filtered, and filters live in the URL", async ({
  page,
}) => {
  await page.goto("/fr/lieux");
  const results = page.getByRole("status");
  await expect(results).toHaveText("19 adresses");

  // Every word must match, in any order; one result is singular in French.
  await page.getByLabel("Rechercher").fill("tamarin salines");
  await expect(results).toHaveText("1 adresse");
  await expect(page).toHaveURL(/\?q=tamarin/);

  // Accents are ignored: "belvedere" finds "belvédère".
  await page.getByLabel("Rechercher").fill("belvedere");
  await expect(
    page.getByRole("link", { name: /Belvédère de Chamarel/ }),
  ).toBeVisible();

  await page.getByLabel("Rechercher").fill("");
  await page.getByLabel("Catégorie").selectOption("beach");
  await expect(results).toHaveText("4 adresses");

  await page.getByRole("button", { name: "Effacer les filtres" }).click();
  await expect(results).toHaveText("19 adresses");

  await page.goto("/en/places?area=le-morne&featured=1");
  await expect(page.getByRole("status")).toHaveText("0 places");
});

test("the photo gallery opens, moves with the keyboard and closes", async ({
  page,
}) => {
  await page.goto("/en/places/le-morne-brabant");
  const opener = page.getByRole("button", { name: "Open photo 2 of 3" });
  await opener.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("figcaption")).toContainText("2 / 3");
  await page.keyboard.press("ArrowRight");
  await expect(dialog.locator("figcaption")).toContainText("3 / 3");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});
