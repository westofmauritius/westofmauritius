import { EB_Garamond, Inter } from "next/font/google";

// next/font downloads these at build time and serves them from our own domain:
// no request goes to Google from the visitor's browser (good for privacy and
// speed), and fallback metrics are adjusted so text does not jump on load.

/**
 * Classic serif for headings and the wordmark. Chosen over Cormorant
 * Garamond because its accents (î, ô, ê) read naturally in French.
 * A variable font: one file covers every weight.
 */
export const garamond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
  display: "swap",
});

/** Clean sans-serif for body text and the interface. */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/** Class names to put on <html> so the CSS variables exist everywhere. */
export const fontVariables = `${garamond.variable} ${inter.variable}`;
