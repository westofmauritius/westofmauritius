import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";
import { securityHeaders } from "./src/lib/security-headers";

// Soley lives in a subfolder of a repository that has its own
// package-lock.json; pin the project root so Next.js does not pick the
// parent folder.
const root = fileURLToPath(new URL(".", import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: root,
  turbopack: { root },
  // Guides are MDX files imported by the guide pages (content/guides).
  pageExtensions: ["ts", "tsx", "mdx"],
  experimental: {
    // forbidden() for signed-in people without the right role.
    authInterrupts: true,
    // Installer applications carry documents. Vercel accepts request
    // bodies up to 4.5 MB, so the form allows 4 MB of files in total.
    serverActions: { bodySizeLimit: "5mb" },
  },
  // Do not advertise the framework in a response header.
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Signed-in areas and APIs are never cached by a CDN and never indexed.
      {
        source: "/:locale/(account|portal|admin)/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

// Plugins are given by package name so they also work with Turbopack.
// remark-gfm adds tables (used by the cookie policy).
const withMDX = createMDX({ options: { remarkPlugins: [["remark-gfm", {}]] } });
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(withMDX(nextConfig));
