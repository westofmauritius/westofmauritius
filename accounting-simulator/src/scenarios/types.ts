// The shape of a scenario file (src/scenarios/data/*.json).
//
// A scenario is pure data: the company, its chart of accounts, opening
// balances and a list of tasks. The app and the tests read any file that
// follows this shape, so a new scenario never needs new code.
// Amounts in scenario files are in dollars; the engine converts to cents.

import type { Account } from "@/engine";

export const ROLES = [
  "Purchasing",
  "Accounts payable",
  "Approver",
  "Treasury",
  "Accounts receivable",
  "Payroll",
  "Controller",
  "CFO",
] as const;
export type Role = (typeof ROLES)[number];

export interface ScenarioLine {
  account: string;
  debit?: number;
  credit?: number;
}

export interface ScenarioEntry {
  date: string;
  description: string;
  reference: string;
  lines: ScenarioLine[];
}

// Documents -------------------------------------------------------------------

export interface Party {
  name: string;
  address?: string;
}

export interface InvoiceDoc {
  kind: "invoice";
  /** "Invoice", "Purchase order", "Delivery note", "Sales invoice" and so on. */
  title: string;
  from: Party;
  to: Party;
  number: string;
  date: string;
  dueDate?: string;
  orderNumber?: string;
  lines: { description: string; quantity?: number; unitPrice?: number; amount: number }[];
  total: number;
  /** When false, the document shows quantities only (a delivery note). */
  showPrices?: boolean;
  notes?: string[];
  stamp?: { text: string; tone: "good" | "warn" | "info" };
}

export interface BankStatementDoc {
  kind: "bankStatement";
  bank: string;
  accountName: string;
  period: string;
  openingBalance?: number;
  closingBalance?: number;
  /** Positive is money in, negative is money out. */
  lines: { date: string; description: string; amount: number; highlight?: boolean }[];
}

export interface MemoDoc {
  kind: "memo";
  from: string;
  to: string;
  date: string;
  subject: string;
  body: string[];
  table?: { headers: string[]; rows: (string | number)[][] };
  stamp?: { text: string; tone: "good" | "warn" | "info" };
}

export interface PayrollDoc {
  kind: "payroll";
  period: string;
  payDate: string;
  employees: { name: string; role: string; amount: number }[];
  total: number;
  notes?: string[];
}

export interface ReconciliationDoc {
  kind: "reconciliation";
  date: string;
  bookBalance: number;
  bankBalance: number;
  notes?: string[];
}

export type ScenarioDocument = InvoiceDoc | BankStatementDoc | MemoDoc | PayrollDoc | ReconciliationDoc;

// Steps -----------------------------------------------------------------------

interface StepBase {
  id: string;
  /** Short heading, used when a task has several screens. */
  title?: string;
  prompt: string;
  /** Shown after the first wrong try. */
  hint: string;
  /** The full answer with the reasoning, shown after the second wrong try. */
  explanation: string;
  /** Shown when the learner gets it right. */
  correctFeedback: string;
  /** Overrides the task documents for this screen. */
  documents?: ScenarioDocument[];
}

export interface ChoiceStep extends StepBase {
  kind: "choice";
  options: { id: string; label: string; feedback: string }[];
  answer: string;
}

export interface EntryStep extends StepBase {
  kind: "entry";
  entry: ScenarioEntry;
}

export type Step = ChoiceStep | EntryStep;

// Tasks and scenario ------------------------------------------------------------

export interface Involvement {
  role: Role;
  action: string;
  /** Marks the part the learner plays. */
  you?: boolean;
}

export interface Task {
  id: string;
  title: string;
  from: string;
  date: string;
  /** One line for the inbox. */
  summary: string;
  documents: ScenarioDocument[];
  steps: Step[];
  involved: Involvement[];
  /** One sentence for the end of month "what you learned" list. */
  learned: string;
}

export interface Scenario {
  id: string;
  title: string;
  /** Lower numbers are shown first on the start page. */
  order: number;
  company: { name: string; tagline: string; about: string[] };
  learner: { role: string; reportsTo: string; about: string[] };
  people?: { name: string; role: Role | string; note: string }[];
  period: { label: string; start: string; end: string };
  accounts: Account[];
  opening: ScenarioEntry;
  tasks: Task[];
  /** Figures the tests check after the learner answers every task correctly. */
  expected?: {
    balances: Record<string, number>;
    netIncome: number;
  };
}
