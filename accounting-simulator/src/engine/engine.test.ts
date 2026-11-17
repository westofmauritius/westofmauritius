import { describe, expect, it } from "vitest";
import {
  type Account,
  type Books,
  type JournalEntry,
  balance,
  balanceSheet,
  cashSummary,
  compareEntry,
  generalLedger,
  incomeStatement,
  parseAmount,
  postEntry,
  trialBalance,
  validateEntry,
  formatAmount,
  formatDollars,
} from "./index";

const accounts: Account[] = [
  { id: "cash", name: "Cash", type: "asset", cash: true },
  { id: "equipment", name: "Equipment", type: "asset" },
  { id: "acc_dep", name: "Accumulated depreciation", type: "asset", contra: true },
  { id: "ap", name: "Accounts payable", type: "liability" },
  { id: "capital", name: "Share capital", type: "equity" },
  { id: "revenue", name: "Revenue", type: "revenue" },
  { id: "rent", name: "Rent expense", type: "expense" },
  { id: "dep", name: "Depreciation expense", type: "expense" },
];

const entry = (id: string, lines: [string, number, number][]): JournalEntry => ({
  id,
  date: "2026-03-01",
  description: id,
  reference: id,
  lines: lines.map(([account, debit, credit]) => ({ account, debit, credit })),
});

function sampleBooks(): Books {
  let books: Books = { accounts, entries: [] };
  books = postEntry(books, entry("open", [["cash", 1000, 0], ["equipment", 600, 0], ["capital", 0, 1600]]));
  books = postEntry(books, entry("sale", [["cash", 500, 0], ["revenue", 0, 500]]));
  books = postEntry(books, entry("rent", [["rent", 200, 0], ["ap", 0, 200]]));
  books = postEntry(books, entry("dep", [["dep", 100, 0], ["acc_dep", 0, 100]]));
  return books;
}

describe("posting rules", () => {
  it("refuses an entry where debits and credits differ", () => {
    const books: Books = { accounts, entries: [] };
    expect(() => postEntry(books, entry("bad", [["cash", 100, 0], ["revenue", 0, 90]]))).toThrow(/must be equal/);
  });

  it("reports every rule that is broken", () => {
    const codes = validateEntry(
      [
        { account: "cash", debit: 100, credit: 100 },
        { account: "nope", debit: 0, credit: 0 },
      ],
      accounts,
    ).map((p) => p.code);
    expect(codes).toEqual(expect.arrayContaining(["both_sides", "unknown_account", "empty_line"]));
  });

  it("needs at least two lines", () => {
    expect(validateEntry([{ account: "cash", debit: 0, credit: 0 }], accounts).map((p) => p.code)).toContain("no_lines");
  });
});

describe("normal balances", () => {
  const books = sampleBooks();
  it("debits increase assets and expenses", () => {
    expect(balance(books, "cash")).toBe(1500);
    expect(balance(books, "rent")).toBe(200);
  });
  it("credits increase liabilities, equity and revenue", () => {
    expect(balance(books, "ap")).toBe(200);
    expect(balance(books, "capital")).toBe(1600);
    expect(balance(books, "revenue")).toBe(500);
  });
  it("a contra asset carries a credit balance", () => {
    expect(balance(books, "acc_dep")).toBe(100);
  });
});

describe("reports", () => {
  const books = sampleBooks();

  it("builds a ledger with a running balance", () => {
    const ledger = generalLedger(books, "cash");
    expect(ledger.rows.map((r) => r.balance)).toEqual([1000, 1500]);
    expect(ledger.totalDebits).toBe(1500);
  });

  it("trial balance totals agree", () => {
    const tb = trialBalance(books);
    expect(tb.balanced).toBe(true);
    expect(tb.totalDebits).toBe(2400);
  });

  it("income statement gives the result for the period", () => {
    const is = incomeStatement(books);
    expect(is.totalRevenue).toBe(500);
    expect(is.totalExpenses).toBe(300);
    expect(is.netIncome).toBe(200);
  });

  it("balance sheet includes the period result in equity and balances", () => {
    const bs = balanceSheet(books);
    expect(bs.totalAssets).toBe(1500 + 600 - 100);
    expect(bs.periodResult).toBe(200);
    expect(bs.totalEquity).toBe(1800);
    expect(bs.balanced).toBe(true);
  });

  it("cash summary separates opening, money in and money out", () => {
    const cs = cashSummary(books, ["open"]);
    expect(cs.opening).toBe(1000);
    expect(cs.totalIn).toBe(500);
    expect(cs.totalOut).toBe(0);
    expect(cs.closing).toBe(1500);
  });
});

describe("comparing a learner entry", () => {
  const expected = [
    { account: "rent", debit: 200, credit: 0 },
    { account: "ap", debit: 0, credit: 200 },
  ];
  it("accepts the right entry in any order", () => {
    expect(compareEntry([...expected].reverse(), expected).correct).toBe(true);
  });
  it("accepts one amount split over two lines on the same account", () => {
    const split = [
      { account: "rent", debit: 150, credit: 0 },
      { account: "rent", debit: 50, credit: 0 },
      { account: "ap", debit: 0, credit: 200 },
    ];
    expect(compareEntry(split, expected).correct).toBe(true);
  });
  it("spots the wrong side, a wrong amount and a wrong account", () => {
    const flipped = compareEntry(
      [
        { account: "rent", debit: 0, credit: 200 },
        { account: "ap", debit: 200, credit: 0 },
      ],
      expected,
    );
    expect(flipped.wrongSide).toEqual(["rent", "ap"]);
    const wrongAccount = compareEntry(
      [
        { account: "rent", debit: 200, credit: 0 },
        { account: "cash", debit: 0, credit: 200 },
      ],
      expected,
    );
    expect(wrongAccount.missingAccounts).toEqual(["ap"]);
    expect(wrongAccount.extraAccounts).toEqual(["cash"]);
  });
});

describe("money helpers", () => {
  it("parses what people type", () => {
    expect(parseAmount("4,000")).toBe(400000);
    expect(parseAmount("$1200.5")).toBe(120050);
    expect(parseAmount("")).toBe(0);
    expect(parseAmount("abc")).toBeNull();
    expect(parseAmount("-5")).toBeNull();
  });
  it("formats amounts", () => {
    expect(formatAmount(400000)).toBe("4,000.00");
    expect(formatAmount(-600000)).toBe("(6,000.00)");
    expect(formatDollars(2500)).toBe("$25");
  });
});
