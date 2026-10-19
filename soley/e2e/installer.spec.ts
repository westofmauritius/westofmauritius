import { expect, test } from "@playwright/test";
import {
  DEMO,
  latestEmail,
  requestQuotes,
  signIn,
  uniqueEmail,
} from "./helpers";

test("an installer can apply and sees the review notice", async ({ page }) => {
  const email = uniqueEmail("applicant");
  await page.goto("/en/for-installers");
  await page
    .getByRole("link", { name: "Apply to become a partner" })
    .first()
    .click();
  await page
    .getByRole("textbox", { name: "Company name" })
    .fill("E2E Test Solar Ltd");
  await page
    .getByRole("textbox", { name: "Years installing solar systems" })
    .fill("5");
  await page
    .getByRole("textbox", { name: "Business address" })
    .fill("Royal Road, Moka");
  await page
    .getByRole("textbox", { name: "Name", exact: true })
    .fill("Test Person");
  await page.getByRole("textbox", { name: "E-mail" }).fill(email);
  await page.getByRole("textbox", { name: "Phone" }).fill("+230 5123 4567");
  await page.getByRole("checkbox", { name: "Moka" }).check();
  await page.getByRole("checkbox", { name: "Flacq" }).check();
  await page.getByLabel("Business registration certificate").setInputFiles({
    name: "brn.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 test"),
  });

  // Forgetting the terms shows an error and keeps what was typed.
  await page.getByRole("button", { name: "Send application" }).click();
  await expect(page.getByRole("alert").first()).toContainText(
    "Please check 1 field",
  );
  await expect(page.getByRole("textbox", { name: "Company name" })).toHaveValue(
    "E2E Test Solar Ltd",
  );

  await page.getByRole("checkbox", { name: /partner terms/ }).check();
  await page.getByLabel("Business registration certificate").setInputFiles({
    name: "brn.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 test"),
  });
  await page.getByRole("button", { name: "Send application" }).click();
  await page.waitForURL(/for-installers\/thank-you/);
  await latestEmail(page.request, email, "application-received");
  await latestEmail(page.request, "team@example.com", "admin-new-application");

  await signIn(page, email);
  await expect(page).toHaveURL(/\/en\/portal/);
  await expect(
    page.getByText("Your application is being reviewed"),
  ).toBeVisible();
});

test("an installer accepts a request and sends a quote", async ({
  page,
  browser,
}) => {
  // A household in Pamplemousses: only the demo installers covering it get the request.
  const household = uniqueEmail("household");
  const householdPage = await browser.newPage();
  const reference = await requestQuotes(householdPage, {
    email: household,
    region: "pamplemousses",
  });
  await householdPage.close();

  await signIn(page, DEMO.installerNorth);
  await expect(page).toHaveURL(/\/en\/portal/);
  const card = page.getByRole("listitem").filter({ hasText: reference });
  await card.getByRole("link", { name: /Open/ }).click();
  await expect(
    page.getByRole("heading", { name: `Request ${reference}` }),
  ).toBeVisible();
  // Contact details stay hidden until the request is accepted.
  await expect(page.getByText(household)).toHaveCount(0);
  await page.getByRole("button", { name: "Accept the request" }).click();
  await expect(page.getByRole("link", { name: household })).toBeVisible();

  await page.getByRole("textbox", { name: /Total price/ }).fill("210000");
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

  await latestEmail(page.request, household, "new-quote");
});
