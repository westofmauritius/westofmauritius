import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const DEMO = {
  admin: "admin@example.com",
  household: "household@example.com",
  installerNorth: "installer.north@example.com",
} as const;

type OutboxEmail = { to: string; subject: string; text: string; tag: string };

/** The newest e-mail of a kind sent to an address (development outbox). */
export async function latestEmail(
  request: APIRequestContext,
  to: string,
  tag: string,
): Promise<OutboxEmail> {
  let found: OutboxEmail | undefined;
  await expect
    .poll(async () => {
      const response = await request.get(
        `/api/dev/outbox?to=${encodeURIComponent(to)}`,
      );
      const emails = (await response.json()) as OutboxEmail[];
      found = emails.find((e) => e.tag === tag);
      return Boolean(found);
    })
    .toBe(true);
  return found!;
}

/** Signs in with a magic link read from the outbox. */
export async function signIn(
  page: Page,
  email: string,
  locale: "en" | "fr" = "en",
) {
  await page.goto(locale === "en" ? "/en/sign-in" : "/fr/connexion");
  await page
    .getByRole("textbox", {
      name: locale === "en" ? "E-mail address" : "Adresse e-mail",
    })
    .fill(email);
  const sentAt = Date.now();
  await page
    .getByRole("button", {
      name:
        locale === "en"
          ? "Send me a sign-in link"
          : "M’envoyer un lien de connexion",
    })
    .click();
  await page.waitForURL(/check-email|verifiez-vos-emails/);
  let link = "";
  await expect
    .poll(async () => {
      const response = await page.request.get(
        `/api/dev/outbox?to=${encodeURIComponent(email)}`,
      );
      const emails = (await response.json()) as (OutboxEmail & {
        sentAt: string;
      })[];
      const mail = emails.find(
        (e) => e.tag === "magic-link" && Date.parse(e.sentAt) >= sentAt - 1000,
      );
      link = mail?.text.match(/https?:\/\/\S+auth\/callback\S+/)?.[0] ?? "";
      return link;
    })
    .not.toBe("");
  await page.goto(link);
}

/** Fills and sends the quote form; returns the request reference. */
export async function requestQuotes(
  page: Page,
  {
    email,
    region = "moka",
    name = "Test Household",
  }: { email: string; region?: string; name?: string },
) {
  await page.goto(`/en/get-quotes?bill=4000&region=${region}`);
  await page.getByRole("radio", { name: "House" }).check();
  await page.getByRole("radio", { name: "I own it" }).check();
  await page.getByRole("radio", { name: "Flat concrete roof" }).check();
  await page.getByRole("radio", { name: "No shade" }).check();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(
    page.getByRole("heading", { name: "Electricity" }),
  ).toBeVisible();
  await page.getByRole("radio", { name: "Not sure, advise me" }).check();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: "District" })).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Within 3 months" }).check();
  await page.getByRole("radio", { name: "From savings" }).check();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("textbox", { name: "Your name" }).fill(name);
  await page.getByRole("textbox", { name: "E-mail" }).fill(email);
  await page.getByRole("textbox", { name: "Phone" }).fill("+230 5123 4567");
  await page.getByRole("radio", { name: "WhatsApp" }).check();
  await page.getByRole("checkbox", { name: /I agree that Soley/ }).check();
  await page.getByRole("button", { name: "Send my request" }).click();
  await page.waitForURL(/thank-you/);
  const text = await page.getByTestId("reference").innerText();
  return text.match(/SOL-[0-9A-Z]{5}/)![0];
}

/** A unique e-mail address per test run. */
export const uniqueEmail = (prefix: string) =>
  `${prefix}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`;
