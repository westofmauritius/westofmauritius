import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    // Image resizing on Cloudflare needs its Images service, which is set up
    // in the performance step (12) before real photos are added. Until then
    // images are served as uploaded.
    unoptimized: true,
  },
};

// Connects next-intl to Next.js. It finds src/i18n/request.ts automatically.
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
