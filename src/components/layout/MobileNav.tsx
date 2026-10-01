"use client";

import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { NavItem } from "./nav";

type MobileNavProps = {
  items: NavItem[];
  menuLabel: string;
  closeLabel: string;
  /** Extra content at the bottom of the menu, e.g. the language switcher. */
  footer?: React.ReactNode;
};

/**
 * Full-screen menu for phones. This is the only part of the header that needs
 * JavaScript (open/close state), so it is a small client component and the
 * rest of the header stays server-rendered.
 */
export function MobileNav({
  items,
  menuLabel,
  closeLabel,
  footer,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Stop the page behind the menu from scrolling while it is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="-mr-2 flex size-11 items-center justify-center"
      >
        <span className="sr-only">{open ? closeLabel : menuLabel}</span>
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          {open ? (
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          ) : (
            <path d="M3 8h18M3 16h18" stroke="currentColor" strokeWidth="1.5" />
          )}
        </svg>
      </button>

      {open && (
        <nav
          id="mobile-menu"
          className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-white px-4 pt-6 pb-10"
        >
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-4 font-display text-3xl"
                  aria-current={pathname === item.href ? "page" : undefined}
                  // Close the menu when a link is chosen; the header stays
                  // mounted across page changes, so it would otherwise stay open.
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {footer && <div className="mt-8">{footer}</div>}
        </nav>
      )}
    </div>
  );
}
