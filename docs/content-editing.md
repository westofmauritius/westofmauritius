# Editing content

All places, areas, guides and "Live in the West" articles are edited in
**Keystatic**, a visual editor at `/keystatic`. Every save writes plain files
into `content/` (and photos into `public/images/`), so content is versioned in
git like the code. You never need to touch code to add or change content.

## What is where

| In the editor    | Files             | Shown on (from step …)      |
| ---------------- | ----------------- | --------------------------- |
| Areas            | `content/areas/`  | Area pages (5)              |
| Places           | `content/places/` | Place pages, area pages (5) |
| Guides           | `content/guides/` | Guide pages (6)             |
| Live in the West | `content/living/` | Live in the West (8)        |

Each entry has fields that are the same in every language (map position,
links, photos, "Featured") and a **Text per language** block with one part for
English and one for French.

## Rules

- **Placeholder**: tick it while an entry contains invented text. Placeholder
  entries show a visible label, are hidden from Google and left out of the
  sitemap. Untick it once the content is real.
- **Never invent reviews, ratings or facts about real businesses.**
- **Featured** puts a place first in lists with a "Featured" label. Set
  **Featured until** for paid placements; after that date the place is shown
  normally again (from the next build).
- **Affiliate link** becomes the main button on the place page and is marked
  as a partner link.
- **URL in this language** (guides): the address of the guide in that
  language, e.g. `meilleures-plages` gives `/fr/guides/plages/meilleures-plages`.
  Leave it empty to use the internal name. Two guides in the same category
  cannot share a URL (the content check stops the build).
- **French spacing**: type a normal space before `:` `;` `?` `!` in French;
  the site turns it into the non-breaking space French typography needs.
- **Map position**: in Google Maps, right-click the spot and click the
  coordinates to copy them (first number = latitude, second = longitude).
- **Details last checked**: update it whenever you confirm opening hours or
  links.

## Safety net

Before every build, `npm run content:check` checks things a single form
cannot: links to deleted areas or places (stops the build), map positions far
from the west coast, expired featured placements and texts that exist in one
language but not the other (warnings).

## Option 1: edit on your own computer (works now)

```bash
npm run dev
# open http://localhost:3000/keystatic, edit, save
git add content public/images && git commit -m "Update content" && git push
```

Cloudflare builds and publishes the site after the push.

## Option 2: edit on the live site (one-time setup)

With GitHub storage, you log in at `https://<your site>/keystatic` with
GitHub, and every save becomes a commit, which triggers a new Cloudflare
build. No local setup needed.

1. **Create a GitHub App** at GitHub → Settings → Developer settings →
   GitHub Apps → New GitHub App:
   - Homepage URL: your site, e.g. `https://westofmauritius.mu`
   - Callback URL: `https://<your site>/api/keystatic/github/oauth/callback`
   - Webhook: untick "Active"
   - Repository permissions: **Contents: Read and write**,
     **Pull requests: Read and write**, Metadata: Read-only
   - Create it, then **Generate a new client secret** and note the
     **Client ID**, the **client secret** and the app's **slug** (the last
     part of its public URL).
   - "Install App" → install it on `westofmauritius/westofmauritius`.
2. **Cloudflare → Workers → westofmauritius → Settings**:
   - Build variables:
     - `NEXT_PUBLIC_KEYSTATIC_STORAGE` = `github`
     - `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` = the app slug
   - Variables and secrets (runtime, type "Secret"):
     - `KEYSTATIC_GITHUB_CLIENT_ID`
     - `KEYSTATIC_GITHUB_CLIENT_SECRET`
     - `KEYSTATIC_SECRET` = a long random string (e.g. from
       `openssl rand -hex 32`)
3. Redeploy, open `/keystatic` and sign in with GitHub.

Without these settings the live site hides `/keystatic` (it would have
nowhere to save).
