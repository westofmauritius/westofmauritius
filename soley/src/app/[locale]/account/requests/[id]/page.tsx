import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ComparisonTable } from "@/components/account/ComparisonTable";
import { ActionButton } from "@/components/shared/ActionButton";
import { ActionForm } from "@/components/shared/ActionForm";
import { RequestDetails } from "@/components/shared/RequestDetails";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Alert, Card, RadioCards, TextArea, TextField } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { requireHousehold } from "@/lib/auth/roles";
import { cn } from "@/lib/cn";
import { getLiveFacts } from "@/lib/facts";
import { getHouseholdRequest, HouseholdError } from "@/lib/services/household";
import {
  chooseQuoteAction,
  closeRequestAction,
  confirmInstalledAction,
  submitReviewAction,
} from "./actions";

const stepOrder = ["sent", "matched", "quotes", "chosen", "installed"] as const;
const reached: Record<string, number> = {
  new: 0,
  assigned: 1,
  quoted: 2,
  chosen: 3,
  installed: 4,
  cancelled: -1,
};

export default async function HouseholdRequestPage({
  params,
}: PageProps<"/[locale]/account/requests/[id]">) {
  const { id } = await params;
  const locale = await resolveLocale(params);
  const viewer = await requireHousehold(locale, {
    pathname: "/account/requests/[id]",
    params: { id },
  });
  if (!viewer.household) notFound();
  const t = await getTranslations("account.request");
  const data = await getHouseholdRequest(id, viewer.household.id).catch(
    (error) => {
      if (error instanceof HouseholdError) notFound();
      throw error;
    },
  );
  const { request, assignments, offers, review } = data;
  const facts = await getLiveFacts();
  const grant = {
    sharePercent: facts.grantSharePercent,
    maxMur: facts.grantMaxMur,
  };
  const canChoose =
    ["assigned", "quoted"].includes(request.status) && offers.length > 0;
  const chosen = offers.find((o) => o.quote.id === request.chosen_quote_id);
  const step = reached[request.status] ?? 0;
  const tr = await getTranslations("account.request.reviewFields");

  return (
    <div className="space-y-8">
      <Link
        href="/account"
        className="inline-flex min-h-11 items-center font-semibold text-ocean-600 underline underline-offset-4"
      >
        ← {t("back")}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">
          {t("title", { reference: request.reference })}
        </h1>
        <StatusBadge kind="request" status={request.status} />
      </div>

      {request.status !== "cancelled" ? (
        <section aria-labelledby="progress">
          <h2 id="progress" className="sr-only">
            {t("progressTitle")}
          </h2>
          <ol className="grid grid-cols-5 gap-1.5">
            {stepOrder.map((key, index) => (
              <li
                key={key}
                aria-current={index === step ? "step" : undefined}
                className="text-xs sm:text-sm"
              >
                <span
                  className={cn(
                    "block h-2 rounded-full",
                    index <= step ? "bg-sun-400" : "bg-sand-200",
                  )}
                />
                <span
                  className={cn(
                    "mt-1 block",
                    index <= step ? "font-semibold" : "text-ink-muted",
                  )}
                >
                  {t(`steps.${key}`)}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <Alert tone="info" title={t("closedTitle")} />
      )}

      {chosen && (
        <Alert
          tone="success"
          title={t("chosenTitle", { company: chosen.installer.company_name })}
        >
          {t("chosenBody")}
        </Alert>
      )}

      {request.status === "chosen" && (
        <Card>
          <h2 className="text-xl">{t("installedQuestion")}</h2>
          <div className="mt-4">
            <ActionButton
              action={confirmInstalledAction.bind(null, id)}
              label={t("confirmInstalled")}
            />
          </div>
        </Card>
      )}

      {request.status === "installed" && chosen && (
        <Card>
          <h2 className="text-xl">
            {t("reviewTitle", { company: chosen.installer.company_name })}
          </h2>
          {review ? (
            <Alert
              tone={review.status === "approved" ? "success" : "info"}
              className="mt-4"
              role="status"
            >
              {review.status === "approved"
                ? t("reviewPublished")
                : t("reviewPending")}
            </Alert>
          ) : (
            <>
              <p className="mt-2 text-ink-muted">{t("reviewIntro")}</p>
              <ActionForm
                action={submitReviewAction.bind(null, id)}
                submitLabel={t("sendReview")}
                successMessage={t("reviewThanks")}
                labels={{
                  rating: tr("rating"),
                  title: tr("title"),
                  body: tr("body"),
                  author_display_name: tr("author_display_name"),
                }}
                className="mt-4 space-y-4"
              >
                <RadioCards
                  legend={tr("rating")}
                  name="rating"
                  columns={3}
                  options={[5, 4, 3, 2, 1].map((n) => ({
                    value: String(n),
                    label: `${"★".repeat(n)} ${tr("ratingOption", { count: n })}`,
                  }))}
                />
                <TextField
                  name="title"
                  label={tr("title")}
                  optionalLabel={(await getTranslations("common"))("optional")}
                />
                <TextArea name="body" label={tr("body")} required />
                <TextField
                  name="author_display_name"
                  label={tr("author_display_name")}
                  hint={tr("author_display_nameHint")}
                  required
                />
              </ActionForm>
            </>
          )}
        </Card>
      )}

      <section aria-labelledby="compare" className="space-y-4">
        <h2 id="compare" className="text-2xl">
          {t("compareTitle")}
        </h2>
        {offers.length === 0 ? (
          <p className="text-ink-muted">{t("noQuotes")}</p>
        ) : (
          <>
            <p className="text-ink-muted">{t("compareIntro")}</p>
            <ComparisonTable
              offers={offers}
              monthlyBillMur={request.monthly_bill_mur}
              settings={facts.calculator}
              grant={grant}
              chosenQuoteId={request.chosen_quote_id}
              chooseAction={
                canChoose
                  ? (quoteId) => chooseQuoteAction.bind(null, id, quoteId)
                  : undefined
              }
            />
            <p className="text-sm text-ink-muted">{t("estimateNote")}</p>
          </>
        )}
        {["assigned", "quoted", "new"].includes(request.status) && (
          <ActionButton
            action={closeRequestAction.bind(null, id)}
            label={t("noneSuits")}
            variant="ghost"
            confirm={t("noneSuitsConfirm")}
          />
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl">{t("installersTitle")}</h2>
          {assignments.length === 0 ? (
            <p className="mt-3 text-ink-muted">{t("installersNone")}</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {assignments.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2"
                >
                  <span className="font-semibold">{a.company}</span>
                  <span className="text-sm text-ink-muted">
                    {t(`installerStatus.${a.status as "offered"}`)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <RequestDetails request={request} />
        </Card>
      </div>
    </div>
  );
}
