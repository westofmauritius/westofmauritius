"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Alert, Button, SelectField } from "@/components/ui";
import { idle } from "@/lib/actions/form-state";
import { declineReasons } from "@/lib/validation/quote";
import { acceptLeadAction, declineLeadAction } from "./actions";

/** Accept or decline an offered lead. */
export function LeadActions({
  assignmentId,
  body,
}: {
  assignmentId: string;
  body: string;
}) {
  const t = useTranslations("portal.lead");
  const tq = useTranslations("quoteForm");
  const tv = useTranslations("validation");
  const [acceptState, accept, accepting] = useActionState(
    acceptLeadAction.bind(null, assignmentId),
    idle,
  );
  const [declineState, decline, declining] = useActionState(
    declineLeadAction.bind(null, assignmentId),
    idle,
  );
  const error =
    (acceptState.status === "error" && acceptState.message) ||
    (declineState.status === "error" && declineState.message);
  const reasonError =
    declineState.status === "error" && declineState.errors?.reason
      ? tv(declineState.errors.reason)
      : undefined;
  return (
    <div className="space-y-4">
      <p>{body}</p>
      {error && (
        <Alert tone="danger" role="alert">
          {tq(`errors.${error as "server"}`)}
        </Alert>
      )}
      <form action={accept}>
        <Button type="submit" size="lg" disabled={accepting}>
          {t("accept")}
        </Button>
      </form>
      <form
        action={decline}
        className="flex flex-wrap items-end gap-3 border-t border-line pt-4"
      >
        <SelectField
          name="reason"
          label={t("declineReason")}
          placeholder="—"
          className="min-w-56"
          error={reasonError}
          options={declineReasons.map((r) => ({
            value: r,
            label: t(`declineReasons.${r}`),
          }))}
        />
        <Button type="submit" variant="ghost" disabled={declining}>
          {t("decline")}
        </Button>
      </form>
    </div>
  );
}
