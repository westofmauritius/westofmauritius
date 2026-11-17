import type { Account, Books, JournalEntry } from "./types";

// Normal balance logic.
// Debits increase assets and expenses. Credits increase liabilities, equity
// and revenue. A contra account (such as accumulated depreciation) behaves
// the opposite way to the type it sits under.

export type Side = "debit" | "credit";

export function normalSide(account: Account): Side {
  const debitNormal = account.type === "asset" || account.type === "expense";
  if (account.contra) return debitNormal ? "credit" : "debit";
  return debitNormal ? "debit" : "credit";
}

/** Debits minus credits for one account, over the given entries. */
export function netDebit(entries: JournalEntry[], accountId: string): number {
  let net = 0;
  for (const entry of entries) {
    for (const line of entry.lines) {
      if (line.account === accountId) net += line.debit - line.credit;
    }
  }
  return net;
}

/**
 * Balance in the account's own normal direction: a positive number means the
 * account holds a normal balance (for example a debit balance on Cash).
 */
export function balance(books: Books, accountId: string): number {
  const account = findAccount(books, accountId);
  const net = netDebit(books.entries, accountId);
  return normalSide(account) === "debit" ? net : -net;
}

export function findAccount(books: Books, accountId: string): Account {
  const account = books.accounts.find((a) => a.id === accountId);
  if (!account) throw new Error(`Unknown account "${accountId}"`);
  return account;
}

// General ledger ------------------------------------------------------------

export interface LedgerRow {
  entryId: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  /** Running balance in the account's normal direction. */
  balance: number;
}

export interface LedgerAccount {
  account: Account;
  rows: LedgerRow[];
  totalDebits: number;
  totalCredits: number;
  balance: number;
}

export function generalLedger(books: Books, accountId: string): LedgerAccount {
  const account = findAccount(books, accountId);
  const sign = normalSide(account) === "debit" ? 1 : -1;
  const rows: LedgerRow[] = [];
  let running = 0;
  let totalDebits = 0;
  let totalCredits = 0;
  for (const entry of books.entries) {
    for (const line of entry.lines) {
      if (line.account !== accountId) continue;
      running += sign * (line.debit - line.credit);
      totalDebits += line.debit;
      totalCredits += line.credit;
      rows.push({
        entryId: entry.id,
        date: entry.date,
        description: entry.description,
        reference: entry.reference,
        debit: line.debit,
        credit: line.credit,
        balance: running,
      });
    }
  }
  return { account, rows, totalDebits, totalCredits, balance: running };
}

// Trial balance ---------------------------------------------------------------

export interface TrialBalanceRow {
  account: Account;
  debit: number;
  credit: number;
}

export interface TrialBalance {
  rows: TrialBalanceRow[];
  totalDebits: number;
  totalCredits: number;
  balanced: boolean;
}

/** Lists every account with a balance, in chart of accounts order. */
export function trialBalance(books: Books): TrialBalance {
  const rows: TrialBalanceRow[] = [];
  let totalDebits = 0;
  let totalCredits = 0;
  for (const account of books.accounts) {
    const net = netDebit(books.entries, account.id);
    if (net === 0) continue;
    const row = { account, debit: net > 0 ? net : 0, credit: net < 0 ? -net : 0 };
    totalDebits += row.debit;
    totalCredits += row.credit;
    rows.push(row);
  }
  return { rows, totalDebits, totalCredits, balanced: totalDebits === totalCredits };
}

// Income statement ------------------------------------------------------------

export interface StatementLine {
  account: Account;
  amount: number;
}

export interface IncomeStatement {
  revenue: StatementLine[];
  expenses: StatementLine[];
  totalRevenue: number;
  totalExpenses: number;
  /** Positive is a profit, negative is a loss. */
  netIncome: number;
}

function linesOfType(books: Books, type: Account["type"], creditPositive: boolean): StatementLine[] {
  return books.accounts
    .filter((a) => a.type === type)
    .map((account) => {
      const net = netDebit(books.entries, account.id);
      return { account, amount: creditPositive ? -net : net };
    })
    .filter((line) => line.amount !== 0);
}

const sum = (lines: StatementLine[]) => lines.reduce((total, line) => total + line.amount, 0);

export function incomeStatement(books: Books): IncomeStatement {
  const revenue = linesOfType(books, "revenue", true);
  const expenses = linesOfType(books, "expense", false);
  const totalRevenue = sum(revenue);
  const totalExpenses = sum(expenses);
  return { revenue, expenses, totalRevenue, totalExpenses, netIncome: totalRevenue - totalExpenses };
}

// Balance sheet ---------------------------------------------------------------

export interface BalanceSheet {
  /** Contra assets appear as negative amounts, so the column adds up. */
  assets: StatementLine[];
  liabilities: StatementLine[];
  equity: StatementLine[];
  /**
   * The period's profit or loss. Revenue and expense accounts are only
   * closed into retained earnings at year end, so until then the result is
   * shown as its own line in equity. This is what keeps the sheet balanced.
   */
  periodResult: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  balanced: boolean;
}

export function balanceSheet(books: Books): BalanceSheet {
  const assets = linesOfType(books, "asset", false);
  const liabilities = linesOfType(books, "liability", true);
  const equity = linesOfType(books, "equity", true);
  const periodResult = incomeStatement(books).netIncome;
  const totalAssets = sum(assets);
  const totalLiabilities = sum(liabilities);
  const totalEquity = sum(equity) + periodResult;
  return {
    assets,
    liabilities,
    equity,
    periodResult,
    totalAssets,
    totalLiabilities,
    totalEquity,
    balanced: totalAssets === totalLiabilities + totalEquity,
  };
}

// Cash movement summary ---------------------------------------------------------

export interface CashMovement {
  entryId: string;
  date: string;
  description: string;
  /** Positive is money in, negative is money out. */
  amount: number;
}

export interface CashSummary {
  opening: number;
  inflows: CashMovement[];
  outflows: CashMovement[];
  totalIn: number;
  totalOut: number;
  closing: number;
}

/**
 * A simple view of where cash came from and where it went. Entries marked as
 * opening balances make up the opening figure; every other entry that touches
 * a cash account is listed as money in or money out.
 */
export function cashSummary(books: Books, openingEntryIds: string[] = []): CashSummary {
  const cashIds = new Set(books.accounts.filter((a) => a.cash).map((a) => a.id));
  let opening = 0;
  const inflows: CashMovement[] = [];
  const outflows: CashMovement[] = [];
  for (const entry of books.entries) {
    const amount = entry.lines
      .filter((l) => cashIds.has(l.account))
      .reduce((total, l) => total + l.debit - l.credit, 0);
    if (openingEntryIds.includes(entry.id)) {
      opening += amount;
      continue;
    }
    if (amount === 0) continue;
    const movement = { entryId: entry.id, date: entry.date, description: entry.description, amount };
    (amount > 0 ? inflows : outflows).push(movement);
  }
  const totalIn = inflows.reduce((t, m) => t + m.amount, 0);
  const totalOut = outflows.reduce((t, m) => t + m.amount, 0);
  return { opening, inflows, outflows, totalIn, totalOut, closing: opening + totalIn + totalOut };
}
