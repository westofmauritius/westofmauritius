"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { contactTopics } from "@/lib/forms/options";
import { validateContact } from "@/lib/forms/validation";
import {
  ErrorSummary,
  Honeypot,
  PrivacyLink,
  SelectField,
  SubmissionMessage,
  TextArea,
  TextField,
} from "./fields";
import { useFormSubmission } from "./useFormSubmission";

const FORM = "contact";

/** The contact page form. Saved like leads, and e-mailed to the owner. */
export function ContactForm() {
  const t = useTranslations("Forms");
  const locale = useLocale();
  const { errors, state, onSubmit, summaryRef, successRef } = useFormSubmission(
    {
      endpoint: "/api/contact",
      validate: validateContact,
      event: "contact-submitted",
      eventData: (input) => ({
        topic: String(input.topic ?? ""),
        language: locale,
      }),
    },
  );

  if (state === "success") {
    return (
      <div role="status" className="rounded-sm bg-sand-50 p-8 ring-1 ring-line">
        <h2 ref={successRef} tabIndex={-1} className="type-h3">
          {t("contact.successTitle")}
        </h2>
        <p className="mt-4 text-lg text-ink-muted">
          {t("contact.successText")}
        </p>
      </div>
    );
  }

  const labels = {
    name: t("contact.name"),
    email: t("contact.email"),
    topic: t("contact.topic"),
    message: t("contact.message"),
  };

  return (
    <form
      action="/api/contact"
      method="post"
      noValidate
      onSubmit={onSubmit}
      className="relative space-y-6"
    >
      <input type="hidden" name="locale" value={locale} />
      <Honeypot />
      <ErrorSummary
        form={FORM}
        errors={errors}
        labels={labels}
        summaryRef={summaryRef}
      />
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
      </div>
      <SelectField
        form={FORM}
        name="topic"
        label={labels.topic}
        placeholder={t("contact.topicPlaceholder")}
        options={contactTopics.map((v) => ({
          value: v,
          label: t(`contact.topics.${v}`),
        }))}
        required
        errors={errors}
      />
      <TextArea
        form={FORM}
        name="message"
        label={labels.message}
        rows={7}
        required
        errors={errors}
      />
      <p className="text-small text-ink-muted">
        <PrivacyLink>{t("contact.privacy")}</PrivacyLink>
      </p>
      <SubmissionMessage state={state} />
      <Button type="submit" variant="primary" disabled={state === "sending"}>
        {state === "sending" ? t("status.sending") : t("contact.submit")}
      </Button>
    </form>
  );
}
