"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { NavItem } from "./nav";

/** True when the visitor is on this section's page or one below it. */
export function isActive(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

/**
 * Main-navigation link that knows when its section is open: it then gets
 * aria-current (announced by screen readers) and a visible underline.
 */
export function NavLink({ item }: { item: NavItem }) {
  const active = isActive(usePathname(), item.path);
  return (
    <Link
      href={item.path}
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
