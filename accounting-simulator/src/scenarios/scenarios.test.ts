import { describe, expect, it } from "vitest";
import { balance, balanceSheet, incomeStatement, toCents, trialBalance } from "@/engine";
import { loadScenarios } from "./load";
import { allStepKeys, booksFor, cashBeforeTask, stepKey, validateScenario } from "./books";
import type { Scenario } from "./types";

const scenarios = loadScenarios();

describe.each(scenarios.map((s) => [s.id, s] as const))("scenario %s", (_id, scenario: Scenario) => {
  it("has no problems in the file", () => {
    expect(validateScenario(scenario)).toEqual([]);
  });

  it("balance sheet balances after every step when every answer is right", () => {
    const done = new Set<string>();
    const check = (label: string) => {
      const books = booksFor(scenario, (key) => done.has(key));
      const bs = balanceSheet(books);
      expect(bs.balanced, `balance sheet after ${label}`).toBe(true);
      expect(trialBalance(books).balanced, `trial balance after ${label}`).toBe(true);
    };
    check("opening balances");
    for (const task of scenario.tasks) {
      for (const step of task.steps) {
        done.add(stepKey(task, step));
        check(stepKey(task, step));
      }
    }
  });

  it("reaches the expected closing figures", () => {
    if (!scenario.expected) return;
    const keys = new Set(allStepKeys(scenario));
    const books = booksFor(scenario, (key) => keys.has(key));
    for (const [account, amount] of Object.entries(scenario.expected.balances)) {
      expect(balance(books, account), account).toBe(toCents(amount));
    }
    expect(incomeStatement(books).netIncome).toBe(toCents(scenario.expected.netIncome));
  });

  it("reconciliation documents agree with the books at that moment", () => {
    for (const task of scenario.tasks) {
      for (const doc of [...task.documents, ...task.steps.flatMap((s) => s.documents ?? [])]) {
        if (doc.kind === "reconciliation") {
          expect(cashBeforeTask(scenario, task.id), `book balance in ${task.id}`).toBe(toCents(doc.bookBalance));
        }
      }
    }
  });

  it("learner text has no hyphens or dashes in sentences", () => {
    // Ids, account references and ISO dates are code, not text, so skip them.
    const codeKeys = new Set(["id", "answer", "account", "kind", "type", "tone", "role", "code"]);
    const offenders: string[] = [];
    const walk = (value: unknown, key = "") => {
      if (typeof value === "string") {
        if (codeKeys.has(key) || /^\d{4}-\d{2}-\d{2}$/.test(value)) return;
        if (/[-‐-―]/.test(value)) offenders.push(value);
      } else if (Array.isArray(value)) value.forEach((v) => walk(v, key));
      else if (value && typeof value === "object") {
        for (const [k, v] of Object.entries(value)) walk(v, k);
      }
    };
    walk({ ...scenario, id: undefined });
    expect(offenders).toEqual([]);
  });
});

// The figures from the brief, written out by hand so the scenario file
// cannot drift away from them unnoticed.
describe("Harbor Smoothie Co., March close", () => {
  const scenario = scenarios.find((s) => s.id === "harbor-smoothie-march")!;
  const keys = new Set(allStepKeys(scenario));
  const books = booksFor(scenario, (key) => keys.has(key));

  it("opening balance sheet: assets 100,000 = liabilities 36,000 + equity 64,000", () => {
    const opening = balanceSheet(booksFor(scenario, () => false));
    expect(opening.totalAssets).toBe(toCents(100000));
    expect(opening.totalLiabilities).toBe(toCents(36000));
    expect(opening.totalEquity).toBe(toCents(64000));
  });

  it("cash closes at 39,875", () => {
    expect(balance(books, "cash")).toBe(toCents(39875));
  });

  it("revenue 9,000, expenses 16,875, loss 7,875", () => {
    const is = incomeStatement(books);
    expect(is.totalRevenue).toBe(toCents(9000));
    expect(is.totalExpenses).toBe(toCents(16875));
    expect(is.netIncome).toBe(toCents(-7875));
  });

  it("balance sheet balances at 31 March", () => {
    const bs = balanceSheet(books);
    expect(bs.balanced).toBe(true);
    expect(bs.totalAssets).toBe(toCents(92275));
    expect(bs.totalLiabilities).toBe(toCents(36150));
    expect(bs.totalEquity).toBe(toCents(56125));
  });
});
