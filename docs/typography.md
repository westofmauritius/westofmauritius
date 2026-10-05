# Typography

The site follows the Hiriketiya site's type style (an uppercase eyebrow, a
large serif headline with one italic accent word, airy sans text). The
headline serif is Lora, chosen for how easily it reads on screen.

## Fonts

| Role                     | Typeface                       | Files                                                        |
| ------------------------ | ------------------------------ | ------------------------------------------------------------ |
| Headlines                | Lora 500                       | `serif-roman.woff2` (18 kB)                                  |
| Accent word in headlines | Lora 500 italic                | `serif-italic.woff2` (13 kB, letters and punctuation only)   |
| Body text and interface  | Figtree, variable 400 to 600   | `sans.woff2` (15 kB)                                         |
| Wordmark (logo name)     | Fraunces 600, soft rounded cut | `wordmark.woff2` (2 kB, only the letters of the brand names) |

The files in `src/assets/fonts/web/` are built by `scripts/subset-fonts.py`
from Google Fonts: only the characters English and French need, fixed axes
(static weight 500 for the serif, weights 400 to 600 for
the sans). `src/lib/fonts.ts` loads them with `next/font/local`: self
hosted, `font-display: swap` and size matched fallbacks; the roman serif
and the sans are preloaded, the italic loads only on pages that use it, so text
does not move when the fonts arrive (CLS 0).

To change a typeface: edit `SOURCES` in the script, run
`python3 scripts/subset-fonts.py` and rebuild. Nothing else names a font.

## Type scale

Tokens live in `src/app/globals.css` (`@theme`). Headline sizes are fluid
(`clamp`), so they scale smoothly from phone to desktop.

| Token / utility | Font                                   | Size (phone to desktop)  | Line height |
| --------------- | -------------------------------------- | ------------------------ | ----------- |
| `eyebrow`       | Figtree 500, uppercase, 0.24em spacing | 12 px                    | 1.4         |
| `type-display`  | Lora                                   | 54 to 120 px             | 0.98        |
| `type-h1`       | Lora                                   | 44 to 84 px              | 1.0         |
| `type-h2`       | Lora                                   | 34 to 58 px              | 1.05        |
| `type-h3`       | Lora                                   | 25 to 36 px              | 1.12        |
| `type-h4`       | Lora                                   | 20 to 24 px              | 1.25        |
| `lead`          | Figtree                                | 18 to 21 px              | 1.65        |
| `text-body`     | Figtree                                | 17 px (long texts 18 px) | 1.75        |
| `text-small`    | Figtree                                | 14 px                    | 1.6         |
| `type-button`   | Figtree 500                            | 15 px                    | 1.25        |

## Components

- `<Headline as="h1" size="display">The *best* coast.</Headline>`: the word
  between asterisks is set in the italic, in the accent colour. Works in
  translations too. Use `tone="dark"` on photos and dark sections.
- `<Eyebrow icon="pin">Tamarin · West coast · Mauritius</Eyebrow>`: write
  it in normal case; CSS sets the capitals. `tone="dark"` on dark
  backgrounds.
- `SectionHeading` uses both.

## Accent colour and contrast (WCAG 2.2 AA)

| Use                                 | Colour    | Background                      | Ratio            | Needed |
| ----------------------------------- | --------- | ------------------------------- | ---------------- | ------ |
| Eyebrow (small text)                | coral 700 | cream page / sand 50 / sand 100 | 5.8 / 5.3 / 4.85 | 4.5    |
| Eyebrow (small text)                | coral 700 | lagoon 50 / coral 50 bands      | 5.5 / 5.45       | 4.5    |
| Accent word (large text)            | coral 700 | any of the above                | 4.85 or more     | 3      |
| Eyebrow and accent on dark          | coral 300 | ocean 900 / 950                 | 7.8 / 9.1        | 4.5    |
| Homepage hero on the photo (phones) | coral 300 | photo under scrim               | 6.9 or more      | 4.5    |

The homepage hero was measured on the real photo pixels at 360, 390, 430,
768, 1024, 1440 and 1920 px wide. On phones a scrim on the text block keeps
the small eyebrow above 4.5:1 whatever the screen height.
