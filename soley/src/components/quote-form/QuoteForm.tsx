"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState, useEffect, useRef, useState } from "react";
import type { z } from "zod";
import { submitQuoteRequest } from "@/app/[locale]/get-quotes/actions";
import {
  Alert,
  Button,
  Checkbox,
  RadioCards,
  SelectField,
  TextArea,
  TextField,
} from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { idle } from "@/lib/actions/form-state";
import { regions } from "@/lib/regions";
import { fieldErrors } from "@/lib/validation/common";
import {
  batteryInterests,
  contactMethods,
  financings,
  ownerships,
  propertyTypes,
  quoteFormSteps,
  roofTypes,
  shadings,
  timelines,
} from "@/lib/validation/quote-request";
import { ErrorSummary } from "./ErrorSummary";
import { Turnstile } from "./Turnstile";

type Values = Record<string, string>;

export const DRAFT_KEY = "soley-quote-draft-v1";

const emptyValues: Values = { grant_interest: "on" };

/** Which step each field is on, to jump back to errors the server found. */
const stepOfField = (field: string) =>
  quoteFormSteps.findIndex((step) => field in step.schema.shape);

function readDraft(): Values | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Values) : null;
  } catch {
    return null;
  }
}

/**
 * The quote request form in five steps. Each step is checked in the browser
 * before moving on; the server checks everything again. Answers are kept in
 * this device's storage (never consent), so a closed tab or a lost
 * connection loses nothing.
 */
export function QuoteForm({ prefill }: { prefill: Values }) {
  const t = useTranslations("quoteForm");
  const tv = useTranslations("validation");
  const tr = useTranslations("regions");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [values, setValues] = useState<Values>({ ...emptyValues, ...prefill });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [restored, setRestored] = useState(false);
  const [state, formAction, pending] = useActionState(
    submitQuoteRequest.bind(null, locale),
    idle,
  );
  const heading = useRef<HTMLHeadingElement>(null);
  const loaded = useRef(false);

  // Restore a saved draft once, after hydration (the server cannot see the
  // browser's storage). Values from the calculator link win over the draft.
  useEffect(() => {
    const draft = readDraft();
    if (draft && Object.keys(draft).length > 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from browser storage after hydration
      setValues((current) => ({ ...current, ...draft, ...prefill }));
      setRestored(true);
    }
    loaded.current = true;
  }, [prefill]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      const draft = { ...values };
      delete draft.consent; // consent is always given fresh, never restored
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Storage full or blocked: the form still works, only without a draft.
    }
  }, [values]);

  // Errors from the server: show them on the step where they belong.
  useEffect(() => {
    if (state.status !== "error" || !state.errors) return;
    const fields = Object.keys(state.errors);
    const first = Math.min(...fields.map(stepOfField).filter((i) => i >= 0));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to the server's answer
    setErrors(state.errors);
    if (Number.isFinite(first)) setStep(first);
  }, [state]);

  const current = quoteFormSteps[step]!;
  const isLast = step === quoteFormSteps.length - 1;

  const set = (name: string) => (value: string) =>
    setValues((v) => ({ ...v, [name]: value }));
  const onInput =
    (name: string) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      set(name)(event.target.value);
  const error = (name: string) => (errors[name] ? tv(errors[name]) : undefined);

  const validateStep = (schema: z.ZodType) => {
    const result = schema.safeParse(values);
    const next = result.success ? {} : fieldErrors(result.error);
    setErrors(next);
    return result.success;
  };

  const goTo = (index: number) => {
    setStep(index);
    setErrors({});
    requestAnimationFrame(() => heading.current?.focus());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = () => {
    if (validateStep(current.schema)) goTo(step + 1);
  };

  const clearDraft = () => {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {}
    setValues({ ...emptyValues });
    setRestored(false);
    goTo(0);
  };

  const fieldLabel = (field: string) => {
    const key = `fields.${field}` as const;
    if (t.has(`${key}.label`)) return t(`${key}.label` as "fields.name.label");
    if (t.has(`${key}.legend`))
      return t(`${key}.legend` as "fields.shading.legend");
    if (field === "consent") return t("consent.short");
    return field;
  };

  const summary = Object.entries(errors).map(([field, key]) => ({
    field,
    label: fieldLabel(field),
    message: tv(key),
  }));

  const radios = <T extends readonly string[]>(
    name: string,
    options: T,
    columns: 1 | 2 | 3 = 2,
    hint?: string,
  ) => (
    <RadioCards
      id={`field-${name}`}
      legend={t(`fields.${name}.legend` as "fields.shading.legend")}
      hint={hint}
      name={name}
      columns={columns}
      value={values[name] ?? ""}
      onChange={set(name)}
      error={error(name)}
      options={options.map((value) => ({
        value,
        label: t(`fields.${name}.${value}` as "fields.shading.none"),
      }))}
    />
  );

  return (
    <div>
      <nav aria-label={t("progress")}>
        <p className="text-sm font-semibold text-ocean-700">
          {t("stepOf", { current: step + 1, total: quoteFormSteps.length })}
        </p>
        <ol className="mt-2 grid grid-cols-5 gap-1.5" aria-hidden="true">
          {quoteFormSteps.map((s, index) => (
            <li
              key={s.key}
              className={`h-2 rounded-full ${index <= step ? "bg-sun-400" : "bg-sand-200"}`}
            />
          ))}
        </ol>
      </nav>

      {restored && (
        <Alert tone="info" className="mt-5" role="status">
          <p>
            {t("draftRestored")}{" "}
            <button
              type="button"
              onClick={clearDraft}
              className="font-semibold text-ocean-600 underline underline-offset-2"
            >
              {t("clearDraft")}
            </button>
          </p>
        </Alert>
      )}

      <form
        action={formAction}
        noValidate
        onSubmit={(event) => {
          if (!isLast) {
            event.preventDefault();
            next();
          } else if (!validateStep(current.schema)) {
            event.preventDefault();
          }
        }}
        className="mt-6 space-y-6"
      >
        <h2 ref={heading} tabIndex={-1} className="text-2xl focus:outline-none">
          {t(`steps.${current.key}`)}
        </h2>

        <ErrorSummary
          title={tv("summaryTitle", { count: summary.length })}
          errors={summary}
        />
        {state.status === "error" && state.message && (
          <Alert tone="danger" role="alert">
            {t(`errors.${state.message as "server"}`)}
          </Alert>
        )}

        {current.key === "home" && (
          <>
            {radios("property_type", propertyTypes, 3)}
            {radios("ownership", ownerships)}
            {values.ownership === "tenant" && (
              <Alert tone="info">{t("fields.ownershipTenantNote")}</Alert>
            )}
            {radios("roof_type", roofTypes)}
            <TextField
              id="field-roof_area_m2"
              label={t("fields.roof_area_m2.label")}
              hint={t("fields.roof_area_m2.hint")}
              optionalLabel={tc("optional")}
              inputMode="decimal"
              value={values.roof_area_m2 ?? ""}
              onChange={onInput("roof_area_m2")}
              error={error("roof_area_m2")}
            />
            {radios("shading", shadings)}
          </>
        )}

        {current.key === "usage" && (
          <>
            <TextField
              id="field-monthly_bill_mur"
              label={t("fields.monthly_bill_mur.label")}
              hint={t("fields.monthly_bill_mur.hint")}
              inputMode="numeric"
              value={values.monthly_bill_mur ?? ""}
              onChange={onInput("monthly_bill_mur")}
              error={error("monthly_bill_mur")}
              required
            />
            {radios(
              "battery_interest",
              batteryInterests,
              3,
              t("fields.battery_interest.hint"),
            )}
            <TextField
              id="field-desired_kwp"
              label={t("fields.desired_kwp.label")}
              hint={t("fields.desired_kwp.hint")}
              optionalLabel={tc("optional")}
              inputMode="decimal"
              value={values.desired_kwp ?? ""}
              onChange={onInput("desired_kwp")}
              error={error("desired_kwp")}
            />
          </>
        )}

        {current.key === "location" && (
          <>
            <SelectField
              id="field-region"
              label={t("fields.region.label")}
              hint={t("fields.region.hint")}
              value={values.region ?? ""}
              onChange={onInput("region")}
              placeholder="—"
              options={regions.map((r) => ({ value: r, label: tr(r) }))}
              error={error("region")}
              required
            />
            <TextField
              id="field-town"
              label={t("fields.town.label")}
              hint={t("fields.town.hint")}
              optionalLabel={tc("optional")}
              autoComplete="address-level2"
              value={values.town ?? ""}
              onChange={onInput("town")}
              error={error("town")}
            />
          </>
        )}

        {current.key === "plan" && (
          <>
            {radios("timeline", timelines)}
            {radios("financing", financings, 1)}
            <Checkbox
              id="field-grant_interest"
              label={t("fields.grant_interest.label")}
              hint={t("fields.grant_interest.hint")}
              checked={values.grant_interest === "on"}
              onChange={(event) =>
                set("grant_interest")(event.target.checked ? "on" : "")
              }
            />
          </>
        )}

        {current.key === "contact" && (
          <>
            <TextField
              id="field-name"
              label={t("fields.name.label")}
              autoComplete="name"
              value={values.name ?? ""}
              onChange={onInput("name")}
              error={error("name")}
              required
            />
            <TextField
              id="field-email"
              type="email"
              label={t("fields.email.label")}
              hint={t("fields.email.hint")}
              autoComplete="email"
              value={values.email ?? ""}
              onChange={onInput("email")}
              error={error("email")}
              required
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                id="field-phone"
                type="tel"
                label={t("fields.phone.label")}
                autoComplete="tel"
                placeholder="+230 5…"
                value={values.phone ?? ""}
                onChange={onInput("phone")}
                error={error("phone")}
                required
              />
              <TextField
                id="field-whatsapp"
                type="tel"
                label={t("fields.whatsapp.label")}
                hint={t("fields.whatsapp.hint")}
                optionalLabel={tc("optional")}
                value={values.whatsapp ?? ""}
                onChange={onInput("whatsapp")}
                error={error("whatsapp")}
              />
            </div>
            {radios("preferred_contact", contactMethods, 3)}
            <TextArea
              id="field-notes"
              label={t("fields.notes.label")}
              optionalLabel={tc("optional")}
              value={values.notes ?? ""}
              onChange={onInput("notes")}
              error={error("notes")}
            />
            <div className="rounded-2xl bg-sand-100 p-4">
              <Checkbox
                id="field-consent"
                label={t("consent.label")}
                checked={values.consent === "on"}
                onChange={(event) =>
                  set("consent")(event.target.checked ? "on" : "")
                }
                error={error("consent")}
                required
              />
              <p className="mt-2 pl-8 text-sm text-ink-muted">
                {t("consent.note")}{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="font-semibold text-ocean-600 underline underline-offset-2"
                >
                  {t("consent.privacyLink")}
                </Link>
              </p>
            </div>
            <Turnstile label={t("turnstileLabel")} language={locale} />
            {/* Every answer travels to the server as a hidden field; the
                visible inputs above are controlled and carry no name. */}
            {Object.entries(values).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => goTo(step - 1)}>
              {tc("back")}
            </Button>
          ) : (
            <span />
          )}
          {isLast ? (
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? tc("sending") : t("submit")}
            </Button>
          ) : (
            <Button type="submit" size="lg">
              {tc("next")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
