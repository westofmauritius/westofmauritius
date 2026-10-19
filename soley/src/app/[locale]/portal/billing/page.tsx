import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Stat } from "@/components/ui";
import { resolveLocale } from "@/i18n/locale";
import { requireInstaller } from "@/lib/auth/roles";
import { formatMonth, formatMur, formatNumber } from "@/lib/format";
import { installerStats } from "@/lib/services/assignments";
import { billingLines } from "@/lib/services/billing";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("portal.billing");
  return { title: t("title"), robots: { index: false } };
}

export default async function BillingPage({
  params,
}: PageProps<"/[locale]/portal/billing">) {
  const locale = await resolveLocale(params);
  const { installer } = await requireInstaller(locale, "/portal/billing");
  const t = await getTranslations("portal.billing");
  const [lines, stats] = await Promise.all([
    billingLines(installer.id),
    installerStats().then((s) => s.get(installer.id)),
  ]);
  const decided = (stats?.won ?? 0) + (stats?.lost ?? 0);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-ink-muted">{t("intro")}</p>
      </div>

      <section aria-labelledby="stats">
        <h2 id="stats" className="text-xl">
          {t("stats")}
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label={t("accepted")} value={String(stats?.accepted ?? 0)} />
          <Stat label={t("won")} value={String(stats?.won ?? 0)} />
          <Stat
            label={t("winRate")}
            value={
              decided
                ? `${Math.round(((stats?.won ?? 0) / decided) * 100)} %`
                : "—"
            }
          />
          <Stat
            label={t("responseTime")}
            value={
              stats?.avgResponseHours != null
                ? t("hours", {
                    hours: formatNumber(stats.avgResponseHours, locale),
                  })
                : "—"
            }
          />
        </dl>
      </section>

      <section aria-labelledby="months">
        {lines.length === 0 ? (
          <p className="text-ink-muted">{t("empty")}</p>
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-white">
            <table className="w-full text-left">
              <caption id="months" className="sr-only">
                {t("title")}
              </caption>
              <thead className="bg-sand-100 text-sm">
                <tr>
                  <th scope="col" className="p-3">
                    {t("month")}
                  </th>
                  <th scope="col" className="p-3">
                    {t("leads")}
                  </th>
                  <th scope="col" className="p-3">
                    {t("amount")}
                  </th>
                  <th scope="col" className="p-3">
                    {t("invoice")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.month} className="border-t border-line">
                    <th scope="row" className="p-3 font-semibold">
                      {formatMonth(line.month, locale)}
                    </th>
                    <td className="p-3 tabular-nums">{line.leadCount}</td>
                    <td className="p-3 tabular-nums">
                      {formatMur(line.totalMur, locale)}
                    </td>
                    <td className="p-3">
                      {line.invoice ? (
                        <span className="flex flex-wrap items-center gap-2">
                          {line.invoice.number}
                          <StatusBadge
                            kind="invoice"
                            status={line.invoice.status}
                          />
                        </span>
                      ) : (
                        <span className="text-ink-muted">{t("noInvoice")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
