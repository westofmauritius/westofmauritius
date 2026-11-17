"use client";

import { useState } from "react";
import {
  type Account,
  type AccountType,
  type JournalLine,
  compareEntry,
  describeProblem,
  formatAmount,
  parseAmount,
  toCents,
  totals,
  validateEntry,
} from "@/engine";
import type { EntryStep } from "@/scenarios/types";
import { toLines } from "@/scenarios/books";
import type { StepProgress } from "@/lib/progress";
import { Feedback } from "./Feedback";

interface Row {
  account: string;
  debit: string;
  credit: string;
}

const emptyRow = (): Row => ({ account: "", debit: "", credit: "" });

const GROUPS: { type: AccountType; label: string }[] = [
  { type: "asset", label: "Assets" },
  { type: "liability", label: "Liabilities" },
  { type: "equity", label: "Equity" },
  { type: "revenue", label: "Revenue" },
  { type: "expense", label: "Expenses" },
];

interface Props {
  step: EntryStep;
  accounts: Account[];
  progress: StepProgress;
  onWrong: () => void;
  onCorrect: () => void;
}

/**
 * The learner builds a journal entry line by line. The engine refuses an
 * unbalanced entry before it is checked against the answer, so the first
 * rule of bookkeeping is always enforced. A refused entry is not counted as a
 * wrong try: the learner just fixes it.
 */
export function EntryBuilder({ step, accounts, progress, onWrong, onCorrect }: Props) {
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow()]);
  const [blocking, setBlocking] = useState<string[]>([]);
  const [mistake, setMistake] = useState<string | null>(null);

  const expected = toLines(step.entry.lines);
  const parsed = rows.map((r) => ({ account: r.account, debit: parseAmount(r.debit), credit: parseAmount(r.credit) }));
  const sum = totals(parsed.map((p) => ({ account: p.account, debit: p.debit ?? 0, credit: p.credit ?? 0 })));
  const difference = sum.debits - sum.credits;

  const update = (index: number, change: Partial<Row>) => {
    setRows((current) => current.map((r, i) => (i === index ? { ...r, ...change } : r)));
    setBlocking([]);
  };

  const fillAnswer = () => {
    setRows(
      step.entry.lines.map((l) => ({
        account: l.account,
        debit: l.debit ? String(l.debit) : "",
        credit: l.credit ? String(l.credit) : "",
      })),
    );
    setBlocking([]);
  };

  const post = () => {
    // Ignore rows the learner left completely empty.
    const used = rows.filter((r) => r.account || r.debit.trim() || r.credit.trim());
    if (used.some((r) => parseAmount(r.debit) === null || parseAmount(r.credit) === null)) {
      setBlocking(["One of the amounts is not a number. Use digits only, for example 4000 or 4,000.50."]);
      return;
    }
    const lines: JournalLine[] = used.map((r) => ({
      account: r.account,
      debit: parseAmount(r.debit) ?? 0,
      credit: parseAmount(r.credit) ?? 0,
    }));
    const problems = validateEntry(lines, accounts);
    if (problems.length > 0) {
      // Show each kind of problem once.
      const seen = new Set<string>();
      setBlocking(
        problems
          .filter((p) => (seen.has(p.code) ? false : (seen.add(p.code), true)))
          .map((p) => describeProblem(p, accounts)),
      );
      return;
    }
    const result = compareEntry(lines, expected);
    if (result.correct) {
      setMistake(null);
      onCorrect();
      return;
    }
    setMistake(describeMistake(result));
    onWrong();
  };

  const showHint = progress.wrong >= 1 && !progress.revealed;
  const name = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;

  return (
    <div>
      <div className="rounded-md border border-line bg-white">
        <div className="flex flex-wrap justify-between gap-2 border-b border-line bg-surface px-3 py-2 text-xs">
          <span className="font-medium text-ink">{step.entry.description}</span>
          <span className="text-muted">Reference {step.entry.reference}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr>
                <th className="bg-navy px-3 py-1.5 text-left text-xs font-semibold text-white">Account</th>
                <th className="num w-32 bg-navy px-3 py-1.5 text-xs font-semibold text-white">Debit</th>
                <th className="num w-32 bg-navy px-3 py-1.5 text-xs font-semibold text-white">Credit</th>
                <th className="w-10 bg-navy" aria-label="Remove line" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-line/70">
                  <td className="px-2 py-1.5">
                    <select
                      aria-label={`Account, line ${i + 1}`}
                      value={row.account}
                      onChange={(e) => update(i, { account: e.target.value })}
                      className="w-full rounded border border-line bg-white px-2 py-1.5 text-sm"
                    >
                      <option value="">Choose an account</option>
                      {GROUPS.map((g) => (
                        <optgroup key={g.type} label={g.label}>
                          {accounts
                            .filter((a) => a.type === g.type)
                            .map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.code ? `${a.code} ` : ""}
                                {a.name}
                              </option>
                            ))}
                        </optgroup>
                      ))}
                    </select>
                  </td>
                  {(["debit", "credit"] as const).map((side) => (
                    <td key={side} className="px-2 py-1.5">
                      <input
                        aria-label={`${side === "debit" ? "Debit" : "Credit"}, line ${i + 1}`}
                        inputMode="decimal"
                        value={row[side]}
                        onChange={(e) => update(i, { [side]: e.target.value })}
                        placeholder="0.00"
                        className={`num w-full rounded border bg-white px-2 py-1.5 text-sm ${
                          parsed[i][side] === null ? "border-bad" : "border-line"
                        }`}
                      />
                    </td>
                  ))}
                  <td className="px-1 text-center">
                    {rows.length > 2 && (
                      <button
                        type="button"
                        aria-label={`Remove line ${i + 1}`}
                        onClick={() => setRows((current) => current.filter((_, j) => j !== i))}
                        className="rounded px-2 py-1 text-muted hover:bg-surface hover:text-bad"
                      >
                        ×
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="text-xs">
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setRows((r) => [...r, emptyRow()])}
                    className="font-medium text-brand hover:underline"
                  >
                    + Add a line
                  </button>
                </td>
                <td className="num px-3 py-2 font-semibold">{formatAmount(sum.debits)}</td>
                <td className="num px-3 py-2 font-semibold">{formatAmount(sum.credits)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <p className={`border-t border-line px-3 py-2 text-xs ${difference === 0 ? "text-brand" : "text-warn"}`}>
          {sum.debits === 0 && sum.credits === 0
            ? "Debits and credits must be equal before you can post."
            : difference === 0
              ? "Debits equal credits. Ready to post."
              : `Not balanced yet. ${difference > 0 ? "Debits" : "Credits"} are ${formatAmount(Math.abs(difference))} higher.`}
        </p>
      </div>

      {blocking.length > 0 && (
        <div role="alert" className="mt-3 rounded-md border border-warn/40 bg-warn-soft p-3 text-sm text-ink">
          <p className="font-semibold">This entry cannot be posted yet.</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {blocking.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {mistake && (
        <Feedback tone="bad" title="Not quite.">
          <p>{mistake}</p>
        </Feedback>
      )}

      {showHint && (
        <Feedback tone="info" title="Hint">
          <p>{step.hint}</p>
        </Feedback>
      )}

      {progress.revealed && (
        <Feedback tone="info" title="Here is the answer.">
          <p>{step.explanation}</p>
          <table className="mt-2 w-full max-w-md text-xs">
            <tbody>
              {step.entry.lines.map((l) => (
                <tr key={l.account} className="border-b border-line/70">
                  <td className={`py-1 ${l.credit ? "pl-4" : ""}`}>{name(l.account)}</td>
                  <td className="num py-1">{l.debit ? `Dr ${formatAmount(toCents(l.debit))}` : ""}</td>
                  <td className="num py-1">{l.credit ? `Cr ${formatAmount(toCents(l.credit))}` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={fillAnswer} className="mt-3 text-sm font-medium text-brand hover:underline">
            Fill in the answer for me
          </button>
        </Feedback>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={post}
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Post entry
        </button>
      </div>
    </div>
  );
}

/**
 * Says what kind of mistake it is without giving the answer away. The hint
 * and, later, the full answer do the rest.
 */
function describeMistake(result: ReturnType<typeof compareEntry>): string {
  if (result.missingAccounts.length || result.extraAccounts.length) {
    return "At least one of the accounts is not the right one for this document. Think about what the company gained or gave up, and what it now owes or is owed.";
  }
  if (result.wrongSide.length) {
    return "You picked the right accounts, but at least one is on the wrong side. Ask yourself for each account: does it go up or down, and is that a debit or a credit for this type of account?";
  }
  return "The accounts and sides are right. Check the amounts against the document.";
}
