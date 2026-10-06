import localFont from "next/font/local";

/*
 * One typeface for the whole site: Plus Jakarta Sans, a clean modern sans
 * with a friendly rounded character, in one variable file (weights 400 to
 * 800) for headlines, text, buttons and the logo alike.
 *
 * Self hosted through next/font: the file in src/assets/fonts/web/ is built
 * by scripts/subset-fonts.py (only the characters English and French need,
 * 16 kB), served from our own domain with `font-display: swap`, preloaded,
 * and paired with a fallback font with matching metrics so text does not
 * move when it arrives.
 *
 * To switch typefaces, change SOURCES in scripts/subset-fonts.py, run it
 * and rebuild. Nothing else in the site names a font: everything uses the
 * --font-sans variable.
 */
export const sans = localFont({
  src: "../assets/fonts/web/sans.woff2",
  weight: "400 800",
  style: "normal",
  variable: "--font-sans-loaded",
  display: "swap",
  adjustFontFallback: "Arial",
});

/** Class names to put on <html> so the CSS variables exist everywhere. */
export const fontVariables = sans.variable;
