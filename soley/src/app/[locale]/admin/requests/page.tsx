import { getTranslations } from "next-intl/server";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { requireAdmin } from "@/lib/auth/roles";
import { getDb } from "@/lib/data";
import type { RequestStatus } from "@/lib/data/schema";
import { formatDate, formatMur } from "@/lib/format";

const statuses: RequestStatus[] = [
  "new",
  "assigned",
  "quoted",
  "chosen",
  "installed",
  "cancelled",
];

export default async function AdminRequests({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/requests">) {
  const locale = await resolveLocale(params);
  await requireAdmin(locale, "/admin/requests");
  const t = await getTranslations("admin.requests");
  const ts = await getTranslations("status.request");
  const tr = await getTranslations("regions");
  const tc = await getTranslations("common");
  const { status } = await searchParams;
  const filter = statuses.find((s) => s === status);
  const db = getDb();
  const [requests, assignments] = await Promise.all([
    db.select("quote_requests", filter ? { status: filter } : {}, {
      orderBy: "created_at",
      ascending: false,
    }),
    db.select("lead_assignments"),
  ]);

  const filterLink = (value?: RequestStatus) => (
    <Link
      href={{
        pathname: "/admin/requests",
        query: value ? { status: value } : {},
      }}
      aria-current={filter === value ? "page" : undefined}
      className="inline-flex min-h-10 items-center rounded-full border border-line bg-white px-3 text-sm font-semibold aria-[current=page]:border-ocean-800 aria-[current=page]:bg-ocean-800 aria-[current=page]:text-white"
    >
      {value ? ts(value) : t("filterAll")}
    </Link>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">{t("title")}</h1>
      <nav aria-label={t("title")} className="flex flex-wrap gap-2">
        {filterLink()}
        {statuses.map((s) => (
          <span key={s}>{filterLink(s)}</span>
        ))}
      </nav>
      {requests.length === 0 ? (
        <p className="text-ink-muted">{t("empty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-white">
          <table className="w-full min-w-[40rem] text-left">
            <thead className="bg-sand-100 text-sm">
              <tr>
                {(
                  [
                    "reference",
                    "region",
                    "bill",
                    "status",
                    "installers",
                    "created",
                  ] as const
                ).map((c) => (
                  <th key={c} scope="col" className="p-3">
                    {t(`columns.${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const active = assignments.filter(
                  (a) =>
                    a.quote_request_id === request.id &&
                    !["declined", "withdrawn"].includes(a.status),
                ).length;
                return (
                  <tr key={request.id} className="border-t border-line">
                    <th scope="row" className="p-3">
                      <Link
                        href={{
                          pathname: "/admin/requests/[id]",
                          params: { id: request.id },
                        }}
                        className="font-semibold text-ocean-600 underline underline-offset-2"
                      >
                        {request.reference}
                      </Link>
                      {request.is_demo && (
                        <Badge tone="warning" className="ml-2">
                          {tc("demo")}
                        </Badge>
                      )}
                    </th>
                    <td className="p-3">{tr(request.region)}</td>
                    <td className="p-3 tabular-nums">
                      {formatMur(request.monthly_bill_mur, locale)}
                    </td>
                    <td className="p-3">
                      <StatusBadge kind="request" status={request.status} />
                    </td>
                    <td className="p-3 tabular-nums">
                      {active} / {request.max_installers}
                    </td>
                    <td className="p-3 text-sm">
                      {formatDate(request.created_at, locale, "short")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
