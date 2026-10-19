// Development helper: node scripts/screenshot.mjs <url> <out.png> [width]
import { chromium } from "@playwright/test";
const [, , url, out, width = "390"] = process.argv;
const browser = await chromium
  .launch({ executablePath: "/opt/pw-browsers/chromium" })
  .catch(() => chromium.launch());
const page = await browser.newPage({
  viewport: { width: Number(width), height: 844 },
});
await page.goto(url, { waitUntil: "networkidle" });
await page.screenshot({ path: out, fullPage: true });
await browser.close();
