import { getTranslations } from "next-intl/server";
import { AreaNav } from "@/components/shared/AreaNav";
import { SignOutForm } from "@/components/shared/SignOutForm";
import { Alert, Container } from "@/components/ui";
import { resolveLocale } from "@/i18n/locale";
import { requireInstaller } from "@/lib/auth/roles";

export default async function PortalLayout({
  children,
  params,
}: LayoutProps<"/[locale]/portal">) {
  const locale = await resolveLocale(params);
  const { installer } = await requireInstaller(locale);
  const t = await getTranslations("portal");
  return (
    <Container className="py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold tracking-wider text-ocean-600 uppercase">
            {t("title")}
          </p>
          <p className="text-2xl font-bold">{installer.company_name}</p>
        </div>
        <SignOutForm />
      </div>
      {installer.status === "suspended" ? (
        <Alert tone="danger" title={t("suspendedTitle")} className="mt-4">
          {t("suspendedBody")}
        </Alert>
      ) : installer.status !== "approved" ? (
        <Alert tone="info" title={t("pendingTitle")} className="mt-4">
          {t("pendingBody")}
        </Alert>
      ) : !installer.active ? (
        <Alert tone="warning" className="mt-4">
          {t("pausedNotice")}
        </Alert>
      ) : null}
      <div className="mt-6">
        <AreaNav
          label={t("title")}
          items={[
            {
              href: "/portal",
              match: "/portal",
              also: ["/portal/leads"],
              label: t("nav.inbox"),
            },
            {
              href: "/portal/billing",
              match: "/portal/billing",
              label: t("nav.billing"),
            },
            {
              href: "/portal/profile",
              match: "/portal/profile",
              label: t("nav.profile"),
            },
          ]}
        />
      </div>
      <div className="mt-8">{children}</div>
    </Container>
  );
}
