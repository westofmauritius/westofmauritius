import { getTranslations } from "next-intl/server";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge, ScrollRegion } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { requireAdmin } from "@/lib/auth/roles";
import { getDb } from "@/lib/data";
import type { InstallerStatus } from "@/lib/data/schema";
import { formatDate, formatNumber } from "@/lib/format";
import { installerStats } from "@/lib/services/assignments";

const statuses: InstallerStatus[] = [
  "applied",
  "in_review",
  "approved",
  "suspended",
  "rejected",
];

export default async function AdminInstallers({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/installers">) {
  const locale = await resolveLocale(params);
  await requireAdmin(locale, "/admin/installers");
  const t = await getTranslations("admin.installers");
  const ts = await getTranslations("status.installer");
  const tr = await getTranslations("regions");
  const tc = await getTranslations("common");
  const { status } = await searchParams;
  const filter = statuses.find((s) => s === status);
  const db = getDb();
  const [installers, regions, stats] = await Promise.all([
    db.select("installers", filter ? { status: filter } : {}, {
      orderBy: "created_at",
      ascending: false,
    }),
    db.select("installer_regions"),
    installerStats(),
  ]);
  // The vetting queue first.
  const order = (s: InstallerStatus) => statuses.indexOf(s);
  installers.sort((a, b) => order(a.status) - order(b.status));

  const filterLink = (value?: InstallerStatus) => (
    <Link
      href={{
        pathname: "/admin/installers",
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
      {installers.length === 0 ? (
        <p className="text-ink-muted">{t("empty")}</p>
      ) : (
        <ScrollRegion
          label={tc("scrollTable")}
          className="rounded-card border border-line bg-white"
        >
          <table className="w-full min-w-[44rem] text-left">
            <thead className="bg-sand-100 text-sm">
              <tr>
                {(
                  [
                    "company",
                    "status",
                    "regions",
                    "leads",
                    "rating",
                    "applied",
                  ] as const
                ).map((c) => (
                  <th key={c} scope="col" className="p-3">
                    {t(`columns.${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {installers.map((installer) => {
                const s = stats.get(installer.id);
                const covered = regions.filter(
                  (r) => r.installer_id === installer.id,
                );
                return (
                  <tr
                    key={installer.id}
                    className="border-t border-line align-top"
                  >
                    <th scope="row" className="p-3">
                      <Link
                        href={{
                          pathname: "/admin/installers/[id]",
                          params: { id: installer.id },
                        }}
                        className="font-semibold text-ocean-600 underline underline-offset-2"
                      >
                        {installer.company_name}
                      </Link>
                      {installer.is_demo && (
                        <Badge tone="warning" className="ml-2">
                          {tc("demo")}
                        </Badge>
                      )}
                    </th>
                    <td className="p-3">
                      <StatusBadge kind="installer" status={installer.status} />
                    </td>
                    <td className="p-3 text-sm">
                      {covered.map((r) => tr(r.region)).join(", ")}
                    </td>
                    <td className="p-3 tabular-nums">
                      {s?.leadsThisMonth ?? 0}
                    </td>
                    <td className="p-3 tabular-nums">
                      {s?.rating
                        ? `${formatNumber(s.rating, locale)} (${s.reviewCount})`
                        : "—"}
                    </td>
                    <td className="p-3 text-sm">
                      {formatDate(installer.created_at, locale, "short")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ScrollRegion>
      )}
    </div>
  );
}
