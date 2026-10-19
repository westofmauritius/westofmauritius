"use client";

import { useLocale, useTranslations } from "next-intl";
import { startTransition, useActionState } from "react";
import { ErrorSummary } from "@/components/quote-form/ErrorSummary";
import { Turnstile } from "@/components/quote-form/Turnstile";
import {
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  FileField,
  SelectField,
  TextArea,
  TextField,
} from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { idle } from "@/lib/actions/form-state";
import { regions } from "@/lib/regions";
import { documentKinds } from "@/lib/validation/installer";
import { submitInstallerApplication } from "./actions";

const accept = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

/**
 * The partner application, posted to a server action. The fields are
 * uncontrolled and keep their values when the server sends errors back.
 */
export function ApplicationForm() {
  const t = useTranslations("forInstallers.apply");
  const tv = useTranslations("validation");
  const tq = useTranslations("quoteForm");
  const tr = useTranslations("regions");
  const tl = useTranslations("language");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [state, action, pending] = useActionState(
    submitInstallerApplication.bind(null, locale),
    idle,
  );
  const errors = state.status === "error" ? (state.errors ?? {}) : {};
  const error = (name: string) => (errors[name] ? tv(errors[name]) : undefined);
  const label = (name: string) =>
    t.has(`fields.${name}`)
      ? t(`fields.${name}` as "fields.brn")
      : name === "terms"
        ? tq("consent.short")
        : name;

  return (
    <form
      // Submitted through onSubmit rather than the `action` prop: React
      // resets a form after its action runs, which would wipe a long
      // application whenever the server finds an error.
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}
      className="space-y-8"
      noValidate
    >
      <ErrorSummary
        title={tv("summaryTitle", { count: Object.keys(errors).length })}
        errors={Object.entries(errors).map(([field, key]) => ({
          field,
          label: label(field),
          message: tv(key),
        }))}
      />
      {state.status === "error" && state.message && (
        <Alert tone="danger" role="alert">
          {tq(`errors.${state.message as "server"}`)}
        </Alert>
      )}

      <fieldset className="space-y-5">
        <legend className="text-xl font-bold">{t("companySection")}</legend>
        <TextField
          id="field-company_name"
          name="company_name"
          label={t("fields.company_name")}
          autoComplete="organization"
          required
          error={error("company_name")}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="field-brn"
            name="brn"
            label={t("fields.brn")}
            optionalLabel={tc("optional")}
            error={error("brn")}
          />
          <TextField
            id="field-years_in_business"
            name="years_in_business"
            label={t("fields.years_in_business")}
            inputMode="numeric"
            required
            error={error("years_in_business")}
          />
        </div>
        <TextField
          id="field-address"
          name="address"
          label={t("fields.address")}
          autoComplete="street-address"
          required
          error={error("address")}
        />
        <TextField
          id="field-website"
          name="website"
          label={t("fields.website")}
          optionalLabel={tc("optional")}
          inputMode="url"
          error={error("website")}
        />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-xl font-bold">{t("contactSection")}</legend>
        <TextField
          id="field-contact_name"
          name="contact_name"
          label={t("fields.contact_name")}
          autoComplete="name"
          required
          error={error("contact_name")}
        />
        <TextField
          id="field-contact_email"
          name="contact_email"
          type="email"
          label={t("fields.contact_email")}
          hint={t("fields.contact_emailHint")}
          autoComplete="email"
          required
          error={error("contact_email")}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="field-phone"
            name="phone"
            type="tel"
            label={t("fields.phone")}
            autoComplete="tel"
            required
            error={error("phone")}
          />
          <TextField
            id="field-whatsapp"
            name="whatsapp"
            type="tel"
            label={t("fields.whatsapp")}
            optionalLabel={tc("optional")}
            error={error("whatsapp")}
          />
        </div>
        <SelectField
          id="field-locale"
          name="locale"
          label={t("fields.locale")}
          defaultValue={locale}
          options={[
            { value: "en", label: tl("en") },
            { value: "fr", label: tl("fr") },
          ]}
        />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-xl font-bold">{t("coverageSection")}</legend>
        <CheckboxGroup
          id="field-regions"
          name="regions"
          legend={t("fields.regions")}
          options={regions.map((r) => ({ value: r, label: tr(r) }))}
          error={error("regions")}
        />
        <TextArea
          id="field-certifications"
          name="certifications"
          label={t("fields.certifications")}
          hint={t("fields.certificationsHint")}
          optionalLabel={tc("optional")}
          rows={3}
          error={error("certifications")}
        />
        <Checkbox
          id="field-ceb_registered"
          name="ceb_registered"
          label={t("fields.ceb_registered")}
        />
        <TextArea
          id="field-description"
          name="description"
          label={t("fields.description")}
          hint={t("fields.descriptionHint")}
          optionalLabel={tc("optional")}
          error={error("description")}
        />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-xl font-bold">{t("documentsSection")}</legend>
        <p className="text-ink-muted">{t("documentsIntro")}</p>
        {documentKinds.map((kind) => (
          <FileField
            key={kind}
            id={`field-doc_${kind}`}
            name={`doc_${kind}`}
            accept={accept}
            label={t(`fields.doc_${kind}`)}
            optionalLabel={kind === "registration" ? undefined : tc("optional")}
            error={error(`doc_${kind}`)}
          />
        ))}
      </fieldset>

      <div className="rounded-2xl bg-sand-100 p-4">
        <Checkbox
          id="field-terms"
          name="terms"
          required
          label={t("terms")}
          error={error("terms")}
        />
        <p className="mt-2 pl-8 text-sm">
          <Link
            href="/terms"
            target="_blank"
            className="font-semibold text-ocean-600 underline underline-offset-2"
          >
            {t("termsLink")}
          </Link>
        </p>
      </div>
      <Turnstile label={tq("turnstileLabel")} language={locale} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? tc("sending") : t("submit")}
      </Button>
    </form>
  );
}
