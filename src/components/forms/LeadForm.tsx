"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { budgets, timeframes } from "@/lib/forms/options";
import { validateLead } from "@/lib/forms/validation";
import {
  CheckboxField,
  ChoiceGroup,
  ErrorSummary,
  Honeypot,
  PrivacyLink,
  SelectField,
  SubmissionMessage,
  TextArea,
  TextField,
} from "./fields";
import { useFormSubmission } from "./useFormSubmission";

type LeadFormProps = {
  areas: { value: string; label: string }[];
  countries: { value: string; label: string }[];
  /** The exact consent wording (versioned in src/lib/forms/consent.ts). */
  consentText: string;
};

const FORM = "lead";

/**
 * The property enquiry form — the site's main conversion. Works without
 * JavaScript too (a normal post to /api/leads, then the thank-you page).
 */
export function LeadForm({ areas, countries, consentText }: LeadFormProps) {
  const t = useTranslations("Forms");
  const locale = useLocale();
  const areaSlugs = areas.map((a) => a.value);

  // ?area=tamarin pre-selects an area; ?source=… tells us which link led here.
  const search = useSyncExternalStore(
    () => () => {},
    () => window.location.search,
    () => "",
  );
  const params = new URLSearchParams(search);
  const fromUrl = areaSlugs.filter((a) => params.getAll("area").includes(a));
  const [chosenAreas, setChosenAreas] = useState<string[] | null>(null);
  const selectedAreas = chosenAreas ?? fromUrl;

  const { errors, state, onSubmit, summaryRef, successRef } = useFormSubmission(
    {
      endpoint: "/api/leads",
      validate: (input) => validateLead(input, areaSlugs),
      listFields: ["areas"],
      event: "lead-submitted",
      eventData: (input) => ({
        budget: String(input.budget ?? ""),
        timeframe: String(input.timeframe ?? ""),
        source: String(input.source ?? "") || "direct",
        language: locale,
      }),
    },
  );

  if (state === "success") {
    return (
      <div
        role="status"
        className="rounded-sm bg-sand-50 p-8 ring-1 ring-line sm:p-12"
      >
        <h2 ref={successRef} tabIndex={-1} className="type-h3">
          {t("lead.successTitle")}
        </h2>
        <p className="mt-4 lead text-ink-muted">{t("lead.successText")}</p>
      </div>
    );
  }

  const labels: Record<string, string> = {
    name: t("lead.name"),
    email: t("lead.email"),
    phone: t("lead.phone"),
    country: t("lead.country"),
    budget: t("lead.budget"),
    timeframe: t("lead.timeframe"),
    areas: t("lead.areas"),
    message: t("lead.message"),
    consent: t("lead.consentLabel"),
  };

  return (
    <form
      action="/api/leads"
      method="post"
      noValidate
      onSubmit={onSubmit}
      className="relative space-y-12"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="source" value={params.get("source") ?? ""} />
      <Honeypot />

      <ErrorSummary
        form={FORM}
        errors={errors}
        labels={labels}
        summaryRef={summaryRef}
      />

      <fieldset className="space-y-6">
        <legend className="mb-6 type-h4">{t("lead.aboutYou")}</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            form={FORM}
            name="name"
            label={labels.name}
            autoComplete="name"
            required
            errors={errors}
          />
          <TextField
            form={FORM}
            name="email"
            type="email"
            label={labels.email}
            autoComplete="email"
            required
            errors={errors}
          />
          <TextField
            form={FORM}
            name="phone"
            type="tel"
            label={labels.phone}
            hint={t("lead.phoneHint")}
            autoComplete="tel"
            errors={errors}
          />
          <SelectField
            form={FORM}
            name="country"
            label={labels.country}
            placeholder={t("lead.countryPlaceholder")}
            options={countries}
            required
            errors={errors}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-8">
        <legend className="mb-6 type-h4">{t("lead.yourPlans")}</legend>
        <ChoiceGroup
          form={FORM}
          type="radio"
          name="budget"
          label={labels.budget}
          options={budgets.map((b) => ({ value: b, label: t(`budgets.${b}`) }))}
          columns="sm:grid-cols-2 lg:grid-cols-3"
          required
          errors={errors}
        />
        <ChoiceGroup
          form={FORM}
          type="radio"
          name="timeframe"
          label={labels.timeframe}
          options={timeframes.map((v) => ({
            value: v,
            label: t(`timeframes.${v}`),
          }))}
          required
          errors={errors}
        />
        <ChoiceGroup
          form={FORM}
          type="checkbox"
          name="areas"
          label={labels.areas}
          hint={t("lead.areasHint")}
          options={areas}
          columns="grid-cols-2 lg:grid-cols-3"
          checked={selectedAreas}
          onToggle={(value, on) =>
            setChosenAreas(
              on
                ? [...selectedAreas, value]
                : selectedAreas.filter((a) => a !== value),
            )
          }
          errors={errors}
        />
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="mb-6 type-h4">{t("lead.anythingElse")}</legend>
        <TextArea
          form={FORM}
          name="message"
          label={labels.message}
          hint={t("lead.messageHint")}
          errors={errors}
        />
      </fieldset>

      <div className="space-y-5 border-t border-line pt-8">
        <CheckboxField
          form={FORM}
          name="consent"
          label={labels.consent}
          required
          errors={errors}
        >
          {consentText} <PrivacyLink>{t("lead.privacy")}</PrivacyLink>
        </CheckboxField>
        <CheckboxField form={FORM} name="newsletter" label="" errors={errors}>
          {t("lead.newsletter")}
        </CheckboxField>
      </div>

      <SubmissionMessage state={state} />

      <Button
        type="submit"
        variant="accent"
        disabled={state === "sending"}
        className="w-full sm:w-auto"
      >
        {state === "sending" ? t("status.sending") : t("lead.submit")}
      </Button>
    </form>
  );
}
