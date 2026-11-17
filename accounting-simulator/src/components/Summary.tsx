"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatDollars, incomeStatement } from "@/engine";
import type { Scenario } from "@/scenarios/types";
import { booksFor } from "@/scenarios/books";
import { currentTaskIndex, score, useProgress } from "@/lib/progress";
import { BalanceSheetView, CashView, IncomeStatementView } from "./BooksPanel";

export function Summary({ scenario }: { scenario: Scenario }) {
  const { progress } = useProgress(scenario.id);
  const books = useMemo(() => booksFor(scenario, (key) => !!progress.steps[key]?.done), [scenario, progress]);
  const finished = currentTaskIndex(scenario, progress) >= scenario.tasks.length;
  const s = score(scenario, progress);
  const result = incomeStatement(books).netIncome;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <p className="text-sm font-semibold tracking-wide text-brand uppercase">Month end summary</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
        {finished ? `${scenario.period.label} is closed. Well done.` : `${scenario.period.label} is not closed yet`}
      </h1>
      {!finished && (
        <p className="mt-3 text-muted">
          These are the books so far.{" "}
          <Link href={`/scenarios/${scenario.id}/play`} className="font-medium text-brand underline">
            Back to your inbox
          </Link>{" "}
          to finish the month.
        </p>
      )}
      {finished && (
        <p className="mt-3 max-w-3xl leading-relaxed text-muted">
          {scenario.company.name} made a {result < 0 ? "loss" : "profit"} of {formatDollars(Math.abs(result))} in{" "}
          {scenario.period.label}. In this practice month a full month of costs landed, such as rent,
          salaries and depreciation, but only one sales invoice was booked. The balance sheet balances, and cash agrees
          with the bank.
        </p>
      )}

      <section aria-label="Your score" className="mt-8 grid gap-3 sm:grid-cols-3">
        <ScoreCard label="Right the first time" value={s.first} total={s.total} tone="text-brand" />
        <ScoreCard label="Right after a hint" value={s.hint} total={s.total} tone="text-navy" />
        <ScoreCard label="With the full answer" value={s.answer} total={s.total} tone="text-warn" />
      </section>
      <p className="mt-2 text-xs text-muted">
        Counted per decision. Some documents needed more than one decision, so there are {s.total} in total.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Panel title="Income statement">
          <IncomeStatementView books={books} />
        </Panel>
        <Panel title="Balance sheet">
          <BalanceSheetView books={books} />
        </Panel>
        <Panel title="Cash movements">
          <CashView books={books} />
        </Panel>
      </div>

      <section className="mt-10 rounded-lg border border-line bg-white p-6">
        <h2 className="text-lg font-semibold text-ink">What you learned</h2>
        <ul className="mt-3 space-y-2">
          {scenario.tasks.map((task) => (
            <li key={task.id} className="flex gap-2 text-sm leading-relaxed">
              <span aria-hidden className="text-brand">
                ✓
              </span>
              <span>{task.learned}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={`/scenarios/${scenario.id}/play`}
          className="rounded-md border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:border-muted"
        >
          Review your inbox
        </Link>
        <Link
          href={`/scenarios/${scenario.id}`}
          className="rounded-md border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:border-muted"
        >
          Start the month again
        </Link>
      </div>
    </main>
  );
}

function ScoreCard({ label, value, total, tone }: { label: string; value: number; total: number; tone: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${tone}`}>
        {value}
        <span className="text-base font-normal text-muted"> of {total}</span>
      </p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="rounded-lg border border-line bg-white p-3">
      {children}
    </section>
  );
}
