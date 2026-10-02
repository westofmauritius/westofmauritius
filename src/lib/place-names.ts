import type { Locale } from "@/i18n/routing";

/**
 * A place name ready for "in …" sentences. English messages say "in {name}"
 * themselves; French needs the preposition joined to the name: "à Tamarin"
 * but "au Morne" (à + le).
 */
export function inPlace(name: string, locale: Locale) {
  if (locale !== "fr") return name;
  if (name.startsWith("Le ")) return `au ${name.slice(3)}`;
  return `à ${name}`;
}
