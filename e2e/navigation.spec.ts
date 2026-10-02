import { expect, test } from "@playwright/test";

test("the start page leads to an area and on to a place", async ({ page }) => {
  await page.goto("/en");
  await expect(page).toHaveTitle(/West of Mauritius/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Areas" })
    .click();
  await expect(page).toHaveURL(/\/en\/areas$/);
  await expect(
    page.getByRole("link", { name: "Areas", exact: true }).first(),
  ).toHaveAttribute("aria-current", "page");

  await page.getByRole("link", { name: "Tamarin" }).first().click();
  await expect(page).toHaveURL(/\/en\/areas\/tamarin$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Tamarin" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Tamarin Bay" }).first().click();
  await expect(page).toHaveURL(/\/en\/places\/tamarin-bay$/);
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(crumbs.getByRole("link", { name: "Tamarin" })).toBeVisible();
});

test("unknown pages show the translated 404", async ({ page }) => {
  const response = await page.goto("/fr/nexiste-pas");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Page introuvable" }),
  ).toBeVisible();
});

test("the skip link moves focus to the content", async ({ page }) => {
  await page.goto("/en/guides");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("structured data and hreflang are present", async ({ page }) => {
  await page.goto("/fr/guides/plages");
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", /\/en\/guides\/beaches$/);
  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  expect(jsonLd.join()).toContain("BreadcrumbList");
});

test("places describe themselves to search engines", async ({ page }) => {
  await page.goto("/en/places/le-morne-brabant");
  const jsonLd = (
    await page.locator('script[type="application/ld+json"]').allTextContents()
  ).join();
  expect(jsonLd).toContain('"@type":"Mountain"');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /\/og\/en\/places\/le-morne-brabant\.jpg$/,
  );
});

test("the practical guide is one click from every page", async ({ page }) => {
  await page.goto("/fr");
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Préparer son voyage" })
    .click();
  await expect(page).toHaveURL(/\/fr\/guides\/preparer-son-voyage$/);
  await page
    .getByRole("link", { name: /Préparer un séjour/ })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { level: 2, name: "Quand venir" }),
  ).toBeVisible();
});

test("the guides have an RSS feed per language", async ({ request }) => {
  const response = await request.get("/fr/feed.xml");
  expect(response.headers()["content-type"]).toContain("application/rss+xml");
  const xml = await response.text();
  expect(xml).toContain("<language>fr</language>");
  expect(xml).toContain("/fr/guides/plages/plages-de-la-cote-ouest");
  // Placeholder guides are not announced.
  expect(xml).not.toContain("exemple");
});

test("no dashes or hyphens in the visible text", async ({ page }) => {
  // The owner wants none: they read as machine-written. Spot-check a few
  // text-heavy pages in both languages (URLs and code are not text).
  for (const url of [
    "/en",
    "/fr",
    "/en/areas/le-morne",
    "/fr/guides/preparer-son-voyage/preparer-un-sejour-cote-ouest",
    "/en/places/martello-tower-la-preneuse",
    "/fr/vivre-dans-l-ouest/demande",
    "/en/areas/chamarel",
    "/en/living-in-the-west/tamarin-vs-grand-baie",
    "/en/community",
  ]) {
    await page.goto(url);
    const text = await page.locator("body").innerText();
    // Also "95-metre": a hyphen between letters or digits.
    expect(text, url).not.toMatch(/[‒-―]|[\p{L}\d]-[\p{L}\d]/u);
  }
});

test("photo credits live on their own page, not on the photos", async ({
  page,
}) => {
  await page.goto("/en/places/chamarel-falls");
  await expect(page.getByText(/Wikimedia Commons/)).toHaveCount(0);
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Photo credits" })
    .click();
  await expect(page).toHaveURL(/\/en\/credits$/);
  await expect(page.getByText(/Licence: CC/).first()).toBeVisible();
});

test("guides name their author, dates and sources", async ({ page }) => {
  await page.goto("/en/guides/activities/hiking-in-the-west");
  const byline = page.getByRole("link", { name: "Oliver" }).first();
  await expect(byline).toHaveAttribute("href", "/en/about/oliver");
  await expect(page.getByText(/Last updated \d+ \w+ 20\d\d/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sources" })).toBeVisible();
  const jsonLd = (
    await page.locator('script[type="application/ld+json"]').allTextContents()
  ).join();
  expect(jsonLd).toContain('"@type":"Person"');
  expect(jsonLd).toContain("/#author");

  await byline.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Oliver");
});

test("area pages answer living questions and lead to a shortlist", async ({
  page,
}) => {
  await page.goto("/en/areas/tamarin");
  const living = page.locator("#living");
  await expect(
    living.getByRole("heading", { name: "Living in Tamarin", exact: true }),
  ).toBeVisible();
  // FAQ accordion opens with the keyboard.
  const question = living.getByText("Is Tamarin a good place to live?");
  await question.focus();
  await page.keyboard.press("Enter");
  await expect(living.locator("details").first()).toHaveAttribute("open", "");
  // The shortlist link carries the area and where it was clicked.
  await expect(
    living.getByRole("link", { name: "Get my free shortlist" }),
  ).toHaveAttribute("href", /area=tamarin.*source=area-living-tamarin/);
  // Placeholder answers never become FAQ data for search engines.
  const jsonLd = (
    await page.locator('script[type="application/ld+json"]').allTextContents()
  ).join();
  expect(jsonLd).not.toContain("FAQPage");
});

test("the Living in the West hub links every question, comparison and area", async ({
  page,
}) => {
  await page.goto("/en/living-in-the-west");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Living in the West",
  );
  await expect(
    page.getByRole("link", { name: /Tamarin vs Grand Baie/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Living in Tamarin" }),
  ).toHaveAttribute("href", "/en/areas/tamarin#living");

  // Question pages answer first, then detail, a table and sources.
  await page.goto("/en/living-in-the-west/cost-of-living-in-tamarin");
  await expect(page.getByText("The short answer")).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});

test("old Live in the West addresses redirect permanently", async ({
  request,
}) => {
  const response = await request.get("/en/live-in-the-west/buying-in-tamarin", {
    maxRedirects: 0,
  });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe(
    "/en/living-in-the-west/buying-property-in-tamarin",
  );
});

test("area pages show tonight's sunset time", async ({ page }) => {
  await page.goto("/en/areas/tamarin");
  await expect(
    page.getByText(/Sunset (tonight|tomorrow) in Tamarin: \d\d:\d\d/),
  ).toBeVisible();
});

test("the village quiz recommends an area and leads to a shortlist", async ({
  page,
}) => {
  await page.goto("/en/living-in-the-west/find-your-area");
  await page.getByRole("button", { name: "Show my village" }).click();
  await expect(
    page.getByText("Please answer all three questions."),
  ).toBeVisible();
  await page.getByLabel("I prefer the hills and cooler air").check();
  await page.getByLabel("Quiet, close to nature").check();
  await page.getByLabel("A hike in the national park").check();
  await page.getByRole("button", { name: "Show my village" }).click();
  await expect(
    page.getByRole("heading", { level: 2, name: "Chamarel" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Get my free shortlist for Chamarel/ }),
  ).toHaveAttribute("href", /area=chamarel.*source=quiz/);
});
