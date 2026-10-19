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

const formLabels = {
  en: {
    path: "/en/get-quotes",
    house: "House",
    owner: "I own it",
    roof: "Flat concrete roof",
    shade: "No shade",
    next: "Next",
    electricity: "Electricity",
    battery: "Not sure, advise me",
    district: "District",
    timeline: "Within 3 months",
    financing: "From savings",
    name: "Your name",
    email: "E-mail",
    phone: "Phone",
    whatsapp: "WhatsApp",
    consent: /I agree that Soley/,
    send: "Send my request",
    thanks: /thank-you/,
  },
  fr: {
    path: "/fr/obtenir-des-devis",
    house: "Maison",
    owner: "Je suis propriétaire",
    roof: "Toit plat en béton",
    shade: "Pas d’ombre",
    next: "Suivant",
    electricity: "Électricité",
    battery: "Je ne sais pas, conseillez-moi",
    district: "District",
    timeline: "D’ici 3 mois",
    financing: "Avec mon épargne",
    name: "Votre nom",
    email: "E-mail",
    phone: "Téléphone",
    whatsapp: "WhatsApp",
    consent: /J’accepte que Soley/,
    send: "Envoyer ma demande",
    thanks: /merci/,
  },
} as const;

/** Fills and sends the quote form; returns the request reference. */
export async function requestQuotes(
  page: Page,
  {
    email,
    region = "moka",
    name = "Test Household",
    locale = "en",
  }: { email: string; region?: string; name?: string; locale?: "en" | "fr" },
) {
  const l = formLabels[locale];
  await page.goto(`${l.path}?bill=4000&region=${region}`);
  await page.getByRole("radio", { name: l.house }).check();
  await page.getByRole("radio", { name: l.owner }).check();
  await page.getByRole("radio", { name: l.roof }).check();
  await page.getByRole("radio", { name: l.shade }).check();
  await page.getByRole("button", { name: l.next }).click();
  await expect(
    page.getByRole("heading", { name: l.electricity }),
  ).toBeVisible();
  await page.getByRole("radio", { name: l.battery }).check();
  await page.getByRole("button", { name: l.next }).click();
  await expect(page.getByRole("heading", { name: l.district })).toBeVisible();
  await page.getByRole("button", { name: l.next }).click();
  await page.getByRole("radio", { name: l.timeline }).check();
  await page.getByRole("radio", { name: l.financing }).check();
  await page.getByRole("button", { name: l.next }).click();
  await page.getByRole("textbox", { name: l.name }).fill(name);
  await page.getByRole("textbox", { name: l.email }).fill(email);
  await page.getByRole("textbox", { name: l.phone }).fill("+230 5123 4567");
  await page.getByRole("radio", { name: l.whatsapp }).check();
  await page.getByRole("checkbox", { name: l.consent }).check();
  await page.getByRole("button", { name: l.send }).click();
  await page.waitForURL(l.thanks);
  const text = await page.getByTestId("reference").innerText();
  return text.match(/SOL-[0-9A-Z]{5}/)![0];
}

/** Installers who were offered a request, read from the new-lead e-mails. */
export async function offeredInstallers(
  request: APIRequestContext,
  count: number,
) {
  let emails: string[] = [];
  await expect
    .poll(async () => {
      const all = (await (
        await request.get("/api/dev/outbox")
      ).json()) as (OutboxEmail & {
        sentAt: string;
      })[];
      emails = all
        .filter((e) => e.tag === "new-lead")
        .slice(0, count)
        .map((e) => e.to);
      return emails.length;
    })
    .toBe(count);
  return emails;
}

/** An installer accepts the request and sends a quote at the given price. */
export async function acceptAndQuote(
  page: Page,
  installerEmail: string,
  reference: string,
  price: number,
) {
  await signIn(page, installerEmail);
  await page.goto("/en/portal");
  await page
    .getByRole("listitem")
    .filter({ hasText: reference })
    .getByRole("link", { name: /Open/ })
    .click();
  await page.getByRole("button", { name: "Accept the request" }).click();
  await expect(page.getByRole("button", { name: "Send quote" })).toBeVisible();
  await page.getByRole("textbox", { name: /Total price/ }).fill(String(price));
  await page.getByRole("textbox", { name: "System size (kWp)" }).fill("3.5");
  await page.getByRole("textbox", { name: /Expected production/ }).fill("4800");
  await page.getByRole("textbox", { name: "Panel brand" }).fill("Test Panels");
  await page.getByRole("textbox", { name: "Number of panels" }).fill("8");
  await page
    .getByRole("textbox", { name: "Inverter brand" })
    .fill("Test Inverter");
  await page
    .getByRole("textbox", { name: "Panel warranty (years)" })
    .fill("25");
  await page
    .getByRole("textbox", { name: "Inverter warranty (years)" })
    .fill("10");
  await page
    .getByRole("textbox", { name: "Workmanship warranty (years)" })
    .fill("5");
  await page
    .getByRole("textbox", { name: /Weeks until installation/ })
    .fill("3");
  await page.getByRole("textbox", { name: "Days on site" }).fill("2");
  await page.getByRole("button", { name: "Send quote" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Quote saved" }),
  ).toBeVisible();
  await page.context().clearCookies();
}

/** A unique e-mail address per test run. */
export const uniqueEmail = (prefix: string) =>
  `${prefix}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`;
