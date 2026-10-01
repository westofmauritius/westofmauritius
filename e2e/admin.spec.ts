import { expect, test } from "@playwright/test";
import { uniqueIp } from "./helpers";

test("admin is protected, lists leads and exports CSV", async ({
  page,
  request,
}) => {
  // A lead to look for.
  const name = `Admin Test ${Date.now()}`;
  await request.post("/api/leads", {
    data: {
      locale: "en",
      name,
      email: "admin-test@example.com",
      country: "GB",
      budget: "over-1m",
      timeframe: "within-6-months",
      areas: ["le-morne"],
      consent: "on",
      startedAt: String(Date.now() - 60_000),
    },
    headers: { "X-Forwarded-For": uniqueIp() },
  });

  // Not logged in: sent to the log-in page; the export is not found.
  await page.goto("/admin/leads");
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect((await request.get("/api/admin/export/leads")).status()).toBe(404);

  await page.getByLabel("Password").fill("wrong");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(
    page.getByText("Wrong password. Please try again."),
  ).toBeVisible();

  await page.getByLabel("Password").fill("e2e-test-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/admin\/leads$/);
  await expect(page.getByText(name)).toBeVisible();

  await page.getByLabel("Budget").selectOption("over-1m");
  await page.getByRole("button", { name: "Filter" }).click();
  await expect(page).toHaveURL(/budget=over-1m/);
  await expect(page.getByText(name)).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Export CSV" }).click();
  const file = await (await download).path();
  const { readFileSync } = await import("node:fs");
  expect(readFileSync(file, "utf8")).toContain(name);

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
});
