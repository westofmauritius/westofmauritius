# West Mauritius

Source code for **westmauritius.mu** (English) and, later, **ouestmaurice.mu**
(French): a premium lifestyle and travel guide to the west coast of
Mauritius — Tamarin, Black River, Le Morne, Flic en Flac, La Gaulette and
Chamarel — with a "Live in the West" section that collects property leads.

## Stack

| Part            | Tool                               | Added in step |
| --------------- | ---------------------------------- | ------------- |
| Framework       | Next.js (App Router) + TypeScript  | 1             |
| Styling         | Tailwind CSS v4                    | 1–2           |
| Languages       | next-intl (`/en`, `/fr`)           | 3             |
| Content editing | Keystatic (files in `content/`)    | 4             |
| Maps            | MapLibre + OpenFreeMap             | 5             |
| Leads database  | Neon Postgres + Drizzle ORM        | 9             |
| E-mail          | Resend                             | 9             |
| Analytics       | Free, cookieless (decided step 11) | 11            |

## Getting started

Requires Node.js 20.9 or newer (see `.nvmrc`).

```bash
npm install
cp .env.example .env.local   # then fill in values
npm run dev                  # http://localhost:3000
```

## Scripts

| Command             | What it does                                          |
| ------------------- | ----------------------------------------------------- |
| `npm run dev`       | Start the development server                          |
| `npm run build`     | Production build (what the host runs)                 |
| `npm run start`     | Serve the production build locally                    |
| `npm run lint`      | ESLint (code problems)                                |
| `npm run typecheck` | TypeScript (type errors)                              |
| `npm run format`    | Prettier (rewrites formatting, sorts classes)         |
| `npm run check`     | Lint + typecheck + format check — run before a commit |

## Folder structure

Folders are created in the step that first needs them.

```
content/            Site content edited through Keystatic (step 4)
messages/           Interface text per language: en.json, fr.json (step 3)
public/             Static files served as-is
src/
  app/              Routes. Each folder is a URL segment.
    [locale]/       All public pages, per language (step 3)
    admin/leads/    Password-protected lead list + CSV export (step 9)
    api/            Server endpoints, e.g. form submissions (step 9)
    keystatic/      Content editor UI (step 4)
  components/       Reusable UI pieces
  i18n/             Language config and translated URL paths (step 3)
  lib/              Non-UI code: content loading, SEO helpers, db, e-mail
```

## Languages and URLs

- Every page lives under `src/app/[locale]/` and is built once per language.
- `src/i18n/routing.ts` lists the languages and maps internal routes to public
  URLs, e.g. `/places/[slug]` → `/en/places/…` and `/fr/lieux/…`. It also
  explains how to add a language and how to connect ouestmaurice.mu later.
- Interface texts live in `messages/en.json` and `messages/fr.json`. The build
  fails if a language file is missing a key that en.json has.
- Always link with `Link` from `@/i18n/navigation`, never from `next/link`, and
  give it the internal route (`href="/areas"`); it adds the language and the
  translated path.
- Use `localeAlternates()` from `src/lib/seo/alternates.ts` in each page's
  metadata for the canonical URL and hreflang tags.
- `src/proxy.ts` sends visitors from `/` to `/en` or `/fr` based on their
  browser language or earlier choice.

## Design system

- Tokens (colours, fonts, type sizes) live in `src/app/globals.css`.
- Fonts: Cormorant Garamond (headings, wordmark) and Inter (body), loaded in
  `src/lib/fonts.ts` and self-hosted by `next/font`.
- Reusable pieces live in `src/components/ui` (wordmark, buttons, cards …) and
  `src/components/layout` (header, footer).
- Review everything at **`/styleguide`** (internal, not indexed).

## Content rules

- Anything invented for layout purposes is marked as a **placeholder**: it
  shows a visible label, is `noindex` and stays out of the sitemap.
- Never invent reviews, ratings or facts about real businesses.
