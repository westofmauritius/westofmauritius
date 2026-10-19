import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui";
import { ConsentSettingsButton } from "@/components/consent/ConsentSettingsButton";
import { Logo } from "./Logo";

export async function SiteFooter() {
  const t = await getTranslations();
  const year = new Date().getFullYear();
  const linkClass =
    "inline-flex min-h-10 items-center text-ocean-100 underline-offset-4 hover:text-white hover:underline";
  return (
    <footer className="on-dark mt-20 bg-ocean-950 py-12 text-white">
      <Container>
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-3 text-sm text-ocean-100">{t("footer.tagline")}</p>
          </div>
          <nav aria-label={t("footer.service")}>
            <h2 className="text-sm font-bold tracking-wider text-sun-300 uppercase">
              {t("footer.service")}
            </h2>
            <ul className="mt-3 space-y-1">
              <li>
                <Link className={linkClass} href="/calculator">
                  {t("nav.calculator")}
                </Link>
              </li>
              <li>
                <Link className={linkClass} href="/get-quotes">
                  {t("nav.getQuotes")}
                </Link>
              </li>
              <li>
                <Link className={linkClass} href="/grant-guide">
                  {t("nav.grantGuide")}
                </Link>
              </li>
              <li>
                <Link className={linkClass} href="/installers">
                  {t("nav.installers")}
                </Link>
              </li>
              <li>
                <Link className={linkClass} href="/guides">
                  {t("nav.guides")}
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label={t("footer.company")}>
            <h2 className="text-sm font-bold tracking-wider text-sun-300 uppercase">
              {t("footer.company")}
            </h2>
            <ul className="mt-3 space-y-1">
              <li>
                <Link className={linkClass} href="/about">
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link className={linkClass} href="/contact">
                  {t("footer.contact")}
                </Link>
              </li>
              <li>
                <Link className={linkClass} href="/for-installers">
                  {t("nav.forInstallers")}
                </Link>
              </li>
              <li>
                <Link className={linkClass} href="/sign-in">
                  {t("nav.signIn")}
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label={t("footer.legal")}>
            <h2 className="text-sm font-bold tracking-wider text-sun-300 uppercase">
              {t("footer.legal")}
            </h2>
            <ul className="mt-3 space-y-1">
              <li>
                <Link className={linkClass} href="/privacy">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link className={linkClass} href="/terms">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link className={linkClass} href="/cookies">
                  {t("footer.cookies")}
                </Link>
              </li>
              <li>
                <ConsentSettingsButton className={linkClass} />
              </li>
            </ul>
          </nav>
        </div>
        <div className="mt-10 border-t border-white/15 pt-6 text-sm text-ocean-100">
          <p className="font-semibold text-white">{t("common.independent")}</p>
          <p className="mt-1">{t("footer.notOfficial")}</p>
          <p className="mt-4">{t("footer.copyright", { year })}</p>
        </div>
      </Container>
    </footer>
  );
}
