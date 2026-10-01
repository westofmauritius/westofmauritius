/**
 * HTTP security headers for every page (see next.config.ts), plus a stricter
 * Content-Security-Policy that lists exactly where the site may load things
 * from. If a new outside service is added (e.g. a video host), add it here.
 */

// Outside hosts the site talks to.
const mapHosts = "https://tiles.openfreemap.org"; // map style, tiles, fonts, icons
const analyticsHosts = "https://cloud.umami.is https://api-gateway.umami.dev"; // Umami

export const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline' is needed for the small inline scripts Next.js writes
  // into prerendered pages (a per-request nonce would make pages dynamic).
  `script-src 'self' 'unsafe-inline' ${analyticsHosts}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${mapHosts}`,
  "font-src 'self' data:",
  `connect-src 'self' ${mapHosts} ${analyticsHosts}`,
  // MapLibre draws the map in a web worker (our own file, or a blob in some browsers).
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

/** Headers for every response. */
export const securityHeaders = [
  // Only ever load the site over HTTPS (one year, including subdomains).
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  // Do not guess file types; never let other sites frame ours (clickjacking).
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  // Send only the domain (not full URLs) to other sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Features the site never uses are switched off for it and anything embedded.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];
