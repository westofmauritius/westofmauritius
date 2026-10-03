import type { Locale } from "@/i18n/routing";

/**
 * Consent texts, versioned. The version stored with each submission proves
 * exactly what the person agreed to. When the wording changes, add a new
 * version (never edit an old one) and point `current` at it.
 *
 * The lead consent names the sharing with developers and agents explicitly:
 * leads are passed on, so GDPR and the Mauritius Data Protection Act 2017
 * require specific, informed consent for that. Have a lawyer review the
 * wording before launch.
 */
export const consentTexts = {
  "lead-2026-10b": {
    en: "I agree that West of Mauritius may store my details and share them with selected property developers and estate agents on the west coast of Mauritius, so they can contact me about my enquiry. I can withdraw my consent at any time.",
    fr: "J’accepte qu’Ouest Maurice conserve mes coordonnées et les transmette à des promoteurs immobiliers et agents immobiliers sélectionnés de la côte ouest de l’île Maurice, afin qu’ils me contactent au sujet de ma demande. Je peux retirer mon consentement à tout moment.",
  },
  // Same wording as 10b without the comma (the site uses no commas).
  "lead-2026-10c": {
    en: "I agree that West of Mauritius may store my details and share them with selected property developers and estate agents on the west coast of Mauritius so they can contact me about my enquiry. I can withdraw my consent at any time.",
    fr: "J’accepte qu’Ouest Maurice conserve mes coordonnées et les transmette à des promoteurs immobiliers et agents immobiliers sélectionnés de la côte ouest de l’île Maurice afin qu’ils me contactent au sujet de ma demande. Je peux retirer mon consentement à tout moment.",
  },
  "newsletter-2026-10b": {
    en: "I want to receive the West of Mauritius newsletter by email. I can unsubscribe at any time.",
    fr: "Je souhaite recevoir la newsletter d’Ouest Maurice par courriel. Je peux me désabonner à tout moment.",
  },
  "whatsapp-2026-10": {
    en: "I agree that West of Mauritius may store my name and WhatsApp number to invite me to its west coast WhatsApp group. Members of the group can see my number. I can leave the group or ask to be removed at any time.",
    fr: "J’accepte qu’Ouest Maurice conserve mon nom et mon numéro WhatsApp pour m’inviter dans son groupe WhatsApp de la côte ouest. Les membres du groupe peuvent voir mon numéro. Je peux quitter le groupe ou demander à être retiré à tout moment.",
  },
} satisfies Record<string, Record<Locale, string>>;

export type ConsentVersion = keyof typeof consentTexts;

export const currentConsent = {
  lead: "lead-2026-10c",
  newsletter: "newsletter-2026-10b",
  whatsapp: "whatsapp-2026-10",
} as const satisfies Record<string, ConsentVersion>;
