import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";
import { securityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  // Guides are MDX files imported by the guide pages (content/guides).
  pageExtensions: ["ts", "tsx", "mdx"],
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

const withMDX = createMDX({});
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(withMDX(nextConfig));
