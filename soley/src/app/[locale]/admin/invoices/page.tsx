import { getTranslations } from "next-intl/server";
import { ActionButton } from "@/components/admin/ActionButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { buttonClasses } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { requireAdmin } from "@/lib/auth/roles";
import { getDb } from "@/lib/data";
import { formatMonth, formatMur } from "@/lib/format";
import { billingLines } from "@/lib/services/billing";
import { createInvoiceAction, setInvoiceStatusAction } from "../actions";

export default async function AdminInvoices({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/invoices">) {
  const locale = await resolveLocale(params);
  await requireAdmin(locale, "/admin/invoices");
  const t = await getTranslations("admin.invoices");
  const { month } = await searchParams;
  const [allLines, installers] = await Promise.all([
    billingLines(),
    getDb().select("installers"),
  ]);
  const months = [...new Set(allLines.map((l) => l.month))].sort().reverse();
  const selected =
    typeof month === "string" && months.includes(month) ? month : undefined;
  const lines = selected
    ? allLines.filter((l) => l.month === selected)
    : allLines;
  const company = (id: string) =>
    installers.find((i) => i.id === id)?.company_name ?? "—";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">{t("title")}</h1>
      <p className="max-w-3xl text-ink-muted">{t("intro")}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/invoices"
          aria-current={!selected ? "page" : undefined}
          className="inline-flex min-h-10 items-center rounded-full border border-line bg-white px-3 text-sm font-semibold aria-[current=page]:bg-ocean-800 aria-[current=page]:text-white"
        >
          {t("allMonths")}
        </Link>
        {months.map((m) => (
          <Link
            key={m}
            href={{ pathname: "/admin/invoices", query: { month: m } }}
            aria-current={selected === m ? "page" : undefined}
            className="inline-flex min-h-10 items-center rounded-full border border-line bg-white px-3 text-sm font-semibold aria-[current=page]:bg-ocean-800 aria-[current=page]:text-white"
          >
            {formatMonth(m, locale)}
          </Link>
        ))}
        <a
          href={`/api/admin/invoices${selected ? `?month=${selected}` : ""}`}
          className={buttonClasses("secondary", "md", "ml-auto")}
          download
        >
          {t("export")}
        </a>
      </div>
      {lines.length === 0 ? (
        <p className="text-ink-muted">{t("empty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-white">
          <table className="w-full min-w-[46rem] text-left">
            <thead className="bg-sand-100 text-sm">
              <tr>
                {(
                  [
                    "installer",
                    "month",
                    "leads",
                    "total",
                    "invoice",
                    "actions",
                  ] as const
                ).map((c) => (
                  <th key={c} scope="col" className="p-3">
                    {t(`columns.${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr
                  key={`${line.installerId}-${line.month}`}
                  className="border-t border-line align-top"
                >
                  <th scope="row" className="p-3 font-semibold">
                    {company(line.installerId)}
                  </th>
                  <td className="p-3">{formatMonth(line.month, locale)}</td>
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
                      "—"
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {!line.invoice && (
                        <ActionButton
                          action={createInvoiceAction.bind(
                            null,
                            line.installerId,
                            line.month,
                          )}
                          label={t("create")}
                          variant="primary"
                        />
                      )}
                      {line.invoice?.status === "draft" && (
                        <ActionButton
                          action={setInvoiceStatusAction.bind(
                            null,
                            line.invoice.id,
                            "sent",
                          )}
                          label={t("markSent")}
                        />
                      )}
                      {line.invoice?.status === "sent" && (
                        <ActionButton
                          action={setInvoiceStatusAction.bind(
                            null,
                            line.invoice.id,
                            "paid",
                          )}
                          label={t("markPaid")}
                        />
                      )}
                      {line.invoice && line.invoice.status !== "paid" && (
                        <ActionButton
                          action={setInvoiceStatusAction.bind(
                            null,
                            line.invoice.id,
                            "void",
                          )}
                          label={t("void")}
                          variant="ghost"
                          confirm={t("void")}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
