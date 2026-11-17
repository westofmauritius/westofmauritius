import type { Account, Books, JournalEntry, JournalLine } from "./types";
import { formatDollars } from "./money";

export type EntryProblem =
  | { code: "no_lines" }
  | { code: "unknown_account"; account: string }
  | { code: "both_sides"; account: string }
  | { code: "empty_line"; account: string }
  | { code: "negative_amount"; account: string }
  | { code: "unbalanced"; debits: number; credits: number };

export function totals(lines: JournalLine[]): { debits: number; credits: number } {
  let debits = 0;
  let credits = 0;
  for (const line of lines) {
    debits += line.debit;
    credits += line.credit;
  }
  return { debits, credits };
}

/**
 * Checks the bookkeeping rules every entry must follow before it can be
 * posted. Returns an empty list when the entry is fine.
 */
export function validateEntry(lines: JournalLine[], accounts: Account[]): EntryProblem[] {
  const problems: EntryProblem[] = [];
  const known = new Set(accounts.map((a) => a.id));

  if (lines.length < 2) problems.push({ code: "no_lines" });

  for (const line of lines) {
    if (!known.has(line.account)) problems.push({ code: "unknown_account", account: line.account });
    if (line.debit < 0 || line.credit < 0) problems.push({ code: "negative_amount", account: line.account });
    if (line.debit > 0 && line.credit > 0) problems.push({ code: "both_sides", account: line.account });
    if (line.debit === 0 && line.credit === 0) problems.push({ code: "empty_line", account: line.account });
  }

  const { debits, credits } = totals(lines);
  if (debits !== credits) problems.push({ code: "unbalanced", debits, credits });

  return problems;
}

/** Plain English text for a problem, shown to the learner. */
export function describeProblem(problem: EntryProblem, accounts: Account[]): string {
  const name = (id: string) => accounts.find((a) => a.id === id)?.name ?? "an account";
  switch (problem.code) {
    case "no_lines":
      return "An entry needs at least two lines: one debit and one credit.";
    case "unknown_account":
      return "Every line needs an account. Pick one from the list.";
    case "both_sides":
      return `The line for ${name(problem.account)} has both a debit and a credit. Use one side per line.`;
    case "empty_line":
      return `The line for ${name(problem.account)} has no amount. Type an amount or remove the line.`;
    case "negative_amount":
      return "Amounts must be positive. The column you use tells the direction.";
    case "unbalanced": {
      const gap = Math.abs(problem.debits - problem.credits);
      return `Debits are ${formatDollars(problem.debits)} and credits are ${formatDollars(problem.credits)}. They must be equal before you can post. The gap is ${formatDollars(gap)}.`;
    }
  }
}

export class UnbalancedEntryError extends Error {}

/**
 * Posts an entry and returns new books. The hard rule of double entry is
 * enforced here: an entry that breaks any rule is refused.
 */
export function postEntry(books: Books, entry: JournalEntry): Books {
  const problems = validateEntry(entry.lines, books.accounts);
  if (problems.length > 0) {
    const text = problems.map((p) => describeProblem(p, books.accounts)).join(" ");
    throw new UnbalancedEntryError(`Entry "${entry.description}" cannot be posted. ${text}`);
  }
  return { ...books, entries: [...books.entries, entry] };
}

/** Accounts touched by an entry, used to highlight what moved in the books. */
export function accountsTouched(entries: JournalEntry[]): string[] {
  return [...new Set(entries.flatMap((e) => e.lines.map((l) => l.account)))];
}
