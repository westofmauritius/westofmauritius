# Soley

Soley ("sol" in Mauritian Creole) is an independent service that helps
households in Mauritius get rooftop solar safely. A household works out its
savings and the government grant, sends one short request, and receives up
to three quotes from installers that Soley has vetted in person. The
household compares the quotes side by side and chooses one. Households pay
nothing; installers pay a fee for each request they accept.

- The plan, the data model, the assumptions and the progress per milestone:
  [PLAN.md](PLAN.md)
- Conventions for working in the code: [CLAUDE.md](CLAUDE.md)
- Everything the owner must do before launch:
  [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md)

> **Where this lives.** Soley is a self-contained app in the `soley/`
> folder of the `westofmauritius` repository, next to the West of Mauritius
> site (which Cloudflare deploys from `main`). Nothing outside `soley/` and
> `.github/workflows/soley.yml` belongs to Soley. It can be moved to its own
> repository as is.

## Stack

| Part        | Tool                                                                  |
| ----------- | --------------------------------------------------------------------- |
| Framework   | Next.js 16 (App Router), React 19, strict TypeScript                  |
| Styling     | Tailwind CSS v4, design tokens in `src/app/globals.css`               |
| Components  | Own small library in `src/components/ui`                              |
| Languages   | next-intl: `/en/…` and `/fr/…` with translated paths and hreflang     |
| Database    | Supabase Postgres, Row Level Security on every table                  |
| Sign-in     | Supabase Auth magic links (e-mail, no passwords)                      |
| Files       | Supabase Storage, private bucket for installer documents              |
| Validation  | Zod, the same schemas on the client and the server                    |
| E-mail      | Resend                                                                |
| Bot / abuse | Cloudflare Turnstile and a database rate limit on every form          |
| Statistics  | Plausible, only after consent                                         |
| Content     | MDX guides and legal pages in `content/`, facts in `content/facts.ts` |
| Hosting     | Vercel (with a daily cron for reminders)                              |
| CI          | GitHub Actions (`.github/workflows/soley.yml`)                        |
| Tests       | Vitest (unit, incl. the database on PGlite), Playwright + axe         |

## Getting started

Requires Node.js 22 (see `.nvmrc`).

```bash
cd soley
npm install
npm run dev            # http://localhost:3000
```

Without Supabase variables, the app runs on an **in-memory demo store**
filled with clearly marked demo data (`src/lib/demo/seed-data.ts`), and
e-mails are not sent but kept in a development outbox. Data is lost when the
server restarts.

**Signing in locally:** go to `/en/sign-in`, enter one of the demo
addresses below, then open
[http://localhost:3000/api/dev/outbox](http://localhost:3000/api/dev/outbox)
and follow the sign-in link in the newest e-mail.

| Role                | Demo e-mail                       |
| ------------------- | --------------------------------- |
| Admin               | `admin@example.com`               |
| Household           | `household@example.com`           |
| Installer           | `installer.north@example.com`     |
| Installer (vetting) | `installer.applicant@example.com` |

The outbox and the demo store exist only in development and in demo builds
(`SOLEY_DEMO_MODE=true`). A production build without Supabase refuses to
start rather than lose data.

## Scripts

| Command              | What it does                                                    |
| -------------------- | --------------------------------------------------------------- |
| `npm run dev`        | Development server                                              |
| `npm run build`      | Production build                                                |
| `npm run start`      | Serve the production build                                      |
| `npm run check`      | Lint, typecheck, format check and unit tests: run before commit |
| `npm run test`       | Unit tests (Vitest), including the migrations on PGlite         |
| `npm run test:e2e`   | Demo build, then end-to-end and accessibility tests             |
| `npm run build:demo` | Production build in demo mode (used by the e2e tests)           |
| `npm run db:seed`    | Load demo data into a **staging** Supabase project              |
| `npm run format`     | Fix formatting                                                  |

## Environment variables

All variables are listed with explanations in [.env.example](.env.example).
Copy it to `.env.local` for local work. Never commit real values.

| Variable                                                 | Needed for                                                  |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                   | Canonical URLs, sitemap, links in e-mails                   |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`                            | The floating WhatsApp button (hidden when empty)            |
| `NEXT_PUBLIC_CONTACT_EMAIL`                              | Contact page and e-mail footers                             |
| `NEXT_PUBLIC_SUPABASE_URL`                               | Database, sign-in, storage                                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                          | Sign-in (public key; RLS protects the data)                 |
| `SUPABASE_SERVICE_ROLE_KEY`                              | Server-side data access. Secret, server only                |
| `ADMIN_EMAILS`                                           | Comma-separated admin e-mails (bootstrap)                   |
| `SESSION_SECRET`                                         | Signing tokens (32+ random characters)                      |
| `RESEND_API_KEY`, `EMAIL_FROM`                           | Sending e-mail                                              |
| `ADMIN_NOTIFICATION_EMAIL`                               | Where new requests, applications and contact messages go    |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Bot protection on public forms                              |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`                           | Statistics after consent (empty = no statistics, no banner) |
| `CRON_SECRET`                                            | Protects the daily reminder job                             |
| `SOLEY_DEMO_MODE`                                        | Demo store in a production build. Never on the live site    |

## Setting up Supabase

1. Create a Supabase project **in an EU region** (the controller is in
   Sweden; see the privacy policy).
2. Apply the migrations in `supabase/migrations`, either with the Supabase
   CLI (`supabase link` then `supabase db push`) or by pasting them in order
   into the SQL editor. They create every table with Row Level Security,
   the rate-limit function and the private `installer-documents` bucket.
3. Add the first admins: set `ADMIN_EMAILS`, or insert rows into the
   `admins` table.
4. **Authentication → URL configuration:** set the site URL to the live
   domain and add `https://<domain>/auth/callback` to the redirect URLs.
5. **Authentication → E-mail templates → Magic link:** people often open the
   e-mail on another app than the browser they started in, so use a link
   that does not depend on the browser:

   ```html
   <p>Hello / Bonjour,</p>
   <p>Sign in to Soley / Connectez-vous à Soley :</p>
   <p>
     <a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email"
       >Sign in / Se connecter</a
     >
   </p>
   <p>
     The link works once and expires in one hour. / Le lien fonctionne une seule
     fois et expire au bout d’une heure.
   </p>
   ```

6. **Authentication → SMTP:** use Resend's SMTP settings so sign-in e-mails
   come from the Soley domain.
7. Do **not** run `npm run db:seed` on the live project: it loads demo
   companies and reviews. It refuses to run unless
   `SOLEY_ALLOW_DEMO_SEED=true`, and is meant for a staging project.

Unit tests apply the same migrations to an in-process Postgres (PGlite) and
check the RLS rules (`supabase/tests/migrations.test.ts`).

## Deploying to Vercel

1. Import the repository in Vercel and set **Root Directory** to `soley`.
   Vercel detects Next.js; `vercel.json` sets the region (Frankfurt, close
   to an EU Supabase project) and the daily reminder job.
2. Add the environment variables (Production and Preview). Preview
   deployments are never indexed by search engines.
3. Set `CRON_SECRET`: Vercel sends it to `/api/cron/reminders` every day at
   05:00 UTC (09:00 in Mauritius).
4. Add the domain and set `NEXT_PUBLIC_SITE_URL` to it.
5. In Resend, verify the sending domain; in Cloudflare, create a Turnstile
   widget for the domain; in Plausible, add the site.

GitHub Actions runs `npm run check`, the build and all end-to-end tests on
every push that touches `soley/`.

## How it works

- **Data access** goes through `getDb()` (`src/lib/data`), which returns the
  Supabase adapter in production or the memory adapter in development and
  tests. Business logic lives in `src/lib/services` and is written once.
- **Authorization** happens on the server: every page in a signed-in area
  calls `requireAdmin`, `requireInstaller` or `requireHousehold`, and every
  server action checks the caller first. RLS policies are a second line of
  defence.
- **Pure logic** with unit tests: `src/lib/calculator.ts` (savings and
  grant), `src/lib/routing.ts` (which installers get a request),
  `src/lib/compare.ts` (quote comparison), `src/lib/metrics.ts`,
  `src/lib/reminders.ts`, `src/lib/csv.ts` and the Zod schemas.
- **Facts** (grant amount, share, calculator values) start from
  `content/facts.ts`, each with its source and `verify: true`. Admins change
  them in Admin → Facts and Admin → Settings without a deployment; the public
  pages update within a few minutes.
- **Consent** to share a request with installers is logged with the text
  version and time. A unit test ties each consent text to its version, so a
  changed text cannot go out without a new version.

## Editing content

- **Texts on the site:** `messages/en.json` and `messages/fr.json`. Both
  must have the same keys (a unit test checks this).
- **Guides:** MDX files in `content/guides/<language>/<slug>.mdx`, listed
  with their titles, slugs and review date in `content/guides/index.ts`.
- **Legal pages:** `content/legal/<language>/*.mdx`. Set `draft: false` in
  `content/legal/index.ts` once a lawyer has approved them.
- **Facts and calculator values:** in the admin panel, or the defaults in
  `content/facts.ts`.

## Adding a language

Mauritian Creole (`mfe`) is planned. To add it (or any language):

1. Add `"mfe"` to `locales` in `src/i18n/routing.ts`, and an `mfe` path to
   every entry in `pathnames` (TypeScript lists every missing one).
2. Copy `messages/en.json` to `messages/mfe.json`, translate it, and
   register it in `src/i18n/request.ts`. Add the language's name under
   `language` in every messages file, and extend the language test
   (`src/i18n/messages.test.ts`) to the new file.
3. Add `mfe` versions of the guides (MDX files plus entries in
   `content/guides/index.ts`) and of the legal pages
   (`content/legal/index.ts`). Guides without a version in a language are
   simply not listed in it.
4. Number and date formats: `src/lib/format.ts` uses `<language>-MU`; check
   that the result reads well.
5. Add the language to the proxy's signed-in path pattern in
   `src/proxy.ts` and to the Open Graph locale in `src/lib/seo.ts`.
6. Run `npm run check` and `npm run test:e2e`.

## Tests

- `npm run test`: unit tests for the calculator, routing, comparison, reminders,
  validation, consent versions, facts, guides, privacy, tokens, CSV,
  translations, and the SQL migrations with their RLS policies on PGlite.
- `npm run test:e2e`: the full flows on a phone-sized browser (and SEO and
  accessibility checks on desktop too): a household requests quotes in
  French, three installers accept and quote, the household compares and
  chooses; installer application and vetting; manual routing, invoices and
  CSV; reviews and moderation; data export and deletion; hreflang, sitemap
  and structured data; axe checks for WCAG 2.2 AA on every page type.
