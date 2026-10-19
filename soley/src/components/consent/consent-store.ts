"use client";

/**
 * The visitor's analytics choice, kept in their own browser only. Bump the
 * version when the consent text changes, so everyone is asked again.
 */
export const CONSENT_KEY = "soley-analytics-consent-v1";
export const CONSENT_EVENT = "soley:consent-changed";

export type ConsentChoice = "granted" | "denied" | null;

export function readConsent(): ConsentChoice {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function writeConsent(choice: ConsentChoice) {
  try {
    if (choice) window.localStorage.setItem(CONSENT_KEY, choice);
    else window.localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
}
