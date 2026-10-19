@../AGENTS.md

# Soley: project conventions

Soley is a separate app inside this repository (see PLAN.md, Assumptions 1).
Everything here runs from the `soley/` folder. The parent folder's
CLAUDE.md is about the West of Mauritius site; its deploy rule
(fast-forward `main`) does **not** apply to Soley until the owner decides
how Soley is deployed.

## Before every commit

```bash
npm run check   # lint, typecheck, format check, unit tests
npm run build
```

Never leave a red build. Run `npm run test:e2e` before finishing a milestone
that touches a flow.

## Code

- Next.js 16 App Router. Read `node_modules/next/dist/docs/` before using an
  API you are unsure about: this version differs from older guides
  (`proxy.ts` instead of middleware, async `params`, `PageProps<"/route">`).
- Strict TypeScript; no `any`. Pure logic goes in `src/lib/` with a
  `*.test.ts` next to it (Vitest).
- Validation: Zod schemas in `src/lib/validation/`, used by both the client
  form and the server action. The server always validates again.
- Data access only through `getStore()` (`src/lib/data`). Never import the
  Supabase service client in a client component; modules that use it start
  with `import "server-only"`.
- Every server action checks the caller's role first (`requireRole`).
- Components: the small library in `src/components/ui` (Button, Card,
  fields…). Import from `@/components/ui`.
- Links: `Link`, `redirect`, `useRouter` from `@/i18n/navigation`, never
  from `next/link` or `next/navigation` (except `notFound`).

## Text and languages

- **No text in components.** Every visible string lives in
  `messages/en.json` and `messages/fr.json`, with the same keys (a unit test
  checks this). Mauritian Creole (`mfe`) will be added later; see README.
- Facts and figures with a source live in `content/facts.ts`, marked
  `verify: true` until the owner has checked them. Never invent figures,
  rules, quotes, installers or reviews. Demo data exists only in the seed
  and is marked "Demo".
- Never imply Soley is official. No CEB or government logos.
- Rupees are written with `formatMur()`; dates with `formatDate()`.

## Design

- Mobile first. Deep ocean blue base, sun yellow as the only accent
  (dark text on yellow, never yellow text on light backgrounds).
- WCAG 2.2 AA: visible labels, 44 px touch targets, focus rings, contrast
  values in `src/app/globals.css`.

## Secrets

Never commit secrets. Every variable is documented in `.env.example`.
