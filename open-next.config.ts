import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// OpenNext adapter settings for Cloudflare Workers.
const config = defineCloudflareConfig({
  // Every page is prerendered at build time and only changes with the next
  // build (content edits trigger a rebuild). This cache serves those
  // prerendered pages straight from Cloudflare's static file storage — no
  // database or KV store needed. Without it, pages such as /en/areas/tamarin
  // are not found on Cloudflare.
  incrementalCache: staticAssetsIncrementalCache,
  // Answer requests for prerendered pages from the cache before loading the
  // full Next.js server: faster, and less CPU time per request.
  enableCacheInterception: true,
});

// `npm run build` runs OpenNext (so Cloudflare's default "npm run build" +
// "npx wrangler deploy" works). OpenNext in turn runs the plain Next.js build
// through this command — it must not be "npm run build", or it would loop.
config.buildCommand = "npm run build:next";

export default config;
