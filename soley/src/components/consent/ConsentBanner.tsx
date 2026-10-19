"use client";

import { useTranslations } from "next-intl";
import { useEffect, useSyncExternalStore } from "react";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/button-styles";
import { site } from "@/lib/site";
import { CONSENT_EVENT, readConsent, writeConsent } from "./consent-store";

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Asks before any statistics are collected, and loads Plausible only after
 * the visitor says yes. Without a configured Plausible domain there is
 * nothing to ask about, so the banner never shows.
 */
export function ConsentBanner() {
  const t = useTranslations("consent");
  // "unknown" while rendering on the server, so the banner never flashes
  // for visitors who already chose.
  const choice = useSyncExternalStore(subscribe, readConsent, () => "unknown");

  useEffect(() => {
    if (choice !== "granted" || !site.plausibleDomain) return;
    if (document.getElementById("plausible-script")) return;
    const script = document.createElement("script");
    script.id = "plausible-script";
    script.defer = true;
    script.dataset.domain = site.plausibleDomain;
    script.src = "https://plausible.io/js/script.js";
    document.head.appendChild(script);
  }, [choice]);

  if (!site.plausibleDomain || choice !== null) return null;

  return (
    <section
      aria-labelledby="consent-title"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-line bg-white p-5 shadow-xl sm:bottom-6"
    >
      <h2 id="consent-title" className="text-lg">
        {t("title")}
      </h2>
      <p className="mt-2 text-sm text-ink-muted">{t("body")}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={buttonClasses("secondary")}
          onClick={() => writeConsent("granted")}
        >
          {t("accept")}
        </button>
        <button
          type="button"
          className={buttonClasses("ghost")}
          onClick={() => writeConsent("denied")}
        >
          {t("decline")}
        </button>
        <Link
          href="/cookies"
          className="ml-auto inline-flex min-h-11 items-center text-sm font-semibold text-ocean-600 underline underline-offset-4"
        >
          {t("more")}
        </Link>
      </div>
    </section>
  );
}
