import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests in a real browser against a production build in demo
 * mode: the in-memory store with demo data, e-mails in the development
 * outbox (the tests read magic links from it). Run `npm run build` with
 * SOLEY_DEMO_MODE=true first, or let CI do it.
 */
const port = 3200;
const systemChromium = "/opt/pw-browsers/chromium";

export default defineConfig({
  testDir: "e2e",
  // Tests share one in-memory server; flows create their own data.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
    launchOptions: existsSync(systemChromium)
      ? { executablePath: systemChromium }
      : {},
  },
  projects: [
    // Most visitors use a phone, so the flows run on a phone-sized screen.
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /a11y|seo/,
    },
  ],
  webServer: {
    command: `npx next start -p ${port}`,
    port,
    reuseExistingServer: !process.env.CI,
    env: {
      SOLEY_DEMO_MODE: "true",
      NEXT_PUBLIC_SITE_URL: `http://localhost:${port}`,
      ADMIN_NOTIFICATION_EMAIL: "team@example.com",
    },
  },
});
