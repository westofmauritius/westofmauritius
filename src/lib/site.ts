/**
 * Site-wide settings that do not belong to a single page.
 * Step 3 connects the brand name to the active language.
 */
export const brandName = {
  en: "West Mauritius",
  fr: "Ouest Maurice",
} as const;

/** The six areas covered by the site, west coast from north to south. */
export const areaNames = [
  "Flic en Flac",
  "Tamarin",
  "Black River",
  "La Gaulette",
  "Le Morne",
  "Chamarel",
] as const;
