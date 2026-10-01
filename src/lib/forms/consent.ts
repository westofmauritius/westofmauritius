import type { Locale } from "@/i18n/routing";

/**
 * Consent texts, versioned. The version stored with each submission proves
 * exactly what the person agreed to. When the wording changes, add a new
 * version (never edit an old one) and point `current` at it.
 *
 * The lead consent names the sharing with developers and agents explicitly:
 * leads are passed on, so GDPR and the Mauritius Data Protection Act 2017
 * require specific, informed consent for that. Have a lawyer review the
 * wording before launch (see TODO_OLIVER.md).
 */
export const consentTexts = {
  "lead-2026-10": {
    en: "I agree that West Mauritius may store my details and share them with selected property developers and estate agents on the west coast of Mauritius, so they can contact me about my enquiry. I can withdraw my consent at any time.",
    fr: "J’accepte qu’Ouest Maurice conserve mes coordonnées et les transmette à des promoteurs immobiliers et agents immobiliers sélectionnés de la côte ouest de l’île Maurice, afin qu’ils me contactent au sujet de ma demande. Je peux retirer mon consentement à tout moment.",
  },
  "newsletter-2026-10": {
    en: "I want to receive the West Mauritius newsletter by email. I can unsubscribe at any time.",
    fr: "Je souhaite recevoir la newsletter d’Ouest Maurice par e-mail. Je peux me désabonner à tout moment.",
  },
} satisfies Record<string, Record<Locale, string>>;

export type ConsentVersion = keyof typeof consentTexts;

export const currentConsent = {
  lead: "lead-2026-10",
  newsletter: "newsletter-2026-10",
} as const satisfies Record<string, ConsentVersion>;
