"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type Item = {
  href: React.ComponentProps<typeof Link>["href"];
  label: string;
  /** Internal path of the tab, e.g. "/portal". */
  match: string;
  /** Other internal paths that belong to this tab, e.g. "/portal/leads". */
  also?: string[];
};

/**
 * Tabs for a signed-in area (portal, admin, account). The current tab is
 * marked with aria-current; it scrolls sideways on narrow phones.
 */
export function AreaNav({ items, label }: { items: Item[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-1 border-b border-line">
        {items.map((item) => {
          const active =
            pathname === item.match ||
            (item.also ?? []).some((prefix) => pathname.startsWith(prefix));
          return (
            <li key={item.match}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center border-b-3 px-3 font-semibold whitespace-nowrap",
                  active
                    ? "border-sun-500 text-ocean-900"
                    : "border-transparent text-ink-muted hover:text-ocean-900",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
