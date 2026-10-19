import { describe, expect, it } from "vitest";
import { calculatorDefaults, policyFacts } from "./facts";

const all = { ...policyFacts, ...calculatorDefaults };

describe("content/facts.ts", () => {
  it("gives every fact a source with a URL and a check date", () => {
    for (const [key, fact] of Object.entries(all)) {
      expect(fact.source.name, key).not.toBe("");
      expect(fact.source.url, key).toMatch(/^https:\/\//);
      expect(fact.checkedOn, key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("explains every placeholder to the owner", () => {
    for (const [key, fact] of Object.entries(all)) {
      if ("placeholder" in fact && fact.placeholder) {
        expect(fact.note, key).toMatch(/PLACEHOLDER/);
      }
    }
  });

  it("keeps the brief's figures", () => {
    expect(policyFacts.grantMaxMur.value).toBe(75_000);
    expect(policyFacts.grantSharePercent.value).toBe(25);
    expect(calculatorDefaults.tariffMurPerKwh.value).toBe(9);
    expect(calculatorDefaults.sunHoursPerDay.value).toBe(5);
    expect(calculatorDefaults.performanceRatio.value).toBe(0.78);
  });
});
