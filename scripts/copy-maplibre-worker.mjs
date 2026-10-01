/**
 * Copies MapLibre's web-worker files into public/vendor/maplibre/<version>/.
 *
 * MapLibre draws the map in a background "web worker" that it loads from a
 * file next to its own script. After Next.js bundles MapLibre that file is
 * not where MapLibre expects it, so we serve it ourselves and tell MapLibre
 * where it is (setWorkerUrl in src/components/map/PlacesMap.tsx).
 *
 * Runs automatically before `npm run dev` and `npm run build`. The version
 * in the path makes browsers fetch new files when MapLibre is updated.
 */
import { copyFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const pkgPath = require.resolve("maplibre-gl/package.json");
const { version } = JSON.parse(readFileSync(pkgPath, "utf8"));
const dist = join(dirname(pkgPath), "dist");

const target = join("public", "vendor", "maplibre");
rmSync(target, { recursive: true, force: true });
mkdirSync(join(target, version), { recursive: true });

// The worker imports the shared code with a relative path, so both go together.
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(join(dist, file), join(target, version, file));
}
console.log(`MapLibre ${version} worker copied to ${target}/${version}/`);
