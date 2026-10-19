import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AreaNav } from "@/components/shared/AreaNav";
import { SignOutForm } from "@/components/shared/SignOutForm";
import { Container } from "@/components/ui";
import { resolveLocale } from "@/i18n/locale";
import { requireHousehold } from "@/lib/auth/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return {
    title: `${t("title")} | Soley`,
    robots: { index: false, follow: false },
  };
}

export default async function AccountLayout({
  children,
  params,
}: LayoutProps<"/[locale]/account">) {
  const locale = await resolveLocale(params);
  const viewer = await requireHousehold(locale);
  const t = await getTranslations("account");
  return (
    <Container className="py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold tracking-wider text-ocean-600 uppercase">
            {t("title")}
          </p>
          <p className="text-sm text-ink-muted">{viewer.email}</p>
        </div>
        <SignOutForm />
      </div>
      <div className="mt-4">
        <AreaNav
          label={t("title")}
          items={[
            {
              href: "/account",
              match: "/account",
              also: ["/account/requests"],
              label: t("nav.requests"),
            },
            {
              href: "/account/privacy",
              match: "/account/privacy",
              label: t("nav.privacy"),
            },
          ]}
        />
      </div>
      <div className="mt-8">{children}</div>
    </Container>
  );
}
