import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {};

// Connects next-intl to Next.js. It finds src/i18n/request.ts automatically.
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
