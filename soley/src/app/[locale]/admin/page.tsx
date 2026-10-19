import { getTranslations } from "next-intl/server";
import { Card, Stat } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { requireAdmin } from "@/lib/auth/roles";
import { getDb } from "@/lib/data";
import { formatDate, formatMur, formatNumber } from "@/lib/format";
import { dashboardMetrics, requestsPerWeek } from "@/lib/metrics";

export default async function AdminDashboard({
  params,
}: PageProps<"/[locale]/admin">) {
  const locale = await resolveLocale(params);
  await requireAdmin(locale);
  const t = await getTranslations("admin.dashboard");
  const db = getDb();
  const [requests, assignments, installers, reviews] = await Promise.all([
    db.select("quote_requests"),
    db.select("lead_assignments"),
    db.select("installers", { status: ["applied", "in_review"] }),
    db.select("reviews", { status: "pending" }),
  ]);
  const metrics = dashboardMetrics(requests, assignments);
  const weeks = requestsPerWeek(requests, new Date(), 8);
  const maxWeek = Math.max(1, ...weeks.map((w) => w.count));
  const unrouted = requests.filter((r) => r.status === "new").length;
  const todo = [
    installers.length > 0 && {
      href: "/admin/installers" as const,
      text: t("todoApplications", { count: installers.length }),
    },
    unrouted > 0 && {
      href: "/admin/requests" as const,
      text: t("todoRequests", { count: unrouted }),
    },
    reviews.length > 0 && {
      href: "/admin/reviews" as const,
      text: t("todoReviews", { count: reviews.length }),
    },
  ].filter(Boolean) as {
    href: "/admin/installers" | "/admin/requests" | "/admin/reviews";
    text: string;
  }[];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl">{t("title")}</h1>
      <Card>
        <h2 className="text-xl">{t("todo")}</h2>
        {todo.length === 0 ? (
          <p className="mt-3 text-ink-muted">{t("todoNothing")}</p>
        ) : (
          <ul className="mt-3 space-y-1">
            {todo.map((item) => (
              <li key={item.text}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center font-semibold text-ocean-600 underline underline-offset-4"
                >
                  {item.text}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t("requests")} value={String(metrics.totalRequests)} />
        <Stat
          label={t("responseTime")}
          value={
            metrics.avgResponseHours === null
              ? "—"
              : t("hours", {
                  hours: formatNumber(metrics.avgResponseHours, locale),
                })
          }
        />
        <Stat
          label={t("winRate")}
          value={
            metrics.winRate === null
              ? "—"
              : `${Math.round(metrics.winRate * 100)} %`
          }
        />
        <Stat
          label={t("revenuePerRequest")}
          value={
            metrics.revenuePerRequest === null
              ? "—"
              : formatMur(metrics.revenuePerRequest, locale)
          }
          hint={`${t("billed")}: ${formatMur(metrics.billedMur, locale)}`}
        />
      </dl>

      <Card>
        <h2 className="text-xl">{t("perWeek")}</h2>
        {/* A simple bar list: readable on phones and by screen readers. */}
        <ul className="mt-4 space-y-2">
          {weeks.map((week) => (
            <li
              key={week.week}
              className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3 text-sm"
            >
              <span className="text-ink-muted">
                {t("weekOf", { date: formatDate(week.week, locale, "short") })}
              </span>
              <span aria-hidden="true" className="h-4 rounded-full bg-sand-100">
                <span
                  className="block h-4 rounded-full bg-ocean-700"
                  style={{ width: `${(week.count / maxWeek) * 100}%` }}
                />
              </span>
              <span className="text-right font-semibold tabular-nums">
                {week.count}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
