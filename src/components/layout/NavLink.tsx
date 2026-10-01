"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { NavItem } from "./nav";

/**
 * Main-navigation link that knows when its section is open: it then gets
 * aria-current (announced by screen readers) and a visible underline.
 */
export function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active =
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative py-2 transition-colors hover:text-ink",
        active
          ? "text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-coral-500"
          : "text-ink-muted",
      )}
    >
      {item.label}
    </Link>
  );
}
