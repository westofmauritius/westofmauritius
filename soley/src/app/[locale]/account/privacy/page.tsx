import { getTranslations } from "next-intl/server";
import { ActionForm } from "@/components/shared/ActionForm";
import { Card, TextField } from "@/components/ui";
import { buttonClasses } from "@/components/ui/button-styles";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { requireHousehold } from "@/lib/auth/roles";
import { getDb } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { deleteMyDataAction } from "./actions";

export default async function MyDataPage({
  params,
}: PageProps<"/[locale]/account/privacy">) {
  const locale = await resolveLocale(params);
  const viewer = await requireHousehold(locale, "/account/privacy");
  const t = await getTranslations("account.privacy");
  const db = getDb();
  const consents = viewer.household
    ? await db.select("consents", { household_id: viewer.household.id })
    : [];
  const requests = viewer.household
    ? await db.select("quote_requests", { household_id: viewer.household.id })
    : [];

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-3xl">{t("title")}</h1>
      <p className="text-lg text-ink-muted">{t("intro")}</p>

      <Card>
        <h2 className="text-xl">{t("exportTitle")}</h2>
        <p className="mt-2">{t("exportBody")}</p>
        <a
          href="/api/account/export"
          download
          className={buttonClasses("secondary", "md", "mt-4")}
        >
          {t("exportButton")}
        </a>
      </Card>

      <Card>
        <h2 className="text-xl">{t("consentsTitle")}</h2>
        {consents.length === 0 ? (
          <p className="mt-2 text-ink-muted">{t("noConsents")}</p>
        ) : (
          <ul className="mt-3 list-disc space-y-1 pl-5">
            {consents.map((c) => (
              <li key={c.id}>
                {t("consentLine", {
                  date: formatDate(c.created_at, locale),
                  reference:
                    requests.find((r) => r.id === c.quote_request_id)
                      ?.reference ?? "—",
                  version: c.text_version,
                })}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {viewer.household && (
        <Card className="border-danger-700/40">
          <h2 className="text-xl">{t("deleteTitle")}</h2>
          <p className="mt-2">{t("deleteBody")}</p>
          <ActionForm
            action={deleteMyDataAction.bind(null, locale)}
            submitLabel={t("deleteButton")}
            variant="danger"
            labels={{ confirm: t("deleteConfirmLabel") }}
            className="mt-4 space-y-4"
          >
            <TextField
              name="confirm"
              label={t("deleteConfirmLabel")}
              autoComplete="off"
              className="max-w-xs"
              required
            />
          </ActionForm>
        </Card>
      )}

      <p className="text-sm text-ink-muted">
        {t("rights")}{" "}
        <Link
          href="/privacy"
          className="font-semibold text-ocean-600 underline underline-offset-2"
        >
          {(await getTranslations("footer"))("privacy")}
        </Link>
      </p>
    </div>
  );
}
