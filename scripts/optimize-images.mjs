/**
 * Resizes every photo in public/images into AVIF and WebP copies at the
 * widths the site requests (src/lib/image-sizes.ts), written to public/_img/.
 * Browsers that understand AVIF (most today) get it — about a third smaller
 * for the same quality; the others fall back to WebP (see ResponsiveImage).
 *
 * Runs before `npm run dev` and `npm run build`. Only new or changed photos
 * are processed, so it is quick after the first run. Photos are never
 * enlarged: a small original gives copies no wider than itself.
 * The output is generated and not stored in git.
 */
import { mkdirSync, readdirSync, statSync } from "node:fs";
import { availableParallelism } from "node:os";
import { dirname, join, relative } from "node:path";
import sharp from "sharp";

// Same values as src/lib/image-sizes.ts (this script runs without TypeScript).
const widths = [256, 384, 640, 828, 960, 1280, 1920, 2560];
const photo = /\.(jpe?g|png|webp|avif)$/i;

const formats = [
  // effort 2: AVIF encoding is slow at higher settings (minutes per photo)
  // for little gain; this keeps a full rebuild on Cloudflare to a minute or two.
  { ext: "avif", encode: (img) => img.avif({ quality: 50, effort: 2 }) },
  // effort 6: slower to build, noticeably smaller files for the same quality.
  { ext: "webp", encode: (img) => img.webp({ quality: 74, effort: 6 }) },
];

const source = join("public", "images");
const target = join("public", "_img", "images");

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (photo.test(entry.name)) yield path;
  }
}

let made = 0;
let skipped = 0;
try {
  statSync(source);
} catch {
  console.log("No public/images folder yet — nothing to optimize.");
  process.exit(0);
}

async function optimize(file) {
  const base = join(target, relative(source, file)).replace(photo, "");
  const changed = statSync(file).mtimeMs;
  for (const width of widths) {
    for (const format of formats) {
      const out = `${base}-${width}.${format.ext}`;
      try {
        if (statSync(out).mtimeMs >= changed) {
          skipped++;
          continue;
        }
      } catch {
        // Not generated yet.
      }
      mkdirSync(dirname(out), { recursive: true });
      await format
        .encode(
          sharp(file)
            .rotate() // respect the camera's orientation flag
            .resize({ width, withoutEnlargement: true }),
        )
        .toFile(out);
      made++;
    }
  }
}

// A few photos at a time: encoding is CPU-bound, and build machines have
// several cores.
const queue = [...walk(source)];
const workers = Math.max(1, Math.min(4, availableParallelism()));
await Promise.all(
  Array.from({ length: workers }, async () => {
    for (let file = queue.shift(); file; file = queue.shift()) {
      await optimize(file);
    }
  }),
);
console.log(`Images: ${made} resized copies written, ${skipped} up to date.`);
