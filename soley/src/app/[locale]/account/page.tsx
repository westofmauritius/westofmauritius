import { getTranslations } from "next-intl/server";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ButtonLink, Card } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { requireHousehold } from "@/lib/auth/roles";
import { getDb } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { listHouseholdRequests } from "@/lib/services/household";

export default async function AccountPage({
  params,
}: PageProps<"/[locale]/account">) {
  const locale = await resolveLocale(params);
  const viewer = await requireHousehold(locale);
  const t = await getTranslations("account");
  const tr = await getTranslations("regions");
  const requests = viewer.household
    ? await listHouseholdRequests(viewer.household.id)
    : [];
  const quotes = requests.length
    ? await getDb().select("quotes", {
        quote_request_id: requests.map((r) => r.id),
      })
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">{t("requestsTitle")}</h1>
      {requests.length === 0 ? (
        <Card>
          <p>{t("noRequests", { email: viewer.email })}</p>
          <ButtonLink href="/get-quotes" className="mt-4">
            {t("startRequest")}
          </ButtonLink>
        </Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {requests.map((request) => {
            const count = quotes.filter(
              (q) => q.quote_request_id === request.id,
            ).length;
            return (
              <Card as="li" key={request.id} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg">
                    {t("requestCard", { reference: request.reference })}
                  </h2>
                  <StatusBadge kind="request" status={request.status} />
                </div>
                <p className="text-ink-muted">
                  {tr(request.region)} ·{" "}
                  {t("received", {
                    date: formatDate(request.created_at, locale),
                  })}
                </p>
                <p className="font-semibold">{t("quotesCount", { count })}</p>
                <Link
                  href={{
                    pathname: "/account/requests/[id]",
                    params: { id: request.id },
                  }}
                  className="mt-1 inline-flex min-h-11 items-center font-semibold text-ocean-600 underline underline-offset-4"
                >
                  {t("open")}
                  <span className="sr-only"> {request.reference}</span>
                </Link>
              </Card>
            );
          })}
        </ul>
      )}
    </div>
  );
}
