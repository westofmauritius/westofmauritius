import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import fr from "../../messages/fr.json";

/** Every key path in a nested messages object, e.g. "home.hero.title". */
function keys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("translation files", () => {
  it("French has exactly the same keys as English", () => {
    const enKeys = keys(en).sort();
    const frKeys = keys(fr).sort();
    expect(frKeys.filter((k) => !enKeys.includes(k))).toEqual([]);
    expect(enKeys.filter((k) => !frKeys.includes(k))).toEqual([]);
  });

  it("has no empty texts", () => {
    const empty = (messages: unknown) =>
      keys(messages).filter((path) => {
        const value = path
          .split(".")
          .reduce<unknown>(
            (node, key) => (node as Record<string, unknown>)[key],
            messages,
          );
        return typeof value === "string" && value.trim() === "";
      });
    expect(empty(en)).toEqual([]);
    expect(empty(fr)).toEqual([]);
  });
});
