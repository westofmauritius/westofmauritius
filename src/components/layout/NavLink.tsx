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
 * aria-current (announced by screen readers) and a coral underline, which
 * also slides in on hover. A highlighted item is a coral button instead.
 */
export function NavLink({ item }: { item: NavItem }) {
  const active = isActive(usePathname(), item.path);
  return (
    <Link
      href={item.path}
      aria-current={active ? "page" : undefined}
      className={
        item.highlight
          ? cn(
              "inline-flex min-h-10 items-center rounded-full px-5 font-medium text-white shadow-sm transition-colors",
              active ? "bg-coral-700" : "bg-coral-600 hover:bg-coral-700",
            )
          : cn(
              "relative py-2 font-medium transition-colors hover:text-ink",
              "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-coral-500 after:transition-transform after:duration-300",
              active
                ? "text-ink after:scale-x-100"
                : "text-ocean-800 after:scale-x-0 hover:after:scale-x-100",
            )
      }
    >
      {item.label}
    </Link>
  );
}
