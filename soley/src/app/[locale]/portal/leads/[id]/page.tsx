import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { RequestDetails } from "@/components/shared/RequestDetails";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Alert, Card } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { requireInstaller } from "@/lib/auth/roles";
import { formatMur } from "@/lib/format";
import { getLead, LeadError } from "@/lib/services/leads";
import { getPlatformSettings } from "@/lib/services/settings";
import { isoDateInDays } from "@/lib/time";
import { LeadActions } from "./LeadActions";
import { QuoteEditor } from "./QuoteEditor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("portal");
  return { title: t("title"), robots: { index: false } };
}

export default async function LeadPage({
  params,
}: PageProps<"/[locale]/portal/leads/[id]">) {
  const { id } = await params;
  const locale = await resolveLocale(params);
  const { installer } = await requireInstaller(locale, {
    pathname: "/portal/leads/[id]",
    params: { id },
  });
  const t = await getTranslations("portal.lead");
  const tf = await getTranslations("quoteForm.fields");
  const lead = await getLead(id, installer.id).catch((error) => {
    if (error instanceof LeadError) notFound();
    throw error;
  });
  const { assignment, request, household, quote } = lead;
  const settings = await getPlatformSettings();
  const open = !["chosen", "installed", "cancelled"].includes(request.status);
  const canQuote =
    installer.status === "approved" &&
    open &&
    ["accepted", "quoted"].includes(assignment.status);
  const validUntil = isoDateInDays(30);

  return (
    <div className="space-y-8">
      <Link
        href="/portal"
        className="inline-flex min-h-11 items-center font-semibold text-ocean-600 underline underline-offset-4"
      >
        ← {t("back")}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">
          {t("title", { reference: request.reference })}
        </h1>
        <StatusBadge kind="assignment" status={assignment.status} />
      </div>

      {assignment.status === "won" && <Alert tone="success">{t("won")}</Alert>}
      {assignment.status === "lost" && <Alert tone="info">{t("lost")}</Alert>}
      {assignment.status === "declined" && (
        <Alert tone="info">{t("declined")}</Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <h2 className="text-xl">{t("details")}</h2>
          <div className="mt-4">
            <RequestDetails request={request} />
          </div>
        </Card>
        <Card>
          <h2 className="text-xl">{t("contact")}</h2>
          {household ? (
            <dl className="mt-4 space-y-2">
              <div>
                <dt className="sr-only">{tf("name.label")}</dt>
                <dd className="text-lg font-bold">{household.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-ink-muted">{tf("phone.label")}</dt>
                <dd>
                  <a
                    href={`tel:${household.phone}`}
                    className="font-semibold text-ocean-600 underline"
                  >
                    {household.phone}
                  </a>
                </dd>
              </div>
              {household.whatsapp && (
                <div>
                  <dt className="text-sm text-ink-muted">
                    {tf("whatsapp.label")}
                  </dt>
                  <dd>
                    <a
                      href={`https://wa.me/${household.whatsapp.replace(/\D/g, "")}`}
                      className="font-semibold text-ocean-600 underline"
                    >
                      {household.whatsapp}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-ink-muted">{tf("email.label")}</dt>
                <dd>
                  <a
                    href={`mailto:${household.email}`}
                    className="font-semibold break-all text-ocean-600 underline"
                  >
                    {household.email}
                  </a>
                </dd>
              </div>
              {household.preferred_contact && (
                <dd className="text-sm">
                  {t("preferred", {
                    method: tf(
                      `preferred_contact.${household.preferred_contact}`,
                    ),
                  })}
                </dd>
              )}
            </dl>
          ) : (
            <p className="mt-4 text-ink-muted">
              {assignment.status === "offered"
                ? t("contactHidden")
                : t("erased")}
            </p>
          )}
        </Card>
      </div>

      {assignment.status === "offered" &&
        open &&
        installer.status === "approved" && (
          <Card>
            <h2 className="text-xl">{t("acceptTitle")}</h2>
            <div className="mt-4">
              <LeadActions
                assignmentId={assignment.id}
                body={
                  settings.lead_price_mur > 0
                    ? t("acceptBody", {
                        price: formatMur(settings.lead_price_mur, locale),
                      })
                    : t("acceptBodyNoPrice")
                }
              />
            </div>
          </Card>
        )}
      {assignment.status === "offered" && !open && (
        <Alert tone="info">{t("closed")}</Alert>
      )}

      {canQuote && (
        <Card>
          <h2 className="text-xl">{t("quoteTitle")}</h2>
          <p className="mt-2 text-ink-muted">{t("quoteIntro")}</p>
          {assignment.status === "accepted" && (
            <Alert tone="success" className="mt-4" role="status">
              {t("accepted")}
            </Alert>
          )}
          <div className="mt-6">
            <QuoteEditor
              assignmentId={assignment.id}
              quote={quote}
              defaultValidUntil={validUntil}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
