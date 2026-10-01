import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests in a real browser against a production build
 * (`npm run test:e2e` builds first). Forms use the in-memory store, and
 * admin uses throw-away test credentials.
 */
const port = 3200;

// Use the system's Chromium when there is one (e.g. in CI images); otherwise
// Playwright's own download (`npx playwright install chromium`).
const systemChromium = "/opt/pw-browsers/chromium";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
    launchOptions: existsSync(systemChromium)
      ? { executablePath: systemChromium }
      : {},
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /mobile\.spec\.ts/,
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: /mobile\.spec\.ts/,
    },
  ],
  webServer: {
    command: `npx next start -p ${port}`,
    port,
    reuseExistingServer: !process.env.CI,
    env: {
      ALLOW_MEMORY_STORE: "1",
      ADMIN_PASSWORD: "e2e-test-password",
      ADMIN_SESSION_SECRET: "e2e-session-secret-0123456789abcdef",
    },
  },
});
