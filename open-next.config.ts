import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// OpenNext adapter settings for Cloudflare Workers.
const config = defineCloudflareConfig();

// `npm run build` runs OpenNext (so Cloudflare's default "npm run build" +
// "npx wrangler deploy" works). OpenNext in turn runs the plain Next.js build
// through this command — it must not be "npm run build", or it would loop.
config.buildCommand = "npm run build:next";

export default config;
