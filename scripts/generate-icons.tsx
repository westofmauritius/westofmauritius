/**
 * Draws the site's icons from the logo mark (src/lib/brand-mark.ts):
 * src/app/icon.svg, src/app/apple-icon.png, src/app/favicon.ico and the web
 * app icons in public/icons. The results are committed; run this again only
 * after changing the mark:  npx tsx scripts/generate-icons.tsx
 */
import { writeFileSync } from "node:fs";
import sharp from "sharp";
import { brandMark as m } from "../src/lib/brand-mark";

const bg = m.colors.ink;

/** The mark in white on the deep-ocean tile. `pad` is the margin in 24ths. */
function tile(size: number, { radius = 0.22, pad = 2.5 } = {}) {
  const box = 24 + pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${-pad} ${-pad} ${box} ${box}">
  <rect x="${-pad}" y="${-pad}" width="${box}" height="${box}" rx="${box * radius}" fill="${bg}"/>
  <circle cx="${m.sun.cx}" cy="${m.sun.cy}" r="${m.sun.r}" fill="${m.colors.sun}"/>
  <path d="${m.mountain}" fill="#ffffff"/>
  <rect x="${m.lagoon.x}" y="${m.lagoon.y}" width="${m.lagoon.width}" height="${m.lagoon.height}" rx="${m.lagoon.rx}" fill="${m.colors.lagoonOnDark}"/>
</svg>`;
}

const png = (svg: string, size: number) =>
  sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

/** An .ico file holding PNG images (supported by every current browser). */
function ico(images: { size: number; data: Buffer }[]) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.data)]);
}

async function main() {
  const svg = tile(64);
  writeFileSync("src/app/icon.svg", svg + "\n");
  // Apple adds its own rounded corners: a square tile.
  writeFileSync(
    "src/app/apple-icon.png",
    await png(tile(180, { radius: 0 }), 180),
  );
  writeFileSync(
    "src/app/favicon.ico",
    ico([
      { size: 16, data: await png(tile(16, { pad: 1.5 }), 16) },
      { size: 32, data: await png(tile(32, { pad: 1.5 }), 32) },
      { size: 48, data: await png(tile(48), 48) },
    ]),
  );
  writeFileSync("public/icons/icon-192.png", await png(tile(192), 192));
  writeFileSync("public/icons/icon-512.png", await png(tile(512), 512));
  // Maskable: Android crops to a circle, so keep the mark inside the middle 80%.
  writeFileSync(
    "public/icons/icon-maskable-512.png",
    await png(tile(512, { radius: 0, pad: 6 }), 512),
  );
  console.log("Icons written.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
