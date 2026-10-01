import { expect, test } from "@playwright/test";

test("the mobile menu opens with focus inside and closes with Escape", async ({
  page,
}) => {
  await page.goto("/en");
  const button = page.getByRole("button", { name: "Open menu" });
  await button.click();
  const menu = page.locator("#mobile-menu");
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("link").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(button).toBeFocused();
});

test("no page scrolls sideways on a phone", async ({ page }) => {
  for (const path of [
    "/en",
    "/fr/lieux",
    "/en/live-in-the-west/enquire",
    "/fr/guides/plages",
  ]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    expect(overflow, path).toBe(false);
  }
});
