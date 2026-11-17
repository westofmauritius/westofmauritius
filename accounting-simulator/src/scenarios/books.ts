// Turns scenario data into engine objects, and checks that a scenario file
// is internally consistent. Safe to use in the browser and on the server.

import {
  type Books,
  type JournalEntry,
  type JournalLine,
  postEntry,
  toCents,
  totals,
  validateEntry,
  netDebit,
} from "@/engine";
import { ROLES, type Scenario, type ScenarioEntry, type ScenarioLine, type Step, type Task } from "./types";

export const OPENING_ENTRY_ID = "opening";

export function toLines(lines: ScenarioLine[]): JournalLine[] {
  return lines.map((l) => ({ account: l.account, debit: toCents(l.debit ?? 0), credit: toCents(l.credit ?? 0) }));
}

export function stepKey(task: Task, step: Step): string {
  return `${task.id}/${step.id}`;
}

function toEntry(id: string, entry: ScenarioEntry): JournalEntry {
  return { id, date: entry.date, description: entry.description, reference: entry.reference, lines: toLines(entry.lines) };
}

/** The journal entry a step posts, if it posts one. */
export function stepEntry(task: Task, step: Step): JournalEntry | null {
  return step.kind === "entry" ? toEntry(stepKey(task, step), step.entry) : null;
}

/**
 * Books after the opening balances and every completed step, in scenario
 * order. Only the expected entries are ever posted: the learner must reach
 * the right entry before a step counts as done.
 */
export function booksFor(scenario: Scenario, completed: (key: string) => boolean): Books {
  let books: Books = { accounts: scenario.accounts, entries: [] };
  books = postEntry(books, toEntry(OPENING_ENTRY_ID, scenario.opening));
  for (const task of scenario.tasks) {
    for (const step of task.steps) {
      const entry = stepEntry(task, step);
      if (entry && completed(stepKey(task, step))) books = postEntry(books, entry);
    }
  }
  return books;
}

export function allStepKeys(scenario: Scenario): string[] {
  return scenario.tasks.flatMap((task) => task.steps.map((step) => stepKey(task, step)));
}

/**
 * Checks a scenario file and returns a list of problems in plain words.
 * Run by the tests and when the app loads scenarios, so a mistake in a new
 * JSON file shows up straight away.
 */
export function validateScenario(scenario: Scenario): string[] {
  const problems: string[] = [];
  const where = (text: string) => problems.push(`${scenario.id}: ${text}`);
  const accountIds = new Set(scenario.accounts.map((a) => a.id));

  if (accountIds.size !== scenario.accounts.length) where("two accounts share an id");

  const checkEntry = (label: string, entry: ScenarioEntry) => {
    const lines = toLines(entry.lines);
    for (const problem of validateEntry(lines, scenario.accounts)) {
      where(`${label} breaks rule "${problem.code}"`);
    }
  };
  checkEntry("opening balances", scenario.opening);

  const taskIds = new Set<string>();
  for (const task of scenario.tasks) {
    if (taskIds.has(task.id)) where(`task id "${task.id}" is used twice`);
    taskIds.add(task.id);
    if (task.steps.length === 0) where(`task "${task.id}" has no steps`);
    const stepIds = new Set<string>();
    for (const step of task.steps) {
      if (stepIds.has(step.id)) where(`step id "${task.id}/${step.id}" is used twice`);
      stepIds.add(step.id);
      if (step.kind === "entry") checkEntry(`entry in ${task.id}/${step.id}`, step.entry);
      if (step.kind === "choice" && !step.options.some((o) => o.id === step.answer)) {
        where(`choice ${task.id}/${step.id} has no option with id "${step.answer}"`);
      }
    }
    for (const person of task.involved) {
      if (!(ROLES as readonly string[]).includes(person.role)) where(`unknown role "${person.role}" in ${task.id}`);
    }
    for (const doc of [...task.documents, ...task.steps.flatMap((s) => s.documents ?? [])]) {
      if (doc.kind === "invoice" && doc.showPrices !== false) {
        const sum = doc.lines.reduce((t, l) => t + toCents(l.amount), 0);
        if (sum !== toCents(doc.total)) where(`${doc.title} ${doc.number} lines do not add up to the total`);
      }
      if (doc.kind === "payroll") {
        const sum = doc.employees.reduce((t, e) => t + toCents(e.amount), 0);
        if (sum !== toCents(doc.total)) where(`payroll in ${task.id} does not add up`);
      }
      if (doc.kind === "bankStatement" && doc.openingBalance !== undefined && doc.closingBalance !== undefined) {
        const sum = doc.lines.reduce((t, l) => t + toCents(l.amount), toCents(doc.openingBalance));
        if (sum !== toCents(doc.closingBalance)) where(`bank statement in ${task.id} does not add up`);
      }
    }
  }
  return problems;
}

/**
 * For a reconciliation document: the cash in the books just before the task
 * that shows it. Lets the tests prove the document matches the books.
 */
export function cashBeforeTask(scenario: Scenario, taskId: string): number {
  const index = scenario.tasks.findIndex((t) => t.id === taskId);
  const done = new Set(
    scenario.tasks.slice(0, index).flatMap((task) => task.steps.map((step) => stepKey(task, step))),
  );
  const books = booksFor(scenario, (key) => done.has(key));
  const cashIds = scenario.accounts.filter((a) => a.cash).map((a) => a.id);
  return cashIds.reduce((t, id) => t + netDebit(books.entries, id), 0);
}

export { totals };
