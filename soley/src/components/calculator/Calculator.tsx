"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import type { CalculatorSettings } from "@content/facts";
import {
  Badge,
  ButtonLink,
  RadioCards,
  SelectField,
  Stat,
  TextField,
} from "@/components/ui";
import type { Locale } from "@/i18n/routing";
import {
  calculateSolar,
  type GrantRules,
  type SizingMode,
} from "@/lib/calculator";
import { formatMur, formatNumber } from "@/lib/format";
import { regions } from "@/lib/regions";

/** Parses what people type: "3 500", "3,500" and "Rs 3500" all mean 3500. */
const parseAmount = (value: string) => {
  const number = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(number) ? number : 0;
};

/**
 * The calculator form and its results. The numbers update as the visitor
 * types (announced politely to screen readers), and the button carries the
 * answers over to the quote form so nothing has to be typed twice.
 */
export function Calculator({
  settings,
  grant,
  headingLevel = "h2",
}: {
  settings: CalculatorSettings;
  grant: GrantRules;
  headingLevel?: "h2" | "h3";
}) {
  const t = useTranslations("calculator");
  const tr = useTranslations("regions");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const resultsId = useId();

  const [bill, setBill] = useState("3000");
  const [sizing, setSizing] = useState<SizingMode>("bill");
  const [roof, setRoof] = useState("");
  const [kwp, setKwp] = useState("");
  const [region, setRegion] = useState("");
  const [battery, setBattery] = useState("no");

  const result = useMemo(
    () =>
      calculateSolar(
        {
          monthlyBillMur: parseAmount(bill),
          sizing,
          roofAreaM2: parseAmount(roof),
          desiredKwp: parseAmount(kwp),
          battery: battery === "yes",
        },
        settings,
        grant,
      ),
    [bill, sizing, roof, kwp, battery, settings, grant],
  );

  const Heading = headingLevel;
  const mur = (value: number) => formatMur(value, locale);
  const hasResult = result.systemKwp > 0;

  const query: Record<string, string> = {
    bill: String(parseAmount(bill)),
    battery,
  };
  if (region) query.region = region;
  if (hasResult) query.kwp = String(result.systemKwp);

  return (
    <div className="grid gap-6 rounded-card border border-line bg-white p-5 shadow-sm sm:p-7 lg:grid-cols-2">
      <form
        className="space-y-5"
        onSubmit={(event) => event.preventDefault()}
        aria-describedby={resultsId}
      >
        <TextField
          label={t("billLabel")}
          hint={t("billHint")}
          name="bill"
          inputMode="numeric"
          autoComplete="off"
          value={bill}
          onChange={(event) => setBill(event.target.value)}
        />
        <RadioCards
          legend={t("sizingLegend")}
          name="sizing"
          columns={3}
          value={sizing}
          onChange={(value) => setSizing(value as SizingMode)}
          options={[
            { value: "bill", label: t("sizing.bill") },
            { value: "roof", label: t("sizing.roof") },
            { value: "size", label: t("sizing.size") },
          ]}
        />
        {sizing === "roof" && (
          <TextField
            label={t("roofLabel")}
            hint={t("roofHint")}
            name="roof"
            inputMode="decimal"
            value={roof}
            onChange={(event) => setRoof(event.target.value)}
          />
        )}
        {sizing === "size" && (
          <TextField
            label={t("kwpLabel")}
            hint={t("kwpHint")}
            name="kwp"
            inputMode="decimal"
            value={kwp}
            onChange={(event) => setKwp(event.target.value)}
          />
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label={t("regionLabel")}
            hint={t("regionHint")}
            name="region"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            placeholder={t("regionPlaceholder")}
            options={regions.map((r) => ({ value: r, label: tr(r) }))}
          />
          <RadioCards
            legend={t("batteryLegend")}
            name="battery"
            value={battery}
            onChange={setBattery}
            options={[
              { value: "no", label: tc("no") },
              { value: "yes", label: tc("yes") },
            ]}
          />
        </div>
      </form>

      <section id={resultsId} aria-live="polite" className="flex flex-col">
        <div className="flex items-center justify-between gap-3">
          <Heading className="text-xl">{t("resultsTitle")}</Heading>
          <Badge tone="warning">{tc("estimate")}</Badge>
        </div>
        {hasResult ? (
          <>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              <Stat
                label={t("result.size")}
                value={tc("kwp", {
                  value: formatNumber(result.systemKwp, locale),
                })}
                hint={
                  result.limitedByRoof
                    ? t("result.limitedByRoof")
                    : t("result.coverage", {
                        percent: Math.round(result.coverage * 100),
                      })
                }
              />
              <Stat label={t("result.cost")} value={mur(result.costMur)} />
              <Stat
                label={t("result.grant", { share: grant.sharePercent })}
                value={`−\u00a0${mur(result.grantMur)}`}
                hint={
                  result.grantCapped
                    ? t("result.grantCapped", { max: mur(grant.maxMur) })
                    : undefined
                }
              />
              <Stat
                emphasis
                label={t("result.netCost")}
                value={mur(result.netCostMur)}
              />
              <Stat
                label={t("result.saving")}
                value={mur(result.yearlySavingMur)}
                hint={t("result.production", {
                  kwh: formatNumber(result.yearlyProductionKwh, locale, 0),
                })}
              />
              <Stat
                label={t("result.payback")}
                value={
                  result.paybackYears === null
                    ? "—"
                    : t("result.paybackValue", {
                        years: formatNumber(result.paybackYears, locale),
                      })
                }
              />
            </dl>
            <p className="mt-4 text-sm text-ink-muted">{tc("estimateNote")}</p>
            <ButtonLink
              href={{ pathname: "/get-quotes", query }}
              size="lg"
              className="mt-5 w-full sm:w-auto sm:self-start"
            >
              {t("cta")}
            </ButtonLink>
          </>
        ) : (
          <p className="mt-4 text-ink-muted">{t("empty")}</p>
        )}
      </section>
    </div>
  );
}
