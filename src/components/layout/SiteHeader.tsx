import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Wordmark } from "@/components/ui/Wordmark";
import { MobileNav } from "./MobileNav";
import type { NavItem } from "./nav";

type SiteHeaderProps = {
  brandName: string;
  homeHref: string;
  items: NavItem[];
  /** Translated labels for the mobile menu button (screen readers). */
  menuLabel?: string;
  closeLabel?: string;
};

/** Sticky top bar: wordmark left, navigation right (menu button on phones). */
export function SiteHeader({
  brandName,
  homeHref,
  items,
  menuLabel = "Open menu",
  closeLabel = "Close menu",
}: SiteHeaderProps) {
  return (
    // The frosted background sits on a ::before layer, not the header itself:
    // backdrop-blur on the header would trap the fixed-position mobile menu
    // inside the 64px header instead of covering the screen.
    <header className="sticky top-0 z-50 border-b border-line before:absolute before:inset-0 before:-z-10 before:bg-white/90 before:backdrop-blur-md">
      <Container size="wide" className="flex h-16 items-center justify-between">
        <Link href={homeHref} aria-label={brandName}>
          <Wordmark name={brandName} className="text-xl sm:text-2xl" />
        </Link>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm tracking-wide">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <MobileNav
          items={items}
          menuLabel={menuLabel}
          closeLabel={closeLabel}
        />
      </Container>
    </header>
  );
}
