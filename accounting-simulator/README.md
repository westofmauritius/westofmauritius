# Accounting practice simulator

A website where people learn accounting by doing it. The learner works as a
junior accountant in a fictional company: documents land in an inbox, they
decide what to do and book them, and they see the books change after every
step. Brand: Oliver Smith, Accounting and finance.

Version 1: one company (Harbor Smoothie Co.), one month (March), 14 tasks,
20 decisions. No login, no database. Progress is saved in the browser
(localStorage).

## Run it

```bash
cd accounting-simulator
npm install
npm run dev        # http://localhost:3000
npm run check      # lint, types and unit tests
npm run build      # production build, every page is static
```

Node 20.9 or newer.

## Folders

| Folder                     | What it holds                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `src/engine/`              | The accounting engine. Plain TypeScript, no React. Amounts are whole cents.                       |
| `src/scenarios/data/`      | One JSON file per scenario. The only place scenario content lives.                                |
| `src/scenarios/types.ts`   | The shape of a scenario file, with comments.                                                      |
| `src/scenarios/books.ts`   | Turns a scenario into books, and checks a scenario file for mistakes.                             |
| `src/components/`, `app/`  | The UI: start page, intro, the inbox/workspace/books screen, and the month end summary.          |
| `src/lib/progress.ts`      | Saved progress, scoring and task status.                                                          |

## The engine

- Chart of accounts with a type per account: asset, liability, equity,
  revenue, expense. Contra accounts (accumulated depreciation) are flagged.
- `postEntry` refuses any entry where debits and credits differ, and explains why.
- Reports: general ledger per account, trial balance, income statement,
  balance sheet (the period result is shown inside equity, so it always
  balances) and a simple cash movement summary.

## Writing a new scenario

1. Copy `src/scenarios/data/harbor-smoothie-march.json` to a new file and
   change the `id`, `title` and `order`.
2. Edit the accounts, opening balances and tasks. Each task has documents,
   one or more steps (`choice` or `entry`) and a "who was involved" list.
   The roles are fixed: Purchasing, Accounts payable, Approver, Treasury,
   Accounts receivable, Payroll, Controller, CFO.
3. Optionally add `expected` closing balances; the tests will check them.
4. Run `npm test`. The tests check every scenario file: entries balance,
   document totals add up, roles exist, the balance sheet balances after
   every step, and no learner text contains hyphens or dashes.

No code changes are needed: the start page and routes pick up every file in
the folder.

## Deploying

The app is fully static and needs no paid service. On Vercel (Hobby), import
the repository and set the root directory to `accounting-simulator`.

It lives in this repository for now. It is not part of the West of
Mauritius site and is not built or deployed with it.
