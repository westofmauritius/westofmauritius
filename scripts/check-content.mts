/**
 * Content check — runs automatically before every build (`prebuild` in
 * package.json), locally and on Cloudflare.
 *
 * Keystatic already validates each field when you save. This script checks
 * what a single form cannot: links between entries (a place pointing to a
 * deleted area), map positions far from the west coast, expired featured
 * placements and missing translations.
 *
 * Errors stop the build, so broken content never goes live.
 * Warnings are printed but do not stop the build.
 *
 * Run by hand with: npm run content:check
 */
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../keystatic.config";

// keystatic.config.ts is compiled as CommonJS here, so the default export can
// arrive wrapped in { default }.
const config =
  (keystaticConfig as unknown as { default?: typeof keystaticConfig })
    .default ?? keystaticConfig;
const reader = createReader(process.cwd(), config);

const errors: string[] = [];
const warnings: string[] = [];
const today = new Date().toISOString().slice(0, 10);

// Rough box around the west coast, from north of Flic en Flac to south of Le
// Morne and inland to Chamarel. Outside it, a coordinate is probably a typo.
const westCoast = {
  latMin: -20.55,
  latMax: -20.2,
  lngMin: 57.28,
  lngMax: 57.47,
};

function checkLocation(label: string, loc: { lat: number; lng: number }) {
  const { lat, lng } = loc;
  if (
    lat < westCoast.latMin ||
    lat > westCoast.latMax ||
    lng < westCoast.lngMin ||
    lng > westCoast.lngMax
  ) {
    warnings.push(
      `${label}: map position ${lat}, ${lng} is outside the west coast — check it.`,
    );
  }
}

/** Warns when a text is filled in one language but empty in another. */
function checkTranslations(
  label: string,
  content: Record<string, Record<string, unknown>>,
) {
  const locales = Object.keys(content);
  const keys = Object.keys(content[locales[0]]).filter(
    (k) => typeof content[locales[0]][k] === "string",
  );
  for (const key of keys) {
    const filled = locales.filter(
      (l) => String(content[l][key] ?? "").trim() !== "",
    );
    if (filled.length > 0 && filled.length < locales.length) {
      const missing = locales.filter((l) => !filled.includes(l));
      warnings.push(`${label}: "${key}" is missing in ${missing.join(", ")}.`);
    }
  }
}

async function main() {
  // Reading everything also re-validates every file against the model.
  const [areas, places, guides, living] = await Promise.all([
    reader.collections.areas.all(),
    reader.collections.places.all(),
    reader.collections.guides.all(),
    reader.collections.living.all(),
  ]);

  const areaSlugs = new Set(areas.map((a) => a.slug));
  const placeSlugs = new Set(places.map((p) => p.slug));

  for (const { slug, entry } of areas) {
    checkLocation(`Area "${slug}"`, entry.location);
    checkTranslations(`Area "${slug}"`, entry.content);
  }

  for (const { slug, entry } of places) {
    const label = `Place "${slug}"`;
    if (!areaSlugs.has(entry.area))
      errors.push(`${label}: area "${entry.area}" does not exist.`);
    checkLocation(label, entry.location);
    checkTranslations(label, entry.content);
    if (entry.featured && entry.featuredUntil && entry.featuredUntil < today) {
      warnings.push(
        `${label}: featured placement ended on ${entry.featuredUntil} — it is no longer shown as featured.`,
      );
    }
  }

  for (const { slug, entry } of guides) {
    const label = `Guide "${slug}"`;
    for (const a of entry.areas)
      if (!areaSlugs.has(a))
        errors.push(`${label}: area "${a}" does not exist.`);
    for (const p of entry.places)
      if (!placeSlugs.has(p))
        errors.push(`${label}: place "${p}" does not exist.`);
    checkTranslations(label, entry.content);
  }

  for (const { slug, entry } of living) {
    const label = `Live in the West "${slug}"`;
    if (entry.area && !areaSlugs.has(entry.area))
      errors.push(`${label}: area "${entry.area}" does not exist.`);
    checkTranslations(label, entry.content);
  }

  const all = [...areas, ...places, ...guides, ...living];
  const placeholders = all.filter(({ entry }) => entry.placeholder).length;

  console.log(
    `Content: ${areas.length} areas, ${places.length} places, ${guides.length} guides, ` +
      `${living.length} Live in the West articles (${placeholders} marked as placeholder).`,
  );
  for (const w of warnings) console.warn(`  warning: ${w}`);
  for (const e of errors) console.error(`  ERROR: ${e}`);

  if (errors.length > 0) {
    console.error(
      `\nContent check failed with ${errors.length} error(s). Fix them in /keystatic and save.`,
    );
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error("Content check could not read the content files:\n", error);
  process.exit(1);
});
