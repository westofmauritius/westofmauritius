"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { validateNewsletter } from "@/lib/forms/validation";
import {
  CheckboxField,
  Honeypot,
  SubmissionMessage,
  TextField,
} from "./fields";
import { useFormSubmission } from "./useFormSubmission";

const FORM = "newsletter";

/**
 * Newsletter sign-up (footer). Double opt-in: the address is only used once
 * the person clicks the link in the confirmation e-mail.
 */
export function NewsletterForm({ consentText }: { consentText: string }) {
  const t = useTranslations("Forms");
  const locale = useLocale();
  const { errors, state, onSubmit, successRef } = useFormSubmission({
    endpoint: "/api/newsletter",
    validate: validateNewsletter,
    event: "newsletter-signup",
    eventData: () => ({ language: locale }),
  });

  return (
    <div>
      <p className="font-display text-2xl text-white">
        {t("newsletter.title")}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ocean-200">
        {t("newsletter.text")}
      </p>
      {state === "success" ? (
        <div role="status" className="mt-5">
          <p ref={successRef} tabIndex={-1} className="font-medium text-white">
            {t("newsletter.successTitle")}
          </p>
          <p className="mt-1 text-sm text-ocean-200">
            {t("newsletter.successText")}
          </p>
        </div>
      ) : (
        <form
          action="/api/newsletter"
          method="post"
          noValidate
          onSubmit={onSubmit}
          className="relative mt-5 space-y-4 [&_.text-coral-700]:text-coral-200 [&_.text-ink-muted]:text-ocean-300 [&_input:not([type=checkbox])]:border-white/20 [&_input:not([type=checkbox])]:bg-white/5 [&_input:not([type=checkbox])]:text-white [&_label]:text-ocean-100"
        >
          <input type="hidden" name="locale" value={locale} />
          <Honeypot />
          <TextField
            form={FORM}
            name="email"
            type="email"
            label={t("newsletter.email")}
            autoComplete="email"
            required
            errors={errors}
          />
          <CheckboxField
            form={FORM}
            name="consent"
            label=""
            required
            errors={errors}
          >
            {consentText}
          </CheckboxField>
          <SubmissionMessage state={state} />
          <Button type="submit" variant="light" disabled={state === "sending"}>
            {state === "sending" ? t("status.sending") : t("newsletter.submit")}
          </Button>
        </form>
      )}
    </div>
  );
}
