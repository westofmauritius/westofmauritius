/**
 * Draws the social sharing (Open Graph) image of every page at build time,
 * into public/og/<locale>/…png. Runs in `prebuild`, after the content check.
 *
 * Done here rather than with Next.js's opengraph-image routes because those
 * put an image engine of ~800 kB into the Cloudflare Worker, for images that
 * never change between builds. Unchanged images are skipped.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createReader } from "@keystatic/core/reader";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import keystaticConfig from "../keystatic.config";
import en from "../messages/en.json";
import fr from "../messages/fr.json";
import {
  guideCategories,
  guideCategoryKeys,
} from "../src/lib/guide-categories";
import { OgTemplate, type OgTone } from "./og-template";

const config =
  (keystaticConfig as unknown as { default?: typeof keystaticConfig })
    .default ?? keystaticConfig;
const reader = createReader(process.cwd(), config);

const locales = ["en", "fr"] as const;
type Locale = (typeof locales)[number];
const messages = { en, fr } as const;
const brand: Record<Locale, string> = {
  en: "West Mauritius",
  fr: "Ouest Maurice",
};

// Same rule as src/lib/typography.ts: narrow no-break space before French : ; ? !
const typeset = (text: string, locale: Locale) =>
  locale === "fr" ? text.replace(/ ([:;?!»])/g, " $1") : text;

const fonts = [
  {
    name: "Garamond",
    data: readFileSync("src/assets/fonts/EBGaramond-Medium.ttf"),
    weight: 500 as const,
  },
  {
    name: "Inter",
    data: readFileSync("src/assets/fonts/Inter-Medium.ttf"),
    weight: 500 as const,
  },
];

type Job = { path: string; title: string; eyebrow?: string; tone?: OgTone };

const outDir = join("public", "og");
const cacheFile = join(outDir, ".cache.json");
const cache: Record<string, string> = existsSync(cacheFile)
  ? JSON.parse(readFileSync(cacheFile, "utf8"))
  : {};
// Bump when the template changes, so every image is redrawn.
const TEMPLATE_VERSION = "1";

async function render(job: Job, locale: Locale) {
  const props = {
    title: typeset(job.title, locale),
    eyebrow: job.eyebrow,
    brand: brand[locale],
    tone: job.tone,
  };
  const key = createHash("sha1")
    .update(TEMPLATE_VERSION + JSON.stringify(props))
    .digest("hex");
  const file = join(outDir, locale, `${job.path}.png`);
  if (cache[file] === key && existsSync(file)) return false;
  const svg = await satori(<OgTemplate {...props} />, {
    width: 1200,
    height: 630,
    fonts,
  });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } })
    .render()
    .asPng();
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, png);
  cache[file] = key;
  return true;
}

async function main() {
  const [areas, places, guides, living] = await Promise.all([
    reader.collections.areas.all(),
    reader.collections.places.all(),
    reader.collections.guides.all(),
    reader.collections.living.all(),
  ]);
  let drawn = 0;
  let total = 0;

  for (const locale of locales) {
    const t = messages[locale];
    const areaName = (slug: string) =>
      areas.find((a) => a.slug === slug)?.entry.content[locale].name ?? slug;
    const jobs: Job[] = [
      { path: "default", title: t.Home.title, eyebrow: t.Home.eyebrow },
      ...areas.map(({ slug, entry }) => ({
        path: `areas/${slug}`,
        title: entry.content[locale].name,
        eyebrow: t.Pages.areas.title,
        tone: entry.placeholderTone,
      })),
      ...places.map(({ slug, entry }) => ({
        path: `places/${slug}`,
        title: entry.content[locale].name || entry.name,
        eyebrow: `${t.Categories[entry.category].one} · ${areaName(entry.area)}`,
        tone: entry.placeholderTone,
      })),
      ...guideCategoryKeys.map((key) => ({
        path: `guides/${key}`,
        title: t.GuideCategories[key].title,
        eyebrow: t.Pages.guides.title,
        tone: guideCategories[key].tone,
      })),
      ...guides.map(({ slug, entry }) => ({
        path: `guides/${entry.category}/${slug}`,
        title: entry.content[locale].title,
        eyebrow: t.GuideCategories[entry.category].title,
        tone: entry.placeholderTone,
      })),
      ...living.map(({ slug, entry }) => ({
        path: `living/${slug}`,
        title: entry.content[locale].title,
        eyebrow: t.LivePage.eyebrow,
        tone: "ocean" as const,
      })),
    ];
    for (const job of jobs) {
      total++;
      if (await render(job, locale)) drawn++;
    }
  }

  writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
  console.log(`Sharing images: ${drawn} drawn, ${total - drawn} up to date.`);
}

main().catch((error: unknown) => {
  console.error("Could not draw the sharing images:", error);
  process.exit(1);
});
