"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Button } from "@/components/ui";
import type { ButtonVariant } from "@/components/ui/button-styles";
import type { FormState } from "@/lib/actions/form-state";
import { idle } from "@/lib/actions/form-state";

/**
 * A single button that runs a server action (approve, withdraw, mark
 * paid…). `confirm` asks first, for actions that are hard to undo.
 */
export function ActionButton({
  action,
  label,
  variant = "secondary",
  confirm,
  errorMessage,
}: {
  action: (previous: FormState) => Promise<FormState>;
  label: string;
  variant?: ButtonVariant;
  confirm?: string;
  /** Shown when the action reports a conflict (e.g. checklist incomplete). */
  errorMessage?: string;
}) {
  const tq = useTranslations("quoteForm.errors");
  const [state, run, pending] = useActionState(action, idle);
  return (
    <form
      action={run}
      onSubmit={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
      className="inline-flex flex-col gap-1"
    >
      <Button type="submit" variant={variant} disabled={pending}>
        {label}
      </Button>
      {state.status === "error" && (
        <span role="alert" className="text-sm font-semibold text-danger-700">
          {state.message === "conflict" && errorMessage
            ? errorMessage
            : tq((state.message ?? "server") as "server")}
        </span>
      )}
    </form>
  );
}
