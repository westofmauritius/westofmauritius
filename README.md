# West of Mauritius

Source code for **westofmauritius.mu**: a Mauritian's guide to the west coast
of Mauritius (Tamarin, Black River, Le Morne, Flic en Flac, La Gaulette and
Chamarel), for visitors and for people moving there, with a property section
that collects leads. English first; French is built in and switched off until
its content is ready.

- Why things are built the way they are: [DECISIONS.md](DECISIONS.md)
- Which page targets which search: [SEO.md](SEO.md)
- How to edit content: [docs/content-editing.md](docs/content-editing.md)

## Stack

| Part            | Tool                                                  |
| --------------- | ----------------------------------------------------- |
| Framework       | Next.js (App Router), React, strict TypeScript        |
| Styling         | Tailwind CSS v4 (tokens in `src/app/globals.css`)     |
| Languages       | next-intl, `/en/…` and `/fr/…` with translated paths  |
| Content editing | Keystatic; content is files in `content/`             |
| Maps            | MapLibre + OpenFreeMap tiles (free, no key)           |
| Forms database  | Neon Postgres over HTTP (plain SQL, `db/schema.sql`)  |
| E-mail          | Resend (REST API)                                     |
| Analytics       | Umami Cloud (free, cookie-free), off until configured |
| Hosting         | Cloudflare Workers via OpenNext                       |
| Tests           | Vitest (unit), Playwright + axe (end-to-end, a11y)    |

Everything works on free plans. The site sets no cookies for visitors, so it
needs no cookie banner.

## Getting started

Requires Node.js 22 (see `.nvmrc`).

```bash
npm install
cp .env.example .env.local   # optional locally: everything has a fallback
npm run dev                  # http://localhost:3000
```

Without a database, forms save to memory in development, so you can try
them. The admin pages need `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in
`.env.local`.

## Scripts

| Command                  | What it does                                                     |
| ------------------------ | ---------------------------------------------------------------- |
| `npm run dev`            | Development server                                               |
| `npm run build`          | Cloudflare build: Next.js build + OpenNext Worker (`.open-next`) |
| `npm run build:next`     | Plain Next.js build (used by OpenNext and the e2e tests)         |
| `npm run start`          | Serve the plain Next.js build on Node                            |
| `npm run preview`        | Build and run the Worker locally in Cloudflare's runtime         |
| `npm run deploy`         | Build and deploy to Cloudflare from your machine                 |
| `npm run check`          | Lint + typecheck + format check + unit tests — run before commit |
| `npm run test`           | Unit tests (Vitest)                                              |
| `npm run test:e2e`       | Build, then end-to-end and accessibility tests (Playwright)      |
| `npm run format`         | Fix formatting (Prettier, also sorts Tailwind classes)           |
| `npm run content:check`  | Check content links (also runs before every build)               |
| `npm run og:generate`    | Draw the social sharing images (also runs before every build)    |
| `npm run icons:generate` | Redraw the favicon and app icons from the logo mark              |
| `npm run db:migrate`     | Create the database tables (needs `DATABASE_URL`)                |

Before every build, `prebuild` also copies MapLibre's worker file to
`public/vendor/` and resizes photos into AVIF and WebP copies in `public/_img/`. Both folders, and
the sharing images in `public/og/`, are generated and not in git.

## Folder structure

```
content/              Site content, edited through Keystatic
db/schema.sql         Database tables: leads, contact messages, newsletter, WhatsApp group
docs/                 Guides for editors
e2e/                  Playwright end-to-end and accessibility tests
messages/             Interface texts: en.json, fr.json
public/               Static files served as-is (plus generated folders)
scripts/              Build helpers (images, maps, sharing images, content check)
src/
  app/
    [locale]/         All public pages, per language
    admin/            Password-protected list of leads/messages, CSV export
    api/              Form endpoints, admin login/export, Keystatic API
    keystatic/        Content editor UI
  components/         UI pieces: ui/, layout/, content/, forms/, map/, home/
  i18n/               Languages, translated paths, server-side Link
  lib/
    content/          Reading content (build time only)
    forms/            Form options, validation, consent texts (client + server)
    server/           Database, e-mail, rate limits, admin sessions
    seo/              Canonicals, hreflang, structured data, sharing images
keystatic.config.ts   The content model
```

## Deploying to Cloudflare

The site runs on Cloudflare Workers. [OpenNext](https://opennext.js.org/cloudflare)
turns the Next.js build into a Worker; settings are in `wrangler.jsonc` and
`open-next.config.ts`. All public pages are prerendered and served from the
Worker's static files; only the forms, admin and API run code per request.

| Setting (Workers → westofmauritius → Settings → Build) | Value                 |
| ------------------------------------------------------ | --------------------- |
| Build command                                          | `npm run build`       |
| Deploy command                                         | `npx wrangler deploy` |

Environment variables are listed in [.env.example](.env.example), split
into **build variables** (`NEXT_PUBLIC_*`, baked in at build time) and
**runtime secrets** (database, e-mail, admin).

### Going live

Set these once in Cloudflare (Workers → westofmauritius → Settings):

| What           | Where            | Value                                                               |
| -------------- | ---------------- | ------------------------------------------------------------------- |
| Forms database | Secret           | `DATABASE_URL` from neon.tech, then run `npm run db:migrate`        |
| E-mail         | Secrets          | `RESEND_API_KEY`, `EMAIL_FROM`, `LEAD_NOTIFY_EMAIL`, `IP_HASH_SALT` |
| Admin login    | Secrets          | `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`                            |
| Statistics     | Build variable   | `NEXT_PUBLIC_UMAMI_WEBSITE_ID` from cloud.umami.is                  |
| Domain         | Domains & Routes | Custom domains `westofmauritius.mu` and `www.westofmauritius.mu`    |
| E-mail domain  | Resend → Domains | Verify `westofmauritius.mu` (SPF, DKIM, DMARC records in DNS)       |

Without a database the forms say they are temporarily unavailable rather
than losing submissions. Search engines may only index the
`westofmauritius.mu` host; previews are blocked automatically.

The free Workers plan allows a 3 MB (compressed) Worker; this one is about
1.8 MB. Check with `npx wrangler deploy --dry-run` after adding dependencies
— DECISIONS.md lists what was moved out of the Worker and why.

## Languages and URLs

- Every page lives under `src/app/[locale]/` and is built once per language.
- `src/i18n/routing.ts` lists the languages and maps internal routes to public
  URLs, e.g. `/places/[slug]` → `/en/places/…` and `/fr/lieux/…`. It also
  explains how to add a language and how to move French to ouestmaurice.mu.
- Interface texts live in `messages/en.json` and `messages/fr.json`. The
  typecheck fails if French is missing a key that English has.
- In server components, link with `Link` from `@/i18n/Link` and the internal
  route (`href="/areas"`); it adds the language and the translated path
  without sending a translation library to the browser. Client components get
  ready-made paths as props (see `SiteHeader` → `MobileNav`).
- Use `localeAlternates()` from `src/lib/seo/alternates.ts` in each page's
  metadata for the canonical URL and hreflang tags.
- `src/middleware.ts` sends visitors from `/` to `/en` (or, once French is
  published, to the browser's language).
- French is hidden until its content is ready: one build variable,
  `NEXT_PUBLIC_FRENCH_PUBLISHED=true`, turns on the switcher, French
  hreflang, French sitemap entries and indexing (`src/i18n/published.ts`).

## Content

- Edited in Keystatic at `/keystatic`; stored as files in `content/`.
- Pages read content through `src/lib/content/` (`getAreas`, `getPlace` …),
  which returns flat, single-language objects.
- Anything invented for layout is marked as a **placeholder**: it shows a
  visible label, is `noindex`, has no structured data and stays out of the
  sitemap. Never invent reviews, ratings, prices, hours or facts about real
  businesses.
- Photos: store photographer, licence and source link with every photo
  (Keystatic fields "credit" and "credit link"); they are shown on the page.
  Current photos are from Wikimedia Commons (CC0 / CC BY / CC BY-SA).
- Places can be **featured** (discreet label) and have an **affiliate link**
  (`rel="sponsored"`, labelled for visitors).

## Forms and leads

- The lead form (`/en/living-in-the-west/enquire`), contact form, newsletter
  and WhatsApp group form (`/en/community`) share one pipeline (`src/lib/server/forms.ts`): validation (same rules in
  the browser and on the server, `src/lib/forms/validation.ts`), honeypot,
  timing check, rate limit per hashed IP, database, e-mail to the owner.
- Forms also work without JavaScript (normal post, then the thank-you page).
- Consent texts are versioned (`src/lib/forms/consent.ts`); the version is
  stored with each submission.
- Newsletter uses double opt-in, with an unsubscribe link from the first e-mail.
- `/admin` lists leads, messages, subscribers and WhatsApp requests with
  filters and CSV export, and counts conversions per page.
- Every CTA and form sends a `source` (the page or block it sits on). It is
  stored with each conversion and sent with the Umami event
  (`src/lib/analytics.ts`).
- Each area page has a "Living in X" section (`AreaLivingSection`); Living
  in the West articles can be questions or comparisons with a short answer,
  summary table, FAQ and sources. Author, byline and sources components
  live in `src/components/author/` and `src/components/content/`.

## SEO, accessibility and security

- `SITE_URL` (default `https://westofmauritius.mu`) is the single source
  for canonical URLs, sitemap, Open Graph, structured data and e-mail links.
- Only the `SITE_URL` host may be indexed: `worker.mjs` gives every other
  host (workers.dev previews) `X-Robots-Tag: noindex` and a block-all
  robots.txt, and redirects `www.` and the retired domain (see
  `src/lib/hosts.ts`). `SEARCH_INDEXING=off` blocks everything.
- RSS feed of the guides per language: `/en/feed.xml`, `/fr/feed.xml`.
- `sitemap.xml` (with hreflang), canonicals, unique titles and descriptions,
  structured data (`src/lib/seo/schema.ts`), sharing images per page.
- WCAG 2.2 AA: checked with axe on every page type in the e2e tests.
- Security headers and Content Security Policy:
  `src/lib/security-headers.ts`.

## Design system

- Colours, fonts and type sizes are tokens in `src/app/globals.css`.
- Newsreader (headlines, wordmark) and Figtree (text and interface), the
  Hiriketiya site's typefaces, self hosted by `next/font`
  (`src/lib/fonts.ts`). Type scale, `<Headline>` and `<Eyebrow>`:
  `docs/typography.md`.
- Review all components at **`/en/styleguide`** (internal, not indexed).
