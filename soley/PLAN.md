# Soley: build plan

Soley ("sol" in Mauritian Creole) is an independent comparison service that
helps households in Mauritius get rooftop solar safely. A household uses the
calculator, sends one short request, and Soley passes it to at most three
vetted installers in the right region. The household compares the quotes side by
side and picks one. Households pay nothing. Installers pay a fee for each
qualified lead, invoiced by hand from the admin panel (version 1 has no
payment system).

This file is the plan. Conventions for working in the code are in
[CLAUDE.md](CLAUDE.md), and setup is in [README.md](README.md).

## Architecture

```
soley/
├── content/            facts.ts (sourced facts, verify: true), guides/*.mdx
├── messages/           en.json, fr.json (all UI text)
├── src/
│   ├── app/[locale]/   public site, household account, installer portal, admin
│   ├── app/api/        route handlers (auth callback, CSV export, dev outbox)
│   ├── components/ui/  small component library (Button, Field, Card…)
│   ├── components/     feature components (calculator, quote form, layout)
│   ├── i18n/           next-intl routing with translated paths
│   ├── lib/            pure logic (calculator, routing, validation) + services
│   │   ├── data/       Store interface + memory and Supabase adapters
│   │   ├── auth/       magic link sessions (Supabase Auth or demo adapter)
│   │   └── email/      Resend transport + localized templates
│   └── proxy.ts        language routing (Next 16 "proxy", formerly middleware)
├── supabase/migrations SQL schema with Row Level Security on every table
├── scripts/seed.ts     demo data (every row marked "Demo")
└── e2e/                Playwright end-to-end and accessibility tests
```

- **Next.js 16 App Router, strict TypeScript, Tailwind v4.** Server
  components by default; client components only for interactive parts
  (calculator, multi-step form, language switcher, consent banner).
- **One data layer, two adapters.** All pages call `getStore()`, which
  returns either the Supabase adapter (production) or an in-memory adapter
  seeded with demo data (local development, CI and e2e tests without a
  Supabase project). Both implement the same `Store` interface, so the code
  above it does not know which one runs. The memory adapter refuses to run
  in production unless `SOLEY_DEMO_MODE=true` is set on purpose.
- **Authorization lives on the server.** The server talks to Supabase with
  the service role key (in `server-only` modules) and checks the role on
  every action. Row Level Security is still enabled on every table, with
  policies scoped to `auth.uid()`, so the public anon key can never read
  another person's data even if it leaks or a page is written wrongly.
- **Roles by e-mail.** A person signs in with a magic link. Their role is
  derived from their e-mail: admin (in the `admins` table or `ADMIN_EMAILS`),
  installer (contact e-mail of an installer), household (e-mail on a quote
  request). One e-mail can hold several roles.
- **Validation with Zod** in `src/lib/validation/`, shared by the client
  forms and the server actions.
- **Abuse protection:** every public form checks Cloudflare Turnstile and a
  rate limit (Postgres function in production, memory in development).
- **E-mail with Resend** over its REST API. Without an API key, mails go to
  a development outbox (`/api/dev/outbox`) that the e2e tests read.
- **Analytics with Plausible**, loaded only after the visitor agrees in the
  consent banner.

## Data model

All tables are in `supabase/migrations`. Every table has RLS enabled.

| Table                 | Purpose                                                              |
| --------------------- | -------------------------------------------------------------------- |
| `households`          | One per e-mail: name, phone, WhatsApp, language, auth user id        |
| `quote_requests`      | House, roof, usage, region, timeline, financing, status              |
| `consents`            | What was agreed, text version, timestamp (per request)               |
| `installers`          | Company, contact, status (applied → approved / rejected), cap        |
| `installer_regions`   | Which regions an installer covers                                    |
| `installer_documents` | Uploaded certificates and insurance (private storage bucket)         |
| `installer_reviews`   | Vetting checklist and site visit result (one per installer)          |
| `lead_assignments`    | Request ↔ installer, status, response time, fee snapshot             |
| `quotes`              | Structured quote: price, kWp, panels, inverter, battery, warranties… |
| `reviews`             | Verified household reviews, moderation status                        |
| `invoices`            | Per installer and month, total, status (draft / sent / paid)         |
| `facts`               | Admin overrides of `content/facts.ts`                                |
| `calculator_settings` | Calculator defaults (tariff, sun hours, cost per kWp…)               |
| `platform_settings`   | Lead price, default monthly cap                                      |
| `admin_notes`         | Notes on installers or requests (site visits, calls)                 |
| `admins`              | E-mails with admin rights                                            |
| `rate_limits`         | Counters for the rate limit function                                 |

Request status: `new → assigned → quoted → chosen → installed`, or
`cancelled`. Assignment status: `offered → accepted → quoted → won / lost`,
or `declined`. A lead becomes **qualified** (billable) when an installer
accepts it; the fee at that moment is stored on the assignment.

## Pages

Public (each with an English and a French URL):

| Internal route          | English                | French                        |
| ----------------------- | ---------------------- | ----------------------------- |
| `/`                     | `/en`                  | `/fr`                         |
| `/calculator`           | `/en/calculator`       | `/fr/calculateur`             |
| `/get-quotes`           | `/en/get-quotes`       | `/fr/obtenir-des-devis`       |
| `/grant-guide`          | `/en/grant-guide`      | `/fr/guide-subvention`        |
| `/installers`           | `/en/installers`       | `/fr/installateurs`           |
| `/installers/[slug]`    | `/en/installers/…`     | `/fr/installateurs/…`         |
| `/guides`, `/guides/…`  | `/en/guides/…`         | `/fr/guides/…` (French slugs) |
| `/for-installers`       | `/en/for-installers`   | `/fr/pour-installateurs`      |
| `/for-installers/apply` | `/en/for-installers/…` | `/fr/pour-installateurs/…`    |
| `/about`, `/contact`    | `/en/about`…           | `/fr/a-propos`, `/fr/contact` |
| `/privacy`, `/terms`    | `/en/privacy`…         | `/fr/confidentialite`…        |
| `/cookies`              | `/en/cookies`          | `/fr/cookies`                 |
| `/sign-in`              | `/en/sign-in`          | `/fr/connexion`               |

Signed in:

- Household: `/account` (requests and status), `/account/requests/[id]`
  (quote comparison, choose, review), `/account/privacy` (export, delete).
- Installer: `/portal` (inbox), `/portal/leads/[id]` (accept, decline,
  quote), `/portal/billing`, `/portal/profile`.
- Admin: `/admin` (dashboard), `/admin/installers` (vetting queue),
  `/admin/requests` (routing), `/admin/invoices` (+ CSV), `/admin/reviews`,
  `/admin/facts`, `/admin/settings`.

## Milestones

1. **Foundation:** project, design tokens, UI kit, i18n, layout, start page.
2. **Calculator** (`src/lib/calculator.ts`) with unit tests.
3. **Quote form, database and e-mail:** migrations, data layer, multi-step
   form with local draft, consent log, Turnstile, rate limit, e-mails.
4. **Installer portal and application:** apply with documents, magic link
   sign-in, inbox, accept or decline, structured quote.
5. **Routing and admin:** `src/lib/routing.ts` with tests, vetting queue,
   manual assignment, invoices and CSV, facts and settings editors,
   dashboard.
6. **Quote comparison, choice and reviews.**
7. **Guides, grant guide and SEO:** MDX guides, structured data, sitemap,
   robots, Open Graph images.
8. **Legal pages, consent, export and deletion.**
9. **End-to-end tests, performance, accessibility and deployment:**
   Playwright flows, axe checks, GitHub Actions, Vercel config, README and
   LAUNCH_CHECKLIST.md.

## Assumptions

Decisions made where the brief left room. Each is the simplest reasonable
choice and can be changed.

1. **Soley lives in `soley/` inside the existing repository.** The repository
   already holds the live West of Mauritius site, which Cloudflare deploys
   from `main`. Soley is a separate product with its own stack (Vercel,
   Supabase), so it is a self-contained app in its own folder and is
   **not merged into `main`** until the owner decides. On Vercel, set the
   project's Root Directory to `soley`. It can move to its own repository
   with no code changes.
2. **Hosting is Vercel, as the brief says**, not Cloudflare like the
   existing site.
3. **Installation cost per kWp, battery cost and roof area per kWp are
   placeholders.** The brief makes the cost per kWp a setting but gives no
   value. The defaults in `content/facts.ts` are marked as placeholders with
   `verify: true`, and the calculator labels every result as an estimate. The
   owner sets real values in Admin → Settings.
4. **The grant is calculated on the whole system price, battery included**
   (25 %, capped at MUR 75,000). Whether a battery counts is listed for the
   owner to check.
5. **Savings count only the electricity the household uses itself.** Selling
   surplus to the CEB is mentioned but not given a value, because no export
   tariff was provided. This makes the estimate conservative.
6. **A lead is billable when the installer accepts it.** Declined leads cost
   nothing. The price is taken from Admin → Settings at that moment and stored
   on the assignment, so a later price change does not alter past invoices.
7. **Routing score:** among eligible installers (approved, active, covering
   the region, under their monthly cap), rank by a score of 50 % response speed
   and 50 % rating. Installers with no history get a neutral score. To rotate
   fairly, the installer who was offered a lead longest ago wins a tie
   within 0.1 of a score point.
8. **Requests are routed automatically when they arrive**, unless no
   installer is eligible. Then they wait in the admin queue. Admin can always
   add or remove installers by hand.
9. **Magic link sign-in for all roles.** A household's account is its e-mail
   address. Installers sign in with the contact e-mail from their
   application. Admins are listed in `ADMIN_EMAILS` and the `admins` table.
10. **Reviews:** only a household whose request reached "installed" with
    that installer can review it, once, and admin approves a review before it
    is shown.
11. **Mauritian Creole** is planned but not shipped: the locale code is
    `mfe`, and README explains how to add it.
12. **Analytics consent** is stored in the visitor's browser only. The
    consent that must be provable (sharing data with installers) is logged on
    the server with a timestamp and a text version.
13. **Deleting a household** erases the person's personal data (name, phone,
    e-mail, address details) and keeps anonymous request rows, because
    invoices already sent refer to them.
14. **Photos:** until the owner supplies real photos of Mauritian homes, the
    site shows clearly labelled illustrated placeholders instead of stock
    photos.
15. **Admin pages are translated too** (the family on Mauritius may prefer
    French), but they keep the same `/admin` paths in both languages.

## Progress

### Milestone 1: Foundation (done)

Built: the Next.js 16 project in `soley/` with design tokens, a small UI kit
(`src/components/ui`), English and French with translated URLs, header,
mobile menu, footer with the independence notice, language switcher
(driven by hreflang), floating WhatsApp button, analytics consent banner
(Plausible only after a yes), the start page with Organization and FAQPage
structured data, and `content/facts.ts` with every sourced fact.
Left for later: the calculator on the start page (milestone 2).

### Milestone 2: Calculator (done)

Built: `src/lib/calculator.ts` (pure function, 10 unit tests) and the
calculator form with live results, on the start page right below the
promise and on its own page (`/en/calculator`, `/fr/calculateur`), which
lists every assumption with a "provisional average" label on placeholders.
The "Get quotes" button carries the answers over to the quote form.
Left for later: settings from the database (milestone 3/5).

### Milestone 3: Quote form, database and e-mail (done)

Built: the Supabase migration (all tables, RLS on every table, a rate
limit function, a private document bucket), tested on an in-process
Postgres (PGlite) including the RLS rules; the data layer with Supabase
and memory adapters; clearly marked demo data and `npm run db:seed`; Zod
validation shared by client and server; the five-step quote form with a
local draft, error summary, Turnstile, a rate limit and a consent log
(text version + timestamp, guarded by a test); e-mails through Resend
(or the development outbox); and automatic routing to up to three
installers (`src/lib/routing.ts`, 11 tests), brought forward from
milestone 5 because a new request needs it.
Left for later: sign-in and the household's account (milestones 4 and 6).

### Milestone 4: Installer portal and application (done)

Built: magic-link sign-in for all roles (Supabase Auth in production, a
signed demo link and cookie in demo mode), session refresh in the proxy,
role checks (`requireAdmin`, `requireInstaller`, `forbidden()`); the
installer sales page with the live lead price; the partner application
with regions, documents (private storage, 4 MB total because of Vercel's
request limit) and a logged consent to the partner terms; the portal with
an inbox, lead page (contact details only after accepting), accept or
decline with a reason, the structured quote form, billing with results,
and a profile page (pause, monthly cap, regions, language, more
documents). Playwright end-to-end tests for both installer flows.

### Milestone 5: Routing and admin panel (done)

Built: the admin panel (`/en/admin`, same paths in French) with an
overview (to-do list, requests per week, response time, share of quoted
requests where a quote was chosen, billed amount per request), the vetting
queue with a six-point checklist that must be complete before approval,
site visit notes and document downloads, request routing (the routing
rules' suggestion with scores and reasons for skipped installers, manual
assignment, withdraw, cancel, mark installed), invoices per installer and
month with a CSV export (one row per accepted request), review moderation,
and editors for facts and calculator/platform settings that update the
public site without a deployment. Admin actions all check the role on the
server. Dashboard metrics and CSV are unit tested; admin flows have
end-to-end tests. Also fixed: the header overflowed on 390 px phones.

Interpretation: "cost per request" on the dashboard is shown as the
average amount billed to installers per request received, since Soley
has no other cost data in version 1.

### Milestone 6: Quote comparison, choice and reviews (done)

Built: the household account (requests with status and progress), the
side-by-side comparison (one column per installer, sticky row labels on
phones, "Best" labels per row, price after the grant, price per kWp and a
payback estimate from the household's own bill; `src/lib/compare.ts` is
tested), choosing a quote (the other installers are told), closing a
request when none suits, confirming the installation, and reviews that only
a verified customer can write, once, after installation, and that are
published only after moderation. The public installer directory and
profiles (approved installers only, "Reviewed by Soley" badge, districts,
certificates, years, reviews, LocalBusiness structured data). End-to-end
tests: the whole journey in French on a phone (request, three installers
quote, compare, choose), the review and moderation loop, and that a
household cannot open another household's request.
