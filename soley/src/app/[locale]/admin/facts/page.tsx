import { getTranslations } from "next-intl/server";
import { policyFacts, type PolicyFactKey } from "@content/facts";
import { ActionForm } from "@/components/shared/ActionForm";
import { Badge, Card, Checkbox, TextField } from "@/components/ui";
import { resolveLocale } from "@/i18n/locale";
import { requireAdmin } from "@/lib/auth/roles";
import { getDb } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { saveFactAction } from "../actions";

export default async function AdminFacts({
  params,
}: PageProps<"/[locale]/admin/facts">) {
  const locale = await resolveLocale(params);
  await requireAdmin(locale, "/admin/facts");
  const t = await getTranslations("admin.facts");
  const overrides = await getDb().select("facts");
  const keys = Object.keys(policyFacts) as PolicyFactKey[];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">{t("title")}</h1>
      <p className="max-w-3xl text-ink-muted">{t("intro")}</p>
      {keys.map((key) => {
        const fact = policyFacts[key];
        const saved = overrides.find((o) => o.key === key);
        const verified = saved?.verified ?? !fact.verify;
        return (
          <Card key={key}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg">{t(`labels.${key}`)}</h2>
              <Badge tone={verified ? "success" : "warning"}>
                {verified ? t("verified") : t("unverified")}
              </Badge>
            </div>
            {"note" in fact && fact.note && (
              <p className="mt-2 text-sm text-ink-muted">
                {t("noteLabel")}: {fact.note}
              </p>
            )}
            <ActionForm
              action={saveFactAction.bind(null, key)}
              submitLabel={t("save")}
              successMessage={t("saved")}
              variant="secondary"
              labels={{
                value: t("value"),
                source_url: t("sourceUrl"),
                source_name: t("sourceName"),
              }}
              className="mt-4 space-y-3"
            >
              {fact.kind === "number" ? (
                <TextField
                  name="value"
                  inputMode="decimal"
                  label={t("value")}
                  defaultValue={saved?.value ?? fact.value}
                  className="max-w-xs"
                />
              ) : (
                <p className="text-sm text-ink-muted">{t("textFact")}</p>
              )}
              <div className="grid gap-3 sm:grid-cols-3">
                <TextField
                  name="source_name"
                  label={t("sourceName")}
                  defaultValue={saved?.source_name ?? fact.source.name}
                />
                <TextField
                  name="source_url"
                  label={t("sourceUrl")}
                  inputMode="url"
                  defaultValue={saved?.source_url ?? fact.source.url}
                />
                <TextField
                  name="source_date"
                  label={t("sourceDate")}
                  defaultValue={
                    saved?.source_date ??
                    ("published" in fact.source ? fact.source.published : "") ??
                    ""
                  }
                />
              </div>
              <Checkbox
                name="verified"
                label={t("verified")}
                defaultChecked={verified}
              />
              {saved && (
                <p className="text-sm text-ink-muted">
                  {saved.updated_by}, {formatDate(saved.updated_at, locale)}
                </p>
              )}
            </ActionForm>
          </Card>
        );
      })}
    </div>
  );
}
