"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";

export type NewsletterLabels = {
  title: string;
  text: string;
  email: string;
  required: string;
  consent: string;
  submit: string;
  sending: string;
  successTitle: string;
  successText: string;
  errorEmail: string;
  errorConsent: string;
  errorOther: string;
};

/**
 * Newsletter sign-up in the footer of every page. Deliberately light: texts
 * come in as props from the server (no translation library in the browser)
 * and the checks are inlined, because this script loads on every page.
 * The server re-validates everything (src/lib/forms/validation.ts).
 *
 * Double opt-in: the address is only used once the person clicks the link in
 * the confirmation e-mail. Works without JavaScript too (normal form post).
 */
export function NewsletterForm({
  labels,
  locale,
}: {
  labels: NewsletterLabels;
  locale: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const [errors, setErrors] = useState<{ email?: string; consent?: string }>(
    {},
  );
  const startedAt = useRef(0);
  const successRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  useEffect(() => {
    if (state === "success") successRef.current?.focus();
  }, [state]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const consent = form.get("consent") === "on";
    const found = {
      ...(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && {
        email: labels.errorEmail,
      }),
      ...(!consent && { consent: labels.errorConsent }),
    };
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setState("sending");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          consent,
          locale,
          website: form.get("website") ?? "",
          startedAt: String(startedAt.current),
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
      };
      if (response.ok && body.ok) {
        setState("success");
        track("newsletter-signup", { language: locale });
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  const input =
    "mt-2 block min-h-12 w-full rounded-sm border bg-white/5 px-4 text-base text-white placeholder:text-ocean-300";

  return (
    <div>
      <p className="font-display text-2xl text-white">{labels.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-ocean-200">
        {labels.text}
      </p>
      {state === "success" ? (
        <div role="status" className="mt-5">
          <p ref={successRef} tabIndex={-1} className="font-medium text-white">
            {labels.successTitle}
          </p>
          <p className="mt-1 text-sm text-ocean-200">{labels.successText}</p>
        </div>
      ) : (
        <form
          action="/api/newsletter"
          method="post"
          noValidate
          onSubmit={onSubmit}
          className="relative mt-5 space-y-4"
        >
          <input type="hidden" name="locale" value={locale} />
          {/* Honeypot: hidden from people, tempting for bots. */}
          <div
            aria-hidden="true"
            className="absolute -left-[9999px] h-px w-px overflow-hidden"
          >
            <label>
              Website
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>

          <label
            htmlFor="newsletter-email"
            className="block text-sm font-medium text-ocean-100"
          >
            {labels.email}{" "}
            <span className="font-normal text-ocean-200">
              ({labels.required})
            </span>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={
                errors.email ? "newsletter-email-error" : undefined
              }
              className={`${input} ${errors.email ? "border-coral-300" : "border-white/20"}`}
            />
            {errors.email && (
              <span
                id="newsletter-email-error"
                className="mt-1.5 block text-sm text-coral-200"
              >
                {errors.email}
              </span>
            )}
          </label>

          <div>
            <label
              htmlFor="newsletter-consent"
              className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ocean-100"
            >
              <input
                id="newsletter-consent"
                type="checkbox"
                name="consent"
                required
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={
                  errors.consent ? "newsletter-consent-error" : undefined
                }
                className="mt-0.5 size-5 shrink-0 accent-coral-500"
              />
              <span>{labels.consent}</span>
            </label>
            {errors.consent && (
              <span
                id="newsletter-consent-error"
                className="mt-1.5 ml-8 block text-sm text-coral-200"
              >
                {errors.consent}
              </span>
            )}
          </div>

          {state === "error" && (
            <p role="alert" className="text-sm text-coral-200">
              {labels.errorOther}
            </p>
          )}

          <button
            type="submit"
            disabled={state === "sending"}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-white/95 px-6 text-sm font-medium tracking-wide text-ocean-900 transition-colors hover:bg-white disabled:opacity-50"
          >
            {state === "sending" ? labels.sending : labels.submit}
          </button>
        </form>
      )}
    </div>
  );
}
