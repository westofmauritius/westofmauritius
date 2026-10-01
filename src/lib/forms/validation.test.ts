import { describe, expect, it } from "vitest";
import {
  looksLikeBot,
  validateContact,
  validateLead,
  validateNewsletter,
} from "./validation";

const areas = ["tamarin", "le-morne"];

const validLead = {
  locale: "fr",
  name: "  Marie Dupont ",
  email: "Marie@Example.com",
  phone: "+33 6 12 34 56 78",
  country: "fr",
  budget: "300k-600k",
  timeframe: "6-12-months",
  areas: ["tamarin", "tamarin"],
  message: "Bonjour",
  consent: "on",
  newsletter: "on",
};

describe("validateLead", () => {
  it("accepts and cleans a valid enquiry", () => {
    const result = validateLead(validLead, areas);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toMatchObject({
      locale: "fr",
      name: "Marie Dupont",
      email: "marie@example.com",
      country: "FR",
      areas: ["tamarin"],
      newsletter: true,
    });
  });

  it("reports every problem at once", () => {
    const result = validateLead(
      { email: "nope", budget: "a lot", areas: ["mars"] },
      areas,
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toEqual({
      name: "required",
      email: "email",
      country: "required",
      budget: "invalid",
      timeframe: "required",
      areas: "invalid",
      consent: "consent",
    });
  });

  it("requires consent", () => {
    const result = validateLead({ ...validLead, consent: undefined }, areas);
    expect(result.ok || result.errors).toEqual({ consent: "consent" });
  });

  it("checks phone numbers loosely and lengths strictly", () => {
    const bad = validateLead(
      { ...validLead, phone: "call me", message: "x".repeat(3001) },
      areas,
    );
    expect(bad.ok || bad.errors).toEqual({
      phone: "invalid",
      message: "tooLong",
    });
  });

  it("falls back to the default language", () => {
    const result = validateLead({ ...validLead, locale: "xx" }, areas);
    expect(result.ok && result.data.locale).toBe("en");
  });
});

describe("validateContact", () => {
  it("needs a name, e-mail, topic and message", () => {
    const result = validateContact({ topic: "spam" });
    expect(result.ok || result.errors).toEqual({
      name: "required",
      email: "required",
      topic: "invalid",
      message: "required",
    });
  });
});

describe("validateNewsletter", () => {
  it("needs a valid e-mail and consent", () => {
    expect(validateNewsletter({ email: "a@b.co", consent: true }).ok).toBe(
      true,
    );
    const result = validateNewsletter({ email: "a@b" });
    expect(result.ok || result.errors).toEqual({
      email: "email",
      consent: "consent",
    });
  });
});

describe("looksLikeBot", () => {
  const now = 1_000_000_000;
  it("flags a filled honeypot", () => {
    expect(
      looksLikeBot(
        { website: "spam.example", startedAt: String(now - 60_000) },
        now,
      ),
    ).toBe(true);
  });
  it("flags instant, stale and garbled timestamps", () => {
    expect(looksLikeBot({ startedAt: String(now - 500) }, now)).toBe(true);
    expect(looksLikeBot({ startedAt: String(now - 2 * 86_400_000) }, now)).toBe(
      true,
    );
    expect(looksLikeBot({ startedAt: "soon" }, now)).toBe(true);
  });

  it("accepts posts without a timestamp (no JavaScript)", () => {
    expect(looksLikeBot({}, now)).toBe(false);
  });
  it("lets a person through", () => {
    expect(
      looksLikeBot({ website: "", startedAt: String(now - 45_000) }, now),
    ).toBe(false);
  });
});
