import { getLocale, getTranslations } from "next-intl/server";
import type { QuoteRequestRow } from "@/lib/data/schema";
import type { Locale } from "@/i18n/routing";
import { formatDate, formatMur, formatNumber } from "@/lib/format";

/**
 * The facts of a quote request (no personal data), as a definition list.
 * Shown to installers, admins and the household itself.
 */
export async function RequestDetails({
  request,
}: {
  request: QuoteRequestRow;
}) {
  const t = await getTranslations("quoteForm.fields");
  const tr = await getTranslations("regions");
  const tc = await getTranslations("common");
  const locale = (await getLocale()) as Locale;
  const option = (field: string, value: string) =>
    t(`${field}.${value}` as "shading.none");

  const rows: [string, string][] = [
    [
      t("region.label"),
      `${tr(request.region)}${request.town ? `, ${request.town}` : ""}`,
    ],
    [t("property_type.legend"), option("property_type", request.property_type)],
    [t("ownership.legend"), option("ownership", request.ownership)],
    [t("roof_type.legend"), option("roof_type", request.roof_type)],
    [
      t("roof_area_m2.label"),
      request.roof_area_m2
        ? `${formatNumber(request.roof_area_m2, locale)} m²`
        : tc("notSet"),
    ],
    [t("shading.legend"), option("shading", request.shading)],
    [t("monthly_bill_mur.label"), formatMur(request.monthly_bill_mur, locale)],
    [
      t("battery_interest.legend"),
      option("battery_interest", request.battery_interest),
    ],
    [
      t("desired_kwp.label"),
      request.desired_kwp
        ? tc("kwp", { value: formatNumber(request.desired_kwp, locale) })
        : tc("notSet"),
    ],
    [t("timeline.legend"), option("timeline", request.timeline)],
    [t("financing.legend"), option("financing", request.financing)],
    [t("grant_interest.label"), request.grant_interest ? tc("yes") : tc("no")],
  ];
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="border-b border-line pb-2">
          <dt className="text-sm text-ink-muted">{label}</dt>
          <dd className="font-medium">{value}</dd>
        </div>
      ))}
      {request.notes && (
        <div className="border-b border-line pb-2 sm:col-span-2">
          <dt className="text-sm text-ink-muted">{t("notes.label")}</dt>
          <dd className="whitespace-pre-line">{request.notes}</dd>
        </div>
      )}
      <div className="sm:col-span-2">
        <dt className="sr-only">Date</dt>
        <dd className="text-sm text-ink-muted">
          {formatDate(request.created_at, locale)}
        </dd>
      </div>
    </dl>
  );
}
