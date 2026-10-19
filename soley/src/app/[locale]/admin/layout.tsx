import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AreaNav } from "@/components/shared/AreaNav";
import { SignOutForm } from "@/components/shared/SignOutForm";
import { Alert, Container } from "@/components/ui";
import { resolveLocale } from "@/i18n/locale";
import { requireAdmin } from "@/lib/auth/roles";
import { isDemoMode } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return {
    title: `${t("title")} | Soley`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminLayout({
  children,
  params,
}: LayoutProps<"/[locale]/admin">) {
  const locale = await resolveLocale(params);
  const viewer = await requireAdmin(locale);
  const t = await getTranslations("admin");
  const items = (
    [
      ["/admin", "dashboard"],
      ["/admin/installers", "installers"],
      ["/admin/requests", "requests"],
      ["/admin/invoices", "invoices"],
      ["/admin/reviews", "reviews"],
      ["/admin/facts", "facts"],
      ["/admin/settings", "settings"],
    ] as const
  ).map(([href, key]) => ({
    href,
    match: href,
    also: href === "/admin" ? [] : [`${href}/`],
    label: t(`nav.${key}`),
  }));
  return (
    <Container className="py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold tracking-wider text-ocean-600 uppercase">
            Soley
          </p>
          <p className="text-2xl font-bold">{t("title")}</p>
          <p className="text-sm text-ink-muted">{viewer.email}</p>
        </div>
        <SignOutForm />
      </div>
      {isDemoMode() && (
        <Alert tone="warning" className="mt-4">
          {t("demoMode")}
        </Alert>
      )}
      <div className="mt-6">
        <AreaNav label={t("title")} items={items} />
      </div>
      <div className="mt-8">{children}</div>
    </Container>
  );
}
