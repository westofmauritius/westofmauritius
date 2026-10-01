/**
 * Choices offered in the forms. The values are stable codes stored in the
 * database; the labels shown to visitors are in messages/*.json ("Forms").
 */

export const budgets = [
  "under-300k",
  "300k-600k",
  "600k-1m",
  "over-1m",
  "unsure",
] as const;
export type Budget = (typeof budgets)[number];

export const timeframes = [
  "within-6-months",
  "6-12-months",
  "1-2-years",
  "just-curious",
] as const;
export type Timeframe = (typeof timeframes)[number];

export const contactTopics = ["general", "partnership", "feedback"] as const;
export type ContactTopic = (typeof contactTopics)[number];

/**
 * ISO 3166-1 country codes. Names are produced in the visitor's language with
 * Intl.DisplayNames, so no translation list is needed. The main audiences
 * (France, South Africa, UK, Mauritius, Australia …) are listed first.
 */
export const priorityCountries = [
  "FR",
  "ZA",
  "GB",
  "MU",
  "AU",
  "BE",
  "CH",
  "RE",
  "DE",
];

export const countryCodes = (
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS " +
  "BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE " +
  "EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM " +
  "HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC " +
  "LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA " +
  "NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW " +
  "SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO " +
  "TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW"
).split(" ");

/** Country options in the visitor's language: main audiences first, then A–Z. */
export function countryOptions(
  locale: string,
): { value: string; label: string }[] {
  const names = new Intl.DisplayNames([locale], { type: "region" });
  const label = (code: string) => names.of(code) ?? code;
  const rest = countryCodes
    .filter((c) => !priorityCountries.includes(c))
    .map((c) => ({ value: c, label: label(c) }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
  return [
    ...priorityCountries.map((c) => ({ value: c, label: label(c) })),
    ...rest,
  ];
}
