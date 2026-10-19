import { getLocale, getTranslations } from "next-intl/server";
import type { CalculatorSettings } from "@content/facts";
import { ActionButton } from "@/components/shared/ActionButton";
import { Badge, ScrollRegion } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { GrantRules } from "@/lib/calculator";
import { bestIds, quoteFigures } from "@/lib/compare";
import { formatDate, formatMur, formatNumber } from "@/lib/format";
import type { QuoteOffer } from "@/lib/services/household";

/**
 * Quotes side by side: one column per installer, one row per question. On
 * a phone the table scrolls sideways with the row labels kept in view. The
 * best value in a row is marked with a "Best" label, not by colour alone.
 */
export async function ComparisonTable({
  offers,
  monthlyBillMur,
  settings,
  grant,
  chooseAction,
  chosenQuoteId,
}: {
  offers: QuoteOffer[];
  monthlyBillMur: number;
  settings: CalculatorSettings;
  grant: GrantRules;
  /** Bound server action per quote, when choosing is still possible. */
  chooseAction?: (
    quoteId: string,
  ) => Parameters<typeof ActionButton>[0]["action"];
  chosenQuoteId: string | null;
}) {
  const t = await getTranslations("account.request");
  const tq = await getTranslations("quote");
  const tc = await getTranslations("common");
  const locale = (await getLocale()) as Locale;
  const items = offers.map((offer) => ({
    id: offer.quote.id,
    offer,
    figures: quoteFigures(offer.quote, monthlyBillMur, settings, grant),
  }));
  const best = {
    price: bestIds(items, (i) => i.offer.quote.price_mur, "low"),
    afterGrant: bestIds(items, (i) => i.figures.afterGrantMur, "low"),
    perKwp: bestIds(items, (i) => i.figures.pricePerKwpMur, "low"),
    production: bestIds(
      items,
      (i) => i.offer.quote.yearly_production_kwh,
      "high",
    ),
    payback: bestIds(items, (i) => i.figures.paybackYears, "low"),
    panelWarranty: bestIds(
      items,
      (i) => i.offer.quote.panel_warranty_years,
      "high",
    ),
    inverterWarranty: bestIds(
      items,
      (i) => i.offer.quote.inverter_warranty_years,
      "high",
    ),
    workmanshipWarranty: bestIds(
      items,
      (i) => i.offer.quote.workmanship_warranty_years,
      "high",
    ),
    start: bestIds(items, (i) => i.offer.quote.start_weeks, "low"),
  };
  const mur = (v: number) => formatMur(v, locale);
  const num = (v: number, digits = 1) => formatNumber(v, locale, digits);
  const years = (v: number | null) =>
    v === null ? "—" : tq("yearsShort", { count: v });

  const rows: {
    key: keyof typeof best | string;
    label: string;
    cell: (i: (typeof items)[number]) => React.ReactNode;
  }[] = [
    {
      key: "price",
      label: t("rows.price"),
      cell: (i) => (
        <strong className="text-lg">{mur(i.offer.quote.price_mur)}</strong>
      ),
    },
    {
      key: "afterGrant",
      label: t("rows.afterGrant"),
      cell: (i) => mur(i.figures.afterGrantMur),
    },
    {
      key: "perKwp",
      label: t("rows.perKwp"),
      cell: (i) => mur(i.figures.pricePerKwpMur),
    },
    {
      key: "size",
      label: t("rows.size"),
      cell: (i) => tc("kwp", { value: num(i.offer.quote.system_kwp) }),
    },
    {
      key: "production",
      label: t("rows.production"),
      cell: (i) =>
        tq("kwhYear", { kwh: num(i.offer.quote.yearly_production_kwh, 0) }),
    },
    {
      key: "payback",
      label: t("rows.payback"),
      cell: (i) =>
        i.figures.paybackYears === null
          ? "—"
          : tc("years", { count: i.figures.paybackYears }),
    },
    {
      key: "panels",
      label: t("rows.panels"),
      cell: ({ offer: { quote: q } }) =>
        `${q.panel_count} × ${q.panel_brand}${q.panel_model ? ` ${q.panel_model}` : ""}${q.panel_watt ? ` (${q.panel_watt} W)` : ""}`,
    },
    {
      key: "inverter",
      label: t("rows.inverter"),
      cell: ({ offer: { quote: q } }) =>
        `${q.inverter_brand}${q.inverter_model ? ` ${q.inverter_model}` : ""}${q.inverter_kw ? ` (${num(q.inverter_kw)} kW)` : ""}`,
    },
    {
      key: "battery",
      label: t("rows.battery"),
      cell: ({ offer: { quote: q } }) =>
        q.battery_brand
          ? `${q.battery_brand} (${num(q.battery_kwh ?? 0)} kWh)`
          : tq("noBattery"),
    },
    {
      key: "panelWarranty",
      label: t("rows.panelWarranty"),
      cell: (i) => years(i.offer.quote.panel_warranty_years),
    },
    {
      key: "inverterWarranty",
      label: t("rows.inverterWarranty"),
      cell: (i) => years(i.offer.quote.inverter_warranty_years),
    },
    {
      key: "workmanshipWarranty",
      label: t("rows.workmanshipWarranty"),
      cell: (i) => years(i.offer.quote.workmanship_warranty_years),
    },
    {
      key: "batteryWarranty",
      label: t("rows.batteryWarranty"),
      cell: (i) => years(i.offer.quote.battery_warranty_years),
    },
    {
      key: "start",
      label: t("rows.start"),
      cell: (i) => tq("weeks", { count: i.offer.quote.start_weeks }),
    },
    {
      key: "duration",
      label: t("rows.duration"),
      cell: (i) => tq("days", { count: i.offer.quote.duration_days }),
    },
    {
      key: "ceb",
      label: t("rows.ceb"),
      cell: (i) =>
        i.offer.quote.includes_ceb_application ? tc("yes") : tc("no"),
    },
    {
      key: "validUntil",
      label: t("rows.validUntil"),
      cell: (i) => formatDate(i.offer.quote.valid_until, locale),
    },
    {
      key: "notes",
      label: t("rows.notes"),
      cell: (i) => (
        <span className="block max-w-xs text-sm whitespace-pre-line">
          {i.offer.quote.notes ?? "—"}
        </span>
      ),
    },
  ];

  return (
    <ScrollRegion
      label={tc("scrollTable")}
      className="rounded-card border border-line bg-white"
    >
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            <td className="sticky left-0 z-10 min-w-32 bg-white p-3" />
            {items.map(({ offer }) => (
              <th
                key={offer.quote.id}
                scope="col"
                className="min-w-56 border-l border-line p-3 align-top"
              >
                <Link
                  href={{
                    pathname: "/installers/[slug]",
                    params: { slug: offer.installer.slug },
                  }}
                  className="text-lg font-bold text-ocean-700 underline underline-offset-2"
                >
                  {offer.installer.company_name}
                </Link>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge tone="success">✓ {t("verified")}</Badge>
                  {offer.installer.is_demo && (
                    <Badge tone="warning">{tc("demo")}</Badge>
                  )}
                  {chosenQuoteId === offer.quote.id && (
                    <Badge tone="info">★</Badge>
                  )}
                </div>
                <p className="mt-2 text-sm font-normal text-ink-muted">
                  {offer.rating === null
                    ? t("noRating")
                    : t("rating", {
                        rating: num(offer.rating),
                        count: offer.reviewCount,
                      })}
                </p>
                {offer.installer.years_in_business !== null && (
                  <p className="text-sm font-normal text-ink-muted">
                    {t("yearsInBusiness", {
                      years: offer.installer.years_in_business,
                    })}
                  </p>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t border-line">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-sand-50 p-3 text-sm font-semibold"
              >
                {row.label}
              </th>
              {items.map((item) => {
                const isBest = (best as Record<string, Set<string>>)[
                  row.key
                ]?.has(item.id);
                return (
                  <td
                    key={item.id}
                    className="border-l border-line p-3 align-top"
                  >
                    {row.cell(item)}
                    {isBest && (
                      <Badge tone="success" className="ml-2">
                        {t("best")}
                      </Badge>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          {chooseAction && (
            <tr className="border-t border-line">
              <td className="sticky left-0 z-10 bg-sand-50 p-3" />
              {items.map(({ offer }) => (
                <td key={offer.quote.id} className="border-l border-line p-3">
                  <ActionButton
                    action={chooseAction(offer.quote.id)}
                    label={t("choose")}
                    variant="primary"
                    confirm={t("chooseConfirm", {
                      company: offer.installer.company_name,
                    })}
                  />
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </ScrollRegion>
  );
}
