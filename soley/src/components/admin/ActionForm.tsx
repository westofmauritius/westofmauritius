"use client";

import { useTranslations } from "next-intl";
import { startTransition, useActionState, useEffect, useRef } from "react";
import { Alert, Button } from "@/components/ui";
import type { ButtonVariant } from "@/components/ui/button-styles";
import type { FormState } from "@/lib/actions/form-state";
import { idle } from "@/lib/actions/form-state";

/**
 * An admin form posted to a server action. Problems are listed at the top
 * with the field's label, and a success message confirms the save. The
 * fields themselves are plain inputs passed as children (server-rendered).
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  successMessage,
  labels = {},
  variant = "primary",
  className,
  resetOnSuccess = false,
}: {
  /** Empty the form after a successful save (e.g. a new note). */
  resetOnSuccess?: boolean;
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submitLabel: string;
  successMessage?: string;
  labels?: Record<string, string>;
  variant?: ButtonVariant;
  className?: string;
}) {
  const tv = useTranslations("validation");
  const tq = useTranslations("quoteForm.errors");
  const tc = useTranslations("common");
  const [state, run, pending] = useActionState(action, idle);
  const form = useRef<HTMLFormElement>(null);
  const errors =
    state.status === "error" ? Object.entries(state.errors ?? {}) : [];

  useEffect(() => {
    if (resetOnSuccess && state.status === "success") form.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={form}
      // Dispatched from onSubmit rather than the `action` prop, which would
      // reset the fields even when the server rejects them.
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => run(data));
      }}
      className={className ?? "space-y-4"}
    >
      {errors.length > 0 && (
        <Alert
          tone="danger"
          role="alert"
          title={tv("summaryTitle", { count: errors.length })}
        >
          <ul className="list-disc pl-5">
            {errors.map(([field, key]) => (
              <li key={field}>
                {labels[field] ?? field}: {tv(key)}
              </li>
            ))}
          </ul>
        </Alert>
      )}
      {state.status === "error" && state.message && (
        <Alert tone="danger" role="alert">
          {tq(state.message as "server")}
        </Alert>
      )}
      {state.status === "success" && (
        <Alert tone="success" role="status">
          {successMessage ?? tc("saved")}
        </Alert>
      )}
      {children}
      <Button type="submit" variant={variant} disabled={pending}>
        {submitLabel}
      </Button>
    </form>
  );
}
