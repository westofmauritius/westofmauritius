import { EB_Garamond } from "next/font/google";

// next/font downloads this at build time and serves it from our own domain:
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

// Body text and the interface use the device's own sans-serif (San Francisco
// on Apple devices, Segoe UI on Windows, Roboto on Android), set in
// globals.css. It looks native everywhere, costs no download and cannot make
// text jump when a font arrives. Inter was used before; dropping its 50 kB
// file was the largest single speed gain left on photo pages.

/** Class names to put on <html> so the CSS variables exist everywhere. */
export const fontVariables = garamond.variable;
