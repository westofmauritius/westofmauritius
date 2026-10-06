"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";

export type WhatsappLabels = {
  name: string;
  phone: string;
  phoneHint: string;
  role: string;
  roles: { value: string; label: string }[];
  required: string;
  consent: string;
  submit: string;
  sending: string;
  successTitle: string;
  successText: string;
  errorRequired: string;
  errorPhone: string;
  errorRole: string;
  errorConsent: string;
  errorOther: string;
};

type Errors = Partial<Record<"name" | "phone" | "role" | "consent", string>>;

/**
 * "Join the WhatsApp group" interest form. Like the newsletter form it gets
 * its texts from the server and checks inline; the server checks again
 * (validateWhatsapp). Works without JavaScript as a normal form post.
 */
export function WhatsappForm({
  labels,
  locale,
  source,
}: {
  labels: WhatsappLabels;
  locale: string;
  source: string;
}) {
  const id = useId();
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const [errors, setErrors] = useState<Errors>({});
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
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const role = String(form.get("role") ?? "");
    const consent = form.get("consent") === "on";
    const found: Errors = {
      ...(!name && { name: labels.errorRequired }),
      ...(!phone
        ? { phone: labels.errorRequired }
        : !/^\+?[\d\s().-]{7,}$/.test(phone) && { phone: labels.errorPhone }),
      ...(!role && { role: labels.errorRole }),
      ...(!consent && { consent: labels.errorConsent }),
    };
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setState("sending");
    try {
      const response = await fetch("/api/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          role,
          consent,
          locale,
          source,
          website: form.get("website") ?? "",
          startedAt: String(startedAt.current),
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
      };
      if (response.ok && body.ok) {
        setState("success");
        track("whatsapp-interest", { role, source });
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div role="status">
        <p ref={successRef} tabIndex={-1} className="type-h4">
          {labels.successTitle}
        </p>
        <p className="mt-2 text-ink-muted">{labels.successText}</p>
      </div>
    );
  }

  const input =
    "mt-2 block min-h-12 w-full rounded-xl border bg-white px-4 text-base";
  const error = (key: keyof Errors) =>
    errors[key] && (
      <span
        id={`${id}-${key}-error`}
        className="mt-1.5 block text-small text-coral-700"
      >
        {errors[key]}
      </span>
    );
  const describedBy = (key: keyof Errors, extra?: string) =>
    [errors[key] && `${id}-${key}-error`, extra].filter(Boolean).join(" ") ||
    undefined;

  return (
    <form
      action="/api/whatsapp"
      method="post"
      noValidate
      onSubmit={onSubmit}
      className="relative space-y-5"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="source" value={source} />
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label htmlFor={`${id}-name`} className="block text-small font-medium">
        {labels.name}{" "}
        <span className="font-normal text-ink-muted">({labels.required})</span>
        <input
          id={`${id}-name`}
          name="name"
          autoComplete="name"
          required
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describedBy("name")}
          className={`${input} ${errors.name ? "border-coral-600" : "border-line"}`}
        />
        {error("name")}
      </label>

      <label htmlFor={`${id}-phone`} className="block text-small font-medium">
        {labels.phone}{" "}
        <span className="font-normal text-ink-muted">({labels.required})</span>
        <span
          id={`${id}-phone-hint`}
          className="mt-1 block font-normal text-ink-muted"
        >
          {labels.phoneHint}
        </span>
        <input
          id={`${id}-phone`}
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          required
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={describedBy("phone", `${id}-phone-hint`)}
          className={`${input} ${errors.phone ? "border-coral-600" : "border-line"}`}
        />
        {error("phone")}
      </label>

      <fieldset aria-describedby={describedBy("role")}>
        <legend className="text-small font-medium">
          {labels.role}{" "}
          <span className="font-normal text-ink-muted">
            ({labels.required})
          </span>
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {labels.roles.map((r) => (
            <label
              key={r.value}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 text-small has-[:checked]:border-ocean-900 has-[:checked]:ring-1 has-[:checked]:ring-ocean-900"
            >
              <input
                type="radio"
                name="role"
                value={r.value}
                required
                className="size-4 accent-ocean-900"
              />
              {r.label}
            </label>
          ))}
        </div>
        {error("role")}
      </fieldset>

      <div>
        <label
          htmlFor={`${id}-consent`}
          className="flex cursor-pointer items-start gap-3 text-small leading-relaxed"
        >
          <input
            id={`${id}-consent`}
            type="checkbox"
            name="consent"
            required
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={describedBy("consent")}
            className="mt-0.5 size-5 shrink-0 accent-ocean-900"
          />
          <span>{labels.consent}</span>
        </label>
        {errors.consent && (
          <span
            id={`${id}-consent-error`}
            className="mt-1.5 ml-8 block text-small text-coral-700"
          >
            {errors.consent}
          </span>
        )}
      </div>

      {state === "error" && (
        <p role="alert" className="text-small text-coral-700">
          {labels.errorOther}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-ocean-900 px-7 text-small font-medium tracking-wide text-white transition-colors hover:bg-ocean-800 disabled:opacity-50"
      >
        {state === "sending" ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
