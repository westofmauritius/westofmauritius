/**
 * Hands the build's site settings to worker.mjs, which decides per request
 * whether a host may be indexed (src/lib/hosts.ts). Runs after the OpenNext
 * build, so SITE_URL only has to be set once, as a build variable.
 */
import { writeFileSync } from "node:fs";
import { searchIndexing, siteUrl } from "../src/lib/site";

writeFileSync(
  ".open-next/site-config.json",
  JSON.stringify({ siteUrl, indexing: searchIndexing }) + "\n",
);
console.log(`Site: ${siteUrl} (indexing: ${searchIndexing})`);
