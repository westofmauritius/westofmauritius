import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/admin/ActionButton";
import { ActionForm } from "@/components/admin/ActionForm";
import { Notes } from "@/components/admin/Notes";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Alert,
  Card,
  Checkbox,
  Stat,
  TextArea,
  TextField,
} from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { requireAdmin } from "@/lib/auth/roles";
import { getDb } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/format";
import { checklistItems } from "@/lib/services/admin";
import { installerStats } from "@/lib/services/assignments";
import {
  saveInstallerProfileAction,
  saveInstallerReviewAction,
  setInstallerStatusAction,
} from "../../actions";

export default async function AdminInstaller({
  params,
}: PageProps<"/[locale]/admin/installers/[id]">) {
  const { id } = await params;
  const locale = await resolveLocale(params);
  await requireAdmin(locale, {
    pathname: "/admin/installers/[id]",
    params: { id },
  });
  const t = await getTranslations("admin.installers");
  const ta = await getTranslations("forInstallers.apply.fields");
  const tr = await getTranslations("regions");
  const tc = await getTranslations("common");
  const tb = await getTranslations("portal.billing");
  const db = getDb();
  const [installer] = await db.select("installers", { id });
  if (!installer) notFound();
  const [regions, documents, [review], stats] = await Promise.all([
    db.select("installer_regions", { installer_id: id }),
    db.select("installer_documents", { installer_id: id }),
    db.select("installer_reviews", { installer_id: id }),
    installerStats().then((s) => s.get(id)),
  ]);
  const checklistDone = checklistItems.every((item) => review?.checklist[item]);

  const details: [string, React.ReactNode][] = [
    [ta("contact_name"), installer.contact_name],
    [
      ta("contact_email"),
      <a
        key="e"
        href={`mailto:${installer.contact_email}`}
        className="break-all text-ocean-600 underline"
      >
        {installer.contact_email}
      </a>,
    ],
    [ta("phone"), installer.phone],
    [ta("whatsapp"), installer.whatsapp ?? "—"],
    [ta("brn"), installer.brn ?? "—"],
    [ta("address"), installer.address ?? "—"],
    [ta("website"), installer.website ?? "—"],
    [ta("years_in_business"), installer.years_in_business ?? "—"],
    [ta("regions"), regions.map((r) => tr(r.region)).join(", ")],
    [ta("certifications"), installer.certifications.join(", ") || "—"],
    [ta("ceb_registered"), installer.ceb_registered ? tc("yes") : tc("no")],
    [ta("locale"), installer.locale.toUpperCase()],
  ];

  return (
    <div className="space-y-8">
      <Link
        href="/admin/installers"
        className="inline-flex min-h-11 items-center font-semibold text-ocean-600 underline underline-offset-4"
      >
        ← {t("back")}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">{installer.company_name}</h1>
        <StatusBadge kind="installer" status={installer.status} />
      </div>
      {installer.is_demo && <Alert tone="warning">{t("demo")}</Alert>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl">{t("details")}</h2>
          <dl className="mt-4 space-y-2">
            {details.map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[10rem_1fr] gap-2 border-b border-line pb-2 text-sm"
              >
                <dt className="text-ink-muted">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl">{t("documents")}</h2>
            {documents.length === 0 ? (
              <p className="mt-3 text-ink-muted">{t("noDocuments")}</p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2"
                  >
                    <span>
                      <span className="font-semibold">
                        {ta(`doc_${doc.kind}` as "doc_registration")}
                      </span>
                      <span className="block text-sm text-ink-muted">
                        {doc.file_name} ·{" "}
                        {formatNumber(doc.size_bytes / 1024, locale, 0)} kB
                      </span>
                    </span>
                    <a
                      href={`/api/admin/documents/${doc.id}`}
                      className="inline-flex min-h-11 items-center font-semibold text-ocean-600 underline"
                    >
                      {t("download")}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card>
            <h2 className="text-xl">{t("stats")}</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              <Stat
                label={tb("accepted")}
                value={String(stats?.accepted ?? 0)}
              />
              <Stat label={tb("won")} value={String(stats?.won ?? 0)} />
              <Stat
                label={tb("responseTime")}
                value={
                  stats?.avgResponseHours != null
                    ? tb("hours", {
                        hours: formatNumber(stats.avgResponseHours, locale),
                      })
                    : "—"
                }
              />
              <Stat
                label={t("columns.rating")}
                value={
                  stats?.rating
                    ? `${formatNumber(stats.rating, locale)} (${stats.reviewCount})`
                    : "—"
                }
              />
            </dl>
          </Card>
        </div>
      </div>

      <Card>
        <h2 className="text-xl">{t("checklistTitle")}</h2>
        <ActionForm
          action={saveInstallerReviewAction.bind(null, id)}
          submitLabel={t("saveReview")}
          variant="secondary"
          labels={{
            site_visit_date: t("siteVisitDate"),
            site_visit_by: t("siteVisitBy"),
            decision_note: t("decisionNote"),
          }}
          className="mt-4 space-y-4"
        >
          <fieldset className="grid gap-2 sm:grid-cols-2">
            <legend className="sr-only">{t("checklistTitle")}</legend>
            {checklistItems.map((item) => (
              <Checkbox
                key={item}
                name={`check_${item}`}
                defaultChecked={review?.checklist[item] === true}
                label={t(`checklist.${item}`)}
              />
            ))}
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="site_visit_date"
              type="date"
              label={t("siteVisitDate")}
              defaultValue={review?.site_visit_date ?? ""}
            />
            <TextField
              name="site_visit_by"
              label={t("siteVisitBy")}
              defaultValue={review?.site_visit_by ?? ""}
            />
          </div>
          <TextArea
            name="decision_note"
            label={t("decisionNote")}
            defaultValue={review?.decision_note ?? ""}
          />
          {review && (
            <p className="text-sm text-ink-muted">
              {review.updated_by}, {formatDate(review.updated_at, locale)}
            </p>
          )}
        </ActionForm>
      </Card>

      <Card>
        <h2 className="text-xl">{t("decisionTitle")}</h2>
        {!checklistDone && installer.status !== "approved" && (
          <Alert tone="info" className="mt-3">
            {t("checklistIncomplete")}
          </Alert>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          {installer.status === "applied" && (
            <ActionButton
              action={setInstallerStatusAction.bind(null, id, "in_review")}
              label={t("startReview")}
              variant="ghost"
            />
          )}
          {["applied", "in_review", "rejected"].includes(installer.status) && (
            <ActionButton
              action={setInstallerStatusAction.bind(null, id, "approved")}
              label={t("approve")}
              variant="primary"
              errorMessage={t("checklistIncomplete")}
            />
          )}
          {installer.status === "suspended" && (
            <ActionButton
              action={setInstallerStatusAction.bind(null, id, "approved")}
              label={t("reinstate")}
              variant="primary"
              errorMessage={t("checklistIncomplete")}
            />
          )}
          {["applied", "in_review"].includes(installer.status) && (
            <ActionButton
              action={setInstallerStatusAction.bind(null, id, "rejected")}
              label={t("reject")}
              variant="danger"
              confirm={t("reject")}
            />
          )}
          {installer.status === "approved" && (
            <ActionButton
              action={setInstallerStatusAction.bind(null, id, "suspended")}
              label={t("suspend")}
              variant="danger"
              confirm={t("suspend")}
            />
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl">{t("profileTitle")}</h2>
        <ActionForm
          action={saveInstallerProfileAction.bind(null, id)}
          submitLabel={t("saveProfile")}
          variant="secondary"
          labels={{
            description_en: t("descriptionEn"),
            description_fr: t("descriptionFr"),
            monthly_lead_cap: t("cap"),
          }}
          className="mt-4 space-y-4"
        >
          <TextArea
            name="description_en"
            label={t("descriptionEn")}
            defaultValue={installer.description_en ?? ""}
          />
          <TextArea
            name="description_fr"
            label={t("descriptionFr")}
            defaultValue={installer.description_fr ?? ""}
          />
          <TextField
            name="monthly_lead_cap"
            inputMode="numeric"
            label={t("cap")}
            defaultValue={installer.monthly_lead_cap ?? ""}
            className="max-w-xs"
          />
          <Checkbox
            name="active"
            label={t("active")}
            defaultChecked={installer.active}
          />
        </ActionForm>
      </Card>

      <Notes subjectType="installer" subjectId={id} />
    </div>
  );
}
