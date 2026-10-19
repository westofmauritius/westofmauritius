import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/shared/ActionButton";
import { ActionForm } from "@/components/shared/ActionForm";
import { Notes } from "@/components/admin/Notes";
import { RequestDetails } from "@/components/shared/RequestDetails";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Alert, Card, SelectField } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { requireAdmin } from "@/lib/auth/roles";
import { getDb } from "@/lib/data";
import { formatDate, formatMur, formatNumber } from "@/lib/format";
import { suggestInstallers } from "@/lib/services/assignments";
import {
  offerManualAction,
  offerSuggestedAction,
  setRequestStatusAction,
  withdrawAssignmentAction,
} from "../../actions";

export default async function AdminRequest({
  params,
}: PageProps<"/[locale]/admin/requests/[id]">) {
  const { id } = await params;
  const locale = await resolveLocale(params);
  await requireAdmin(locale, {
    pathname: "/admin/requests/[id]",
    params: { id },
  });
  const t = await getTranslations("admin.requests");
  const tf = await getTranslations("quoteForm.fields");
  const db = getDb();
  const [request] = await db.select("quote_requests", { id });
  if (!request) notFound();
  const [[household], assignments, installers, suggestion] = await Promise.all([
    db.select("households", { id: request.household_id }),
    db.select(
      "lead_assignments",
      { quote_request_id: id },
      { orderBy: "offered_at" },
    ),
    db.select("installers", {}, { orderBy: "company_name" }),
    suggestInstallers(request),
  ]);
  const companyOf = (installerId: string) =>
    installers.find((i) => i.id === installerId)?.company_name ?? "—";
  const active = assignments.filter(
    (a) => !["declined", "withdrawn"].includes(a.status),
  );
  const room = request.max_installers - active.length;
  const open = !["chosen", "installed", "cancelled"].includes(request.status);
  const pickable = installers.filter(
    (i) =>
      i.status === "approved" &&
      !assignments.some((a) => a.installer_id === i.id),
  );

  return (
    <div className="space-y-8">
      <Link
        href="/admin/requests"
        className="inline-flex min-h-11 items-center font-semibold text-ocean-600 underline underline-offset-4"
      >
        ← {t("back")}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">{request.reference}</h1>
        <StatusBadge kind="request" status={request.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <RequestDetails request={request} />
        </Card>
        <Card>
          <h2 className="text-xl">{t("household")}</h2>
          {household && !household.erased_at ? (
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-ink-muted">{tf("name.label")}</dt>
                <dd className="text-base font-semibold">{household.name}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">{tf("email.label")}</dt>
                <dd className="break-all">{household.email}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">{tf("phone.label")}</dt>
                <dd>{household.phone}</dd>
              </div>
              {household.whatsapp && (
                <div>
                  <dt className="text-ink-muted">{tf("whatsapp.label")}</dt>
                  <dd>{household.whatsapp}</dd>
                </div>
              )}
              {household.preferred_contact && (
                <div>
                  <dt className="text-ink-muted">
                    {tf("preferred_contact.legend")}
                  </dt>
                  <dd>
                    {tf(`preferred_contact.${household.preferred_contact}`)}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="mt-4 text-ink-muted">{t("erased")}</p>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="text-xl">{t("assignmentsTitle")}</h2>
        {assignments.length === 0 ? (
          <p className="mt-3 text-ink-muted">{t("noAssignments")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {assignments.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-semibold">
                    <Link
                      href={{
                        pathname: "/admin/installers/[id]",
                        params: { id: a.installer_id },
                      }}
                      className="text-ocean-600 underline underline-offset-2"
                    >
                      {companyOf(a.installer_id)}
                    </Link>{" "}
                    <StatusBadge kind="assignment" status={a.status} />
                  </p>
                  <p className="text-sm text-ink-muted">
                    {formatDate(a.offered_at, locale)} ·{" "}
                    {t("assignedBy", {
                      who: a.assigned_by === "auto" ? t("auto") : a.assigned_by,
                    })}
                    {a.fee_mur !== null &&
                      ` · ${t("fee", { fee: formatMur(a.fee_mur, locale) })}`}
                  </p>
                </div>
                {["offered", "accepted", "quoted"].includes(a.status) &&
                  open && (
                    <ActionButton
                      action={withdrawAssignmentAction.bind(null, a.id)}
                      label={t("withdraw")}
                      variant="ghost"
                      confirm={t("withdraw")}
                    />
                  )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {open && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="text-xl">{t("suggestTitle")}</h2>
            <p className="mt-2 text-sm text-ink-muted">{t("suggestIntro")}</p>
            {room <= 0 ? (
              <Alert tone="info" className="mt-4">
                {t("full", { max: request.max_installers })}
              </Alert>
            ) : suggestion.selected.length === 0 ? (
              <Alert tone="warning" className="mt-4">
                {t("noSuggestions")}
              </Alert>
            ) : (
              <>
                <ol className="mt-4 list-decimal space-y-1 pl-5">
                  {suggestion.selected.map((c) => (
                    <li key={c.id}>
                      {companyOf(c.id)}{" "}
                      <span className="text-sm text-ink-muted">
                        (
                        {t("score", {
                          score: formatNumber(c.score, locale, 2),
                        })}
                        )
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="mt-4">
                  <ActionButton
                    action={offerSuggestedAction.bind(null, id)}
                    label={t("offerSuggested")}
                    variant="primary"
                  />
                </div>
              </>
            )}
            {suggestion.skipped.filter(
              (s) => s.reason !== "wrongRegion" && s.reason !== "notApproved",
            ).length > 0 && (
              <ul className="mt-4 text-sm text-ink-muted">
                {suggestion.skipped
                  .filter(
                    (s) =>
                      s.reason !== "wrongRegion" && s.reason !== "notApproved",
                  )
                  .map((s) => (
                    <li key={s.id}>
                      {companyOf(s.id)}: {t(`skipped.${s.reason}`)}
                    </li>
                  ))}
              </ul>
            )}
          </Card>
          <Card>
            <h2 className="text-xl">{t("manualTitle")}</h2>
            <p className="mt-2 text-sm text-ink-muted">
              {t("manualIntro", { max: request.max_installers })}
            </p>
            {room > 0 && pickable.length > 0 && (
              <ActionForm
                action={offerManualAction.bind(null, id)}
                submitLabel={t("offer")}
                variant="secondary"
                labels={{ installer_id: t("manualPick") }}
                className="mt-4 space-y-3"
              >
                <SelectField
                  name="installer_id"
                  label={t("manualPick")}
                  placeholder="—"
                  options={pickable.map((i) => ({
                    value: i.id,
                    label: i.company_name,
                  }))}
                />
              </ActionForm>
            )}
          </Card>
        </div>
      )}

      <Card>
        <h2 className="text-xl">{t("statusTitle")}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {request.status === "chosen" && (
            <ActionButton
              action={setRequestStatusAction.bind(null, id, "installed")}
              label={t("markInstalled")}
              variant="primary"
            />
          )}
          {open && (
            <ActionButton
              action={setRequestStatusAction.bind(null, id, "cancelled")}
              label={t("cancel")}
              variant="danger"
              confirm={t("cancel")}
            />
          )}
        </div>
      </Card>

      <Notes subjectType="quote_request" subjectId={id} />
    </div>
  );
}
