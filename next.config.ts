import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { deviceSizes, imageSizes } from "./src/lib/image-sizes";
import {
  contentSecurityPolicy,
  securityHeaders,
} from "./src/lib/security-headers";

const isProduction = process.env.NODE_ENV === "production";

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
  // Do not advertise the framework in a response header.
  poweredByHeader: false,
  // The fonts for the social sharing images are only read at build time
  // (the images are prerendered). Without this, the Cloudflare adapter would
  // pack ~700 kB of font files into the Worker.
  outputFileTracingExcludes: { "*": ["./src/assets/fonts/**"] },

  // Old addresses keep working (301): the property section was renamed from
  // "Live in the West" to "Living in the West", and the area buying guides
  // got keyword URLs ("buying-property-in-tamarin").
  async redirects() {
    const buyingAreas = [
      "black-river",
      "chamarel",
      "flic-en-flac",
      "la-gaulette",
      "le-morne",
      "tamarin",
    ];
    return [
      ...buyingAreas.map((area) => ({
        source: `/en/live-in-the-west/buying-in-${area}`,
        destination: `/en/living-in-the-west/buying-property-in-${area}`,
        permanent: true,
      })),
      {
        source: "/en/live-in-the-west/:path*",
        destination: "/en/living-in-the-west/:path*",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // The Content-Security-Policy applies everywhere except the content
      // editor, which talks to GitHub. Not in development: Next.js's dev
      // tools need eval().
      ...(isProduction
        ? [
            {
              source: "/((?!keystatic|api/keystatic).*)",
              headers: [
                {
                  key: "Content-Security-Policy",
                  value: contentSecurityPolicy,
                },
              ],
            },
          ]
        : []),
      // Admin and APIs: never cached, never indexed.
      {
        source: "/(admin|api)/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

// Connects next-intl to Next.js. It finds src/i18n/request.ts automatically.
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
