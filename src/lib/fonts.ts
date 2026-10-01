import { EB_Garamond, Inter } from "next/font/google";

// next/font downloads these at build time and serves them from our own domain:
// no request goes to Google from the visitor's browser (good for privacy and
// speed), and fallback metrics are adjusted so text does not jump on load.

/**
 * Classic serif for headings and the wordmark. Chosen over Cormorant
 * Garamond because its accents (î, ô, ê) read naturally in French.
 * One static weight (400) keeps the file small: headings and the wordmark
 * both use it.
 */
export const garamond = EB_Garamond({
  subsets: ["latin"],
  weight: "400",
  // Upright only: the italic file (48 kB) would be preloaded on every page
  // for the odd quote. Browsers slant the upright font where italic is used.
  style: ["normal"],
  variable: "--font-garamond",
  display: "swap",
});

/** Clean sans-serif for body text and the interface. */
export const inter = Inter({
  subsets: ["latin"],
  // Not preloaded: the headline font (above) is what the first screen needs
  // most; body text shows in the metric-matched fallback for a moment.
  preload: false,
  variable: "--font-inter",
  display: "swap",
});

/** Class names to put on <html> so the CSS variables exist everywhere. */
export const fontVariables = `${garamond.variable} ${inter.variable}`;
