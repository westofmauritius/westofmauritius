import { expect, test } from "@playwright/test";
import { latestEmail, requestQuotes, signIn, uniqueEmail } from "./helpers";

test("a household downloads its data, with the consent log, then deletes it", async ({
  page,
}) => {
  const email = uniqueEmail("privacy");
  const reference = await requestQuotes(page, { email, region: "flacq" });
  await signIn(page, email);
  await page.goto("/en/account/privacy");
  await expect(
    page.getByText(
      /shared request .* with at most three installers \(text version 2026-10-19\.1\)/,
    ),
  ).toBeVisible();

  const response = await page.request.get("/api/account/export");
  expect(response.headers()["content-disposition"]).toContain("attachment");
  const data = (await response.json()) as {
    household: { email: string };
    requests: { reference: string; sharedWith: unknown[] }[];
    consents: { purpose: string; text_version: string; created_at: string }[];
  };
  expect(data.household.email).toBe(email);
  expect(data.requests[0]!.reference).toBe(reference);
  expect(data.requests[0]!.sharedWith.length).toBeGreaterThan(0);
  expect(data.consents[0]).toMatchObject({
    purpose: "shareWithInstallers",
    text_version: "2026-10-19.1",
  });

  // A wrong confirmation word does nothing.
  await page
    .getByRole("textbox", { name: "Type DELETE to confirm" })
    .fill("no");
  await page
    .getByRole("button", { name: "Delete my data permanently" })
    .click();
  await expect(page.getByRole("alert").first()).toBeVisible();

  await page
    .getByRole("textbox", { name: "Type DELETE to confirm" })
    .fill("DELETE");
  await page
    .getByRole("button", { name: "Delete my data permanently" })
    .click();
  await expect(page).toHaveURL(/sign-in\?deleted=1/);
  await expect(page.getByText("Your data has been deleted")).toBeVisible();
  expect((await page.request.get("/api/account/export")).status()).toBe(401);
});

test("the contact form reaches the team", async ({ page }) => {
  const email = uniqueEmail("contact");
  await page.goto("/fr/contact");
  await page.getByRole("textbox", { name: "Votre nom" }).fill("Test Contact");
  await page.getByRole("textbox", { name: "Votre e-mail" }).fill(email);
  await page
    .getByRole("textbox", { name: "Votre message" })
    .fill("Bonjour, une question sur la subvention.");
  await page.getByRole("button", { name: "Envoyer le message" }).click();
  await expect(page.getByRole("status")).toContainText("Merci");
  const mail = await latestEmail(page.request, "team@example.com", "contact");
  expect(mail.text).toContain("une question sur la subvention");
});

test("legal pages are clearly marked as drafts", async ({ page }) => {
  for (const path of ["/en/privacy", "/fr/conditions", "/en/cookies"]) {
    await page.goto(path);
    await expect(page.getByText(/Draft:|Projet :/)).toBeVisible();
  }
});
