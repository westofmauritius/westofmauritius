import { routing, type Locale } from "@/i18n/routing";
import { budgets, contactTopics, countryCodes, timeframes } from "./options";

/**
 * Form validation shared by the browser (instant feedback) and the server
 * (the real check — never trust the browser). Pure functions, unit-tested.
 *
 * Errors are codes, not sentences, so each side can show them in the
 * visitor's language (messages/*.json → "Forms.errors").
 */
export type ErrorCode =
  "required" | "email" | "tooLong" | "invalid" | "consent";
export type FieldErrors = Record<string, ErrorCode>;
export type Result<T> =
  { ok: true; data: T } | { ok: false; errors: FieldErrors };

/** Raw form input: strings and string lists, as sent by a form or as JSON. */
export type FormInput = Record<string, unknown>;

const text = (input: FormInput, key: string) =>
  typeof input[key] === "string" ? (input[key] as string).trim() : "";

const list = (input: FormInput, key: string): string[] => {
  const value = input[key];
  if (Array.isArray(value))
    return value.filter((v): v is string => typeof v === "string");
  return typeof value === "string" && value ? [value] : [];
};

const checked = (input: FormInput, key: string) => {
  const value = input[key];
  return value === true || value === "true" || value === "on" || value === "1";
};

// Pragmatic e-mail check: something@something.tld, no spaces. The real test
// is whether a reply arrives; stricter patterns reject valid addresses.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Collects errors field by field. */
class Checker {
  errors: FieldErrors = {};
  required(key: string, value: string, max = 200) {
    if (!value) this.errors[key] = "required";
    else if (value.length > max) this.errors[key] = "tooLong";
  }
  optional(key: string, value: string, max: number) {
    if (value.length > max) this.errors[key] = "tooLong";
  }
  email(key: string, value: string) {
    if (!value) this.errors[key] = "required";
    else if (value.length > 254 || !emailPattern.test(value))
      this.errors[key] = "email";
  }
  oneOf(key: string, value: string, allowed: readonly string[]) {
    if (!value) this.errors[key] = "required";
    else if (!allowed.includes(value)) this.errors[key] = "invalid";
  }
  consent(key: string, value: boolean) {
    if (!value) this.errors[key] = "consent";
  }
  result<T>(data: T): Result<T> {
    return Object.keys(this.errors).length
      ? { ok: false, errors: this.errors }
      : { ok: true, data };
  }
}

const localeOf = (input: FormInput): Locale => {
  const value = text(input, "locale");
  return (routing.locales as readonly string[]).includes(value)
    ? (value as Locale)
    : routing.defaultLocale;
};

export type LeadData = {
  locale: Locale;
  name: string;
  email: string;
  phone: string;
  country: string;
  budget: string;
  timeframe: string;
  areas: string[];
  message: string;
  newsletter: boolean;
  source: string;
};

/** The property enquiry ("lead") form. `knownAreas` are the valid area slugs. */
export function validateLead(
  input: FormInput,
  knownAreas: readonly string[],
): Result<LeadData> {
  const c = new Checker();
  const data: LeadData = {
    locale: localeOf(input),
    name: text(input, "name"),
    email: text(input, "email").toLowerCase(),
    phone: text(input, "phone"),
    country: text(input, "country").toUpperCase(),
    budget: text(input, "budget"),
    timeframe: text(input, "timeframe"),
    areas: [...new Set(list(input, "areas"))],
    message: text(input, "message"),
    newsletter: checked(input, "newsletter"),
    source: text(input, "source").slice(0, 120),
  };
  c.required("name", data.name, 120);
  c.email("email", data.email);
  c.optional("phone", data.phone, 40);
  if (data.phone && !/^[+\d][\d\s().-]{5,}$/.test(data.phone))
    c.errors.phone = "invalid";
  c.oneOf("country", data.country, countryCodes);
  c.oneOf("budget", data.budget, budgets);
  c.oneOf("timeframe", data.timeframe, timeframes);
  if (data.areas.some((a) => !knownAreas.includes(a)))
    c.errors.areas = "invalid";
  c.optional("message", data.message, 3000);
  c.consent("consent", checked(input, "consent"));
  return c.result(data);
}

export type ContactData = {
  locale: Locale;
  name: string;
  email: string;
  topic: string;
  message: string;
};

export function validateContact(input: FormInput): Result<ContactData> {
  const c = new Checker();
  const data: ContactData = {
    locale: localeOf(input),
    name: text(input, "name"),
    email: text(input, "email").toLowerCase(),
    topic: text(input, "topic"),
    message: text(input, "message"),
  };
  c.required("name", data.name, 120);
  c.email("email", data.email);
  c.oneOf("topic", data.topic, contactTopics);
  c.required("message", data.message, 5000);
  return c.result(data);
}

export type NewsletterData = { locale: Locale; email: string };

export function validateNewsletter(input: FormInput): Result<NewsletterData> {
  const c = new Checker();
  const data: NewsletterData = {
    locale: localeOf(input),
    email: text(input, "email").toLowerCase(),
  };
  c.email("email", data.email);
  c.consent("consent", checked(input, "consent"));
  return c.result(data);
}

/**
 * Bot checks shared by all forms:
 * - "website" is a hidden honeypot field; people never fill it in.
 * - "startedAt" is when the form was shown, set by our JavaScript. A
 *   submission within 3 seconds is faster than a person can type; forms over
 *   a day old are refused too. Without JavaScript there is no timestamp (a
 *   prerendered page cannot know when it was opened); such posts rely on the
 *   honeypot and the per-visitor rate limit.
 */
export function looksLikeBot(input: FormInput, now = Date.now()): boolean {
  if (text(input, "website")) return true;
  const raw = text(input, "startedAt");
  if (!raw) return false;
  const started = Number(raw);
  if (!Number.isFinite(started)) return true;
  const elapsed = now - started;
  return elapsed < 3000 || elapsed > 24 * 60 * 60 * 1000;
}
