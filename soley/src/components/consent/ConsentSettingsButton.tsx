"use client";

import { useTranslations } from "next-intl";
import { writeConsent } from "./consent-store";

/** Footer link that clears the analytics choice so the banner asks again. */
export function ConsentSettingsButton({ className }: { className?: string }) {
  const t = useTranslations("footer");
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        writeConsent(null);
        // Plausible is already loaded if it was allowed; a reload makes a
        // withdrawn consent take effect at once.
        if (document.getElementById("plausible-script")) {
          window.location.reload();
        }
      }}
    >
      {t("cookieSettings")}
    </button>
  );
}
