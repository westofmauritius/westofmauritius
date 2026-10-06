# Typography and theme

One calm, modern theme across the whole site: a warm white page, soft stone
panels, ocean ink, a single coral accent and one typeface.

## Typeface

**Plus Jakarta Sans**, a clean modern sans with a friendly rounded character,
for everything: headlines (bold, tightly set), text, buttons and the logo
(extra bold). One variable file, `src/assets/fonts/web/sans.woff2`, 16 kB:
weights 400 to 800 and only the characters English and French need, built
by `scripts/subset-fonts.py`. `src/lib/fonts.ts` loads it with
`next/font/local`: self hosted, preloaded, `font-display: swap` and a size
matched fallback, so text does not move when it arrives (CLS 0).

To change the typeface: edit `SOURCES` in the script, run
`python3 scripts/subset-fonts.py` and rebuild. Nothing else names a font.

## Type scale

Tokens live in `src/app/globals.css` (`@theme`); headline sizes are fluid
(`clamp`).

| Token / utility | Weight and spacing     | Size (phone to desktop) | Line height |
| --------------- | ---------------------- | ----------------------- | ----------- |
| `eyebrow`       | 600, uppercase, 0.16em | 12 px                   | 1.4         |
| `type-display`  | 700, −0.045em          | 48 to 108 px            | 1.0         |
| `type-h1`       | 700, −0.04em           | 38 to 72 px             | 1.04        |
| `type-h2`       | 700, −0.035em          | 30 to 50 px             | 1.1         |
| `type-h3`       | 700, −0.025em          | 22 to 30 px             | 1.2         |
| `type-h4`       | 600, −0.015em          | 18 to 21 px             | 1.35        |
| `lead`          | 400                    | 18 to 21 px             | 1.65        |
| `text-body`     | 400                    | 17 px (long texts 18)   | 1.75        |
| `text-small`    | 400                    | 14 px                   | 1.6         |
| `type-button`   | 600                    | 15 px                   | 1.25        |

## Components

- `<Headline as="h1" size="display">The *best*\ncoast.</Headline>`: the
  word between asterisks is set in the accent colour; a line break fixes
  the lines. Use `tone="dark"` on photos and dark sections.
- `<Eyebrow icon="pin">Tamarin · West coast · Mauritius</Eyebrow>`: write it
  in normal case; CSS sets the capitals.
- Shapes: panels, cards and photos `rounded-2xl`; fields `rounded-xl`;
  buttons are pills. Cards lift gently on hover.

## Colour and contrast (WCAG 2.2 AA)

| Use                    | Colour    | On                          | Ratio            | Needed |
| ---------------------- | --------- | --------------------------- | ---------------- | ------ |
| Text                   | ocean 900 | page / stone panels         | 14.2 / 13.0      | 4.5    |
| Secondary text         | ink muted | page / stone panels         | 6.1 / 5.6        | 4.5    |
| Eyebrow and accent     | #b83d24   | page / stone 50 / stone 100 | 5.4 / 4.95 / 4.5 | 4.5    |
| Accent on dark         | coral 300 | ocean 900 / 950             | 7.8 / 9.1        | 4.5    |
| Homepage hero on photo | coral 300 | photo under scrim (phones)  | 6.9 or more      | 4.5    |
