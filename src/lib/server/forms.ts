import "server-only";
import { getPathname } from "@/i18n/pathname";
import { routing, type Locale } from "@/i18n/routing";
import type { FieldErrors, FormInput, Result } from "@/lib/forms/validation";
import { looksLikeBot } from "@/lib/forms/validation";
import { clientIp, hashIp } from "./request";
import { getStore } from "./store";
import type { RateKind, Store } from "./types";

/**
 * Reads a form submission sent either as JSON (our JavaScript forms) or as a
 * classic form post (browsers without JavaScript). Repeated fields such as
 * "areas" become lists.
 */
export async function readInput(request: Request): Promise<FormInput> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    return body && typeof body === "object" ? (body as FormInput) : {};
  }
  const form = await request.formData();
  const input: Record<string, string | string[]> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value !== "string") continue;
    const existing = input[key];
    input[key] = existing === undefined ? value : [...[existing].flat(), value];
  }
  return input;
}

const wantsJson = (request: Request) =>
  (request.headers.get("accept") ?? "").includes("application/json") ||
  (request.headers.get("content-type") ?? "").includes("application/json");

const localeOf = (input: FormInput): Locale =>
  (routing.locales as readonly string[]).includes(String(input.locale))
    ? (input.locale as Locale)
    : routing.defaultLocale;

type Outcome =
  | { status: "ok" }
  | { status: "invalid"; errors: FieldErrors }
  | { status: "rate-limited" }
  | { status: "unavailable" };

/**
 * The common path of every form: bot check → rate limit → validation → save.
 *
 * - Bots get a normal "ok" (so they learn nothing) but nothing is saved.
 * - `limit` submissions per hour per visitor (by hashed IP).
 * - Without a database on the live site the form says it is unavailable
 *   rather than silently losing the submission.
 */
export async function handleForm<T>(
  request: Request,
  options: {
    kind: RateKind;
    limit: number;
    form: string;
    validate: (input: FormInput) => Result<T>;
    save: (store: Store, data: T, context: { ipHash: string }) => Promise<void>;
  },
): Promise<Response> {
  const input = await readInput(request);
  const locale = localeOf(input);
  const respond = (outcome: Outcome) =>
    formResponse(request, outcome, locale, options.form);

  if (looksLikeBot(input)) return respond({ status: "ok" });

  const store = getStore();
  if (!store) {
    console.error(
      `Form "${options.form}" received but no DATABASE_URL is configured.`,
    );
    return respond({ status: "unavailable" });
  }

  const ipHash = await hashIp(clientIp(request.headers));
  if ((await store.hit(options.kind, ipHash, 60)) > options.limit) {
    return respond({ status: "rate-limited" });
  }

  const result = options.validate(input);
  if (!result.ok) return respond({ status: "invalid", errors: result.errors });

  await options.save(store, result.data, { ipHash });
  return respond({ status: "ok" });
}

const statusCode = {
  ok: 200,
  invalid: 400,
  "rate-limited": 429,
  unavailable: 503,
} as const;

/**
 * JavaScript forms get JSON. A classic form post is redirected: to the
 * thank-you page on success, otherwise back to the page it came from.
 */
function formResponse(
  request: Request,
  outcome: Outcome,
  locale: Locale,
  form: string,
): Response {
  if (wantsJson(request)) {
    return Response.json(
      outcome.status === "invalid"
        ? { ok: false, status: outcome.status, errors: outcome.errors }
        : { ok: outcome.status === "ok", status: outcome.status },
      { status: statusCode[outcome.status] },
    );
  }
  // Same host as the request, so a preview or local copy stays on itself.
  const origin = new URL(request.url).origin;
  const target =
    outcome.status === "ok"
      ? `${origin}${getPathname({ href: "/thank-you", locale })}?form=${form}`
      : (request.headers.get("referer") ?? `${origin}/${locale}`);
  return Response.redirect(target, 303);
}
