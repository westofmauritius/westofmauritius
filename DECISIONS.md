# Decisions

A log of the technical and design decisions behind the site, newest last.
Each entry says what was decided and why, so later changes can be made with
the original reasoning in view. (Technical docs are in English; the owner's
to-do list, TODO_OLIVER.md, is in Swedish.)

## Platform

- **Next.js (App Router) + TypeScript (strict) + Tailwind v4.** Server
  rendering and static generation for SEO, one language for everything.
- **Cloudflare Workers via OpenNext, free plan.** Free for commercial use
  (Vercel's free plan is not). Every page is prerendered at build time and
  served from a static-assets cache populated during `npm run build`; only
  forms, admin and the content editor run code per request.
- **`middleware.ts` instead of Next 16's `proxy.ts`.** A proxy runs as
  Node.js code and pulls a second copy of the Next.js server into the Worker
  (3.0 MB → 1.8 MB gzip after the switch; the free limit is 3 MB). The
  deprecation warning during the build is expected.
- **Worker size budget:** stay under ~2.5 MB gzip to keep headroom under the
  3 MB free-plan limit. Checked with `npx wrangler deploy --dry-run`.

## Content

- **Keystatic** (git-based CMS). One editor, content versioned with the code,
  no extra service. Content is YAML + Markdoc files in `content/`.
- **One entry, one block of text per language** rather than one entry per
  language: shared facts (map position, links, featured) can never drift
  apart between languages.
- **A content check before every build** (`scripts/check-content.mts`) stops
  the build on broken links between entries and duplicate URLs.
- **Placeholder content is flagged** (`placeholder: true`): visible label,
  `noindex`, no structured data, left out of the sitemap.

## Languages and URLs

- **/en and /fr prefixes** with translated paths (`/fr/lieux`, `/fr/regions`)
  via next-intl. Guide categories and guides also have translated slugs
  (`/fr/guides/plages/…`). Place and area slugs are proper nouns and shared.
- **hreflang tags are the single source of "this page in other languages".**
  The language switcher reads them, so it is always correct even for pages
  with translated slugs.
- **French typography:** a narrow no-break space is inserted automatically
  before `: ; ? !` in French titles and short texts.
- **EB Garamond + Inter.** Cormorant Garamond was the first choice, but its
  circumflexes clash with apostrophes in French ("l’île").

## Maps

- **MapLibre GL + OpenFreeMap** (OpenStreetMap data) instead of Leaflet:
  vector tiles look sharper and calmer, the style can be tinted to the
  brand's lagoon colour, and it is free with no API key. The library is only
  downloaded when a map scrolls into view. Its worker file is copied to
  `public/vendor/` at build time because bundling breaks its default path.

## Testing

- **Vitest** for unit tests of plain logic, **Playwright + axe** for
  end-to-end and accessibility tests in a real browser.
