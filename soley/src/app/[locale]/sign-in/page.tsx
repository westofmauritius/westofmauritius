import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import {
  Alert,
  ButtonLink,
  Card,
  Container,
  SectionHeading,
} from "@/components/ui";
import { resolveLocale } from "@/i18n/locale";
import { getViewer } from "@/lib/auth/roles";
import { safeNext } from "@/lib/auth/session";
import { pageMetadata } from "@/lib/seo";
import { SignInForm } from "./SignInForm";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/sign-in">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "auth" });
  return pageMetadata({
    locale,
    href: "/sign-in",
    title: t("metaTitle"),
    noindex: true,
  });
}

/**
 * Sign-in for everyone. A visitor who is already signed in is sent to the
 * page they asked for, or straight to their area when they have only one
 * role; with several roles they choose.
 */
export default async function SignInPage({
  params,
  searchParams,
}: PageProps<"/[locale]/sign-in">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations("auth");
  const query = await searchParams;
  const next = safeNext(query.next);
  const viewer = await getViewer();

  if (viewer) {
    if (next) redirect(next);
    const areas = [
      viewer.admin && ({ href: "/admin", label: t("goAdmin") } as const),
      viewer.installer && ({ href: "/portal", label: t("goPortal") } as const),
      viewer.household &&
        ({ href: "/account", label: t("goAccount") } as const),
    ].filter(Boolean) as {
      href: "/admin" | "/portal" | "/account";
      label: string;
    }[];
    if (areas.length === 1) {
      const { getPathname } = await import("@/i18n/navigation");
      redirect(getPathname({ href: areas[0]!.href, locale }));
    }
    return (
      <Container narrow className="py-12">
        <SectionHeading
          as="h1"
          title={t("signedInTitle")}
          intro={t("signedInAs", { email: viewer.email })}
        />
        {areas.length === 0 ? (
          <Card className="mt-8">
            <p>{t("noRole")}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <ButtonLink href="/get-quotes">
                {(await getTranslations("nav"))("getQuotes")}
              </ButtonLink>
              <ButtonLink href="/for-installers" variant="ghost">
                {(await getTranslations("nav"))("forInstallers")}
              </ButtonLink>
            </div>
          </Card>
        ) : (
          <ul className="mt-8 flex flex-wrap gap-3">
            {areas.map((area) => (
              <li key={area.href}>
                <ButtonLink href={area.href}>{area.label}</ButtonLink>
              </li>
            ))}
          </ul>
        )}
        <SignOutButton locale={locale} />
      </Container>
    );
  }

  return (
    <Container narrow className="py-12">
      <SectionHeading as="h1" title={t("title")} intro={t("intro")} />
      {query.error === "link" && (
        <Alert tone="warning" role="alert" className="mt-6">
          {t("linkError")}
        </Alert>
      )}
      <Card className="mt-8">
        <SignInForm next={next} />
      </Card>
    </Container>
  );
}

async function SignOutButton({ locale }: { locale: string }) {
  const tc = await getTranslations("common");
  return (
    <form action="/auth/sign-out" method="post" className="mt-8">
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className="min-h-11 font-semibold text-ocean-600 underline underline-offset-4"
      >
        {tc("signOut")}
      </button>
    </form>
  );
}
