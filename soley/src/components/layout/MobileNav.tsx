"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/button-styles";
import { mainNav } from "./nav";

/**
 * The phone menu: a button that opens a panel below the header. Escape and
 * following a link close it; Escape returns focus to the button.
 */
export function MobileNav() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-ocean-900/20 px-3 font-semibold"
      >
        <span className="sr-only">
          {open ? t("common.closeMenu") : t("common.openMenu")}
        </span>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22">
          {open ? (
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>
      <nav
        id="mobile-menu"
        aria-label={t("nav.main")}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-line bg-surface shadow-lg"
      >
        <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
          {mainNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={close}
                className="flex min-h-12 items-center rounded-xl px-3 text-lg font-semibold hover:bg-sand-100"
              >
                {t(`nav.${item.label}`)}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/sign-in"
              onClick={close}
              className="flex min-h-12 items-center rounded-xl px-3 text-lg font-semibold hover:bg-sand-100"
            >
              {t("nav.signIn")}
            </Link>
          </li>
          <li className="pt-2">
            <Link
              href="/get-quotes"
              onClick={close}
              className={buttonClasses("primary", "lg", "w-full")}
            >
              {t("nav.getQuotes")}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
