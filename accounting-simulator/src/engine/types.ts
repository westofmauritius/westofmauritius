// Core types of the accounting engine.
//
// All amounts inside the engine are whole cents (integers). Doing sums in
// cents avoids floating point surprises such as 0.1 + 0.2 !== 0.3, which
// would make a balanced entry look unbalanced. Scenario files use dollars and
// are converted once, at the boundary (see money.ts).

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export interface Account {
  /** Stable id used in scenario files, for example "accounts_payable". */
  id: string;
  /** Account number shown in the books, for example "2000". */
  code?: string;
  name: string;
  type: AccountType;
  /**
   * A contra account sits under a type but carries the opposite balance.
   * Accumulated depreciation is an asset account with a credit balance.
   */
  contra?: boolean;
  /** Cash accounts feed the cash movement summary. */
  cash?: boolean;
}

export interface JournalLine {
  account: string;
  debit: number; // cents, zero or positive
  credit: number; // cents, zero or positive
}

export interface JournalEntry {
  id: string;
  date: string; // ISO date, YYYY-MM-DD
  description: string;
  reference: string; // document reference, for example "INV 20417"
  lines: JournalLine[];
}

export interface Books {
  accounts: Account[];
  entries: JournalEntry[];
}
