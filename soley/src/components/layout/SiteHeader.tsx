import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ButtonLink } from "@/components/ui";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { mainNav } from "./nav";

/**
 * The header is the same for everyone (no session lookup), so public pages
 * stay static and fast. Signed-in people reach their area through "Sign in",
 * which forwards them straight on when they already have a session.
 */
export async function SiteHeader() {
  const t = await getTranslations("nav");
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Link href="/" className="text-ocean-900" aria-label="Soley">
          <Logo />
        </Link>
        <nav aria-label={t("main")} className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-full px-3 font-semibold whitespace-nowrap hover:bg-sand-100"
                >
                  {t(item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher className="flex" />
          <Link
            href="/sign-in"
            className="hidden min-h-11 items-center rounded-full px-3 font-semibold whitespace-nowrap hover:bg-sand-100 xl:inline-flex"
          >
            {t("signIn")}
          </Link>
          <ButtonLink
            href="/get-quotes"
            className="px-3.5 text-sm whitespace-nowrap max-[359px]:hidden sm:px-5 sm:text-base"
          >
            {t("getQuotes")}
          </ButtonLink>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
