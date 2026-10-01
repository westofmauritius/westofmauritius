import { expect, test } from "@playwright/test";
import { uniqueIp, waitLikeAHuman } from "./helpers";

test.beforeEach(async ({ context }) => {
  await context.setExtraHTTPHeaders({ "X-Forwarded-For": uniqueIp() });
});

test("lead form: shows errors, pre-selects the area, then sends", async ({
  page,
}) => {
  await page.goto("/fr/vivre-dans-l-ouest/demande?area=tamarin&source=e2e");
  await expect(page.getByRole("checkbox", { name: "Tamarin" })).toBeChecked();

  await page.getByRole("button", { name: "Envoyer ma demande" }).click();
  const summary = page.getByRole("alert").first();
  await expect(summary).toBeFocused();
  await expect(summary).toContainText("Nom complet");
  await expect(page.getByLabel(/Nom complet/)).toHaveAttribute(
    "aria-invalid",
    "true",
  );

  await waitLikeAHuman(page);
  await page.getByLabel(/Nom complet/).fill("Marie Test");
  await page.getByLabel(/^Email/).fill("marie@example.com");
  await page.getByLabel(/Pays de résidence/).selectOption("FR");
  await page.getByRole("radio", { name: "300 000 € à 600 000 €" }).check();
  await page.getByRole("radio", { name: "Dans 1 à 2 ans" }).check();
  await page.locator("#lead-consent").check();
  await page.getByRole("button", { name: "Envoyer ma demande" }).click();

  await expect(page.getByRole("heading", { name: /Merci/ })).toBeFocused();
});

test("contact form sends a message", async ({ page }) => {
  await page.goto("/en/contact");
  await waitLikeAHuman(page);
  // Scoped to the page content: the footer has its own e-mail field (newsletter).
  const main = page.getByRole("main");
  await main.getByLabel(/^Name/).fill("Sam Test");
  await main.getByLabel(/^Email/).fill("sam@example.com");
  await main.getByLabel(/^Subject/).selectOption("feedback");
  await main.getByLabel(/^Message/).fill("Lovely site.");
  await main.getByRole("button", { name: "Send message" }).click();
  await expect(
    main.getByRole("heading", { name: "Thank you for your message" }),
  ).toBeVisible();
});

test("newsletter sign-up asks for consent, then confirms by e-mail", async ({
  page,
}) => {
  await page.goto("/en/areas");
  const footer = page.getByRole("contentinfo");
  await waitLikeAHuman(page);
  await footer.getByLabel(/Email address/).fill("reader@example.com");
  await footer.getByRole("button", { name: "Subscribe" }).click();
  await expect(
    footer.getByText("Please tick this box to continue."),
  ).toBeVisible();
  await footer.getByRole("checkbox").check();
  await footer.getByRole("button", { name: "Subscribe" }).click();
  await expect(footer.getByText("Almost there")).toBeVisible();
});

test("without JavaScript, a form post lands on the thank-you page", async ({
  request,
}) => {
  const response = await request.post("/api/leads", {
    form: {
      locale: "fr",
      name: "Jean",
      email: "jean@example.com",
      country: "MU",
      budget: "unsure",
      timeframe: "just-curious",
      consent: "on",
    },
    headers: { "X-Forwarded-For": uniqueIp() },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(303);
  expect(response.headers().location).toContain("/fr/merci?form=lead");
});

test("bots filling the honeypot are not saved but get no hint", async ({
  request,
}) => {
  const response = await request.post("/api/contact", {
    data: {
      website: "spam",
      name: "x",
      email: "x@example.com",
      topic: "general",
      message: "buy",
    },
    headers: { "X-Forwarded-For": uniqueIp(), Accept: "application/json" },
  });
  expect(await response.json()).toEqual({ ok: true, status: "ok" });
});

test("the form API rejects invalid data", async ({ request }) => {
  const response = await request.post("/api/leads", {
    data: { email: "nope", startedAt: String(Date.now() - 60_000) },
    headers: { "X-Forwarded-For": uniqueIp() },
  });
  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.errors).toMatchObject({ email: "email", consent: "consent" });
});
