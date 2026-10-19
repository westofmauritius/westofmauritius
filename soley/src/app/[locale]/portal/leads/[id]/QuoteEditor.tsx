"use client";

import { useTranslations } from "next-intl";
import { startTransition, useActionState } from "react";
import { ErrorSummary } from "@/components/quote-form/ErrorSummary";
import { Alert, Button, Checkbox, TextArea, TextField } from "@/components/ui";
import type { QuoteRow } from "@/lib/data/schema";
import { idle } from "@/lib/actions/form-state";
import { saveQuoteAction } from "./actions";

type NumberField = {
  name: keyof QuoteRow;
  optional?: boolean;
  decimal?: boolean;
  hint?: string;
};

/**
 * The structured quote form. The same fields drive the household's
 * comparison table, so every quote can be compared like for like.
 */
export function QuoteEditor({
  assignmentId,
  quote,
  defaultValidUntil,
}: {
  assignmentId: string;
  quote: QuoteRow | null;
  defaultValidUntil: string;
}) {
  const t = useTranslations("quote");
  const tp = useTranslations("portal.lead");
  const tv = useTranslations("validation");
  const tq = useTranslations("quoteForm");
  const tc = useTranslations("common");
  const [state, action, pending] = useActionState(
    saveQuoteAction.bind(null, assignmentId),
    idle,
  );
  const errors = state.status === "error" ? (state.errors ?? {}) : {};
  const value = (name: keyof QuoteRow) => {
    const v = quote?.[name];
    return v === null || v === undefined ? "" : String(v);
  };
  const label = (name: string) => t(name as "price_mur");

  const field = ({ name, optional, decimal, hint }: NumberField) => (
    <TextField
      key={name}
      id={`field-${name}`}
      name={name}
      label={label(name)}
      hint={hint}
      optionalLabel={optional ? tc("optional") : undefined}
      inputMode={decimal ? "decimal" : "numeric"}
      defaultValue={value(name)}
      error={errors[name] ? tv(errors[name]) : undefined}
    />
  );
  const text = (name: keyof QuoteRow, optional = false, hint?: string) => (
    <TextField
      key={name}
      id={`field-${name}`}
      name={name}
      label={label(name)}
      hint={hint}
      optionalLabel={optional ? tc("optional") : undefined}
      defaultValue={value(name)}
      error={errors[name] ? tv(errors[name]) : undefined}
    />
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}
      noValidate
      className="space-y-8"
    >
      <ErrorSummary
        title={tv("summaryTitle", { count: Object.keys(errors).length })}
        errors={Object.entries(errors).map(([f, key]) => ({
          field: f,
          label: label(f),
          message: tv(key),
        }))}
      />
      {state.status === "error" && state.message && (
        <Alert tone="danger" role="alert">
          {tq(`errors.${state.message as "server"}`)}
        </Alert>
      )}
      {state.status === "success" && (
        <Alert tone="success" role="status">
          {state.message === "updated" ? tp("quoteUpdated") : tp("quoteSaved")}
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {field({ name: "price_mur", hint: t("price_murHint") })}
        {field({ name: "system_kwp", decimal: true })}
        {field({ name: "yearly_production_kwh" })}
        <TextField
          id="field-valid_until"
          name="valid_until"
          type="date"
          label={label("valid_until")}
          defaultValue={value("valid_until") || defaultValidUntil}
          error={errors.valid_until ? tv(errors.valid_until) : undefined}
        />
      </div>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-2 text-lg font-bold">{t("panels")}</legend>
        {text("panel_brand")}
        {text("panel_model", true)}
        {field({ name: "panel_count" })}
        {field({ name: "panel_watt", optional: true })}
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-2 text-lg font-bold">{t("inverter")}</legend>
        {text("inverter_brand")}
        {text("inverter_model", true)}
        {field({ name: "inverter_kw", optional: true, decimal: true })}
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-2 text-lg font-bold">{t("battery")}</legend>
        {text("battery_brand", true, t("battery_brandHint"))}
        {field({ name: "battery_kwh", optional: true, decimal: true })}
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-2 text-lg font-bold">{t("warranties")}</legend>
        {field({ name: "panel_warranty_years" })}
        {field({ name: "inverter_warranty_years" })}
        {field({ name: "workmanship_warranty_years" })}
        {field({ name: "battery_warranty_years", optional: true })}
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-2 text-lg font-bold">{t("timing")}</legend>
        {field({ name: "start_weeks" })}
        {field({ name: "duration_days" })}
      </fieldset>

      <Checkbox
        name="includes_ceb_application"
        label={label("includes_ceb_application")}
        defaultChecked={quote ? quote.includes_ceb_application : true}
      />
      <TextArea
        id="field-notes"
        name="notes"
        label={label("notes")}
        optionalLabel={tc("optional")}
        defaultValue={value("notes")}
        error={errors.notes ? tv(errors.notes) : undefined}
      />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? tc("sending") : quote ? tp("updateQuote") : tp("sendQuote")}
      </Button>
    </form>
  );
}
