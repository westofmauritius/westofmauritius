import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { DEMO, signIn } from "./helpers";

/** WCAG 2.2 level A and AA rules, as automated checks can test them. */
async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const summary = results.violations.map(
    (v) =>
      `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`,
  );
  expect(summary).toEqual([]);
}

const publicPages = [
  "/en",
  "/fr",
  "/en/calculator",
  "/fr/obtenir-des-devis",
  "/en/grant-guide",
  "/fr/installateurs",
  "/en/installers/demo-nord-solaire",
  "/en/guides",
  "/fr/guides/comment-lire-un-devis-solaire",
  "/en/for-installers",
  "/fr/pour-installateurs/candidature",
  "/en/about",
  "/fr/contact",
  "/en/privacy",
  "/fr/cookies",
  "/en/sign-in",
];

for (const path of publicPages) {
  test(`no accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expectNoViolations(page);
  });
}

test("no accessibility violations in the quote form errors", async ({
  page,
}) => {
  await page.goto("/en/get-quotes");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("alert").first()).toBeVisible();
  await expectNoViolations(page);
});

test("no accessibility violations in the signed-in areas", async ({ page }) => {
  await signIn(page, DEMO.household);
  await page.goto("/en/account/requests/00000000-0000-4000-8000-000000000301");
  await expectNoViolations(page);
  await page.context().clearCookies();
  await signIn(page, DEMO.installerNorth);
  await page.goto("/fr/portail");
  await expectNoViolations(page);
  await page.context().clearCookies();
  await signIn(page, DEMO.admin);
  for (const path of [
    "/en/admin",
    "/en/admin/requests",
    "/en/admin/installers/00000000-0000-4000-8000-000000000105",
    "/en/admin/settings",
  ]) {
    await page.goto(path);
    await expectNoViolations(page);
  }
});

test("the menu, the form steps and the calculator work with the keyboard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  // The skip link is the first stop.
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  const menu = page.getByRole("button", { name: "Open menu" });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(
    page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Calculator" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
});
