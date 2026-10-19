/** Crockford base32 without look-alikes (no I, L, O, U). */
const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** A short reference people can read out on the phone: "SOL-7KQ2M". */
export function requestReference(prefix = "SOL"): string {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return `${prefix}-${Array.from(bytes, (b) => alphabet[b % 32]).join("")}`;
}

export const newId = () => crypto.randomUUID();

/** "Demo Nord Solaire Ltd" → "demo-nord-solaire-ltd". */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
