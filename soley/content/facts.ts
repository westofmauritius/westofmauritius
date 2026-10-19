/**
 * Every fact and default number the site relies on, each with its source.
 *
 * Rules (from the brief):
 * - Never invent figures, rules or quotes. Everything here comes from the
 *   owner's brief, and each entry names where it comes from.
 * - Every entry has `verify: true` until the owner has checked it against
 *   the source. LAUNCH_CHECKLIST.md lists them all.
 * - `placeholder: true` means the brief asked for the setting but gave no
 *   value, so the number below is a stand-in that the owner must replace.
 *   The site labels results that use it as rough estimates.
 * - Source URLs point to the publisher's home page where the brief did not
 *   give the exact article address; the owner adds the exact links.
 *
 * Admins can change values in Admin → Facts / Settings without a new
 * deployment. Those changes are stored in the database (tables `facts` and
 * `calculator_settings`) and take priority over the defaults in this file.
 */

export type Source = {
  name: string;
  url: string;
  /** Publication date of the source, ISO format. */
  published?: string;
};

type BaseFact = {
  /** Where the fact comes from. */
  source: Source;
  /** Date this entry was last checked against its source, ISO format. */
  checkedOn: string;
  /** True until the owner has verified the entry before launch. */
  verify: boolean;
  /** True if the brief gave no value and the number is a stand-in. */
  placeholder?: boolean;
  /** A note for the owner, shown in Admin → Facts. Not shown publicly. */
  note?: string;
};

export type NumberFact = BaseFact & { kind: "number"; value: number };
export type TextFact = BaseFact & { kind: "text" };

const brief: Source = {
  name: "Owner's brief (to be checked against an official source)",
  url: "https://ceb.mu",
};

const lexpress: Source = {
  name: "L'Express via AllAfrica",
  url: "https://allafrica.com/mauritius/",
  published: "2026-07-27",
};

const ceb: Source = {
  name: "Central Electricity Board (ceb.mu)",
  url: "https://ceb.mu",
};

const pvMagazine: Source = {
  name: "pv magazine",
  url: "https://www.pv-magazine.com",
  published: "2025-12",
};

/** Policy facts shown in texts. Their wording is in messages/*.json. */
export const policyFacts = {
  /** Household Rooftop Solar Photovoltaic Grant Scheme: maximum grant. */
  grantMaxMur: {
    kind: "number",
    value: 75_000,
    source: lexpress,
    checkedOn: "2026-10-19",
    verify: true,
  },
  /** Share of an approved system's cost that the grant covers, in percent. */
  grantSharePercent: {
    kind: "number",
    value: 25,
    source: lexpress,
    checkedOn: "2026-10-19",
    verify: true,
  },
  /** The grant scheme was launched in July 2026. */
  grantLaunched: {
    kind: "text",
    source: lexpress,
    checkedOn: "2026-10-19",
    verify: true,
  },
  /** Households can borrow the remainder from the Development Bank of Mauritius. */
  dbmLoan: {
    kind: "text",
    source: lexpress,
    checkedOn: "2026-10-19",
    verify: true,
    note: "The brief does not say which source states this; check with DBM (dbm.mu).",
  },
  /** Surplus electricity can be sold back to the CEB. */
  cebBuyback: {
    kind: "text",
    source: ceb,
    checkedOn: "2026-10-19",
    verify: true,
    note: "The brief gives no export tariff, so the calculator does not count surplus income.",
  },
  /** The CEB SSPV Scheme (Households) 2026 also covers hybrid systems with a battery. */
  cebHybrid: {
    kind: "text",
    source: ceb,
    checkedOn: "2026-10-19",
    verify: true,
  },
  /** The CEB has warned that unregistered solar systems may be disconnected. */
  cebUnregisteredWarning: {
    kind: "text",
    source: pvMagazine,
    checkedOn: "2026-10-19",
    verify: true,
  },
} satisfies Record<string, NumberFact | TextFact>;

/**
 * Calculator defaults. All are estimates and the interface says so. Admins
 * change them in Admin → Settings.
 */
export const calculatorDefaults = {
  /** Electricity price, MUR per kWh. */
  tariffMurPerKwh: {
    kind: "number",
    value: 9,
    source: brief,
    checkedOn: "2026-10-19",
    verify: true,
    note: "Average estimate from the brief. CEB tariffs are tiered; check against the CEB tariff page.",
  },
  /** Peak sun hours per day. */
  sunHoursPerDay: {
    kind: "number",
    value: 5,
    source: brief,
    checkedOn: "2026-10-19",
    verify: true,
  },
  /** System efficiency (performance ratio), 0–1. */
  performanceRatio: {
    kind: "number",
    value: 0.78,
    source: brief,
    checkedOn: "2026-10-19",
    verify: true,
  },
  /** Installed price per kWp, MUR. */
  costPerKwpMur: {
    kind: "number",
    value: 60_000,
    source: brief,
    checkedOn: "2026-10-19",
    verify: true,
    placeholder: true,
    note: "PLACEHOLDER. The brief makes this a setting but gives no value. Replace it with an average from real installer quotes.",
  },
  /** Added price of a home battery, MUR. */
  batteryCostMur: {
    kind: "number",
    value: 150_000,
    source: brief,
    checkedOn: "2026-10-19",
    verify: true,
    placeholder: true,
    note: "PLACEHOLDER. No value in the brief. Replace it with an average from real installer quotes.",
  },
  /** Roof area needed per kWp of panels, m². */
  roofM2PerKwp: {
    kind: "number",
    value: 6,
    source: brief,
    checkedOn: "2026-10-19",
    verify: true,
    placeholder: true,
    note: "PLACEHOLDER. No value in the brief. Ask an installer what is typical for the panels they fit.",
  },
} satisfies Record<string, NumberFact>;

export type PolicyFactKey = keyof typeof policyFacts;
export type CalculatorSettingKey = keyof typeof calculatorDefaults;

/** The plain number values of the calculator defaults. */
export type CalculatorSettings = Record<CalculatorSettingKey, number>;

export const defaultCalculatorSettings: CalculatorSettings = Object.fromEntries(
  Object.entries(calculatorDefaults).map(([key, fact]) => [key, fact.value]),
) as CalculatorSettings;

/** Official pages the grant guide links to, with the date they were last checked. */
export const officialLinks = {
  ceb: { url: "https://ceb.mu", checkedOn: "2026-10-19" },
  dbm: { url: "https://www.dbm.mu", checkedOn: "2026-10-19" },
  dataProtection: {
    url: "https://dataprotection.govmu.org",
    checkedOn: "2026-10-19",
  },
} as const;
