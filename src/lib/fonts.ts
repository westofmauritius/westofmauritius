import localFont from "next/font/local";

/*
 * The site's two typefaces, self hosted through next/font:
 * the files live in src/assets/fonts/web/ (built by scripts/subset-fonts.py,
 * which keeps only the characters English and French need), next/font
 * serves them from our own domain with `font-display: swap`, preloads the
 * ones the first screen needs and generates a fallback font with matching metrics, so text does not
 * move when the real font arrives.
 *
 * To switch typefaces, change the sources in scripts/subset-fonts.py, run
 * it, and keep the file names below. Nothing else in the site names a font:
 * everything uses the --font-serif and --font-sans variables.
 */

/**
 * Lora, for headlines: open shapes and a large x height, so headlines and
 * the occasional serif line stay easy to read (Newsreader, used before,
 * proved too sharp on screen). One weight (500), cut static by the subset
 * script.
 */
export const serif = localFont({
  src: "../assets/fonts/web/serif-roman.woff2",
  weight: "500",
  style: "normal",
  variable: "--font-serif",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

/**
 * Lora italic, for the one key word in a headline ("The *best*
 * coast.") and short serif asides. A real italic: a slanted roman looks fake
 * at display sizes. Kept as its own family and not preloaded, so it is only
 * downloaded on pages that use it and never competes with the main photo
 * or the text on the first screen (measured: preloading it cost up to half
 * a second of Largest Contentful Paint on mobile).
 */
export const serifItalic = localFont({
  src: "../assets/fonts/web/serif-italic.woff2",
  weight: "500",
  style: "italic",
  variable: "--font-serif-italic",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

/**
 * Figtree, the Hiriketiya site's sans: body text and the interface
 * (navigation, buttons, forms, eyebrows). One variable file covers the
 * three weights used: 400, 500 and 600.
 */
export const sans = localFont({
  src: "../assets/fonts/web/sans.woff2",
  weight: "400 600",
  style: "normal",
  variable: "--font-sans-loaded",
  display: "swap",
  adjustFontFallback: "Arial",
});

/**
 * Fraunces in its soft, rounded cut, for the brand name in the logo only:
 * a relaxed island feel next to the Lora headlines. The
 * file holds just the letters of the two brand names (2 kB).
 */
export const wordmark = localFont({
  src: "../assets/fonts/web/wordmark.woff2",
  weight: "600",
  style: "normal",
  variable: "--font-wordmark-loaded",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

/** Class names to put on <html> so the CSS variables exist everywhere. */
export const fontVariables = `${serif.variable} ${serifItalic.variable} ${sans.variable} ${wordmark.variable}`;
