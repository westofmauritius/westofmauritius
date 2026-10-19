/**
 * HTTP security headers for every response. A full Content-Security-Policy
 * is left for the launch step, once the final list of third parties
 * (Plausible, Turnstile, Supabase storage) and domains is known; see
 * LAUNCH_CHECKLIST.md.
 */
export const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];
