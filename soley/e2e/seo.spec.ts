import { expect, test } from "@playwright/test";

const jsonLdTypes = async (page: import("@playwright/test").Page) =>
  (
    await page.locator('script[type="application/ld+json"]').allTextContents()
  ).map((text) => (JSON.parse(text) as { "@type": string })["@type"]);

test("pages link their translations with hreflang and translated addresses", async ({
  page,
}) => {
  await page.goto("/en/guides/battery-or-not");
  await expect(
    page.locator('link[rel="alternate"][hreflang="fr"]'),
  ).toHaveAttribute("href", /\/fr\/guides\/batterie-ou-pas$/);
  await expect(
    page.locator('link[rel="alternate"][hreflang="x-default"]'),
  ).toHaveAttribute("href", /\/en\/guides\/battery-or-not$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/en\/guides\/battery-or-not$/,
  );

  // The language switcher follows the hreflang link to the French slug.
  await page
    .getByRole("link", { name: /Français|FR/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/fr\/guides\/batterie-ou-pas$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});

test("structured data on the key pages", async ({ page }) => {
  await page.goto("/en");
  expect(await jsonLdTypes(page)).toEqual(
    expect.arrayContaining(["Organization", "FAQPage"]),
  );
  await page.goto("/fr/guide-subvention");
  expect(await jsonLdTypes(page)).toContain("HowTo");
  await page.goto("/en/guides/how-to-read-a-solar-quote");
  expect(await jsonLdTypes(page)).toContain("Article");
});

test("every page has a title, a description and an Open Graph image", async ({
  page,
  request,
}) => {
  for (const path of [
    "/en",
    "/fr/calculateur",
    "/en/grant-guide",
    "/fr/installateurs",
    "/en/for-installers",
  ]) {
    await page.goto(path);
    await expect(page).toHaveTitle(/Soley/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.{50,}/,
    );
    const image = await page
      .locator('meta[property="og:image"]')
      .first()
      .getAttribute("content");
    expect(image).toBeTruthy();
  }
  const og = await request.get("/fr/opengraph-image");
  expect(og.headers()["content-type"]).toContain("image/png");
});

test("sitemap lists both languages and no private pages", async ({
  request,
}) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("/fr/calculateur");
  expect(xml).toContain("/en/guides/grid-connection-ceb");
  expect(xml).toContain('hreflang="fr"');
  expect(xml).not.toMatch(/\/(admin|portal|account|mon-compte)/);
  // Demo installers never appear.
  expect(xml).not.toContain("demo-");
});

test("the start page redirects to the browser's language", async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: "fr-FR" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page).toHaveURL(/\/fr$/);
  await context.close();
});
