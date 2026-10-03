"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { ErrorCode, FieldErrors } from "@/lib/forms/validation";
import type { SubmissionState } from "./useFormSubmission";

/**
 * Form building blocks with accessible wiring: every input has a visible
 * label, hints and errors are linked with aria-describedby, invalid fields
 * get aria-invalid, and required fields are marked in words (not only "*").
 */

export const fieldId = (form: string, name: string) => `${form}-${name}`;

const inputClass =
  "mt-2 block min-h-12 w-full rounded-sm border bg-white px-4 text-base text-ink transition-colors placeholder:text-ink-muted/70 focus:border-ocean-700";

function useErrorText() {
  const t = useTranslations("Forms");
  return (name: string, code: ErrorCode) =>
    name === "phone" && code === "invalid"
      ? t("errors.phoneInvalid")
      : t(`errors.${code}`);
}

type BaseProps = {
  form: string;
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  errors: FieldErrors;
};

function LabelText({ label, required }: { label: string; required?: boolean }) {
  const t = useTranslations("Forms");
  return (
    <span className="text-small font-medium">
      {label}{" "}
      <span className="font-normal text-ink-muted">
        ({required ? t("required") : t("optional")})
      </span>
    </span>
  );
}

function Described({
  id,
  hint,
  error,
}: {
  id: string;
  hint?: string;
  error?: string;
}) {
  return (
    <>
      {hint && (
        <span
          id={`${id}-hint`}
          className="mt-1.5 block text-small text-ink-muted"
        >
          {hint}
        </span>
      )}
      {error && (
        <span
          id={`${id}-error`}
          className="mt-1.5 block text-small font-medium text-coral-700"
        >
          {error}
        </span>
      )}
    </>
  );
}

const describedBy = (id: string, hint?: string, error?: string) =>
  [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") ||
  undefined;

export function TextField({
  type = "text",
  autoComplete,
  ...props
}: BaseProps & { type?: string; autoComplete?: string }) {
  const errorText = useErrorText();
  const id = fieldId(props.form, props.name);
  const error =
    props.errors[props.name] && errorText(props.name, props.errors[props.name]);
  return (
    <label htmlFor={id} className="block">
      <LabelText label={props.label} required={props.required} />
      <input
        id={id}
        name={props.name}
        type={type}
        autoComplete={autoComplete}
        required={props.required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, props.hint, error)}
        className={cn(inputClass, error ? "border-coral-600" : "border-line")}
      />
      <Described id={id} hint={props.hint} error={error} />
    </label>
  );
}

export function TextArea(props: BaseProps & { rows?: number }) {
  const errorText = useErrorText();
  const id = fieldId(props.form, props.name);
  const error =
    props.errors[props.name] && errorText(props.name, props.errors[props.name]);
  return (
    <label htmlFor={id} className="block">
      <LabelText label={props.label} required={props.required} />
      <textarea
        id={id}
        name={props.name}
        rows={props.rows ?? 5}
        required={props.required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, props.hint, error)}
        className={cn(
          inputClass,
          "py-3",
          error ? "border-coral-600" : "border-line",
        )}
      />
      <Described id={id} hint={props.hint} error={error} />
    </label>
  );
}

export function SelectField(
  props: BaseProps & {
    options: { value: string; label: string }[];
    placeholder?: string;
  },
) {
  const errorText = useErrorText();
  const id = fieldId(props.form, props.name);
  const error =
    props.errors[props.name] && errorText(props.name, props.errors[props.name]);
  return (
    <label htmlFor={id} className="block">
      <LabelText label={props.label} required={props.required} />
      <select
        id={id}
        name={props.name}
        required={props.required}
        defaultValue=""
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, props.hint, error)}
        className={cn(inputClass, error ? "border-coral-600" : "border-line")}
      >
        <option value="" disabled>
          {props.placeholder ?? ""}
        </option>
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Described id={id} hint={props.hint} error={error} />
    </label>
  );
}

/**
 * A group of radio buttons or checkboxes in a <fieldset>, shown as tappable
 * cards (large touch targets). `checked` makes it controlled (used for the
 * pre-selected area); otherwise it is a plain uncontrolled group.
 */
export function ChoiceGroup(
  props: BaseProps & {
    type: "radio" | "checkbox";
    options: { value: string; label: string }[];
    columns?: string;
    checked?: string[];
    onToggle?: (value: string, checked: boolean) => void;
  },
) {
  const errorText = useErrorText();
  const id = fieldId(props.form, props.name);
  const error =
    props.errors[props.name] && errorText(props.name, props.errors[props.name]);
  return (
    <fieldset
      id={id}
      tabIndex={-1}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, props.hint, error)}
    >
      <legend>
        <LabelText label={props.label} required={props.required} />
      </legend>
      <Described id={id} hint={props.hint} error={error} />
      <div className={cn("mt-3 grid gap-2", props.columns ?? "sm:grid-cols-2")}>
        {props.options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "flex min-h-12 cursor-pointer items-center gap-3 rounded-sm border bg-white px-4 py-2 text-small transition-colors has-checked:border-ocean-900 has-checked:bg-sand-50 has-focus-visible:outline-2 has-focus-visible:outline-coral-500",
              error ? "border-coral-600" : "border-line",
            )}
          >
            <input
              type={props.type}
              name={props.name}
              value={o.value}
              required={props.type === "radio" ? props.required : undefined}
              {...(props.checked && {
                checked: props.checked.includes(o.value),
                onChange: (e) => props.onToggle?.(o.value, e.target.checked),
              })}
              className="size-5 shrink-0 accent-ocean-900"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** A single checkbox with its text, e.g. consent. */
export function CheckboxField(
  props: BaseProps & { children: React.ReactNode },
) {
  const errorText = useErrorText();
  const id = fieldId(props.form, props.name);
  const error =
    props.errors[props.name] && errorText(props.name, props.errors[props.name]);
  return (
    <div>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-3 text-small leading-relaxed"
      >
        <input
          id={id}
          type="checkbox"
          name={props.name}
          required={props.required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-5 shrink-0 accent-ocean-900"
        />
        <span>{props.children}</span>
      </label>
      {error && (
        <span
          id={`${id}-error`}
          className="mt-1.5 ml-8 block text-small font-medium text-coral-700"
        >
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * Hidden from people, tempting for bots: anything typed here marks the
 * submission as spam. Off-screen rather than display:none, which some bots skip.
 */
export function Honeypot() {
  return (
    <div
      aria-hidden="true"
      className="absolute -left-[9999px] h-px w-px overflow-hidden"
    >
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

/** List of the fields to fix, linking to each; receives focus after a failed submit. */
export function ErrorSummary({
  form,
  errors,
  labels,
  summaryRef,
}: {
  form: string;
  errors: FieldErrors;
  labels: Record<string, string>;
  summaryRef: React.Ref<HTMLDivElement>;
}) {
  const t = useTranslations("Forms");
  const names = Object.keys(errors);
  if (names.length === 0) return null;
  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      className="rounded-sm border border-coral-400 bg-coral-50 p-5 text-small text-coral-700"
    >
      <p className="font-semibold">
        {names.length === 1
          ? t("errorSummaryOne")
          : t("errorSummary", { count: names.length })}
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {names.map((name) => (
          <li key={name}>
            <a
              href={`#${fieldId(form, name)}`}
              className="underline underline-offset-2"
            >
              {labels[name] ?? name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Problems that are not about a single field (rate limit, outage, network). */
export function SubmissionMessage({ state }: { state: SubmissionState }) {
  const t = useTranslations("Forms.status");
  const text =
    state === "rateLimited"
      ? t("rateLimited")
      : state === "unavailable"
        ? t("unavailable")
        : state === "network"
          ? t("network")
          : null;
  if (!text) return null;
  return (
    <p
      role="alert"
      className="rounded-sm bg-coral-50 p-4 text-small text-coral-700"
    >
      {text}
    </p>
  );
}

export function PrivacyLink({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="/privacy"
      className="text-lagoon-700 underline underline-offset-2"
    >
      {children}
    </Link>
  );
}
