"use client";

import { useState } from "react";
import {
  type Account,
  type Books,
  balanceSheet,
  cashSummary,
  formatAmount,
  generalLedger,
  incomeStatement,
  trialBalance,
  netDebit,
  type StatementLine,
} from "@/engine";
import { OPENING_ENTRY_ID } from "@/scenarios/books";
import { formatDate } from "@/lib/format";

const TABS = ["Journal", "Ledger", "Trial balance", "Income statement", "Balance sheet", "Cash"] as const;
type Tab = (typeof TABS)[number];

interface Props {
  books: Books;
  /** Accounts that changed in the last step. */
  moved: string[];
  /** Id of the last posted entry. */
  lastEntryId?: string;
  /** Changes on every post, so the highlight animation runs again. */
  flash: number;
}

export function BooksPanel({ books, moved, lastEntryId, flash }: Props) {
  const [tab, setTab] = useState<Tab>("Journal");

  return (
    <section aria-label="The books" className="flex h-full min-h-0 flex-col rounded-lg border border-line bg-white">
      <div className="border-b border-line px-3 pt-3">
        <h2 className="px-1 text-xs font-semibold tracking-wide text-muted uppercase">The books</h2>
        <div role="tablist" className="mt-2 flex flex-wrap gap-x-1">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-t-md border-b-2 px-2.5 py-2 text-xs font-medium whitespace-nowrap ${
                tab === t ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto p-3" key={`${tab}-${flash}`}>
        {tab === "Journal" && <Journal books={books} lastEntryId={lastEntryId} />}
        {tab === "Ledger" && <Ledger books={books} moved={moved} />}
        {tab === "Trial balance" && <TrialBalanceView books={books} moved={moved} />}
        {tab === "Income statement" && <IncomeStatementView books={books} moved={moved} />}
        {tab === "Balance sheet" && <BalanceSheetView books={books} moved={moved} />}
        {tab === "Cash" && <CashView books={books} />}
      </div>
      {moved.length > 0 && (
        <p className="border-t border-line px-4 py-2 text-xs text-muted">
          <span className="mr-1.5 inline-block size-2.5 rounded-sm bg-[#fff3b0] align-middle" aria-hidden />
          Highlighted: what moved in your last step.
        </p>
      )}
    </section>
  );
}

const label = (a: Account) => (a.code ? `${a.code} ${a.name}` : a.name);

function Th({ children, num }: { children?: React.ReactNode; num?: boolean }) {
  return (
    <th className={`bg-navy px-2 py-1.5 text-xs font-semibold text-white ${num ? "num" : "text-left"}`}>{children}</th>
  );
}

// Journal -----------------------------------------------------------------------

function Journal({ books, lastEntryId }: { books: Books; lastEntryId?: string }) {
  const entries = [...books.entries].reverse();
  const name = (id: string) => label(books.accounts.find((a) => a.id === id)!);
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">Newest entry first.</p>
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`overflow-hidden rounded border border-line ${entry.id === lastEntryId ? "moved" : ""}`}
        >
          <div className="flex justify-between gap-2 bg-surface px-2 py-1.5 text-xs">
            <span className="font-medium text-ink">{entry.description}</span>
            <span className="shrink-0 text-muted">
              {formatDate(entry.date, true)} · {entry.reference}
            </span>
          </div>
          <table className="w-full text-xs">
            <tbody>
              {entry.lines.map((line, i) => (
                <tr key={i} className="border-t border-line/70">
                  <td className={`py-1 pr-2 ${line.credit > 0 ? "pl-6" : "pl-2"}`}>{name(line.account)}</td>
                  <td className="num w-24 px-2 py-1">{line.debit ? formatAmount(line.debit) : ""}</td>
                  <td className="num w-24 px-2 py-1">{line.credit ? formatAmount(line.credit) : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <p className="text-xs text-muted">
        Debits on the left, credits on the right and indented. Every entry has equal debits and credits.
      </p>
    </div>
  );
}

// Ledger (T accounts) -----------------------------------------------------------------

function Ledger({ books, moved }: { books: Books; moved: string[] }) {
  const used = books.accounts.filter((a) => books.entries.some((e) => e.lines.some((l) => l.account === a.id)));
  const [picked, setPicked] = useState<string | null>(null);
  const selected = picked ?? moved[0] ?? used[0]?.id;
  if (!selected) return null;
  const ledger = generalLedger(books, selected);
  const debits = ledger.rows.filter((r) => r.debit > 0);
  const credits = ledger.rows.filter((r) => r.credit > 0);
  const side = netDebit(books.entries, selected) >= 0 ? "debit" : "credit";

  return (
    <div>
      <label className="block text-xs font-medium text-muted" htmlFor="ledger-account">
        Account
      </label>
      <select
        id="ledger-account"
        value={selected}
        onChange={(e) => setPicked(e.target.value)}
        className="mt-1 w-full rounded border border-line bg-white px-2 py-1.5 text-sm"
      >
        {used.map((a) => (
          <option key={a.id} value={a.id}>
            {label(a)}
            {moved.includes(a.id) ? "  (moved)" : ""}
          </option>
        ))}
      </select>

      {moved.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {moved.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setPicked(id)}
              className={`rounded-full border px-2 py-0.5 text-xs ${
                id === selected ? "border-brand bg-brand-soft text-brand" : "border-line text-muted hover:text-ink"
              }`}
            >
              {books.accounts.find((a) => a.id === id)?.name}
            </button>
          ))}
        </div>
      )}

      <div className={`mt-3 rounded border border-line ${moved.includes(selected) ? "moved" : ""}`}>
        <p className="border-b-2 border-ink px-2 py-1.5 text-center text-sm font-semibold">{label(ledger.account)}</p>
        <div className="grid grid-cols-2 text-xs">
          <TSide title="Debit" rows={debits.map((r) => ({ ...r, amount: r.debit }))} />
          <div className="border-l-2 border-ink">
            <TSide title="Credit" rows={credits.map((r) => ({ ...r, amount: r.credit }))} />
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-line text-xs font-semibold">
          <p className="num px-2 py-1">{formatAmount(ledger.totalDebits)}</p>
          <p className="num border-l-2 border-ink px-2 py-1">{formatAmount(ledger.totalCredits)}</p>
        </div>
        <p className="border-t border-line bg-surface px-2 py-1.5 text-xs">
          Balance: <span className="font-semibold">{formatAmount(Math.abs(netDebit(books.entries, selected)))}</span>{" "}
          {netDebit(books.entries, selected) === 0 ? "" : side}
        </p>
      </div>
    </div>
  );
}

function TSide({
  title,
  rows,
}: {
  title: string;
  rows: { entryId: string; date: string; reference: string; amount: number }[];
}) {
  return (
    <div>
      <p className="px-2 py-1 text-center text-muted">{title}</p>
      <ul>
        {rows.map((r, i) => (
          <li key={`${r.entryId}-${i}`} className="flex justify-between gap-1 px-2 py-0.5">
            <span className="truncate text-muted" title={r.reference}>
              {formatDate(r.date, true)} {r.entryId === OPENING_ENTRY_ID ? "Opening" : r.reference}
            </span>
            <span className="num">{formatAmount(r.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Trial balance ---------------------------------------------------------------------

function TrialBalanceView({ books, moved }: { books: Books; moved: string[] }) {
  const tb = trialBalance(books);
  return (
    <table className="w-full text-xs">
      <thead>
        <tr>
          <Th>Account</Th>
          <Th num>Debit</Th>
          <Th num>Credit</Th>
        </tr>
      </thead>
      <tbody>
        {tb.rows.map((row) => (
          <tr key={row.account.id} className={`border-b border-line/70 ${moved.includes(row.account.id) ? "moved" : ""}`}>
            <td className="px-2 py-1">{label(row.account)}</td>
            <td className="num px-2 py-1">{row.debit ? formatAmount(row.debit) : ""}</td>
            <td className="num px-2 py-1">{row.credit ? formatAmount(row.credit) : ""}</td>
          </tr>
        ))}
        <tr className="border-t-2 border-navy font-semibold">
          <td className="px-2 py-1.5">Total</td>
          <td className="num px-2 py-1.5">{formatAmount(tb.totalDebits)}</td>
          <td className="num px-2 py-1.5">{formatAmount(tb.totalCredits)}</td>
        </tr>
      </tbody>
      <caption className="caption-bottom pt-2 text-left text-xs text-muted">
        {tb.balanced ? "Debits equal credits. The trial balance agrees." : "The trial balance does not agree."}
      </caption>
    </table>
  );
}

// Statements ---------------------------------------------------------------------------

function Rows({ lines, moved }: { lines: StatementLine[]; moved: string[] }) {
  return (
    <>
      {lines.map((line) => (
        <tr key={line.account.id} className={`border-b border-line/70 ${moved.includes(line.account.id) ? "moved" : ""}`}>
          <td className="py-1 pr-2 pl-4">{line.account.name}</td>
          <td className="num px-2 py-1">{formatAmount(line.amount)}</td>
        </tr>
      ))}
    </>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <th colSpan={2} className="bg-navy-soft px-2 py-1.5 text-left text-xs font-semibold text-navy">
        {children}
      </th>
    </tr>
  );
}

function TotalRow({ label: text, amount, strong }: { label: string; amount: number; strong?: boolean }) {
  return (
    <tr className={strong ? "border-t-2 border-navy font-semibold" : "font-medium"}>
      <td className="px-2 py-1.5">{text}</td>
      <td className="num px-2 py-1.5">{formatAmount(amount)}</td>
    </tr>
  );
}

export function IncomeStatementView({ books, moved = [] }: { books: Books; moved?: string[] }) {
  const is = incomeStatement(books);
  return (
    <table className="w-full text-xs">
      <thead>
        <tr>
          <Th>Income statement</Th>
          <Th num>USD</Th>
        </tr>
      </thead>
      <tbody>
        <SectionHead>Revenue</SectionHead>
        <Rows lines={is.revenue} moved={moved} />
        <TotalRow label="Total revenue" amount={is.totalRevenue} />
        <SectionHead>Expenses</SectionHead>
        <Rows lines={is.expenses} moved={moved} />
        <TotalRow label="Total expenses" amount={is.totalExpenses} />
        <TotalRow label={is.netIncome >= 0 ? "Profit for the period" : "Loss for the period"} amount={is.netIncome} strong />
      </tbody>
    </table>
  );
}

export function BalanceSheetView({ books, moved = [] }: { books: Books; moved?: string[] }) {
  const bs = balanceSheet(books);
  const resultMoved = moved.some((id) => {
    const type = books.accounts.find((a) => a.id === id)?.type;
    return type === "revenue" || type === "expense";
  });
  return (
    <table className="w-full text-xs">
      <thead>
        <tr>
          <Th>Balance sheet</Th>
          <Th num>USD</Th>
        </tr>
      </thead>
      <tbody>
        <SectionHead>Assets</SectionHead>
        <Rows lines={bs.assets} moved={moved} />
        <TotalRow label="Total assets" amount={bs.totalAssets} strong />
        <SectionHead>Liabilities</SectionHead>
        <Rows lines={bs.liabilities} moved={moved} />
        <TotalRow label="Total liabilities" amount={bs.totalLiabilities} />
        <SectionHead>Equity</SectionHead>
        <Rows lines={bs.equity} moved={moved} />
        <tr className={`border-b border-line/70 ${resultMoved ? "moved" : ""}`}>
          <td className="py-1 pr-2 pl-4">Result for the period</td>
          <td className="num px-2 py-1">{formatAmount(bs.periodResult)}</td>
        </tr>
        <TotalRow label="Total equity" amount={bs.totalEquity} />
        <TotalRow label="Total liabilities and equity" amount={bs.totalLiabilities + bs.totalEquity} strong />
      </tbody>
      <caption className="caption-bottom pt-2 text-left text-xs text-muted">
        {bs.balanced
          ? "Assets equal liabilities plus equity. The balance sheet balances."
          : "The balance sheet does not balance."}{" "}
        The result for the period is the profit or loss so far. It becomes part of retained earnings when the
        year is closed.
      </caption>
    </table>
  );
}

export function CashView({ books }: { books: Books }) {
  const cs = cashSummary(books, [OPENING_ENTRY_ID]);
  return (
    <table className="w-full text-xs">
      <thead>
        <tr>
          <Th>Cash movements</Th>
          <Th num>USD</Th>
        </tr>
      </thead>
      <tbody>
        <TotalRow label="Cash at the start" amount={cs.opening} />
        <SectionHead>Money in</SectionHead>
        {cs.inflows.length === 0 && (
          <tr>
            <td className="py-1 pl-4 text-muted" colSpan={2}>
              Nothing yet
            </td>
          </tr>
        )}
        {cs.inflows.map((m) => (
          <tr key={m.entryId} className="border-b border-line/70">
            <td className="py-1 pr-2 pl-4">{m.description}</td>
            <td className="num px-2 py-1">{formatAmount(m.amount)}</td>
          </tr>
        ))}
        <TotalRow label="Total money in" amount={cs.totalIn} />
        <SectionHead>Money out</SectionHead>
        {cs.outflows.length === 0 && (
          <tr>
            <td className="py-1 pl-4 text-muted" colSpan={2}>
              Nothing yet
            </td>
          </tr>
        )}
        {cs.outflows.map((m) => (
          <tr key={m.entryId} className="border-b border-line/70">
            <td className="py-1 pr-2 pl-4">{m.description}</td>
            <td className="num px-2 py-1">{formatAmount(m.amount)}</td>
          </tr>
        ))}
        <TotalRow label="Total money out" amount={cs.totalOut} />
        <TotalRow label="Cash at the end" amount={cs.closing} strong />
      </tbody>
    </table>
  );
}
