import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// OpenNext adapter settings for Cloudflare Workers. Defaults are fine for now:
// every page is prerendered at build time, so no cache storage is needed yet.
export default defineCloudflareConfig();
