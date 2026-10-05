Fonts, all under the SIL Open Font License 1.1, built from the Google Fonts
sources by `scripts/subset-fonts.py`:

- `web/` — the site's own subsets, loaded through `next/font/local`
  (`src/lib/fonts.ts`): Lora 500 roman and italic, Figtree 400 to 600
  and the Fraunces wordmark (soft cut, only the letters of the brand names).
- `Lora-Medium.ttf`, `Figtree-Medium.ttf`, `Fraunces-Wordmark.ttf` — static copies used to draw
  the social sharing images at build time (`scripts/generate-og.tsx`).

Licences: `OFL-Lora.txt`, `OFL-Figtree.txt`, `OFL-Fraunces.txt`. See also
`docs/typography.md`.
