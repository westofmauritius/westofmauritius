/**
 * The nine districts of Mauritius plus Rodrigues. Keys are stable ids used
 * in the database and URLs; names are translated in messages/*.json under
 * "regions".
 */
export const regions = [
  "port-louis",
  "pamplemousses",
  "riviere-du-rempart",
  "flacq",
  "grand-port",
  "savanne",
  "black-river",
  "plaines-wilhems",
  "moka",
  "rodrigues",
] as const;

export type Region = (typeof regions)[number];

export const isRegion = (value: unknown): value is Region =>
  typeof value === "string" && (regions as readonly string[]).includes(value);
