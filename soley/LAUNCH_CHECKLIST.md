# Launch checklist

Everything the owner must do before Soley goes live. Nothing here can be
done in code alone. Tick each item.

## 1. Verify every fact in `content/facts.ts`

Every entry is marked `verify: true`. Check each one against its source,
add the exact article or page address (the file has the publisher's home
page where the brief gave no link), then tick "Checked against the source"
in **Admin → Facts** (or set `verify: false` in the file).

- [ ] `grantMaxMur`: grant of up to Rs 75,000 per household
      (L'Express via AllAfrica, 27 July 2026)
- [ ] `grantSharePercent`: 25 % of the cost of an approved system (same source)
- [ ] `grantLaunched`: scheme launched in July 2026 (same source)
- [ ] `dbmLoan`: households can borrow the rest from the Development Bank of
      Mauritius (the brief names no source: check with the DBM)
- [ ] `cebBuyback`: surplus electricity can be sold to the CEB (ceb.mu)
- [ ] `cebHybrid`: the CEB SSPV Scheme (Households) 2026 covers hybrid
      systems with a battery (ceb.mu)
- [ ] `cebUnregisteredWarning`: the CEB warned that unregistered systems may
      be disconnected (pv magazine, December 2025)
- [ ] Whether the grant applies to the **battery** part of a system too (the
      calculator assumes it does: PLAN.md, Assumption 4)

Calculator values (Admin → Settings):

- [ ] `tariffMurPerKwh`: Rs 9 per kWh (from the brief; CEB tariffs are tiered)
- [ ] `sunHoursPerDay`: 5
- [ ] `performanceRatio`: 0.78
- [ ] `costPerKwpMur`: **placeholder** Rs 60,000. Replace with an average of
      real quotes
- [ ] `batteryCostMur`: **placeholder** Rs 150,000. Replace
- [ ] `roofM2PerKwp`: **placeholder** 6 m². Ask an installer

Also check the texts that repeat these facts in plain words, in
`messages/en.json` and `messages/fr.json` (the grant guide steps, the start
page, the FAQ) and the three guides in `content/guides/`.

## 2. Legal review

The privacy policy, terms and cookie policy are **drafts**. A lawyer must
review them for the Mauritius Data Protection Act 2017 and the GDPR.

- [ ] Fill in every [bracketed] placeholder: the controller's legal name and
      address, retention periods, payment terms, liability, governing law
- [ ] Decide whether Soley must register with the **Data Protection Office
      of Mauritius**, and do it
- [ ] Sign data processing agreements with Supabase, Vercel, Resend,
      Cloudflare and Plausible, and confirm where each stores data
- [ ] Agree data-sharing terms with installers (they receive households'
      contact details)
- [ ] Have the consent wording in the quote form approved. If it changes,
      bump the version in `src/lib/consent.ts` (a test will remind you)
- [ ] Set `draft: false` in `content/legal/index.ts` for each approved page
- [ ] Replace "[OWNER'S LEGAL NAME OR COMPANY]" on the contact page
      (`contact.controller` in the messages files)
- [ ] Confirm that the wording never suggests Soley is official (no CEB or
      government logos are used anywhere)

## 3. Accounts and services

- [ ] Supabase project in an EU region, migrations applied, auth redirect
      URL and the magic link template set (README → Setting up Supabase)
- [ ] Vercel project with Root Directory `soley`, all environment variables
      set, `SOLEY_DEMO_MODE` **not** set
- [ ] `SESSION_SECRET` and `CRON_SECRET`: long random values
- [ ] Resend: sending domain verified, `EMAIL_FROM` set, Supabase SMTP set
      to Resend
- [ ] Cloudflare Turnstile keys for the domain
- [ ] Plausible site created, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` set
- [ ] `NEXT_PUBLIC_WHATSAPP_NUMBER` set to the owner's number
- [ ] `ADMIN_EMAILS` and `ADMIN_NOTIFICATION_EMAIL` set
- [ ] Database backups switched on in Supabase

## 4. Domain

- [ ] Choose and buy the domain (for example a `.mu` domain)
- [ ] Connect it in Vercel and set `NEXT_PUBLIC_SITE_URL`
- [ ] Submit `https://<domain>/sitemap.xml` in Google Search Console
- [ ] Add a Content-Security-Policy header once the final third parties
      are known (`src/lib/security-headers.ts`)

## 5. Real photos

- [ ] Photos of real Mauritian homes with solar panels, with permission,
      to replace the illustrated placeholder on the start page and the
      About page (`src/components/home/HouseIllustration.tsx`)
- [ ] Optional: photos of the team visiting installers, for the About page

## 6. The first vetted installers

- [ ] **Never load the demo data** (`npm run db:seed`) into the live
      database. Check that no row has `is_demo = true`
- [ ] Set the lead price in Admin → Settings
- [ ] Recruit the first installers in every district, including Rodrigues
- [ ] Visit each one, complete the checklist in Admin → Installers, and
      approve them
- [ ] Add each installer's description in English and French

## 7. Final test on the live site

- [ ] Send a real test request from a phone, in English and in French
- [ ] Check that the e-mails arrive (household, installers, admin) and that
      the sign-in link works when opened from the mail app
- [ ] Let a test installer accept and quote, compare, choose, and confirm
      the installation; then cancel the test request in Admin and delete
      the test household under "My data"
- [ ] Run Lighthouse on the live start page on mobile (target: 90+ in every
      category)
