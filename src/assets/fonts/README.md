Fonts, under the SIL Open Font License 1.1, built from the Google Fonts
sources by `scripts/subset-fonts.py`:

- `web/sans.woff2` — the site's one typeface, Plus Jakarta Sans (weights 400
  to 800), loaded through `next/font/local` (`src/lib/fonts.ts`).
- `PlusJakartaSans-Bold.ttf`, `PlusJakartaSans-Medium.ttf` — static copies
  used to draw the social sharing images at build time
  (`scripts/generate-og.tsx`).

Licence: `OFL-PlusJakartaSans.txt`. See also `docs/typography.md`.
