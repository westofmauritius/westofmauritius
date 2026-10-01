/**
 * Resizes every photo in public/images into WebP copies at the widths the
 * site requests (src/lib/image-sizes.ts), written to public/_img/.
 *
 * Runs before `npm run dev` and `npm run build`. Only new or changed photos
 * are processed, so it is quick after the first run. Photos are never
 * enlarged: a small original gives copies no wider than itself.
 * The output is generated and not stored in git.
 */
import { mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import sharp from "sharp";

// Same values as src/lib/image-sizes.ts (this script runs without TypeScript).
const widths = [256, 384, 640, 960, 1280, 1920, 2560];
const photo = /\.(jpe?g|png|webp|avif)$/i;

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

for (const file of walk(source)) {
  const base = join(target, relative(source, file)).replace(photo, "");
  const changed = statSync(file).mtimeMs;
  for (const width of widths) {
    const out = `${base}-${width}.webp`;
    try {
      if (statSync(out).mtimeMs >= changed) {
        skipped++;
        continue;
      }
    } catch {
      // Not generated yet.
    }
    mkdirSync(dirname(out), { recursive: true });
    await sharp(file)
      .rotate() // respect the camera's orientation flag
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(out);
    made++;
  }
}
console.log(`Images: ${made} resized copies written, ${skipped} up to date.`);
