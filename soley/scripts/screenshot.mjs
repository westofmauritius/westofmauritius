// Development helper: full-page screenshots of the running app.
//   node scripts/screenshot.mjs <url> <out.png> [width]
// With SIGN_IN=email (demo mode only), signs in through the development
// outbox first.
import { chromium } from "@playwright/test";

const [, , url, out, width = "390"] = process.argv;
const browser = await chromium
  .launch({ executablePath: "/opt/pw-browsers/chromium" })
  .catch(() => chromium.launch());
const page = await browser.newPage({
  viewport: { width: Number(width), height: 844 },
});
const origin = new URL(url).origin;

if (process.env.SIGN_IN) {
  const email = process.env.SIGN_IN;
  await page.goto(`${origin}/en/sign-in`);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/check-email/);
  const mails = await (
    await fetch(`${origin}/api/dev/outbox?to=${encodeURIComponent(email)}`)
  ).json();
  const link = mails
    .find((m) => m.tag === "magic-link")
    .text.match(/https?:\/\/\S+auth\/callback\S+/)[0];
  await page.goto(link);
}

await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(500);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
