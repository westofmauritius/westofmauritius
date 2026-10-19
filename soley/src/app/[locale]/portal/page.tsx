import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { requireInstaller } from "@/lib/auth/roles";
import { formatDate, formatMur } from "@/lib/format";
import { listLeads, type LeadView } from "@/lib/services/leads";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("portal");
  return { title: t("title"), robots: { index: false } };
}

const groupOf = (lead: LeadView) =>
  lead.assignment.status === "offered"
    ? "new"
    : ["accepted", "quoted"].includes(lead.assignment.status) &&
        !["chosen", "installed", "cancelled"].includes(lead.request.status)
      ? "active"
      : "closed";

export default async function PortalInbox({
  params,
}: PageProps<"/[locale]/portal">) {
  const locale = await resolveLocale(params);
  const { installer } = await requireInstaller(locale);
  const t = await getTranslations("portal");
  const tr = await getTranslations("regions");
  const leads = await listLeads(installer.id);
  const groups = (["new", "active", "closed"] as const).map((key) => ({
    key,
    leads: leads.filter((lead) => groupOf(lead) === key),
  }));

  return (
    <div className="space-y-10">
      <h1 className="sr-only">{t("inboxTitle")}</h1>
      {groups.map((group) => (
        <section key={group.key} aria-labelledby={`group-${group.key}`}>
          <h2 id={`group-${group.key}`} className="text-xl">
            {t(`groups.${group.key}`)}{" "}
            <span className="text-ink-muted">({group.leads.length})</span>
          </h2>
          {group.leads.length === 0 ? (
            <p className="mt-3 text-ink-muted">{t("empty")}</p>
          ) : (
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {group.leads.map(({ assignment, request }) => (
                <Card
                  as="li"
                  key={assignment.id}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold">{request.reference}</p>
                    <StatusBadge kind="assignment" status={assignment.status} />
                  </div>
                  <p>
                    {tr(request.region)} ·{" "}
                    {t("billLine", {
                      bill: formatMur(request.monthly_bill_mur, locale),
                    })}
                  </p>
                  <p className="text-sm text-ink-muted">
                    {t("offeredOn", {
                      date: formatDate(assignment.offered_at, locale),
                    })}
                  </p>
                  <Link
                    href={{
                      pathname: "/portal/leads/[id]",
                      params: { id: assignment.id },
                    }}
                    className="mt-1 inline-flex min-h-11 items-center font-semibold text-ocean-600 underline underline-offset-4"
                  >
                    {t("open")}
                    <span className="sr-only"> {request.reference}</span>
                  </Link>
                </Card>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
