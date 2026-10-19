import { expect, test } from "@playwright/test";
import {
  acceptAndQuote,
  DEMO,
  offeredInstallers,
  requestQuotes,
  signIn,
  uniqueEmail,
} from "./helpers";

/**
 * The whole journey from the brief, on a phone and in French: a household
 * requests quotes, three installers answer, the household compares them
 * side by side and chooses one.
 */
test("a household gets three quotes, compares them and chooses (in French)", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const household = uniqueEmail("famille");
  // Clear the outbox view of earlier leads: only count e-mails after this point.
  const before = (await (await page.request.get("/api/dev/outbox")).json())
    .length;
  const reference = await requestQuotes(page, {
    email: household,
    region: "moka",
    locale: "fr",
  });
  const installers = await offeredInstallers(page.request, 3);
  expect(new Set(installers).size).toBe(3);
  expect(
    ((await (await page.request.get("/api/dev/outbox")).json()) as unknown[])
      .length,
  ).toBeGreaterThan(before);

  const prices = [240_000, 199_000, 315_000];
  for (const [index, installer] of installers.entries()) {
    await acceptAndQuote(page, installer, reference, prices[index]!);
  }

  await signIn(page, household, "fr");
  await expect(page).toHaveURL(/\/fr\/mon-compte/);
  await page
    .getByRole("link", { name: new RegExp(`Voir le détail ${reference}`) })
    .click();
  await expect(
    page.getByRole("heading", { name: "Comparez vos devis" }),
  ).toBeVisible();
  const table = page.getByRole("table");
  await expect(table.getByRole("columnheader")).toHaveCount(3);
  await expect(
    table.getByRole("rowheader", { name: "Prix total" }),
  ).toBeVisible();
  // The cheapest quote is marked as best on price.
  const priceRow = table
    .getByRole("row")
    .filter({ has: page.getByRole("rowheader", { name: "Prix total" }) });
  await expect(priceRow.getByText("Meilleur")).toHaveCount(1);
  await expect(
    priceRow.getByRole("cell").filter({ hasText: "Meilleur" }),
  ).toContainText("199");

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Choisir ce devis" }).first().click();
  await expect(page.getByText(/Vous avez choisi/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Oui, elle est installée" }),
  ).toBeVisible();
});

test("a verified customer reviews the installer, and it appears after moderation", async ({
  page,
}) => {
  await signIn(page, DEMO.household);
  await page.goto("/en/account");
  await page.getByRole("link", { name: /See details SOL-DEMO1/ }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Choose this quote" }).first().click();
  await page.getByRole("button", { name: "Yes, it is installed" }).click();
  await expect(page.getByRole("heading", { name: /^Review / })).toBeVisible();

  await page.getByRole("radio", { name: /5 stars/ }).check();
  await page
    .getByRole("textbox", { name: "Your experience" })
    .fill("E2E review: the team was on time and explained everything clearly.");
  await page
    .getByRole("textbox", { name: "Name shown with the review" })
    .fill("E2E, Moka");
  await page.getByRole("button", { name: "Send review" }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: /Thank you|waiting for moderation/ }),
  ).toBeVisible();
  const company = (
    await page.getByRole("heading", { name: /^Review / }).innerText()
  ).replace(/^Review /, "");

  await page.context().clearCookies();
  await signIn(page, DEMO.admin);
  await page.goto("/en/admin/reviews");
  const card = page
    .locator("div")
    .filter({ hasText: "E2E review" })
    .filter({ has: page.getByRole("button", { name: "Save" }) })
    .last();
  await card.getByRole("radio", { name: "Publish" }).check();
  await card.getByRole("button", { name: "Save" }).click();
  await expect(
    page
      .getByRole("listitem")
      .filter({ hasText: "E2E review" })
      .getByText("Published"),
  ).toBeVisible();

  await page.goto("/en/installers");
  await page
    .getByRole("link", { name: new RegExp(`See profile: ${company}`) })
    .click();
  await expect(
    page.getByText("E2E review: the team was on time"),
  ).toBeVisible();
});

test("households only see their own requests", async ({ page }) => {
  await signIn(page, uniqueEmail("stranger"));
  // The demo household's request id.
  const response = await page.goto(
    "/en/account/requests/00000000-0000-4000-8000-000000000301",
  );
  expect(response?.status()).toBe(404);
});
