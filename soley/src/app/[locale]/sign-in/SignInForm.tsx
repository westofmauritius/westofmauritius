"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState } from "react";
import { Turnstile } from "@/components/quote-form/Turnstile";
import { Alert, Button, TextField } from "@/components/ui";
import { idle } from "@/lib/actions/form-state";
import { requestSignInLink } from "./actions";

export function SignInForm({ next }: { next: string | null }) {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const tq = useTranslations("quoteForm");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [state, action, pending] = useActionState(
    requestSignInLink.bind(null, locale),
    idle,
  );
  const errors = state.status === "error" ? state.errors : undefined;
  return (
    <form action={action} className="space-y-5">
      {state.status === "error" && state.message && (
        <Alert tone="danger" role="alert">
          {tq(`errors.${state.message as "server"}`)}
        </Alert>
      )}
      <TextField
        name="email"
        type="email"
        autoComplete="email"
        required
        label={t("emailLabel")}
        hint={t("emailHint")}
        error={errors?.email ? tv(errors.email) : undefined}
      />
      {next && <input type="hidden" name="next" value={next} />}
      <Turnstile label={tq("turnstileLabel")} language={locale} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? tc("sending") : t("submit")}
      </Button>
    </form>
  );
}
