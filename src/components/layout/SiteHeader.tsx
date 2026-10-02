import { Container } from "@/components/ui/Container";
import { Wordmark } from "@/components/ui/Wordmark";
import { Link } from "@/i18n/Link";
import type { Locale } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNav } from "./MobileNav";
import { NavLink } from "./NavLink";
import type { NavItem } from "./nav";

type SiteHeaderProps = {
  brandName: string;
  items: NavItem[];
  /** Translated labels for screen readers. */
  navLabel: string;
  menuLabel: string;
  closeLabel: string;
  languageLabel: string;
  locale: Locale;
};

/** Sticky top bar: wordmark left, navigation right (menu button on phones). */
export function SiteHeader({
  brandName,
  items,
  navLabel,
  menuLabel,
  closeLabel,
  languageLabel,
  locale,
}: SiteHeaderProps) {
  return (
    // The frosted background sits on a ::before layer, not the header itself:
    // backdrop-blur on the header would trap the fixed-position mobile menu
    // inside the 64px header instead of covering the screen.
    <header className="sticky top-0 z-50 border-b border-line before:absolute before:inset-0 before:-z-10 before:bg-white/90 before:backdrop-blur-md">
      <Container size="wide" className="flex h-16 items-center justify-between">
        <Link href="/" aria-label={brandName}>
          <Wordmark name={brandName} className="text-xl sm:text-2xl" />
        </Link>

        <nav
          aria-label={navLabel}
          className="hidden items-center gap-8 lg:flex"
        >
          <ul className="flex items-center gap-7 text-[0.9375rem]">
            {items.map((item) => (
              <li key={item.path}>
                <NavLink item={item} />
              </li>
            ))}
          </ul>
          <LanguageSwitcher label={languageLabel} locale={locale} />
        </nav>

        <MobileNav
          items={items}
          menuLabel={menuLabel}
          closeLabel={closeLabel}
          footer={<LanguageSwitcher label={languageLabel} locale={locale} />}
        />
      </Container>
    </header>
  );
}
