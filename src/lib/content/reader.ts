import "server-only";
import { createReader } from "@keystatic/core/reader";
import config from "../../../keystatic.config";

/**
 * Reads the files in content/ using the Keystatic model, which also validates
 * them. Runs at build time only: every page is prerendered, so the live site
 * never needs to read these files (Cloudflare Workers have no disk).
 */
export const reader = createReader(process.cwd(), config);
