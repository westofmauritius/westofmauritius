import type { JournalLine } from "./types";

// Compares the entry a learner built with the expected entry.
//
// Lines are compared per account after netting, so the order of lines does
// not matter and splitting one amount over two lines on the same account is
// accepted. That mirrors how a reviewer looks at an entry in real life.

export interface EntryComparison {
  correct: boolean;
  missingAccounts: string[];
  extraAccounts: string[];
  wrongSide: string[];
  wrongAmount: string[];
}

function netByAccount(lines: JournalLine[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const line of lines) {
    map.set(line.account, (map.get(line.account) ?? 0) + line.debit - line.credit);
  }
  for (const [account, net] of map) if (net === 0) map.delete(account);
  return map;
}

export function compareEntry(learner: JournalLine[], expected: JournalLine[]): EntryComparison {
  const mine = netByAccount(learner);
  const target = netByAccount(expected);
  const result: EntryComparison = {
    correct: true,
    missingAccounts: [],
    extraAccounts: [],
    wrongSide: [],
    wrongAmount: [],
  };
  for (const [account, net] of target) {
    const given = mine.get(account);
    if (given === undefined) result.missingAccounts.push(account);
    else if (Math.sign(given) !== Math.sign(net)) result.wrongSide.push(account);
    else if (given !== net) result.wrongAmount.push(account);
  }
  for (const account of mine.keys()) if (!target.has(account)) result.extraAccounts.push(account);
  result.correct =
    result.missingAccounts.length +
      result.extraAccounts.length +
      result.wrongSide.length +
      result.wrongAmount.length ===
    0;
  return result;
}
