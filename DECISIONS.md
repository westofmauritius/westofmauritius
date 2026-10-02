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
- **EB Garamond for headings.** Cormorant Garamond was the first choice, but
  its circumflexes clash with apostrophes in French ("l’île"). Body text
  uses the device's own sans-serif (see Performance).

## Maps

- **MapLibre GL + OpenFreeMap** (OpenStreetMap data) instead of Leaflet:
  vector tiles look sharper and calmer, the style can be tinted to the
  brand's lagoon colour, and it is free with no API key. The library is only
  downloaded when a map scrolls into view. Its worker file is copied to
  `public/vendor/` at build time because bundling breaks its default path.

## Testing

- **Vitest** for unit tests of plain logic, **Playwright + axe** for
  end-to-end and accessibility tests in a real browser.

## Start page

- **Illustrated hero instead of a stock photo.** Stock photos could not be
  verified to show the west coast of Mauritius, and the brief forbids images
  of the wrong place. The hero is an original SVG sunset scene (a few KB,
  sharp everywhere, no layout shift), with a separate tall framing for
  phones. A real photo can replace it any time in Keystatic → Start page.
- **Featured places lead the "Places to know" section**, topped up with
  other places, so paid placements get visibility on the start page without
  turning it into an ad grid.
- **Organization + WebSite structured data** on the start page.

## Places, gallery and images

- **A places page with search and filters** (`/en/places`, `/fr/lieux`). All
  cards are rendered on the server (good for SEO, works without JavaScript);
  a small client component hides non-matching ones. Filters are stored in
  the URL so results can be shared. A map of every place sits below the
  list; it only loads when scrolled into view.
- **Gallery in a native `<dialog>`**: the browser provides focus trapping,
  Escape and focus return; we add arrow keys and previous/next buttons.
- **Images resized at build time** with sharp into AVIF and WebP at fixed
  widths (`public/_img`, not in git), served through `<picture>`
  (`ResponsiveImage`): AVIF where supported (about a third smaller), WebP
  otherwise. Free, no per-request image service, and photos uploaded in full
  size through Keystatic still load quickly on phones. Encoding runs four
  photos in parallel; a full rebuild takes about a minute and a half.
- **Photo credits link to the source page** (Creative Commons licences
  require attribution); in the gallery viewer too.
- **Placeholder "photos" are SVGs labelled PLACEHOLDER PHOTO**, used only on
  one fictional place to exercise the gallery.

## Live in the West

- **Structure only, as briefed:** four buying schemes (PDS, IRS, RES, Smart
  City — names only), six area guides for buyers and two general guides,
  each with headed sections marked "To be written". No facts about rules,
  prices or taxes until the owner writes them.
- **Three audiences named up front** (moving from abroad, coming home,
  investing) so each reader recognises themselves before the content.
- **Enquiry calls to action on the paths that lead to buying:** Live in the
  West pages, every area page (with the area pre-selected) and every guide.
  Each link carries its position for conversion analytics.

## Forms, leads and e-mail

- **One validation module for browser and server** (`src/lib/forms`),
  returning error codes that each side translates. The server always
  re-validates.
- **Neon Postgres over HTTP** with plain parameterised SQL (no ORM): small
  bundle, works on Workers, no SQL injection. Schema in `db/schema.sql`.
- **In-memory store** for development and tests; a live site without a
  database answers "temporarily unavailable" instead of losing leads.
- **Spam protection without third parties:** honeypot field, a minimum fill
  time (set by JavaScript), and per-visitor rate limits stored as salted IP
  hashes (never IPs). Bots get a normal "ok" response.
- **Versioned consent texts** stored with each lead, naming the sharing with
  developers and agents explicitly (required for selling leads).
- **Double opt-in newsletter** with confirm and unsubscribe links.
- **Resend via plain fetch** (no SDK). E-mail failures never fail a form:
  the submission is saved first.
- **Forms work without JavaScript**: they post to the API and land on a
  thank-you page.
- **The live site's API cannot read `content/`**, so the content check writes
  `src/lib/generated/content-index.json` (area slugs) at build time.

## Admin

- **One password + signed session cookie**, no user accounts (brief: no
  accounts in v1). HMAC-SHA256 with `ADMIN_SESSION_SECRET`, HttpOnly,
  Secure, SameSite=Strict, 8 hours. Constant-time password check, 5
  attempts per 15 minutes. Admin is off unless both secrets are set.
- **Server-rendered tables with GET filters** (no client JavaScript), CSV
  export of exactly the filtered list. CSV is Excel-safe (BOM) and
  neutralises formula injection. The newsletter export contains only
  confirmed, still-subscribed addresses.

## SEO files, sharing images and security

- **Indexing is decided per request, by host** (superseded the earlier
  opt-in flag, see "Domain and indexing" below).
- **sitemap.xml lists every indexable page in both languages with hreflang
  alternates**; placeholder content and utility pages are left out.
- **Sharing images are drawn at build time** (`scripts/generate-og.tsx`,
  satori + resvg) into `public/og/`. Next.js's `opengraph-image` routes were
  tried first but added ~820 kB (gzip) of image engine to the Worker for
  images that never change between builds. Pages with a real photo share
  the photo instead (never an SVG, which social networks reject).
- **The map is loaded with `next/dynamic` and `ssr: false`**: otherwise the
  server bundle carried 1.1 MB of MapLibre it never runs. Worker size after
  these two changes: ~1.8 MB gzip.
- **Security headers** on every response (HSTS, nosniff, frame denial,
  referrer policy, permissions policy) and a Content-Security-Policy that
  lists the only outside hosts used (OpenFreeMap, Umami). `'unsafe-inline'`
  scripts are allowed because prerendered pages cannot carry per-request
  nonces; the editor (`/keystatic`) is exempt because it talks to GitHub.
  Static files get headers and long cache lifetimes from `public/_headers`.
- **Icons generated once** from one SVG (favicon.ico with 16/32/48 px,
  Apple touch icon, maskable PWA icons); the web manifest uses them.

## Privacy, analytics and text pages

- **No cookie banner, because the public site sets no cookies.** next-intl's
  language cookie is switched off (the language is in the URL), analytics
  is cookie-free, and maps set none. The only cookie is the admin session,
  which is strictly necessary.
- **Umami Cloud (free) for analytics**: cookieless, GDPR-friendly, and it
  supports custom events for conversion tracking (Cloudflare Web Analytics
  does not). Loaded only when configured; honours Do Not Track.
- **About and legal pages are Keystatic singletons** so the owner edits them
  without code. Legal drafts describe what the site actually does and are
  flagged as placeholders (noindex) until reviewed by a lawyer.
- **French typography is applied to rendered long text too**, not only
  titles.

## Accessibility and testing

- **Skip link, `aria-current` on the active section, focus management** in
  the mobile menu (focus moves in, Escape closes, focus returns), and
  reduced-motion support.
- **Automated WCAG 2.2 AA checks with axe** on every page type in both
  languages, run in the end-to-end suite. The map canvas is excluded from
  axe: it is supplementary (every place is also listed as text with links).
- **End-to-end tests run against a production build** with the in-memory
  store and throw-away admin credentials; each test uses its own fake IP so
  rate limits do not interfere.

## Performance

Measured with Lighthouse (mobile, median of three runs) on a production
build: performance 95–98 on text, area, place and guide pages, 92–94 on the
start page (large photo) and 93 on the areas overview (the map loads at
once); accessibility, best practices and SEO 100. What remains is mostly
React and Next.js's own JavaScript (~120 kB compressed). Pages marked as placeholders score lower on SEO on purpose
(they are noindex until real content replaces them).

- **No translation library in the browser on most pages.** Links are
  resolved on the server (`src/i18n/Link.tsx`, which wraps `next/link`), the
  menu and language switcher get ready-made paths, and the footer newsletter
  form gets its texts as props. Only form pages load the translation
  provider, and only with the form texts (`FormsProvider`).
- **The language switcher reads the page's own hreflang tags** after load;
  the server-rendered link is built from the routing table
  (`src/lib/localized-paths.ts`), so it also works without JavaScript.
- **One weight of EB Garamond (400, upright), preloaded**, and the device's
  own sans-serif for body text instead of Inter: Inter's 50 kB file was the
  largest remaining cost on photo pages, and a native font cannot shift the
  layout when it loads. Intro paragraphs use the serif at a larger size
  (`lead` utility), which keeps the magazine feel.
- **Text stays inside the Latin character set** (the content check warns
  otherwise): one "ᵉ" in "XVIIIᵉ" made French pages download an extra 86 kB
  font file. French ordinals are written XVIIIe, 1er.
- **Own `getPathname`** (`src/i18n/pathname.ts`) instead of next-intl's: the
  latter lives in a module that also exports next-intl's browser Link, which
  pulled ~14 kB of client code into every page.
- **The main image of a page is preloaded from the `<head>`** with high
  fetch priority; the gallery's full-size viewer image is only rendered when
  the viewer opens (otherwise React preloaded the 400 kB original).
- **Breadcrumbs never wrap**: the last item is cut with "…". A trail that
  wrapped in the fallback font but not in the web font shifted the page.
- **Next's `inlineCss` option was tried and dropped.** It made no measurable
  difference to the scores but added ~800 kB (gzip) to the Cloudflare Worker,
  which has a 3 MB limit on the free plan. The Worker is ~1.86 MB now.

## Real content (October 2026)

- **Areas, public places and four guides are real content**, written from
  well-established facts checked against Wikipedia (figures such as heights,
  dates and areas) and OpenStreetMap (coordinates). Only public places and
  natural sites were added: no businesses, no opening hours, prices,
  ratings or reviews. Paid sites say "check opening times before you go".
- **Restaurants and shops stay fictional placeholders** until the owner adds
  real ones he can vouch for; the restaurant and shopping guides likewise.
  Live in the West stays structure-only, as decided.
- **Photos come from Wikimedia Commons** under CC0, CC BY or CC BY-SA, each
  checked by eye to show the place it illustrates; photographer, licence and
  a link to the source are stored with each photo and shown on the page.
  The brief allowed Unsplash photos that truly show Mauritius; Commons has
  far more verifiably located photos of these exact places, with clear
  licences.
- **Places have an optional name per language** ("Le Morne public beach" /
  "Plage publique du Morne"); addresses are kept to place names, which read
  the same in both languages.
- **An RSS feed per language** (`/en/feed.xml`, `/fr/feed.xml`) lists the
  guides, linked from every page's `<head>`.
- **A sixth guide theme, "Plan your trip"** (`practical`; `/en/guides/plan-your-trip`,
  `/fr/guides/preparer-son-voyage`): seasons, airport, entry, getting around,
  money, language, plugs, time zone and emergency numbers. It has no places,
  so its theme page lists guides only. Linked from the footer.
- **More real content:** three more public places (La Prairie, Wolmar,
  Alexandra Falls) and guides on hiking and a day at Le Morne.
- **The About page is real**: it describes what the site covers, how facts
  are checked, how featured places and partner links are marked, and what
  happens to Live in the West enquiries — all things the site actually does.
  The owner can add his own story.
- **Sharing images use the page's main photo** (darkened top and bottom for
  the brand and title) and are JPEGs; pages without a photo keep the
  gradient.
- **Places have an optional schema.org "kind"** (Park, Mountain, Museum,
  monument …) so search engines get more than "TouristAttraction".
- **Real content is listed before placeholder examples** everywhere (guides
  and places).

## Owner's style rules (October 2026)

- **Brand name is "West of Mauritius"** (French edition still "Ouest
  Maurice"). Consent texts mentioning the brand got new versions
  (`lead-2026-10b`, `newsletter-2026-10b`); the old ones stay, as records of
  what earlier visitors agreed to.
- **No dashes or hyphens in visible text.** The owner finds that em dashes
  and hyphenated words read as machine-written. Sentences were rewritten
  (commas, colons, full stops, parentheses), ranges use "to" / "à"
  ("Tue to Sat", "€300,000 to €600,000"), and French words that need a
  hyphen by spelling ("au-dessus", "sud-ouest", "Port-Louis") were avoided by
  rephrasing; "email" replaces "e-mail". URLs keep their hyphens (they are
  addresses, not text). An end-to-end test checks key pages.
- **No credits on the photos.** Creative Commons licences still require
  attribution, so every photo is credited on one page (`/credits`, built
  from the content) linked from the footer of every page.
- **Every place and guide has a photo.** Where no free photo of the exact
  spot exists (the Slave Route Monument, La Prairie), the photo shows the
  setting and the alt text says so honestly. Fictional placeholder
  businesses show landscapes of their area, never a made-up storefront.
- **Cards show photo, label and title only**, no summary; section intros
  on the start page and theme descriptions are gone. Card lists show two
  per row on phones and four on large screens, so more places fit on
  screen. The start page gained a map of every place.
- **The logo mark is the Rempart**, the peak in the start page photo,
  traced from it, with the setting sun behind and a lagoon line below. It
  lives in one file (`src/lib/brand-mark.ts`) used by the header and footer,
  the sharing images and the icons (`npm run icons:generate`).

## Domain and indexing (October 2026)

- **Domain westofmauritius.mu, brand "West of Mauritius".** `SITE_URL` is
  the only place the address is set, and it defaults to the production
  domain: canonical URLs on any copy of the site (previews, local builds)
  point at the real domain, which is what search engines should see.
- **Indexing is decided per request, from the host**, in a thin Worker entry
  (`worker.mjs`, logic in `src/lib/hosts.ts`, unit tested). The same build is
  served on the production domain and on workers.dev, so a build-time flag
  could not tell them apart and one mistaken variable would have exposed
  (or hidden) the whole site. Now only the `SITE_URL` host is indexable;
  every other host gets `X-Robots-Tag: noindex, nofollow` and a block-all
  robots.txt. `SEARCH_INDEXING=off` is the emergency switch for everything.
  Static files (images, scripts) are served by Cloudflare before the Worker
  and are not blocked on previews; they are only reachable through pages
  that are themselves noindex, so the risk is negligible.
- **`www.` and the retired domain westmauritius.mu redirect (301)** to the
  canonical host, keeping the path; this is the only place the old domain
  appears in code.
- **The no-JavaScript form redirect stays on the request's own host**, so a
  preview never sends people to production.
- **Consent texts were re-versioned** with the new name; the old versions
  were deleted, as the site was never live and nobody agreed to them.

## English first, French hidden (October 2026)

- French stays fully built (routes, messages, content fields) so nothing has
  to be re-architected later, but it is hidden behind one build variable,
  `NEXT_PUBLIC_FRENCH_PUBLISHED` (`src/i18n/published.ts`).
- While hidden: no language switcher, `/` always opens `/en` (locale
  detection off), French hreflang tags and sitemap entries are omitted, and
  every French page is `noindex, nofollow` from the locale layout. French
  translation gaps are no longer reported by the content check.
- Why a build variable rather than deleting French: untranslated or
  half-translated French pages must never be indexed, yet switching on later
  should be a one-line change with no code edits.
- French pages still render if someone types the URL; their canonical points
  to themselves. That is harmless with noindex and keeps the switch trivial.

## Local voice: author, dates and sources (October 2026)

- The site's edge over big travel sites is that a Mauritian writes it, so
  that is made visible everywhere: the start page's first line and the
  footer say "A Mauritian's guide to the west coast", a "Who writes this"
  band introduces the author, and every guide and article carries a byline.
- One author, one Keystatic singleton (Site → Author) rather than an
  authors collection: there is one writer today, and a singleton keeps the
  editor simple. If more writers join, turn it into a collection and add an
  author field to guides.
- The author page lives at `/en/about/oliver`. A name in the URL reads as a
  real person to visitors and search engines. It starts as a placeholder
  (noindex, short bio hidden on the start page) until Oliver writes it.
- Byline: name (linked with `rel="author"`), one line of role, published
  date and "Last updated" (falls back to the published date, so it always
  shows). Dates are British style ("1 October 2026"), in Mauritius time.
- Sources: a `sources` list (title, publisher, link, checked on) on guides,
  areas and Live in the West articles, shown as a numbered list at the end
  of the page and as `citation` in the Article data. Existing guides list
  the Wikipedia and UNESCO pages their facts were checked against.
- Structured data uses fixed ids: `/#organization` (publisher, with
  `founder`) and `/#author` (Person, Mauritian, linked to the author page).
  Every Article points at both, so search engines tie all articles to one
  named person. The author page adds a ProfilePage once it is not a
  placeholder.

## Area pages: Living here (October 2026)

- Every area page now has a "Living in X" section below the travel guide,
  in the order a person deciding to move needs it: a short answer first,
  daily life, pros and cons, a costs table, schools, healthcare and getting
  around, questions and answers, then two next steps (a free personal
  shortlist with the area filled in, or the newsletter).
- These live on the area pages rather than separate "Living in X" pages, so
  one strong page per place ranks for both "Tamarin" and "living in
  Tamarin" instead of two pages competing (see SEO.md).
- All of it is a clearly marked placeholder: no figures, prices, school
  names, hospitals or drive times were invented. Cost rows exist with their
  labels, show "Not confirmed yet" and only display an amount with a date
  and a source. The questions are real questions people search for; the
  answers are placeholders.
- While a section is a placeholder it carries a visible notice, its text is
  `data-nosnippet` and no FAQPage data is emitted. Once Oliver fills it in
  and unticks "Placeholder", the FAQ becomes FAQPage structured data.
- The accordion is native `<details>`: keyboard and screen reader friendly
  and no JavaScript. The costs table turns into cards on phones instead of
  scrolling sideways.
- The area page itself now shows the byline and the sources its facts were
  checked against.
