/**
 * Site-wide settings that come from environment variables (see
 * .env.example). Only NEXT_PUBLIC_ variables are used here, so this file is
 * safe to import from client components.
 */
export const site = {
  name: "Soley",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  ),
  /** The owner's WhatsApp number in international format, digits only. */
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(
    /\D/g,
    "",
  ),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@example.com",
  plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "",
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
} as const;
