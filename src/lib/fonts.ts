import { Cormorant_Garamond, Inter } from "next/font/google";

// next/font downloads these at build time and serves them from our own domain:
// no request goes to Google from the visitor's browser (good for privacy and
// speed), and fallback metrics are adjusted so text does not jump on load.

/** Elegant serif for headings and the wordmark. */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

/** Clean sans-serif for body text and the interface. */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/** Class names to put on <html> so the CSS variables exist everywhere. */
export const fontVariables = `${cormorant.variable} ${inter.variable}`;
