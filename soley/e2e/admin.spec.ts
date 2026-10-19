import { expect, test } from "@playwright/test";
import {
  DEMO,
  latestEmail,
  requestQuotes,
  signIn,
  uniqueEmail,
} from "./helpers";

test("non-admins cannot open the admin panel", async ({ page }) => {
  await page.goto("/en/admin");
  await expect(page).toHaveURL(/\/en\/sign-in\?next=/);
  await signIn(page, DEMO.household);
  await page.goto("/en/admin");
  await expect(page.getByRole("heading", { name: "No access" })).toBeVisible();
});

test("admin vets and approves an installer", async ({ page }) => {
  await signIn(page, DEMO.admin);
  await expect(page).toHaveURL(/\/en\/admin/);
  await expect(
    page.getByRole("link", { name: /installer application/ }),
  ).toBeVisible();

  await page.goto("/en/admin/installers");
  await page.getByRole("link", { name: "Demo New Applicant Ltd" }).click();

  // Approval is refused until the checklist is complete.
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Tick every item" }),
  ).toBeVisible();

  for (const item of [
    "Business registration checked (BRN)",
    "Valid insurance seen",
    "Certificates checked",
    "Two customer references called",
    "Company visited in person",
    "Knows the CEB registration process",
  ]) {
    await page.getByRole("checkbox", { name: item }).check();
  }
  await page.getByRole("textbox", { name: "Visited by" }).fill("E2E admin");
  await page.getByRole("button", { name: "Save checklist" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Saved" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Approve" }).click();
  await expect(
    page.getByText("Approved", { exact: true }).first(),
  ).toBeVisible();
  await latestEmail(
    page.request,
    "installer.applicant@example.com",
    "installer-approved",
  );
});

test("admin routes a request by hand, invoices and exports", async ({
  page,
  browser,
}) => {
  // Rodrigues is covered by one demo installer only, so two places stay free.
  const household = uniqueEmail("routing");
  const other = await browser.newPage();
  const reference = await requestQuotes(other, {
    email: household,
    region: "rodrigues",
  });
  await other.close();

  await signIn(page, DEMO.admin);
  await page.goto("/en/admin/requests");
  await page.getByRole("link", { name: reference }).click();
  await expect(page.getByRole("heading", { name: reference })).toBeVisible();
  await page
    .getByRole("combobox", { name: "Installer" })
    .selectOption({ label: "Demo Lagon Énergie Ltée" });
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Demo Lagon Énergie Ltée" }),
  ).toBeVisible();

  await page
    .getByRole("textbox", { name: "Add note" })
    .fill("Called the household, all fine.");
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByText("Called the household, all fine.")).toBeVisible();

  // Demo leads accepted in earlier months are billable.
  await page.goto("/en/admin/invoices");
  const row = page
    .getByRole("row")
    .filter({ hasText: "Demo Nord Solaire Ltd" })
    .first();
  await row.getByRole("button", { name: "Create invoice" }).click();
  await expect(row.getByText(/SOL-\d{4}-\d{2}-\d{4}/)).toBeVisible();

  const csv = await page.request.get("/api/admin/invoices");
  expect(csv.headers()["content-type"]).toContain("text/csv");
  expect(await csv.text()).toContain("Demo Nord Solaire Ltd");
});

test("admin changes a calculator value without a new deployment", async ({
  page,
}) => {
  await signIn(page, DEMO.admin);
  await page.goto("/en/admin/settings");
  await page
    .getByRole("textbox", { name: "Electricity price (Rs per kWh)" })
    .fill("10");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Settings saved" }),
  ).toBeVisible();
  await page.goto("/en/calculator");
  await expect(
    page.getByText("Electricity price: Rs 10 per kWh"),
  ).toBeVisible();
  // Put it back for the other tests.
  await page.goto("/en/admin/settings");
  await page
    .getByRole("textbox", { name: "Electricity price (Rs per kWh)" })
    .fill("9");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Settings saved" }),
  ).toBeVisible();
});
