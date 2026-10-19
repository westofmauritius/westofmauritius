"use client";

import { useLocale, useTranslations } from "next-intl";
import { startTransition, useActionState } from "react";
import { Turnstile } from "@/components/quote-form/Turnstile";
import { Alert, Button, TextArea, TextField } from "@/components/ui";
import { idle } from "@/lib/actions/form-state";
import { sendContactMessage } from "./actions";

export function ContactForm() {
  const t = useTranslations("contact");
  const tv = useTranslations("validation");
  const tq = useTranslations("quoteForm");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [state, action, pending] = useActionState(
    sendContactMessage.bind(null, locale),
    idle,
  );
  const errors = state.status === "error" ? (state.errors ?? {}) : {};
  const error = (name: string) => (errors[name] ? tv(errors[name]) : undefined);
  if (state.status === "success") {
    return (
      <Alert tone="success" role="status">
        {t("sent")}
      </Alert>
    );
  }
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}
      noValidate
      className="space-y-5"
    >
      {state.status === "error" && state.message && (
        <Alert tone="danger" role="alert">
          {tq(`errors.${state.message as "server"}`)}
        </Alert>
      )}
      <TextField
        name="name"
        label={t("name")}
        autoComplete="name"
        required
        error={error("name")}
      />
      <TextField
        name="email"
        type="email"
        label={t("email")}
        autoComplete="email"
        required
        error={error("email")}
      />
      <TextArea
        name="message"
        label={t("message")}
        rows={6}
        required
        error={error("message")}
      />
      <p className="text-sm text-ink-muted">{t("privacyNote")}</p>
      <Turnstile label={tq("turnstileLabel")} language={locale} />
      <Button type="submit" disabled={pending}>
        {pending ? tc("sending") : t("send")}
      </Button>
    </form>
  );
}
