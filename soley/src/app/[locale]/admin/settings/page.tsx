import { getTranslations } from "next-intl/server";
import { calculatorDefaults, type CalculatorSettingKey } from "@content/facts";
import { ActionForm } from "@/components/admin/ActionForm";
import { Badge, Card, Checkbox, TextField } from "@/components/ui";
import { resolveLocale } from "@/i18n/locale";
import { requireAdmin } from "@/lib/auth/roles";
import { getLiveFacts } from "@/lib/facts";
import { getPlatformSettings } from "@/lib/services/settings";
import { saveSettingsAction } from "../actions";

export default async function AdminSettings({
  params,
}: PageProps<"/[locale]/admin/settings">) {
  const locale = await resolveLocale(params);
  await requireAdmin(locale, "/admin/settings");
  const t = await getTranslations("admin.settings");
  const tf = await getTranslations("admin.facts");
  const [facts, platform] = await Promise.all([
    getLiveFacts(),
    getPlatformSettings(),
  ]);
  const keys = Object.keys(calculatorDefaults) as CalculatorSettingKey[];
  const labels: Record<string, string> = {
    ...Object.fromEntries(keys.map((k) => [k, t(`labels.${k}`)])),
    lead_price_mur: t("leadPrice"),
    default_monthly_cap: t("defaultCap"),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">{t("title")}</h1>
      <ActionForm
        action={saveSettingsAction}
        submitLabel={t("save")}
        successMessage={t("saved")}
        labels={labels}
        className="space-y-6"
      >
        <Card>
          <h2 className="text-xl">{t("calculatorTitle")}</h2>
          <p className="mt-1 text-ink-muted">{t("calculatorIntro")}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {keys.map((key) => {
              const fact = calculatorDefaults[key];
              const isPlaceholder =
                "placeholder" in fact && facts.calculator[key] === fact.value;
              return (
                <div key={key}>
                  <TextField
                    name={key}
                    inputMode="decimal"
                    label={t(`labels.${key}`)}
                    defaultValue={facts.calculator[key]}
                    hint={"note" in fact ? fact.note : undefined}
                  />
                  {isPlaceholder && (
                    <Badge tone="warning" className="mt-2">
                      {tf("placeholder")}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <h2 className="text-xl">{t("platformTitle")}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField
              name="lead_price_mur"
              inputMode="numeric"
              label={t("leadPrice")}
              hint={t("leadPriceHint")}
              defaultValue={platform.lead_price_mur}
            />
            <TextField
              name="default_monthly_cap"
              inputMode="numeric"
              label={t("defaultCap")}
              defaultValue={platform.default_monthly_cap}
            />
          </div>
          <Checkbox
            name="auto_routing"
            className="mt-4"
            label={t("autoRouting")}
            hint={t("autoRoutingHint")}
            defaultChecked={platform.auto_routing}
          />
        </Card>
      </ActionForm>
    </div>
  );
}
