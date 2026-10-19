import { getTranslations } from "next-intl/server";

/** The "Reviewed by Soley" mark: a shield with a tick and the label. */
export async function VerifiedBadge() {
  const t = await getTranslations("directory");
  return (
    <span
      title={t("badgeHint")}
      className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-sm font-bold text-success-700"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
        <path
          fill="currentColor"
          d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5l-8-3Zm-1.2 14.2-3.5-3.5 1.4-1.4 2.1 2.1 4.9-4.9 1.4 1.4-6.3 6.3Z"
        />
      </svg>
      {t("badge")}
    </span>
  );
}
