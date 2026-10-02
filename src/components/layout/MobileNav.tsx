"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive } from "./NavLink";
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

  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);

  // While open: stop the page behind from scrolling, move focus into the
  // menu, and let Escape close it (returning focus to the menu button).
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    menu.current?.querySelector("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={button}
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
          ref={menu}
          id="mobile-menu"
          className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-white px-4 pt-6 pb-10"
        >
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className="block py-4 font-display text-3xl"
                  aria-current={
                    isActive(pathname, item.path) ? "page" : undefined
                  }
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
