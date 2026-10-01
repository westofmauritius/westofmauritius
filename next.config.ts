import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { deviceSizes, imageSizes } from "./src/lib/image-sizes";

const nextConfig: NextConfig = {
  images: {
    // Photos are resized at build time (scripts/optimize-images.mjs) and
    // served as static WebP files; the loader picks the right width. Free,
    // fast, and nothing to run per request on Cloudflare.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes,
    imageSizes,
  },
};

// Connects next-intl to Next.js. It finds src/i18n/request.ts automatically.
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
