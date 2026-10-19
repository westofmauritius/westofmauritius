/**
 * Versions of the texts people agree to. The exact text is in
 * messages/*.json; the version is stored with every consent (table
 * `consents`), so we can always show which wording someone agreed to.
 *
 * When you change a consent text, bump its version here. A unit test
 * (consent.test.ts) fails until you do.
 */
export const consentVersions = {
  /** Sharing a quote request with at most three installers. */
  shareWithInstallers: "2026-10-19.1",
  /** An installer's agreement to the partner terms. */
  installerTerms: "2026-10-19.1",
} as const;

export type ConsentPurpose = keyof typeof consentVersions;
